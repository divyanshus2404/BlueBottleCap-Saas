<div align="center">
  <img src="./public/github-banner-v2.svg" width="100%" alt="BlueBottleCap" />

  <br />

  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1200&color=3B82F6&center=true&vCenter=true&width=560&lines=Chat+with+your+textbooks.;Generate+JEE-grade+mock+tests.;Plan+your+entire+semester+with+AI.;Built+for+Indian+engineering+students." alt="What BlueBottleCap does" />

  <p><strong>The AI study workspace for JEE, GATE & B.Tech</strong> — live at <a href="https://bluebottlecap.com">bluebottlecap.com</a></p>

  <p>
    <a href="https://github.com/divyanshus2404/BlueBottleCap-Saas/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22"><img alt="Good first issues" src="https://img.shields.io/github/issues/divyanshus2404/BlueBottleCap-Saas/good%20first%20issue?color=7057ff&style=for-the-badge&label=good%20first%20issues" /></a>
    <a href="https://github.com/divyanshus2404/BlueBottleCap-Saas/issues"><img alt="Issues" src="https://img.shields.io/github/issues/divyanshus2404/BlueBottleCap-Saas?color=3B82F6&style=for-the-badge" /></a>
    <a href="https://github.com/divyanshus2404/BlueBottleCap-Saas/pulls"><img alt="PRs" src="https://img.shields.io/github/issues-pr/divyanshus2404/BlueBottleCap-Saas?color=10B981&style=for-the-badge" /></a>
    <a href="LICENSE"><img alt="License" src="https://img.shields.io/github/license/divyanshus2404/BlueBottleCap-Saas?style=for-the-badge&color=8B5CF6" /></a>
  </p>
</div>

<br />

## What it does

| Tool | In one line |
|------|-------------|
| 📄 **PDF Copilot** | Upload a textbook, ask it questions, get answers grounded in *your* pages |
| 📝 **Mock Tests** | AI-generated papers that mimic real JEE difficulty, with scoring & review |
| 🗂 **Flashcards** | Turn any chapter into a spaced-repetition deck in seconds |
| 📅 **Study Planner** | Feed it your syllabus + exam dates, get a day-by-day plan |
| 🔥 **Streaks & Leaderboard** | Daily streaks, streak-saves, and friendly competition |
| 📱 **Installable PWA** | Under 1 MB, works offline, installs straight from the browser |

## How it works

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 60, "rankSpacing": 55}}}%%
graph LR
    UI(["Next.js 15<br/>App Router + PWA"])
    API["API Routes<br/>(serverless)"]
    DB[("Firebase<br/>Auth + Firestore")]
    AI["Gemini AI"]
    Pay["Razorpay"]

    UI <--> API
    API <--> DB
    API <--> AI
    API <--> Pay

    classDef ui fill:#3B82F6,stroke:#1D4ED8,color:#fff;
    classDef api fill:#10B981,stroke:#047857,color:#fff;
    classDef ext fill:#F59E0B,stroke:#B45309,color:#fff;
    classDef ai fill:#8B5CF6,stroke:#6D28D9,color:#fff;
    class UI ui; class API api; class DB,Pay ext; class AI ai;
```

The PDF Copilot flow, end to end:

```mermaid
sequenceDiagram
    autonumber
    actor Student
    Student->>Frontend: Uploads textbook PDF
    Frontend->>Frontend: Extracts text client-side
    Student->>Frontend: Asks a question
    Frontend->>Gemini: Context chunks + question
    Gemini-->>Frontend: Streamed answer
    Frontend-->>Student: Answer, grounded in the PDF
```

## Tech stack

<div align="center">

  ![Next.js](https://img.shields.io/badge/next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Firebase](https://img.shields.io/badge/firebase-DD2C00?style=for-the-badge&logo=firebase&logoColor=white)
  ![Google Gemini](https://img.shields.io/badge/gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
  ![Razorpay](https://img.shields.io/badge/razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)
  ![GSAP](https://img.shields.io/badge/gsap-88CE02?style=for-the-badge&logo=greensock&logoColor=black)

</div>

## Run it locally

```sh
git clone https://github.com/divyanshus2404/BlueBottleCap-Saas.git
cd BlueBottleCap-Saas
npm install
cp .env.example .env.local   # add your keys (see below)
npm run dev                  # → http://localhost:3000
```

You'll need Node 18+, a [Gemini API key](https://aistudio.google.com/apikey), and a free [Firebase project](https://console.firebase.google.com) (Auth + Firestore). Razorpay keys are only needed for payment flows.

## Contributing — start here 👋

This repo is **actively looking for contributors**, and beginner PRs are genuinely welcome.

1. Pick an issue labeled [`good first issue`](https://github.com/divyanshus2404/BlueBottleCap-Saas/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) — each one says exactly which files to touch and how
2. Comment on it to claim it (so two people don't do the same work)
3. Fork → branch → PR. Details in [CONTRIBUTING.md](CONTRIBUTING.md)

Bigger appetite? Check [`help wanted`](https://github.com/divyanshus2404/BlueBottleCap-Saas/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) — dark mode, test coverage, performance work.

## Contributors

<a href="https://github.com/divyanshus2404/BlueBottleCap-Saas/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=divyanshus2404/BlueBottleCap-Saas" alt="Contributors" />
</a>

## License

MIT — see [LICENSE](LICENSE). Built by [Divyanshu Singh](https://github.com/divyanshus2404).
