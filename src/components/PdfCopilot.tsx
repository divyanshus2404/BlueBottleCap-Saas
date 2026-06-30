"use client";

import React, { useState, useRef, useEffect } from "react";
import { MOCK_ACADEMIC_PAPER } from "../data/mockPaper";
import { ChatMessage, PaperHighlight, Flashcard, UserStats } from "../types";
import { Sparkles, MessageSquare, Globe, PlusSquare, BookOpen, AlertCircle, Play, ChevronLeft, ChevronRight, CornerDownLeft, Loader2, Sparkle, Trash2, Download } from "lucide-react";

interface PdfCopilotProps {
  userStats: UserStats;
  onIncrementQuery: () => boolean; // return true if allowed
  onAddFlashcard: (fc: Flashcard) => void;
  openedPapers: string[];
  onOpenPaper: (paperId: string) => boolean;
  onUpgradeClick: () => void;
  onGoBack?: () => void;
}

const MOCK_PAPERS_LIBRARY = [] as any[];

const loadPdfTextFromBlob = async (file: File, onProgress?: (percent: number) => void): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  
  if (!(window as any)['pdfjsLib']) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load PDF library."));
      document.head.appendChild(script);
    });
  }
  
  const pdfjsLib = (window as any)['pdfjsLib'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n\n";
    if (onProgress) {
      onProgress(Math.round((i / pdf.numPages) * 100));
    }
  }
  return fullText;
};

export const PdfCopilot: React.FC<PdfCopilotProps> = ({
  userStats,
  onIncrementQuery,
  onAddFlashcard,
  openedPapers,
  onOpenPaper,
  onUpgradeClick,
  onGoBack,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedText, setSelectedText] = useState<string>("");
  const [highlightColor, setHighlightColor] = useState<string>("yellow");
  const [highlights, setHighlights] = useState<PaperHighlight[]>([]);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  
  const [activePaperId, setActivePaperId] = useState<string>("");
  const [customPapers, setCustomPapers] = useState<any[]>([]);
  const [showPdfPaywallModal, setShowPdfPaywallModal] = useState<boolean>(false);
  const loadedPaperRef = useRef<string>("");

  const allPapers = [...MOCK_PAPERS_LIBRARY, ...customPapers];
  const activePaper = allPapers.find(p => p.id === activePaperId) || allPapers[0];

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const currentTitle = activePaper?.title || "No Document";
    const storageKey = `bbc_chat_history_${encodeURIComponent(currentTitle)}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load chat history on state initiation", e);
    }
    return [
      {
        id: "init-msg",
        role: "assistant",
        content: "Hello! I am your BlueBottleCap Academic Co-Pilot. Please upload a PDF, TXT, MD, or image document to begin chat analysis and highlight key concepts.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  // Track the initialized paper title
  useEffect(() => {
    if (activePaper) {
      loadedPaperRef.current = activePaper.title;
    }
  }, []);

  // Sync / load whenever the paper title changes
  useEffect(() => {
    if (!activePaper) {
      setChatMessages([
        {
          id: "init-msg",
          role: "assistant",
          content: "Hello! I am your BlueBottleCap Academic Co-Pilot. Please upload a PDF, TXT, MD, or image document to begin chat analysis and highlight key concepts.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
      return;
    }
    const currentTitle = activePaper.title;
    if (loadedPaperRef.current === currentTitle) {
      return; // Already loaded or initialized
    }

    const storageKey = `bbc_chat_history_${encodeURIComponent(currentTitle)}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatMessages(parsed);
        } else {
          setChatMessages([
            {
              id: "init-msg-new",
              role: "assistant",
              content: `Hello! I am your BlueBottleCap Academic Co-Pilot. I have pre-digested ${currentTitle}. Try highlighting any sentence in the paper, or use the shortcuts below to analyze this text.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
        }
      } else {
        setChatMessages([
          {
            id: "init-msg-new",
            role: "assistant",
            content: `Hello! I am your BlueBottleCap Academic Co-Pilot. I have pre-digested ${currentTitle}. Try highlighting any sentence in the paper, or use the shortcuts below to analyze this text.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }
    } catch (e) {
      console.error("Failed to load chat history due to title change", e);
    }

    loadedPaperRef.current = currentTitle;
    setCurrentPage(1); // Reset page to 1
  }, [activePaper?.title]);

  // Save chatMessages state to local storage whenever it changes
  useEffect(() => {
    if (!activePaper) return;
    const currentTitle = activePaper.title;
    // Only save if the messages correspond to the current paper title 
    if (loadedPaperRef.current !== currentTitle) {
      return;
    }

    const storageKey = `bbc_chat_history_${encodeURIComponent(currentTitle)}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(chatMessages));
    } catch (e) {
      console.error("Failed to save chat history", e);
    }
  }, [chatMessages, activePaper?.title]);

  const [currentInput, setCurrentInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("Spanish");
  const [errors, setErrors] = useState<string | null>(null);

  const textViewerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to latest messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadFilename, setUploadFilename] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handlePaperChange = (paperId: string) => {
    if (onOpenPaper(paperId)) {
      setActivePaperId(paperId);
      setSelectedText("");
      setTooltipPos(null);
    } else {
      setShowPdfPaywallModal(true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    // Reset so picking the same filename again still fires onChange
    // (lets the user retry a failed upload or re-import an updated file).
    input.value = "";
    if (!file) return;

    const paperId = `custom-${file.name}`;
    
    // Perform limit/paywall checks first
    if (!onOpenPaper(paperId)) {
      setShowPdfPaywallModal(true);
      return;
    }

    setUploadingFile(true);
    setUploadFilename(file.name);
    setUploadProgress(0);
    setUploadStatus("Reading file...");

    try {
      if (file.type.startsWith("image/")) {
        setUploadProgress(40);
        setUploadStatus("Extracting visual nodes...");
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result as string;
          setUploadProgress(100);
          setUploadStatus("Analysis complete!");
          setUploadingFile(false);

          const newCustomPaper = {
            id: paperId,
            title: file.name,
            authors: "Self Uploaded Image Document | Local Sandbox Storage",
            doi: "Local Sandbox File",
            abstract: `Custom image document "${file.name}" uploaded for AI visual breakdown.`,
            isImage: true,
            imageSrc: base64Data,
            pages: [
              {
                pageIndex: 1,
                title: "1. Visual Analysis Preview",
                paragraphs: ["Visual analysis active. Use the AI Chat on the right to analyze diagrams, formulas, or text in this image."]
              }
            ]
          };

          setCustomPapers(prev => [...prev, newCustomPaper]);
          setActivePaperId(paperId);
          setSelectedText("");
          setTooltipPos(null);
        };
        reader.onerror = () => {
          throw new Error("Failed to read image file.");
        };
        reader.readAsDataURL(file);

      } else if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        setUploadProgress(50);
        setUploadStatus("Parsing text structure...");
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          setUploadProgress(100);
          setUploadStatus("Analysis complete!");
          setUploadingFile(false);

          const paragraphs = text.split("\n\n").map(p => p.trim()).filter(p => p !== "");
          const newCustomPaper = {
            id: paperId,
            title: file.name,
            authors: "Self Uploaded Text Document | Local Sandbox Storage",
            doi: "Local Sandbox File",
            abstract: `Custom text document "${file.name}" parsed into reading paragraphs.`,
            pages: [
              {
                pageIndex: 1,
                title: "1. Document Content",
                paragraphs: paragraphs.length > 0 ? paragraphs : ["This document contains no text."]
              }
            ]
          };

          setCustomPapers(prev => [...prev, newCustomPaper]);
          setActivePaperId(paperId);
          setSelectedText("");
          setTooltipPos(null);
        };
        reader.onerror = () => {
          throw new Error("Failed to read text file.");
        };
        reader.readAsText(file);

      } else if (file.name.endsWith(".pdf") || file.type === "application/pdf") {
        setUploadStatus("Loading PDF parser...");
        setUploadProgress(20);
        
        try {
          const text = await loadPdfTextFromBlob(file, (pct) => {
            setUploadProgress(20 + Math.round(pct * 0.7));
            setUploadStatus(`Extracting text nodes (${pct}%)...`);
          });

          setUploadProgress(100);
          setUploadStatus("Analysis complete!");
          setUploadingFile(false);

          const isScanned = text.trim().length === 0;
          const paragraphs = isScanned
            ? ["*(Scanned PDF file detected. Empty text extracted client-side. Live AI responses will use a default overview. To run full server-side OCR on scanned documents, please sign up or upgrade.)*"]
            : text.split("\n\n").map(p => p.trim()).filter(p => p !== "");

          // Group paragraphs into pages (say 4 paragraphs per page)
          const pages: any[] = [];
          const paragraphsPerPage = 4;
          let currentPageIndex = 1;

          for (let i = 0; i < paragraphs.length; i += paragraphsPerPage) {
            const pagePars = paragraphs.slice(i, i + paragraphsPerPage);
            pages.push({
              pageIndex: currentPageIndex,
              title: `Page ${currentPageIndex}: Section Analysis`,
              paragraphs: pagePars
            });
            currentPageIndex++;
          }

          if (pages.length === 0) {
            pages.push({
              pageIndex: 1,
              title: "Page 1: Section Analysis",
              paragraphs: ["Empty document content."]
            });
          }

          const newCustomPaper = {
            id: paperId,
            title: file.name,
            authors: "Self Uploaded PDF Document | Local Sandbox Storage",
            doi: "Local Sandbox File",
            abstract: `Extracted text document "${file.name}" with ${pages.length} pages.`,
            pages
          };

          setCustomPapers(prev => [...prev, newCustomPaper]);
          setActivePaperId(paperId);
          setSelectedText("");
          setTooltipPos(null);

        } catch (pdfErr: any) {
          console.error("PDF parsing failed:", pdfErr);
          throw new Error("Failed to parse PDF file. (File might be corrupted or protected)");
        }

      } else {
        throw new Error("Unsupported file format. Please upload .pdf, .txt, .md, or images.");
      }
    } catch (err: any) {
      setUploadingFile(false);
      setUploadStatus("Error uploading file.");
      alert(err.message || "Failed to upload file.");
    }
  };

  const handleSimulateUpload = () => {
    document.getElementById("pdf-copilot-file-input")?.click();
  };

  // Handle manual selection inside center pane
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection) return;

    const text = selection.toString().trim();
    if (text.length > 3) {
      setSelectedText(text);

      // Try positioning the tooltip above/near selection coordinates
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (textViewerRef.current) {
          const containerRect = textViewerRef.current.getBoundingClientRect();
          setTooltipPos({
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top - 45,
          });
        }
      } catch (err) {
        setTooltipPos({ x: 200, y: 150 });
      }
    } else {
      setSelectedText("");
      setTooltipPos(null);
    }
  };

  // Preset highlights helper so the user doesn't struggle to highlight on standard devices
  const simulationPhrases = [
    { phrase: "generative self-attention model", color: "indigo" },
    { phrase: "Multi-Head Attention", color: "teal" },
    { phrase: "optical character recognition (OCR)", color: "sky" },
    { phrase: "Socratic breakdowns", color: "amber" },
    { phrase: "active recall and spaced repetition", color: "purple" }
  ];

  const applyCustomHighlight = (phrase: string, color: string) => {
    if (!activePaper) return;
    const paperText = activePaper.pages.find((p: any) => p.pageIndex === currentPage)?.paragraphs.join(" ") || "";
    if (paperText.toLowerCase().includes(phrase.toLowerCase())) {
      const match = highlights.find(h => h.text.toLowerCase() === phrase.toLowerCase() && h.pageIndex === currentPage);
      if (!match) {
        const newHighlight: PaperHighlight = {
          id: `hl-${Date.now()}`,
          text: phrase,
          color: color,
          pageIndex: currentPage,
        };
        setHighlights(prev => [...prev, newHighlight]);
        setSelectedText(phrase);
        setTooltipPos({ x: 250, y: 100 });
      }
    }
  };

  // Query Gemini API endpoint
  const queryGeminiCoPilot = async (prompt: string, contextSelectedText?: string) => {
    if (!activePaper) return;
    if (!onIncrementQuery()) {
      alert("You have reached your free monthly limit. Please upgrade to Pro in the Pricing tab for infinite queries.");
      return;
    }

    setLoading(true);
    setErrors(null);

    // Build immediate message log for reactive user response
    const newUserMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newUserMessage]);

    try {
      let response;
      let aiReplyText = "";

      if (activePaper.isImage) {
        // Send base64 image data to the real image-analysis endpoint
        const base64Data = activePaper.imageSrc.split(",")[1];
        response = await fetch("/api/gemini/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64Data,
            prompt: prompt,
            mimeType: activePaper.imageSrc.split(";")[0].split(":")[1] || "image/png"
          })
        });

        if (!response.ok) {
          throw new Error("Visual Analysis endpoint refused connection.");
        }
        const data = await response.json();
        aiReplyText = data.analysis;
      } else {
        const activePaperContext = `
        Title: ${activePaper.title}
        Authors: ${activePaper.authors}
        Page ${currentPage} Content:
        ${activePaper.pages.find((p: any) => p.pageIndex === currentPage)?.paragraphs.join("\n\n")}
        `;

        response = await fetch("/api/gemini/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...chatMessages, newUserMessage].map(m => ({ role: m.role, content: m.content })),
            paperContext: activePaperContext,
            highlightedText: contextSelectedText || selectedText || undefined,
          }),
        });

        if (!response.ok) {
          if (response.status === 503) {
            throw new Error("API_KEY_MISSING");
          }
          throw new Error("Co-Pilot server refused connection.");
        }
        const data = await response.json();
        aiReplyText = data.reply;
      }

      const newAiMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        content: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, newAiMessage]);

    } catch (err: any) {
      console.warn("Gemini Live Query failed:", err);
      if (err.message === "API_KEY_MISSING") {
         setErrors("Missing GEMINI_API_KEY. Using simulated offline responses. Please configure your API key to enable live AI analysis.");
      } else {
         setErrors(err.message || "Failed to contact Gemini servers.");
      }

      // Provide academic mock fallback values so the portal NEVER feels broken
      setTimeout(() => {
        let simulatedContent = "";
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes("summarize") || lowerPrompt.includes("summary")) {
          simulatedContent = `### Simulated Page ${currentPage} Synthesis
Here is a fast pedagogical summary for Page ${currentPage}:
1. **Core Concept**: Understanding attention-oriented Transformer networks and active student metadata.
2. **Socratic Insight**: Prior study models suggest a preload summary framework lowers student mental fatigue limits by up to 43%.
3. **Takeaway**: Embedded interactive tools bridge passive scanning with proactive retention.

*(To experience live AI replies, configure your **GEMINI_API_KEY** under Secrets panel)*`;
        } else if (lowerPrompt.includes("translate")) {
          simulatedContent = `### Simulated ${language} Translation
Here is the academic translation of the highlighted passage:
> "${contextSelectedText || selectedText || "Selected passage"}"

Translating to **${language}**:
"${getDummyTranslation(contextSelectedText || selectedText || "", language)}"

*(To experience live AI translations, configure your **GEMINI_API_KEY** under Secrets panel)*`;
        } else if (lowerPrompt.includes("recall") || lowerPrompt.includes("jargon") || lowerPrompt.includes("explain")) {
          simulatedContent = `### Scholastic Jargon Clarification: "${contextSelectedText || selectedText}"
We have mapped this term inside deep learning and academic methodologies:
- **Conceptual Definition**: A neural mechanism allowing systems to dynamically weigh parts of a sequence differently to match context.
- **Why it matters**: It resolves long-term dependencies, converting static reference lists into interactive conversational guides.

*(To experience live AI explanations, configure your **GEMINI_API_KEY** under Secrets panel)*`;
        } else {
          simulatedContent = `### Academic Assistant Reply
You asked: "${prompt}"

I have analyzed this regarding Chapter ${currentPage}. Transformers enable quick textual processing, making student study co-pilots 2x faster than normal.

*(Note: Live Gemini model responses require an active **GEMINI_API_KEY** configured via the Settings secrets panel. Enjoy this offline educational tutorial!)*`;
        }

        const fallbackMessage: ChatMessage = {
          id: `msg-ai-fallback-${Date.now()}`,
          role: "assistant",
          content: simulatedContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages(prev => [...prev, fallbackMessage]);
      }, 900);
    } finally {
      setLoading(false);
      setSelectedText("");
      setTooltipPos(null);
    }
  };

  const getDummyTranslation = (text: string, lang: string) => {
    if (lang === "Spanish") return "Integración en planes de estudio para optimizar compresión de lectura.";
    if (lang === "French") return "Intégration d'architectures d'attention pour optimiser la compréhension.";
    if (lang === "German") return "Aufmerksamkeitsorientierte Architektursysteme zur Optimierung des Verständnisses.";
    return "Symmetric study translation complete.";
  };

  // Create an interactive flashcard
  const makeFlashcardFromHighlight = (textTerm: string) => {
    const activeText = textTerm || selectedText || "Attention Networks";
    const newCard: Flashcard = {
      id: `fc-${Date.now()}`,
      question: `Define this key concept from the paper: "${activeText}"`,
      answer: `A pedagogical mechanism mentioned on Page ${currentPage}. Large Language Models and interactive layouts combine to translate and explain high-density formulas.`,
      category: "AI Academic Suite",
    };
    onAddFlashcard(newCard);
    
    // Notify in chat logs
    setChatMessages(prev => [
      ...prev,
      {
        id: `notify-${Date.now()}`,
        role: "assistant",
        content: `📝 **Flashcard Generated!** Under "Tools Suite > Flashcards Deck", we created a Spaced Repetition card for: **"${activeText}"**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    
    setSelectedText("");
    setTooltipPos(null);
  };

  const clearChatHistory = () => {
    const defaultInitMessage: ChatMessage = {
      id: "init-msg",
      role: "assistant",
    content: `Hello! I am your BlueBottleCap Academic Co-Pilot. I have pre-digested ${activePaper?.title.split(":")[0] || "your document"}. Try highlighting any sentence in the paper, or use the shortcuts below to analyze this text.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    if (window.confirm("Are you sure you want to clear the chat history for this paper?")) {
      setChatMessages([defaultInitMessage]);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;
    queryGeminiCoPilot(currentInput);
    setCurrentInput("");
  };

  const handleExportHighlights = () => {
    if (highlights.length === 0) {
      alert("No highlights found yet! Try highlighting custom text in the document body, or click on simulation phrases to generate highlights first.");
      return;
    }

    const exportData = highlights.map(hl => ({
      pageNumber: hl.pageIndex,
      textContent: hl.text,
      color: hl.color
    }));

    try {
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const secureTitle = (activePaper?.title || "highlights")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .substring(0, 30);
      link.download = `${secureTitle}_highlights.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export highlights", e);
      alert("Failed to export highlights to JSON.");
    }
  };

  return (
    <div className="bbc w-full px-4 py-8 sm:px-6 lg:px-8 fade-in min-h-[calc(100vh-73px)]">
      
      {onGoBack && (
        <button 
          onClick={onGoBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-blue-ink)] transition-colors mb-4 group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
      )}

      {/* Page header warnings */}
      {errors && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-orange-50 p-4 text-xs font-bold text-amber-800 border border-orange-100">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="grow">
            <span>{errors}</span>
          </div>
          <button 
            onClick={() => setErrors(null)} 
            className="text-gray-400 hover:text-gray-600 text-sm font-mono leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Main 3 Panels Split Pane */}
      <div className="grid gap-6 lg:grid-cols-12 min-h-[640px]">
        
        {/* PANEL 1: Left Index Panel (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-slate-50/50 p-4 space-y-5">
          {/* Always: Upload is hero */}
          <div>
            <button
              onClick={handleSimulateUpload}
              disabled={uploadingFile}
              className="w-full text-center rounded-xl bg-[var(--color-blue-ink)] hover:bg-[var(--color-blue-deep)] text-white py-2.5 text-xs font-bold transition shadow-sm cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {uploadingFile ? "Uploading..." : "+ Upload Document"}
            </button>
            <input
              type="file"
              id="pdf-copilot-file-input"
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.webp"
            />
            {uploadingFile && (
              <div className="mt-2 p-2.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-blue-wash)]/60 text-[9px] font-mono text-[var(--color-blue-deep)] space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="truncate max-w-[100px]">{uploadFilename}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                  <div className="bg-brand-cobalt h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <span className="text-[7.5px] text-brand-cobalt animate-pulse block">{uploadStatus}</span>
              </div>
            )}

            {/* Recent doc picker only when there are docs */}
            {allPapers.length > 0 && (
              <div className="mt-3">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400">Recent</span>
                <select
                  value={activePaper?.id ?? ""}
                  onChange={(e) => handlePaperChange(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white p-2 text-xs font-semibold text-brand-navy focus:outline-hidden cursor-pointer"
                >
                  {allPapers.map((paper) => (
                    <option key={paper.id} value={paper.id}>
                      {paper.title.length > 25 ? `${paper.title.substring(0, 22)}...` : paper.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Only when a paper is loaded: pages, export, advanced */}
          {activePaper && (
            <>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400">Pages</span>
                <div className="mt-3 space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                  {activePaper.pages.map((p: any) => {
                    const active = currentPage === p.pageIndex;
                    return (
                      <button
                        key={p.pageIndex}
                        onClick={() => {
                          setCurrentPage(p.pageIndex);
                          setSelectedText("");
                          setTooltipPos(null);
                        }}
                        className={`w-full text-left rounded-lg p-2.5 transition-all text-xs border ${
                          active
                            ? "bg-white border-brand-cobalt text-brand-cobalt shadow-xs font-bold"
                            : "bg-transparent border-transparent text-gray-500 hover:bg-slate-100 hover:text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] ${
                            active ? "bg-brand-cobalt text-white" : "bg-slate-200 text-gray-600"
                          }`}>
                            {p.pageIndex}
                          </span>
                          <span className="truncate leading-tight uppercase font-display select-none">
                            Page {p.pageIndex}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleExportHighlights}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-navy hover:bg-brand-cobalt text-white py-2 text-[11px] font-bold transition shadow-sm cursor-pointer select-none"
                title="Export Highlighted references to JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Highlights</span>
              </button>

              <details className="group">
                <summary className="cursor-pointer text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400 hover:text-gray-600 list-none flex items-center justify-between">
                  <span>Quick Highlights</span>
                  <span className="text-gray-300 group-open:rotate-90 transition-transform">›</span>
                </summary>
                <div className="mt-3 space-y-2">
                  {simulationPhrases.map(phraseItem => (
                    <button
                      key={phraseItem.phrase}
                      onClick={() => applyCustomHighlight(phraseItem.phrase, phraseItem.color)}
                      className="flex items-center gap-1.5 w-full text-left rounded-lg bg-white border border-gray-200 p-2 hover:bg-slate-50 text-[11px] transition"
                    >
                      <Sparkle className="w-3.5 h-3.5 text-brand-sky" />
                      <span className="truncate font-semibold capitalize text-gray-600">{phraseItem.phrase}</span>
                    </button>
                  ))}
                </div>
              </details>
            </>
          )}
        </div>

        {/* PANEL 2: Center Document Body Panel (6 cols) */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {!activePaper ? (
            <div className="flex flex-col items-center justify-center grow py-12 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)] ring-8 ring-[var(--color-blue-wash)]/60">
                <BookOpen className="h-8 w-8 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-brand-navy">No Documents Uploaded</h3>
                <p className="mt-1 text-xs text-gray-500 max-w-sm font-sans">
                  Drop a PDF, notes file, or image to start. Ask questions on the right — answers cite the page they came from.
                </p>
              </div>
              <button
                onClick={handleSimulateUpload}
                disabled={uploadingFile}
                className="rounded-xl bg-[var(--color-blue-ink)] hover:bg-[var(--color-blue-deep)] text-white font-bold py-2.5 px-4 text-xs transition shadow-sm cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {uploadingFile ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          ) : (
            <>
              {/* Paper Info Header */}
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[10px] font-mono font-bold text-brand-cobalt uppercase tracking-widest">{activePaper.doi}</span>
                <h1 className="mt-1 font-display font-black text-xl tracking-tight text-brand-navy leading-snug">
                  {activePaper.title}
                </h1>
                <p className="mt-1.5 text-xs text-slate-400 font-semibold">{activePaper.authors}</p>
              </div>

              {/* Abstract callout panel */}
              {currentPage === 1 && activePaper.abstract && (
                <div className="mt-4 rounded-xl bg-slate-50/50 border border-slate-100 p-4 text-xs font-medium text-gray-500 leading-relaxed italic">
                  <strong>Abstract:</strong> {activePaper.abstract}
                </div>
              )}

              {/* Core scrollable article text container */}
              <div 
                ref={textViewerRef}
                onMouseUp={handleTextSelection}
                className="relative grow mt-6 overflow-y-auto max-h-[460px] pr-2 space-y-4 text-sm text-gray-700 leading-relaxed font-sans selection:bg-brand-cobalt/25 select-text"
              >
                {activePaper.isImage ? (
                  <div className="flex flex-col items-center justify-center py-6 space-y-4 select-none">
                    <img 
                      src={activePaper.imageSrc} 
                      alt={activePaper.title} 
                      className="max-h-[350px] w-auto rounded-xl border border-slate-200 shadow-md object-contain animate-fade-in" 
                    />
                    <p className="text-xs text-slate-500 text-center max-w-md bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                      🖼️ <strong>Image Document Mode.</strong> Use the AI Chat on the right to analyze diagrams, solve formulas, or explain this image!
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-display font-extrabold text-brand-navy border-b border-dashed border-gray-100 pb-1">
                      {activePaper.pages.find((p: any) => p.pageIndex === currentPage)?.title}
                    </h3>

                    {activePaper.pages.find((p: any) => p.pageIndex === currentPage)?.paragraphs.map((par: string, pIdx: number) => {
                      let renderedParagraph: React.ReactNode = par;
                      
                      const pageHls = highlights.filter(hl => hl.pageIndex === currentPage);
                      if (pageHls.length > 0) {
                        let paragraphElements: React.ReactNode[] = [];
                        let currentText = par;

                        pageHls.forEach((hl) => {
                          const hlText = hl.text;
                          const idx = currentText.toLowerCase().indexOf(hlText.toLowerCase());
                          if (idx !== -1) {
                            paragraphElements.push(currentText.substring(0, idx));
                            paragraphElements.push(
                              <mark 
                                key={hl.id} 
                                className={`font-semibold bg-[var(--color-blue-wash)] px-1 text-[var(--color-blue-deep)] border-b-2 border-[var(--color-blue-ink)] cursor-pointer rounded-xs`}
                                onClick={() => {
                                  setSelectedText(hlText);
                                  setTooltipPos({ x: 200, y: 150 });
                                }}
                              >
                                {currentText.substring(idx, idx + hlText.length)}
                              </mark>
                            );
                            currentText = currentText.substring(idx + hlText.length);
                          }
                        });
                        paragraphElements.push(currentText);
                        renderedParagraph = <>{paragraphElements}</>;
                      }

                      return (
                        <p key={pIdx} className="indent-4 text-justify">
                          {renderedParagraph}
                        </p>
                      );
                    })}
                  </>
                )}

                {/* FLOATING TEXT OPTIONS TOOLTIP WINDOW */}
                {tooltipPos && selectedText && (
                  <div 
                    className="absolute z-40 flex items-center gap-1 rounded-xl bg-brand-navy p-1 shadow-lg text-white text-[11px] font-bold py-1.5 px-2 fade-in"
                    style={{ 
                      left: `${tooltipPos.x}px`, 
                      top: `${tooltipPos.y}px`,
                      transform: "translateX(-50%)"
                    }}
                  >
                    <button
                      onClick={() => queryGeminiCoPilot(`Please explain this jargon term deeply in academic context: "${selectedText}"`, selectedText)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-white hover:bg-white/10 transition cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-blue-300" />
                      <span>Explain Jargon</span>
                    </button>
                    
                    <span className="w-px h-4 bg-white/20"></span>

                    <div className="flex items-center gap-1 text-white">
                      <button
                        onClick={() => queryGeminiCoPilot(`Translate to ${language}: "${selectedText}"`, selectedText)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-white/10 transition cursor-pointer"
                      >
                        <Globe className="w-3 h-3 text-emerald-300" />
                        <span>Translate</span>
                      </button>
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-transparent text-white border-0 text-[10px] focus:outline-hidden font-bold pr-1 select-none cursor-pointer"
                      >
                        <option value="Spanish" className="text-gray-900 font-sans font-bold">ES</option>
                        <option value="French" className="text-gray-900 font-sans font-bold">FR</option>
                        <option value="German" className="text-gray-900 font-sans font-bold">DE</option>
                        <option value="Japanese" className="text-gray-900 font-sans font-bold">JA</option>
                      </select>
                    </div>

                    <span className="w-px h-4 bg-white/20"></span>

                    <button
                      onClick={() => makeFlashcardFromHighlight(selectedText)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-white hover:bg-white/10 transition cursor-pointer"
                    >
                      <PlusSquare className="w-3 h-3 text-teal-300" />
                      <span>Make Flashcard</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Annotation Count Footer */}
              <div className="mt-4 border-t border-gray-100 pt-4 flex justify-between items-center text-xs text-gray-400 font-mono">
                <span>Highlight count on page: {highlights.filter(h => h.pageIndex === currentPage).length}</span>
                <span>Study progress: Page {currentPage} of {activePaper.pages.length}</span>
              </div>
            </>
          )}
        </div>

        {/* PANEL 3: Right AI Co-Pilot Chat Sidebar Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col rounded-2xl border border-gray-105 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-brand-cobalt" />
              <h3 className="font-display font-extrabold text-brand-navy text-sm">Copilot Assistant</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={clearChatHistory}
                title="Clear chat history"
                className="rounded-lg p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <span className="rounded-full bg-slate-200/60 px-2 py-0.5 text-[9px] font-bold text-gray-500 font-mono">
                v3.5 Flash
              </span>
            </div>
          </div>

          {/* Instant Prompt Actions Bar */}
          <div className="my-3 flex gap-1.5 overflow-x-auto pb-1 select-none shrink-0 scrollbar-none">
            <button
              onClick={() => queryGeminiCoPilot(`Can you summarize the main findings of Page ${currentPage}?`)}
              className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:border-brand-cobalt hover:text-brand-cobalt shrink-0 transition cursor-pointer"
            >
              📝 Summarize Page
            </button>
            <button
              onClick={() => queryGeminiCoPilot(`Can you identify the critical math formula or logical methodology on Page ${currentPage}?`)}
              className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:border-brand-cobalt hover:text-brand-cobalt shrink-0 transition cursor-pointer"
            >
              📐 Key Equations
            </button>
            <button
              onClick={() => queryGeminiCoPilot(`Generate 3 quiz trivia questions based strictly on the text of Page ${currentPage} so I can test my retention.`)}
              className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:border-brand-cobalt hover:text-brand-cobalt shrink-0 transition cursor-pointer"
            >
              🧠 Test Me
            </button>
          </div>

          {/* Scrollable messages container */}
          <div className="grow overflow-y-auto max-h-[350px] min-h-[190px] pr-1 space-y-3 pb-3">
            {chatMessages.map((msg) => {
              const isAi = msg.role === "assistant";
              const shareToWhatsApp = () => {
                if (typeof window === "undefined") return;
                const trimmed = msg.content.length > 800 ? msg.content.slice(0, 800) + "…" : msg.content;
                const text = `${trimmed}\n\n— answered by BlueBottleCap · https://bluebottlecap.com`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
              };
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[90%] rounded-2xl p-3.5 text-xs tracking-normal leading-relaxed ${
                    isAi
                      ? "bg-white text-gray-800 self-start border border-gray-100 shadow-2xs"
                      : "bg-brand-navy text-white self-end ml-auto"
                  }`}
                >
                  <div className="font-sans whitespace-pre-wrap">{msg.content}</div>
                  <div className={`mt-1.5 flex items-center justify-between gap-2 ${isAi ? "" : "flex-row-reverse"}`}>
                    <span className={`text-[8px] uppercase select-none ${isAi ? "text-gray-400" : "text-white/50"}`}>
                      {msg.timestamp}
                    </span>
                    {isAi && (
                      <button
                        type="button"
                        onClick={shareToWhatsApp}
                        title="Share this answer on WhatsApp"
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                          <path d="M8 0a8 8 0 0 0-6.9 12l-1.1 4 4.1-1A8 8 0 1 0 8 0zm4.6 11.3c-.2.5-1.1 1-1.5 1-.4 0-.9.1-1.5-.1-1.6-.6-2.7-1.7-3.3-2.4-.6-.7-1.4-1.8-1.4-2.7s.5-1.4.7-1.6c.2-.2.4-.2.6-.2h.4c.1 0 .3 0 .5.4l.7 1.7c.1.2.1.4 0 .5l-.3.4-.2.3c-.1.1-.2.2 0 .4.2.3.7 1 1.3 1.5.7.5 1.3.7 1.5.8.2.1.4.1.5-.1l.6-.7c.1-.2.3-.2.5-.1.2.1 1.4.7 1.6.8.2.1.3.2.4.3.1.2.1.7 0 1z"/>
                        </svg>
                        Share
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex items-center gap-2 rounded-2xl bg-white border border-gray-100 p-4 text-xs text-gray-500 self-start max-w-[80%] animate-pulse">
                <Loader2 className="h-4 w-4 text-brand-cobalt animate-spin" />
                <span>Scholar co-pilot is thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* User message submission form */}
          <form onSubmit={handleSendMessage} className="mt-3 shrink-0 relative">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Ask anything about the paper..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-3.5 pr-12 text-xs font-medium focus:border-brand-cobalt focus:outline-hidden"
              disabled={loading}
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 rounded-lg bg-brand-navy p-1.5 text-white hover:bg-brand-cobalt transition disabled:opacity-50 cursor-pointer"
              disabled={loading || !currentInput.trim()}
            >
              <CornerDownLeft className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>

      </div>

      {/* PDF PAYWALL MODAL */}
      {showPdfPaywallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl p-6.5 shadow-2xl relative border border-slate-100 text-center space-y-4">
            
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)] ring-4 ring-[var(--color-blue-ink)]/5 animate-bounce-slow">
              <BookOpen className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-display text-2xl font-black text-brand-navy tracking-tight">
                Unlock Unlimited PDFs
              </h3>
              <p className="mt-2 text-xs text-gray-500 leading-normal max-w-xs mx-auto font-sans">
                Free accounts are limited to <strong>1 PDF</strong> and <strong>5 chat messages per session</strong>. Upgrade to Pro for unlimited PDFs, chat, mocks, and flashcards.
              </p>
            </div>

            {/* Benefit Grid */}
            <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50/50 p-4 text-left text-xs space-y-2 font-sans">
              <div className="flex justify-between font-bold text-brand-navy">
                <span>⭐ Pro Scholar Plan Benefits:</span>
                <span className="text-brand-cobalt font-extrabold">Unlimited</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>• Infinite PDF uploads</span>
                <span className="font-bold text-emerald-600">Yes</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>• Full Gemini AI chat history</span>
                <span className="font-bold text-emerald-600">Yes</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>• 10 GB Secure Cloud Drive</span>
                <span className="font-bold text-emerald-600">Yes</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowPdfPaywallModal(false)}
                className="w-1/2 rounded-xl border border-gray-200 hover:bg-slate-50 py-3 text-xs font-bold text-gray-600 transition cursor-pointer"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowPdfPaywallModal(false);
                  onUpgradeClick();
                }}
                className="w-1/2 rounded-xl bg-[var(--color-blue-ink)] hover:bg-[var(--color-blue-deep)] text-white font-bold py-3 text-xs transition shadow-sm select-none cursor-pointer"
              >
                Upgrade Now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
