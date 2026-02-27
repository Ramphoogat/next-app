import { rmSync } from 'fs';
rmSync('f:/auth/next-app/src/app/api/auth/admin/users/[userId]', { recursive: true, force: true });
console.log('Removed [userId] folder');
