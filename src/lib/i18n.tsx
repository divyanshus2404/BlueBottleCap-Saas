"use client";

// Lightweight i18n — no external library. A language context + flat string
// dictionaries + a t(key) lookup with English fallback. Chosen over next-intl
// so it drops into the existing client-component tree with zero routing
// changes and no per-locale URL structure.
//
// Coverage today: the high-traffic public surfaces (landing hero, primary
// nav/CTAs). Adding a language = add its column to DICTIONARIES; adding a
// string = add its key to every language (missing keys fall back to English,
// so partial translations render safely). Machine-seeded — have a native
// speaker review before leaning on it for a big campaign.

import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "hi" | "bn" | "ta" | "te" | "mr" | "gu" | "kn" | "pa";

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
];

type Dict = Record<string, string>;

// English is the source of truth and the fallback for any missing key.
const en: Dict = {
  "nav.tools": "Tools",
  "nav.how": "How it works",
  "nav.pricing": "Pricing",
  "nav.signin": "Sign in",
  "nav.startFree": "Start free",
  "hero.eyebrow": "For JEE · B.Tech · GATE · Coaching institutes",
  "hero.title": "One AI toolkit. Two ways to use it.",
  "hero.subhead": "Whether you're a student prepping for JEE or a coaching center running a test series — same AI, different lane. Chat with your PDFs, build mocks in your branding, map weak topics before exams find them.",
  "hero.cta": "Open the toolkit",
  "hero.forInstitutes": "For coaching institutes",
  "lang.label": "Language",
};

const hi: Dict = {
  "nav.tools": "टूल्स",
  "nav.how": "यह कैसे काम करता है",
  "nav.pricing": "कीमत",
  "nav.signin": "साइन इन",
  "nav.startFree": "मुफ़्त शुरू करें",
  "hero.eyebrow": "JEE · B.Tech · GATE · कोचिंग संस्थानों के लिए",
  "hero.title": "एक AI टूलकिट। इस्तेमाल के दो तरीके।",
  "hero.subhead": "आप JEE की तैयारी करने वाले छात्र हों या टेस्ट सीरीज़ चलाने वाला कोचिंग सेंटर — वही AI, अलग रास्ता। अपने PDF से चैट करें, अपनी ब्रांडिंग में मॉक बनाएं, और परीक्षा से पहले कमज़ोर टॉपिक पहचानें।",
  "hero.cta": "टूलकिट खोलें",
  "hero.forInstitutes": "कोचिंग संस्थानों के लिए",
  "lang.label": "भाषा",
};

const bn: Dict = {
  "nav.tools": "টুলস",
  "nav.how": "কীভাবে কাজ করে",
  "nav.pricing": "মূল্য",
  "nav.signin": "সাইন ইন",
  "nav.startFree": "বিনামূল্যে শুরু করুন",
  "hero.eyebrow": "JEE · B.Tech · GATE · কোচিং প্রতিষ্ঠানের জন্য",
  "hero.title": "একটি AI টুলকিট। ব্যবহারের দুটি উপায়।",
  "hero.subhead": "আপনি JEE-এর প্রস্তুতি নেওয়া ছাত্র হোন বা টেস্ট সিরিজ চালানো কোচিং সেন্টার — একই AI, ভিন্ন পথ। আপনার PDF-এর সাথে চ্যাট করুন, নিজের ব্র্যান্ডিংয়ে মক তৈরি করুন, পরীক্ষার আগে দুর্বল বিষয় চিহ্নিত করুন।",
  "hero.cta": "টুলকিট খুলুন",
  "hero.forInstitutes": "কোচিং প্রতিষ্ঠানের জন্য",
  "lang.label": "ভাষা",
};

const ta: Dict = {
  "nav.tools": "கருவிகள்",
  "nav.how": "எப்படி வேலை செய்கிறது",
  "nav.pricing": "விலை",
  "nav.signin": "உள்நுழைக",
  "nav.startFree": "இலவசமாக தொடங்குங்கள்",
  "hero.eyebrow": "JEE · B.Tech · GATE · பயிற்சி நிறுவனங்களுக்கு",
  "hero.title": "ஒரு AI கருவித்தொகுப்பு. பயன்படுத்த இரண்டு வழிகள்.",
  "hero.subhead": "நீங்கள் JEE-க்கு தயாராகும் மாணவராக இருந்தாலும், டெஸ்ட் தொடரை நடத்தும் பயிற்சி மையமாக இருந்தாலும் — அதே AI, வேறு வழி. உங்கள் PDF-உடன் அரட்டையடியுங்கள், உங்கள் பிராண்டிங்கில் மாதிரித் தேர்வுகளை உருவாக்குங்கள், தேர்வுக்கு முன் பலவீனமான தலைப்புகளை கண்டறியுங்கள்.",
  "hero.cta": "கருவித்தொகுப்பைத் திறக்கவும்",
  "hero.forInstitutes": "பயிற்சி நிறுவனங்களுக்கு",
  "lang.label": "மொழி",
};

const te: Dict = {
  "nav.tools": "టూల్స్",
  "nav.how": "ఇది ఎలా పనిచేస్తుంది",
  "nav.pricing": "ధర",
  "nav.signin": "సైన్ ఇన్",
  "nav.startFree": "ఉచితంగా ప్రారంభించండి",
  "hero.eyebrow": "JEE · B.Tech · GATE · కోచింగ్ సంస్థల కోసం",
  "hero.title": "ఒక AI టూల్‌కిట్. ఉపయోగించడానికి రెండు మార్గాలు.",
  "hero.subhead": "మీరు JEE కోసం సిద్ధమవుతున్న విద్యార్థి అయినా, టెస్ట్ సిరీస్ నడిపే కోచింగ్ సెంటర్ అయినా — అదే AI, వేరే దారి. మీ PDF లతో చాట్ చేయండి, మీ బ్రాండింగ్‌లో మాక్‌లు తయారు చేయండి, పరీక్షలకు ముందు బలహీన అంశాలను గుర్తించండి.",
  "hero.cta": "టూల్‌కిట్ తెరవండి",
  "hero.forInstitutes": "కోచింగ్ సంస్థల కోసం",
  "lang.label": "భాష",
};

const mr: Dict = {
  "nav.tools": "टूल्स",
  "nav.how": "हे कसे काम करते",
  "nav.pricing": "किंमत",
  "nav.signin": "साइन इन",
  "nav.startFree": "मोफत सुरू करा",
  "hero.eyebrow": "JEE · B.Tech · GATE · कोचिंग संस्थांसाठी",
  "hero.title": "एक AI टूलकिट. वापरण्याचे दोन मार्ग.",
  "hero.subhead": "तुम्ही JEE ची तयारी करणारे विद्यार्थी असा किंवा टेस्ट सिरीज चालवणारे कोचिंग सेंटर — तोच AI, वेगळा मार्ग. तुमच्या PDF शी चॅट करा, तुमच्या ब्रँडिंगमध्ये मॉक तयार करा, परीक्षेआधी कमकुवत विषय ओळखा.",
  "hero.cta": "टूलकिट उघडा",
  "hero.forInstitutes": "कोचिंग संस्थांसाठी",
  "lang.label": "भाषा",
};

const gu: Dict = {
  "nav.tools": "ટૂલ્સ",
  "nav.how": "આ કેવી રીતે કામ કરે છે",
  "nav.pricing": "કિંમત",
  "nav.signin": "સાઇન ઇન",
  "nav.startFree": "મફત શરૂ કરો",
  "hero.eyebrow": "JEE · B.Tech · GATE · કોચિંગ સંસ્થાઓ માટે",
  "hero.title": "એક AI ટૂલકિટ. વાપરવાની બે રીતો.",
  "hero.subhead": "તમે JEE ની તૈયારી કરતા વિદ્યાર્થી હો કે ટેસ્ટ સિરીઝ ચલાવતું કોચિંગ સેન્ટર — એ જ AI, અલગ રસ્તો. તમારા PDF સાથે ચેટ કરો, તમારા બ્રાન્ડિંગમાં મોક બનાવો, પરીક્ષા પહેલાં નબળા વિષયો ઓળખો.",
  "hero.cta": "ટૂલકિટ ખોલો",
  "hero.forInstitutes": "કોચિંગ સંસ્થાઓ માટે",
  "lang.label": "ભાષા",
};

const kn: Dict = {
  "nav.tools": "ಟೂಲ್ಸ್",
  "nav.how": "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
  "nav.pricing": "ಬೆಲೆ",
  "nav.signin": "ಸೈನ್ ಇನ್",
  "nav.startFree": "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ",
  "hero.eyebrow": "JEE · B.Tech · GATE · ಕೋಚಿಂಗ್ ಸಂಸ್ಥೆಗಳಿಗಾಗಿ",
  "hero.title": "ಒಂದು AI ಟೂಲ್‌ಕಿಟ್. ಬಳಸಲು ಎರಡು ದಾರಿಗಳು.",
  "hero.subhead": "ನೀವು JEE ಗೆ ಸಿದ್ಧವಾಗುತ್ತಿರುವ ವಿದ್ಯಾರ್ಥಿಯಾಗಿರಲಿ ಅಥವಾ ಟೆಸ್ಟ್ ಸೀರೀಸ್ ನಡೆಸುವ ಕೋಚಿಂಗ್ ಸೆಂಟರ್ ಆಗಿರಲಿ — ಅದೇ AI, ಬೇರೆ ದಾರಿ. ನಿಮ್ಮ PDF ಗಳೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ, ನಿಮ್ಮ ಬ್ರ್ಯಾಂಡಿಂಗ್‌ನಲ್ಲಿ ಮಾಕ್‌ಗಳನ್ನು ರಚಿಸಿ, ಪರೀಕ್ಷೆಗೆ ಮೊದಲು ದುರ್ಬಲ ವಿಷಯಗಳನ್ನು ಗುರುತಿಸಿ.",
  "hero.cta": "ಟೂಲ್‌ಕಿಟ್ ತೆರೆಯಿರಿ",
  "hero.forInstitutes": "ಕೋಚಿಂಗ್ ಸಂಸ್ಥೆಗಳಿಗಾಗಿ",
  "lang.label": "ಭಾಷೆ",
};

const pa: Dict = {
  "nav.tools": "ਟੂਲਸ",
  "nav.how": "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
  "nav.pricing": "ਕੀਮਤ",
  "nav.signin": "ਸਾਈਨ ਇਨ",
  "nav.startFree": "ਮੁਫ਼ਤ ਸ਼ੁਰੂ ਕਰੋ",
  "hero.eyebrow": "JEE · B.Tech · GATE · ਕੋਚਿੰਗ ਸੰਸਥਾਵਾਂ ਲਈ",
  "hero.title": "ਇੱਕ AI ਟੂਲਕਿੱਟ। ਵਰਤਣ ਦੇ ਦੋ ਤਰੀਕੇ।",
  "hero.subhead": "ਭਾਵੇਂ ਤੁਸੀਂ JEE ਦੀ ਤਿਆਰੀ ਕਰਨ ਵਾਲੇ ਵਿਦਿਆਰਥੀ ਹੋ ਜਾਂ ਟੈਸਟ ਸੀਰੀਜ਼ ਚਲਾਉਣ ਵਾਲਾ ਕੋਚਿੰਗ ਸੈਂਟਰ — ਉਹੀ AI, ਵੱਖਰਾ ਰਾਹ। ਆਪਣੇ PDF ਨਾਲ ਚੈਟ ਕਰੋ, ਆਪਣੀ ਬ੍ਰਾਂਡਿੰਗ ਵਿੱਚ ਮੌਕ ਬਣਾਓ, ਇਮਤਿਹਾਨ ਤੋਂ ਪਹਿਲਾਂ ਕਮਜ਼ੋਰ ਵਿਸ਼ੇ ਪਛਾਣੋ।",
  "hero.cta": "ਟੂਲਕਿੱਟ ਖੋਲ੍ਹੋ",
  "hero.forInstitutes": "ਕੋਚਿੰਗ ਸੰਸਥਾਵਾਂ ਲਈ",
  "lang.label": "ਭਾਸ਼ਾ",
};

const DICTIONARIES: Record<Lang, Dict> = { en, hi, bn, ta, te, mr, gu, kn, pa };

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nValue | undefined>(undefined);

const STORAGE_KEY = "bluebottlecap_lang";
const isLang = (v: string | null): v is Lang => !!v && LANGUAGES.some((l) => l.code === v);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Hydrate from storage, then browser language, on mount (client-only so SSR
  // stays deterministic and avoids a hydration mismatch).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) { setLangState(saved); return; }
    const nav = navigator.language?.slice(0, 2);
    if (isLang(nav ?? null)) setLangState(nav as Lang);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  const t = (key: string) => DICTIONARIES[lang]?.[key] ?? en[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  // Safe default so a component rendered outside the provider (e.g. in a test)
  // still returns English rather than throwing.
  if (!ctx) return { lang: "en", setLang: () => {}, t: (k) => en[k] ?? k };
  return ctx;
}
