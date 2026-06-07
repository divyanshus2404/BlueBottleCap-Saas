<div align="center">
  <img src="./public/github-banner-v2.svg" width="100%" alt="BlueBottleCap SaaS Banner" />
  
  <br />
  
  <a href="https://github.com/divyanshus2404/BlueBottleCap-Saas">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&pause=1000&color=3B82F6&center=true&vCenter=true&width=600&lines=B.Tech+Study+Planner;Engineering+Flashcard+Maker;JEE+Question+Generator;PDF+Copilot+Assistant" alt="Typing SVG" />
  </a>

  <p>An Advanced AI Suite and SaaS Platform powered by Next.js, Google Gemini, and Supabase.</p>

  <p>
    <a href="https://github.com/divyanshus2404/BlueBottleCap-Saas/issues"><img alt="Issues" src="https://img.shields.io/github/issues/divyanshus2404/BlueBottleCap-Saas?color=3B82F6&style=for-the-badge&logo=github" /></a>
    <a href="https://github.com/divyanshus2404/BlueBottleCap-Saas/pulls"><img alt="Pull Requests" src="https://img.shields.io/github/issues-pr/divyanshus2404/BlueBottleCap-Saas?color=10B981&style=for-the-badge&logo=github" /></a>
    <a href="https://github.com/divyanshus2404/BlueBottleCap-Saas/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/divyanshus2404/BlueBottleCap-Saas?style=for-the-badge&logo=opensourceinitiative&color=8B5CF6" /></a>
  </p>
</div>

---

## 🌟 About The Project

**BlueBottleCap SaaS** is a modern, feature-rich platform designed to deliver powerful AI-driven tools directly to students. Whether you're planning your semester, creating flashcards, or solving complex JEE physics problems, BlueBottleCap uses state-of-the-art AI to supercharge your learning.

<p align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</p>

## ⚙️ Core AI Workflows

### 1. B.Tech Study Planner
The study planner analyzes your syllabus and automatically allocates time across your semester.

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 50, "rankSpacing": 50}}}%%
graph TD
    A([Student Input]) -->|Syllabus &<br/>Exam Dates| B(Gemini AI Engine)
    B -->|Analyzes<br/>Weights| C{Study Plan<br/>Generation}
    
    C -->|High<br/>Priority| D[Daily Tasks]
    C -->|Medium<br/>Priority| E[Weekly Revisions]
    C -->|Low<br/>Priority| F[Monthly Overviews]
    
    D --> G([Dashboard UI])
    E --> G
    F --> G
```

### 2. PDF Copilot
Upload any PDF and chat with it instantly. The AI reads the context and answers questions specifically from the document.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend
    participant Supabase
    participant GeminiAI
    
    User->>Frontend: Uploads Textbook PDF
    Frontend->>Supabase: Stores PDF & Extracts Text
    Supabase-->>Frontend: Returns Text Chunks
    User->>Frontend: Asks Question
    Frontend->>GeminiAI: Sends Context & Question
    GeminiAI-->>Frontend: Streams Answer
    Frontend-->>User: Displays Response
```

### 3. JEE Question Generator
Generates practice questions that mimic the difficulty and style of previous years' papers.

```mermaid
pie title "AI Question Distribution"
    "Physics (Mechanics, Electromagnetism)" : 35
    "Chemistry (Organic, Inorganic, Physical)" : 35
    "Mathematics (Calculus, Algebra)" : 30
```

<p align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</p>

## 🏛 System Architecture

The entire platform is built on a highly scalable, serverless architecture using modern web technologies.

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 60, "rankSpacing": 60}}}%%
graph TD
    UI(["Frontend<br/>(Next.js 15)"]) 

    subgraph Backend [Serverless Backend]
        API["API Routes"]
    end

    subgraph Services [External APIs]
        DB[("Supabase DB")]
        AI["Gemini AI"]
        Pay["Razorpay"]
    end

    UI <-->|API Requests<br/>& Responses| API
    
    API <-->|Queries &<br/>User Data| DB
    API <-->|Prompts &<br/>AI Streams| AI
    API <-->|Verifies &<br/>Status| Pay

    classDef ui fill:#3B82F6,stroke:#1D4ED8,stroke-width:2px,color:#fff;
    classDef api fill:#10B981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef db fill:#F59E0B,stroke:#B45309,stroke-width:2px,color:#fff;
    classDef ai fill:#8B5CF6,stroke:#6D28D9,stroke-width:2px,color:#fff;
    
    class UI ui;
    class API api;
    class DB,Pay db;
    class AI ai;
```

---

## 🛠 Tech Stack

<div align="center">
  
  ![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
  ![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
  ![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)
  
</div>

---

## 🚀 Getting Started

Follow these steps to get the primary AI Suite up and running on your local machine.

### Prerequisites

You need [Node.js](https://nodejs.org/) (v18+) and npm installed.

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/divyanshus2404/BlueBottleCap-Saas.git
   cd BlueBottleCap-Saas
   ```

2. **Install NPM packages**
   ```sh
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file at the root (or copy `.env.example`) and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```sh
   npm run dev
   ```
   Open `http://localhost:3000` to view the app in your browser!

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Divyanshu Singh** - [GitHub Profile](https://github.com/divyanshus2404)
