const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/bg-slate-900\/80\s+dark:bg-\[#030712\]\/75/g, 'bg-slate-950/75');
      content = content.replace(/bg-slate-900\/90\s+dark:bg-\[#030712\]\/80/g, 'bg-slate-950/80');
      content = content.replace(/bg-\[#030712\]/g, 'bg-slate-950');
      content = content.replace(/border-slate-200\/80\s+dark:border-slate-800\/60/g, 'border-slate-800/60');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src');
