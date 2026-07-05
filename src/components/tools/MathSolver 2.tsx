import React, { useState } from "react";
import { UploadCloud, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

interface MathSolverProps {
  onUseToolCredit: () => boolean;
}

export const MathSolver: React.FC<MathSolverProps> = ({ onUseToolCredit }) => {
  const [mathImage, setMathImage] = useState<string | null>(null);
  const [mathResult, setMathResult] = useState<string>("");
  const [mathLoading, setMathLoading] = useState<boolean>(false);

  const handleMathSolve = () => {
    if (!mathImage) return;
    if (!onUseToolCredit()) return;
    setMathLoading(true);
    setTimeout(() => {
      setMathResult("Step 1: Simplify the equation by finding a common denominator.\nStep 2: Combine the fractions.\nStep 3: Solve for x.\n\nFinal Answer: x = 42\n\n(Note: This is a placeholder response. In a real scenario, this would call the Math AI endpoint.)");
      setMathLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="relative rounded-xl border-2 border-dashed border-gray-200 p-6 text-center bg-surface-solid hover:bg-surface-solid transition cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setMathImage(reader.result as string);
              reader.readAsDataURL(file);
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {!mathImage ? (
          <div className="flex flex-col items-center justify-center pointer-events-none">
            <div className="p-3 bg-indigo-50 text-accent rounded-full mb-2">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Upload Formula Image</p>
            <p className="text-xs text-text-secondary mt-1">Supports handwritten and printed LaTeX (JPG, PNG)</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <img src={mathImage} alt="Math Equation" className="max-h-48 object-contain rounded-lg shadow-sm border border-border-subtle" />
            <button onClick={(e) => { e.stopPropagation(); setMathImage(null); setMathResult(""); }} className="mt-3 text-xs text-red-500 hover:underline">Remove Image</button>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button 
          disabled={!mathImage || mathLoading}
          onClick={handleMathSolve}
          className="bg-accent hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 transition"
        >
          {mathLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Solving...</> : <><Sparkles className="w-4 h-4" /> Solve Formula</>}
        </button>
      </div>

      {mathResult && (
        <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-2xl">
          <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Solution Generated</h3>
          <div className="text-sm text-green-800 whitespace-pre-wrap leading-relaxed">
            {mathResult}
          </div>
        </div>
      )}
    </div>
  );
};
