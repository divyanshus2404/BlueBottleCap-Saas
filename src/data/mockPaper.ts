import { MockPaper } from "../types";

export const MOCK_ACADEMIC_PAPER: MockPaper = {
  title: "Deep Learning Architectures for Academic Productivity: A Systematic Review",
  authors: "Alexander Chen, PhD & Sarah Jenkins, DSc | Institute for Advanced Cognitive Systems",
  doi: "https://doi.org/10.1016/j.cosmocap.2026.01.042",
  abstract: "The integration of large language architectures inside student workflows has transformed classic learning methodologies. This paper explores how Transformer-based systems, recursive neural nets, and visual OCR encoders can be combined into standard study environments to optimize paper summarization, text extraction, translation, and interactive feedback systems, arguing that customized co-pilots significantly raise critical reading efficiency.",
  pages: [
    {
      pageIndex: 1,
      title: "1. Introduction & The Paradigm Shift in Active Study",
      paragraphs: [
        "In the digital educational landscape, students are faced with an exponential increase in scientific literature and visual documents. Standard reading practices often result in search overload and shallow content understanding. The advent of attention-oriented neural networks, specifically the generative self-attention model, has initiated a cognitive renaissance in document comprehension. Rather than passive linear parsing, student workgroups require active co-piloting systems capable of providing real-time synthesis, targeted jargon decomposition, and contextual indexation.",
        "A critical bottleneck of traditional study is the 'cold start' phase of analyzing a dense academic paper. Prior modeling suggests that summarizing core themes, generating predictive Q&As, and utilizing inline dictionary feedback before in-depth parsing can reduce reading fatigue by up to 43%. By embedding interactive tooltips—including immediate text-to-speech rendering, cross-lingual translations, and smart flashcard generation—we establish a continuous feedback loop that fosters metacognitive awareness and improves retention rates.",
        "This contribution proposes BlueBottleCap, a unified suite of multimodal neural architectures designed to democratize high-efficiency research. Specifically, we investigate the effectiveness of combining a client-side split-pane document browser with a secure, server-side large language interface (LLM) powered by Google Gemini. Our empirical metrics demonstrate that interactive co-pilots enable students to synthesize quantitative findings, parse visual tables, and reconcile abstract equations at more than twice the speed of standard single-medium readers."
      ]
    },
    {
      pageIndex: 2,
      title: "2. Transformer Architectures & Multimodal Semantic Extraction",
      paragraphs: [
        "The underlying mechanics of semantic extraction rest upon Multi-Head Attention mechanisms. In a traditional setting, equations and data diagrams are decoupled from the narrative text, which forces a high cognitive load on the reader, who must jump back and forth. By executing a combined localized parsing grid, neural encoders translate coordinate visual bounding-boxes into unified rich-text markdown. This is particularly relevant for chemical diagrams, complex integration formulas, and data chart axes.",
        "When a student selects or highlights a specific segment of a paper (such as 'Multi-Head Attention'), a self-attention query vector is created. This vector is populated with the selected string and augmented with both document-level abstract embeddings and individual page-level references. This multi-layered context vector is then securely routed to our server-side API proxy. By appending strict pedagogical system instructions, we ensure the generative returned model provides educational, step-by-step Socratic breakdowns rather than simply providing answers.",
        "Furthermore, modern optical character recognition (OCR) systems utilize dense convolutional grids styled alongside tokenizers. This allows the students to sketch, screenshot, or scan old handwritten formula charts and instantly convert them into clean LaTeX symbols. The resulting system is fully robust to variations in contrast, alignment skew, and handwriting styles, providing a seamless transition between analog paper and digital intelligence."
      ]
    },
    {
      pageIndex: 3,
      title: "3. Pedagogical Ethics, Resource Optimization & Strategic Future",
      paragraphs: [
        "While co-pilots increase ingestion speed, ethical educational integration mandates strict guardrails. Over-reliance on auto-synthesizers can lead to semantic dependency and cognitive passivity. To counteract this potential drawback, BlueBottleCap implements an active recall and spaced repetition module. When an student requests an AI summary or highlight explanation, the platform automatically drafts an interactive flashcard pairing questions with answers. These cards are compiled into a personalized study deck, enforcing active memory retrieval.",
        "Resource constraints are another vital consideration in deploying student-facing software. High-performance LLM requests are computationally intensive. To preserve server health and encourage focused research habits, standard student accounts are structured with soft limits (e.g., 25 monthly AI queries). Users demanding unlocked throughput can transition to Pro models using our secure payment gateway. Usage analysis indicates that visual limits visualization—such as real-time tracking graphs and usage countdown indicators—substantially optimizes how students organize their search strategies.",
        "Future research directions involve fully localized on-device inference, allowing offline study sessions, and federated peer-to-peer document annotation networks. By bridging local web-assembly sandboxes with scalable server architectures, the modern scholar is equipped with an immutable, lifelong knowledge garden. In conclusion, the systematic integration of co-pilots marks not the replacement of human reading, but its expansion into an interactive dialogue with human knowledge itself."
      ]
    }
  ]
};
