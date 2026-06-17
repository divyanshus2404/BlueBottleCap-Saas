const fs = require('fs');
const path = '/Users/divyanshu/.gemini/antigravity/scratch/BlueBottleCap-Saas/src/components/ToolsSuite.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Change root container bg and text
content = content.replace(
  'className="flex flex-col lg:flex-row min-h-screen w-full bg-slate-900 text-slate-100 fade-in overflow-hidden"',
  'className="flex flex-col lg:flex-row min-h-screen w-full bg-slate-50 text-slate-900 fade-in overflow-hidden"'
);

// 2. Change sidebar wrapper 
content = content.replace(
  'className="w-full lg:w-[350px] shrink-0 border-r border-slate-800 bg-[#0A0F1C] p-5 flex flex-col gap-6 lg:h-screen lg:sticky lg:top-0 overflow-y-auto custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20"',
  'className="w-full lg:w-[350px] shrink-0 border-r border-border-subtle bg-white flex flex-col lg:h-screen lg:sticky lg:top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20"'
);

// 3. Change header block padding and borders
content = content.replace(
  'className="mb-6 pb-6 border-b border-slate-800"',
  'className="p-5 pb-4 border-b border-border-subtle shrink-0"'
);

// 4. Header Text colors
content = content.replace(
  'text-2.5xl font-black text-white tracking-tight',
  'text-2.5xl font-black text-slate-900 tracking-tight'
);

content = content.replace(
  '<p className="text-xs text-slate-400 font-medium">',
  '<p className="text-xs text-slate-500 font-medium">'
);

// 5. Global Search text
content = content.replace(
  'focus:ring-1 focus:ring-brand-cobalt text-white shadow-3xs',
  'focus:ring-1 focus:ring-brand-cobalt text-slate-900 shadow-3xs'
);

// 6. Tabs
content = content.replace(
  /bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300/g,
  'bg-white hover:bg-slate-100 border border-border-subtle text-slate-600'
);

// 7. Make the tools grid scrollable and fix tool card backgrounds
content = content.replace(
  '{/* Grid containing ALL tools */}',
  '<div className="flex-1 overflow-y-auto custom-scrollbar p-5">\n        {/* Grid containing ALL tools */}'
);

content = content.replace(
  /className="flex flex-col gap-3 select-none pb-12"\>\s*\{filteredTools\.map\(\(tool\) \=\> \{/g,
  'className="flex flex-col gap-3 select-none pb-12">\n          {filteredTools.map((tool) => {'
);

// We need to close the `<div className="flex-1 overflow-y-auto...">` we just opened!
content = content.replace(
  '      </motion.div>\n\n      {/* RIGHT MAIN WORKSPACE */}',
  '        </div>\n      </motion.div>\n\n      {/* RIGHT MAIN WORKSPACE */}'
);

// 8. Grid Card changes (replace slate-900 and slate-800 borders)
// We know from previous refactor that they look like:
// className={`group flex flex-col justify-between rounded-2xl border p-5 bg-slate-900 transition-all cursor-pointer relative overflow-hidden ${
// isCurrentChoice ? "border-accent ring-1 ring-brand-cobalt shadow-xs" : "border-slate-800 hover:border-slate-600 hover:shadow-xs" }`}
content = content.replace(
  /bg-slate-900 transition-all cursor-pointer relative overflow-hidden/g,
  'bg-white transition-all cursor-pointer relative overflow-hidden'
);
content = content.replace(
  /border-slate-800 hover:border-slate-600 hover:shadow-xs/g,
  'border-border-subtle hover:border-slate-300 hover:shadow-xs'
);
content = content.replace(
  /text-white group-hover:text-accent transition-colors duration-150/g,
  'text-slate-900 group-hover:text-accent transition-colors duration-150'
);

// 9. Main Workspace changes
content = content.replace(
  'className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-900 relative lg:h-screen z-10 custom-scrollbar"',
  'className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-50 relative lg:h-screen z-10 custom-scrollbar"'
);

// Empty State changes
content = content.replace(
  '<h3 className="text-3xl font-black font-display text-white tracking-tight">',
  '<h3 className="text-3xl font-black font-display text-slate-900 tracking-tight">'
);
content = content.replace(
  '<p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">',
  '<p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">'
);
content = content.replace(
  'bg-slate-800/80 flex items-center justify-center ring-1 ring-slate-700 shadow-2xl',
  'bg-white flex items-center justify-center ring-1 ring-border-subtle shadow-xl'
);


fs.writeFileSync(path, content);
console.log("Theme Refactoring complete!");
