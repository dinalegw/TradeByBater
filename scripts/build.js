const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourcePublic = path.join(root, 'public');
const targetDist = path.join(root, 'dist');
const staticFiles = ['app.html', 'admin.html', 'TradeByBater_Landing.html'];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  if (fs.existsSync(targetDist)) {
    fs.rmSync(targetDist, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDist, { recursive: true });

  copyRecursive(sourcePublic, path.join(targetDist, 'public'));

  for (const file of staticFiles) {
    const sourceFile = path.join(root, file);
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, path.join(targetDist, file));
    }
  }

  console.log('Build complete. Assets copied to dist/');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
