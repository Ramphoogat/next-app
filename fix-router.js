/* eslint-disable */
const fs = require('fs');
const path = require('path');

const directories = ['./src'];

function replaceRouter(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      replaceRouter(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let changed = false;

      if (content.includes('react-router-dom')) {
        // Simple replacements
        content = content.replace(/import\s+\{.*useNavigate.*\}\s+from\s+['"]react-router-dom['"];/g, 'import { useRouter } from "next/navigation";');
        content = content.replace(/import\s+\{.*useNavigate,\s*useLocation.*\}\s+from\s+['"]react-router-dom['"];/g, 'import { useRouter, useSearchParams, usePathname } from "next/navigation";');
        content = content.replace(/import\s+\{.*useNavigate,\s*useParams.*\}\s+from\s+['"]react-router-dom['"];/g, 'import { useRouter, useParams } from "next/navigation";');
        content = content.replace(/useNavigate\(\)/g, "useRouter()");
        content = content.replace(/const navigate = useRouter\(\)/g, "const router = useRouter()");
        content = content.replace(/navigate\(/g, "router.push(");
        
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated routing in: ${fullPath}`);
      }
    }
  }
}

console.log('Replacing react-router react-router-dom code...');
directories.forEach(dir => replaceRouter(dir));
console.log('Done.');
