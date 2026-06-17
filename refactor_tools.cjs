const fs = require('fs');
const path = '/Users/divyanshu/.gemini/antigravity/scratch/BlueBottleCap-Saas/src/components/ToolsSuite.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add Framer Motion
content = content.replace('import { Flashcard, UserStats }', 'import { motion, AnimatePresence } from "framer-motion";\nimport { Flashcard, UserStats }');

// Remove scrollIntoView
content = content.replace(/const element = document\.getElementById\("active-workspace-anchor"\);\s*if \(element\) \{\s*element\.scrollIntoView\(\{ behavior: "smooth", block: "start" \}\);\s*\}/, '');

const returnIndex = content.indexOf('  return (\n    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 fade-in">');

if (returnIndex === -1) {
  console.log("Could not find return block");
  process.exit(1);
}

const preReturn = content.substring(0, returnIndex);
const postReturn = content.substring(returnIndex);

const anchorStart = postReturn.indexOf('<div id="active-workspace-anchor"');
const headerStart = postReturn.indexOf('{/* Page Header (moved below active workspace) */}');
const gridStart = postReturn.indexOf('{/* Grid containing ALL tools */}');
const modalStart = postReturn.indexOf('{/* UPGRADE PREMIUM PLAN PRO MODAL */}');

if (anchorStart === -1 || headerStart === -1 || gridStart === -1 || modalStart === -1) {
  console.log("Could not find one of the markers");
  process.exit(1);
}

const activeWorkspaceBlock = postReturn.substring(anchorStart, headerStart).trim();
let headerBlock = postReturn.substring(headerStart, gridStart).trim();
headerBlock = headerBlock.replace('className="mt-16 mb-8 pb-6 border-b border-slate-150"', 'className="mb-6 pb-6 border-b border-slate-800"');
headerBlock = headerBlock.replace('text-gray-500', 'text-slate-400');
headerBlock = headerBlock.replace('bg-surface-solid hover:bg-surface-glass border border-border-subtle text-slate-650', 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300');


let gridBlock = postReturn.substring(gridStart, modalStart).trim();
gridBlock = gridBlock.replace('className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 select-none"', 'className="flex flex-col gap-3 select-none pb-12"');
gridBlock = gridBlock.replace(/border-slate-150/g, 'border-slate-800');
gridBlock = gridBlock.replace(/bg-white/g, 'bg-slate-900');
gridBlock = gridBlock.replace(/text-gray-400/g, 'text-slate-400');
gridBlock = gridBlock.replace(/hover:border-gray-350/g, 'hover:border-slate-600');

const modalBlock = postReturn.substring(modalStart);

const newReturnBlock = `  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-slate-900 text-slate-100 fade-in overflow-hidden">
      
      {/* LEFT SIDEBAR: Tools Directory */}
      <motion.div 
        className="w-full lg:w-[350px] shrink-0 border-r border-slate-800 bg-[#0A0F1C] p-5 flex flex-col gap-6 lg:h-screen lg:sticky lg:top-0 overflow-y-auto custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        ${headerBlock}
        ${gridBlock}
      </motion.div>

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-900 relative lg:h-screen z-10 custom-scrollbar">
        <AnimatePresence mode="wait">
          {selectedToolId ? (
            <motion.div 
              key={selectedToolId} 
              initial={{ opacity: 0, scale: 0.98, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-5xl mx-auto"
            >
              ${activeWorkspaceBlock}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="h-full flex flex-col items-center justify-center min-h-[70vh]"
            >
               <div className="text-center space-y-6 flex flex-col items-center">
                 <div className="relative">
                   <div className="absolute inset-0 bg-brand-cobalt blur-3xl opacity-20 rounded-full animate-pulse"></div>
                   <div className="w-24 h-24 rounded-full bg-slate-800/80 flex items-center justify-center ring-1 ring-slate-700 shadow-2xl relative z-10 backdrop-blur-md">
                     <Sparkles className="w-10 h-10 text-accent" />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-3xl font-black font-display text-white tracking-tight">Select a tool to begin</h3>
                   <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">Choose from our collection of interactive utilities in the sidebar to boost your productivity.</p>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        ${modalBlock}
      </div>
`;
// The `</div>` to close RIGHT MAIN WORKSPACE is added above! 
// Wait! `modalBlock` also contains the final closing tags `</div> ); };`
// Oh, the right main workspace contains the modal, so it should be inside it, OR we close the main workspace and let the modal be outside. 
// It's fine for the modal to be inside the right workspace. But the modal uses `fixed inset-0`, so it overlays the whole screen anyway.
// So `modalBlock` ends with:
//       {/* UPGRADE PREMIUM PLAN PRO MODAL */}
//       ...
//     </div>
//   );
// };
// Let's verify: we opened 1 main wrapper, 1 sidebar, 1 workspace.
// Sidebar is closed. Main Wrapper and Workspace are left open.
// Modal block has 1 `</div>` at the end which closes the main wrapper. We need one more `</div>` to close the workspace.
// Wait! I added `</div>` right after `${modalBlock}` in the template string!
// That means `modalBlock` closes the Main Wrapper, and my extra `</div>` closes the Workspace? No, the order matters.
// It should be:
//      </div> {/* close workspace */}
//      ${modalBlock} /* This will output the modal and then </div> to close main wrapper */

const finalReturnBlock = newReturnBlock.replace(/      <\/div>\n$/, '      </div>\n'); // actually let's fix it properly.

const correctedReturnBlock = `  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-slate-900 text-slate-100 fade-in overflow-hidden">
      
      {/* LEFT SIDEBAR: Tools Directory */}
      <motion.div 
        className="w-full lg:w-[350px] shrink-0 border-r border-slate-800 bg-[#0A0F1C] p-5 flex flex-col gap-6 lg:h-screen lg:sticky lg:top-0 overflow-y-auto custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        ${headerBlock}
        ${gridBlock}
      </motion.div>

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-900 relative lg:h-screen z-10 custom-scrollbar">
        <AnimatePresence mode="wait">
          {selectedToolId ? (
            <motion.div 
              key={selectedToolId} 
              initial={{ opacity: 0, scale: 0.98, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-5xl mx-auto"
            >
              ${activeWorkspaceBlock}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="h-full flex flex-col items-center justify-center min-h-[70vh]"
            >
               <div className="text-center space-y-6 flex flex-col items-center">
                 <div className="relative">
                   <div className="absolute inset-0 bg-brand-cobalt blur-3xl opacity-20 rounded-full animate-pulse"></div>
                   <div className="w-24 h-24 rounded-full bg-slate-800/80 flex items-center justify-center ring-1 ring-slate-700 shadow-2xl relative z-10 backdrop-blur-md">
                     <Sparkles className="w-10 h-10 text-accent" />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-3xl font-black font-display text-white tracking-tight">Select a tool to begin</h3>
                   <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">Choose from our collection of interactive utilities in the sidebar to boost your productivity.</p>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div> {/* Close RIGHT MAIN WORKSPACE */}

      ${modalBlock}
`;

fs.writeFileSync(path, preReturn + correctedReturnBlock);
console.log("Refactoring complete with correct tags!");
