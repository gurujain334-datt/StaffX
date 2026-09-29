const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/hover:bg-slate-100(?:\/\d+)?\s+dark:hover:bg-slate-[^\s'"]+/g, (match) => {
        const darkMatch = match.match(/dark:(hover:bg-slate-[^\s'"]+)/);
        return darkMatch ? darkMatch[1] : 'hover:bg-slate-800';
      });

      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src/components');
