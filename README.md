<div align="center">
  <h1>🚀 BlueBottleCap SaaS 🚀</h1>
  <p>An Advanced AI Suite and SaaS Platform powered by Next.js, Google Gemini, and Supabase.</p>

  <p>
    <a href="https://github.com/divyanshus2404/BlueBottleCap-Saas/issues"><img alt="Issues" src="https://img.shields.io/github/issues/divyanshus2404/BlueBottleCap-Saas?color=blue&style=for-the-badge" /></a>
    <a href="https://github.com/divyanshus2404/BlueBottleCap-Saas/pulls"><img alt="Pull Requests" src="https://img.shields.io/github/issues-pr/divyanshus2404/BlueBottleCap-Saas?color=green&style=for-the-badge" /></a>
    <a href="https://github.com/divyanshus2404/BlueBottleCap-Saas/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/divyanshus2404/BlueBottleCap-Saas?style=for-the-badge" /></a>
  </p>
</div>

---

## 🌟 About The Project

BlueBottleCap SaaS is a modern, feature-rich platform designed to deliver powerful AI-driven tools directly to users. The monorepo consists of multiple applications, notably our flagship AI Suite.

### 🎯 Key Highlights
- **AI Suite:** A fully integrated AI studio app powered by Google's Gemini Models.
- **Robust Authentication & Backend:** Powered by Supabase & Firebase.
- **Modern UI:** Built with Next.js 15, React 19, Tailwind CSS v4, and Framer Motion.
- **Payments:** Razorpay integration for seamless monetization.

---

## 📂 Project Structure

This repository acts as a monorepo containing multiple associated projects:

- `/bluebottlecap-ai-suite`: The primary Next.js AI platform with Gemini integrations, Supabase backend, and Razorpay.
- `/vaultid-nextjs`: A standalone Next.js project.
- `/Original - OG`: Legacy and original files.

---

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **AI Integration:** [@google/genai](https://ai.google.dev/)
- **Database/Auth:** [Supabase](https://supabase.com/) & [Firebase](https://firebase.google.com/)
- **Payments:** [Razorpay](https://razorpay.com/)

---

## 🚀 Getting Started

Follow these steps to get the primary AI Suite up and running on your local machine.

### Prerequisites

You need [Node.js](https://nodejs.org/) (v18+) and npm installed.

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/divyanshus2404/BlueBottleCap-Saas.git
   cd "BlueBottleCap-Saas/bluebottlecap-ai-suite"
   ```

2. **Install NPM packages**
   ```sh
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file inside `bluebottlecap-ai-suite` (or copy `.env.example`) and add your API keys:
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
