const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // Backgrounds
  { regex: /dark:bg-slate-950/g, replacement: 'bg-bg-primary' },
  { regex: /dark:bg-slate-900/g, replacement: 'bg-bg-primary' },
  { regex: /bg-slate-950/g, replacement: 'bg-bg-primary' },
  { regex: /bg-slate-900/g, replacement: 'bg-bg-primary' },
  
  // Surfaces
  { regex: /dark:bg-slate-800/g, replacement: 'bg-surface-solid' },
  { regex: /bg-slate-800/g, replacement: 'bg-surface-solid' },
  { regex: /dark:bg-slate-700/g, replacement: 'bg-surface-glass' },
  
  // Texts
  { regex: /dark:text-slate-400/g, replacement: 'text-text-secondary' },
  { regex: /text-slate-400/g, replacement: 'text-text-secondary' },
  { regex: /dark:text-slate-300/g, replacement: 'text-text-primary' },
  { regex: /text-slate-300/g, replacement: 'text-text-primary' },
  { regex: /dark:text-slate-500/g, replacement: 'text-text-muted' },
  { regex: /text-slate-500/g, replacement: 'text-text-muted' },
  { regex: /dark:text-white/g, replacement: 'text-white' }, // since it's dark theme only
  { regex: /text-brand-navy/g, replacement: 'text-white' }, // dark theme only
  
  // Accent
  { regex: /bg-brand-cobalt/g, replacement: 'bg-accent' },
  { regex: /text-brand-cobalt/g, replacement: 'text-accent' },
  { regex: /border-brand-cobalt/g, replacement: 'border-accent' },
  { regex: /text-brand-sky/g, replacement: 'text-accent' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const rule of replacements) {
        content = content.replace(rule.regex, rule.replacement);
      }
      
      // Additional specific pattern cleanups
      // Remove double 'bg-bg-primary bg-bg-primary' etc that might arise
      content = content.replace(/bg-bg-primary bg-bg-primary/g, 'bg-bg-primary');
      content = content.replace(/text-text-secondary text-text-secondary/g, 'text-text-secondary');
      
      // Cleanup `bg-white dark:bg-bg-primary` to just `bg-bg-primary`
      content = content.replace(/bg-white dark:bg-bg-primary/g, 'bg-bg-primary');
      content = content.replace(/bg-slate-50 dark:bg-bg-primary/g, 'bg-bg-primary');
      
      // Update typography
      // Replace some static text configs with premium classes if needed
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log("Theme refactoring complete.");
