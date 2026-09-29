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
      
      // bg-white dark:bg-slate-900/xx -> bg-slate-900/xx
      content = content.replace(/bg-white(?:\/\d+)?\s+dark:bg-slate-900(?:\/\d+)?/g, (match) => {
        const darkMatch = match.match(/dark:(bg-slate-[^\s'"]+)/);
        return darkMatch ? darkMatch[1] : 'bg-slate-900';
      });

      // text-slate-900 dark:text-white -> text-white
      content = content.replace(/text-slate-900\s+dark:text-white/g, 'text-white');
      
      // text-slate-900 dark:text-slate-100 -> text-slate-100
      content = content.replace(/text-slate-900\s+dark:text-slate-[^\s'"]+/g, (match) => {
        const darkMatch = match.match(/dark:(text-[^\s'"]+)/);
        return darkMatch ? darkMatch[1] : 'text-slate-100';
      });

      // Now replace any remaining bg-white with bg-slate-900
      content = content.replace(/\bbg-white\b/g, 'bg-slate-900');
      // replace bg-white/20 with bg-slate-900/20
      content = content.replace(/\bbg-white\/(\d+)\b/g, 'bg-slate-900/$1');

      // Now replace any remaining text-slate-900 with text-slate-100
      content = content.replace(/\btext-slate-900\b/g, 'text-slate-100');

      // also for bg-slate-50 dark:bg-slate-800/xx -> bg-slate-800/xx
      content = content.replace(/bg-slate-50(?:\/\d+)?\s+dark:bg-slate-800(?:\/\d+)?/g, (match) => {
        const darkMatch = match.match(/dark:(bg-slate-[^\s'"]+)/);
        return darkMatch ? darkMatch[1] : 'bg-slate-800';
      });

      // text-slate-800 dark:text-slate-200 -> text-slate-200
      content = content.replace(/text-slate-800\s+dark:text-slate-[^\s'"]+/g, (match) => {
        const darkMatch = match.match(/dark:(text-[^\s'"]+)/);
        return darkMatch ? darkMatch[1] : 'text-slate-200';
      });
      content = content.replace(/text-slate-800\s+dark:text-white/g, 'text-white');
      
      // bg-slate-100 dark:bg-slate-800 -> bg-slate-800
      content = content.replace(/bg-slate-100(?:\/\d+)?\s+dark:bg-slate-[^\s'"]+/g, (match) => {
        const darkMatch = match.match(/dark:(bg-slate-[^\s'"]+)/);
        return darkMatch ? darkMatch[1] : 'bg-slate-800';
      });

      // replace remaining bg-slate-50
      content = content.replace(/\bbg-slate-50\b/g, 'bg-slate-900');
      content = content.replace(/\bbg-slate-50\/(\d+)\b/g, 'bg-slate-900/$1');

      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src/components');
