import fs from 'fs';
import path from 'path';

// Directories to check
const directories = [
  './src/components',
  './src/context',
  './src/app',
  './src/pages_old'
];

function checkAndAddUseClient(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      checkAndAddUseClient(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      // Don't modify Next.js special files that should be SSR like layout.tsx unless necessary
      // Actually layout.tsx shouldn't have use client because it exports metadata
      if (file === 'layout.tsx' || file.includes('route.ts')) continue;

      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Basic check if it uses hooks, event listeners, or window/document
      const needsUseClient = /use(State|Effect|Context|Ref|Reducer|Callback|Memo|Router|Pathname|SearchParams|SearchParams)/.test(content) || 
                             /on(Click|Change|Submit|KeyDown|KeyUp)/.test(content) ||
                             content.includes('createContext') ||
                             content.indexOf('window.') !== -1 ||
                             content.indexOf('document.') !== -1;

      if (needsUseClient && !content.includes('"use client"') && !content.includes("'use client'")) {
        console.log(`Adding "use client" to: ${fullPath}`);
        fs.writeFileSync(fullPath, `"use client";\n` + content);
      }
    }
  }
}

console.log('Running script to add "use client" directive...');
directories.forEach(dir => checkAndAddUseClient(dir));
console.log('Done.');
