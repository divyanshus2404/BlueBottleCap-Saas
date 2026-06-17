import React from "react";
import { ArrowLeft, Shield, AlertTriangle, FileText, Scale } from "lucide-react";

export function TermsAndConditions({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-brand-sky/20">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-brand-cobalt mb-8 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
          Back to App
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-brand-navy p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
            </div>
            <Scale className="w-12 h-12 mx-auto mb-6 text-brand-sky opacity-80" />
            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">Terms & Conditions</h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              Please read these terms carefully before using our platform. Your access to and use of the service is conditioned on your acceptance of and compliance with these terms.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-10 text-slate-700 leading-relaxed">
            
            {/* Legal Disclaimer Section (High Priority) */}
            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-amber-900 mb-2">Important Disclaimer Regarding Rankings & Accuracy</h2>
                  <p className="text-amber-800/90 text-sm md:text-base leading-relaxed">
                    BlueBottleCap AI Suite is an educational tool designed for practice and learning. <strong>All ranks, percentiles, predicted scores, and positions displayed on this website are entirely simulated</strong> based on internal platform algorithms and historical datasets. They are <strong>NOT</strong> affiliated with, endorsed by, or related to the official NTA (National Testing Agency), JEE Main, JEE Advanced, or any real-world examination body.
                  </p>
                  <p className="text-amber-800/90 text-sm md:text-base leading-relaxed mt-3">
                    Our platform does not guarantee or simulate the actual accuracy of achieving these ranks in real examinations. These metrics are for motivational and self-assessment purposes only. Do not rely on these simulated metrics as a definitive indicator of your real-world exam performance.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-cobalt" />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the BlueBottleCap AI Suite ("the Service"), you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-cobalt" />
                2. Educational Use Only
              </h2>
              <p>
                The content provided by our AI models (including but not limited to roadmaps, solutions, flashcards, and study planners) is generated automatically and is intended for educational and supplementary purposes only. While we strive for accuracy, the AI can make mistakes. You must verify critical information, formulas, and concepts with official textbooks and instructors. We are not liable for any academic loss, incorrect learning, or exam failure resulting from the use of our Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">3. User Accounts & Data Privacy</h2>
              <p>
                When you create an account, you must provide accurate and complete information. You are responsible for safeguarding your password and for all activities that occur under your account. We prioritize your privacy and do not sell your personal study data. However, your prompts and uploaded images may be processed by third-party AI providers (like Google Gemini) strictly for the purpose of generating educational responses.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">4. Premium Subscriptions & Refunds</h2>
              <p>
                Some features of the Service are billed on a subscription basis ("Premium"). You will be billed in advance on a recurring schedule. Due to the digital nature of AI credits and computing costs, all payments are non-refundable unless explicitly stated otherwise or required by law. We reserve the right to modify subscription fees at any time, with reasonable prior notice provided to active subscribers.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">5. Limitation of Liability</h2>
              <p>
                In no event shall BlueBottleCap AI Suite, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; and (iii) unauthorized access, use or alteration of your transmissions or content.
              </p>
            </section>

            <section className="space-y-4 border-t border-slate-200 pt-8 mt-12 text-sm text-slate-500">
              <p>Last updated: June 17, 2026</p>
              <p>If you have any questions about these Terms, please contact us at support@bluebottlecap.com.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
