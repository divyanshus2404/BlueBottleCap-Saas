const fs = require('fs');
const path = '/Users/divyanshu/.gemini/antigravity/scratch/BlueBottleCap-Saas/src/components/ToolsSuite.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the start of the right workspace
const searchStart = `      <div className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-50 relative lg:h-screen z-10 custom-scrollbar">
        <AnimatePresence mode="wait">
          {selectedToolId ? (
            <motion.div 
              key={selectedToolId} 
              initial={{ opacity: 0, scale: 0.98, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-5xl mx-auto"
            >`;

const replaceStart = `      <div className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-50 relative lg:h-screen z-10 custom-scrollbar">
          {selectedToolId ? (
            <div key={selectedToolId} className="w-full max-w-5xl mx-auto fade-in">`;

content = content.replace(searchStart, replaceStart);

// Replace the end of the selectedToolId branch
const searchEmptyState = `            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="h-full flex flex-col items-center justify-center min-h-[70vh]"
            >`;

const replaceEmptyState = `            </div>
          ) : (
            <div key="empty-state" className="h-full flex flex-col items-center justify-center min-h-[70vh] fade-in">`;

content = content.replace(searchEmptyState, replaceEmptyState);

// Replace the end of AnimatePresence
const searchEnd = `            </motion.div>
          )}
        </AnimatePresence>
      </div> {/* Close RIGHT MAIN WORKSPACE */}`;

const replaceEnd = `            </div>
          )}
      </div> {/* Close RIGHT MAIN WORKSPACE */}`;

content = content.replace(searchEnd, replaceEnd);

fs.writeFileSync(path, content);
console.log("Removed AnimatePresence from workspace.");
