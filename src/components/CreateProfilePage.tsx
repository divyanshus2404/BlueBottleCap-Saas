"use client";

import React, { useState, useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { ChevronRight, ArrowLeft, ArrowRight, CheckCircle2, User, Sparkles, Palette, Shirt, Smile, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { ActiveView } from '../types';
import { Logo } from './Logo';

interface CreateProfilePageProps {
  setCurrentView: (view: ActiveView) => void;
}

const SKIN_COLORS = ['edb98a', 'fd9841', 'f8d25c', 'd08b5b', 'ae5d29', '391206'];
const HAIR_COLORS = ['2c1b18', 'd6b370', '724133', '4a3123', 'f59797', 'ecdcbf', 'c93305', 'b58143'];
const TOPS = ['shortHair', 'longHair', 'eyepatch', 'hat', 'hijab', 'turban', 'winterHat1', 'winterHat2'];
const CLOTHING = ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'];
const EYES = ['default', 'happy', 'hearts', 'side', 'squint', 'surprised', 'wink'];
const MOUTHS = ['default', 'smile', 'smirk', 'twinkle', 'serious', 'eating'];
const ACCESSORIES = ['none', 'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers'];

type Tab = 'skin' | 'hair' | 'face' | 'clothes' | 'accessories';

export const CreateProfilePage: React.FC<CreateProfilePageProps> = ({ setCurrentView }) => {
  const { currentUser: user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>('skin');
  const [loading, setLoading] = useState(false);
  
  // Avatar Options
  const [skinColor, setSkinColor] = useState(SKIN_COLORS[0]);
  const [top, setTop] = useState(TOPS[0]);
  const [hairColor, setHairColor] = useState(HAIR_COLORS[0]);
  const [clothing, setClothing] = useState(CLOTHING[0]);
  const [eyes, setEyes] = useState(EYES[0]);
  const [mouth, setMouth] = useState(MOUTHS[0]);
  const [accessories, setAccessories] = useState(ACCESSORIES[0]);

  const avatarSvg = useMemo(() => {
    return createAvatar(avataaars, {
      seed: user?.uid || 'custom',
      skinColor: [skinColor],
      top: [top as any],
      hairColor: [hairColor],
      clothing: [clothing as any],
      eyes: [eyes as any],
      mouth: [mouth as any],
      accessories: accessories !== 'none' ? [accessories as any] : [],
      backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
      radius: 50,
    }).toString();
  }, [skinColor, top, hairColor, clothing, eyes, mouth, accessories, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        await updateDoc(userRef, { avatarSvg });
      } else {
        await setDoc(userRef, { avatarSvg, email: user.email, createdAt: new Date() });
      }
      setCurrentView('dashboard');
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'skin', label: 'Skin', icon: <Palette className="w-4 h-4" /> },
    { id: 'hair', label: 'Hair', icon: <User className="w-4 h-4" /> },
    { id: 'face', label: 'Face', icon: <Smile className="w-4 h-4" /> },
    { id: 'clothes', label: 'Style', icon: <Shirt className="w-4 h-4" /> },
    { id: 'accessories', label: 'Extras', icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8 text-brand-cobalt" />
          <span className="text-xl font-black font-display tracking-tight">BlueBottleCap</span>
        </div>
        <button 
          onClick={handleSaveProfile}
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-cobalt to-indigo-600 hover:shadow-lg hover:shadow-brand-cobalt/25 px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save & Continue"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Avatar Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black font-display mb-2">Design your Avatar</h1>
            <p className="text-slate-400">Make it yours. This will be visible on your dashboard and shared studies.</p>
          </div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-64 h-64 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden bg-slate-900 relative group"
          >
            <div 
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: avatarSvg }} 
            />
            
            {/* Sparkle decoration */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 text-amber-400 opacity-50">
              <Sparkles className="w-12 h-12" />
            </div>
          </motion.div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
          
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800 hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'bg-brand-cobalt text-white shadow-lg shadow-brand-cobalt/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Controls Container */}
          <div className="min-h-[300px]">
            {activeTab === 'skin' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Skin Tone</h3>
                  <div className="flex flex-wrap gap-3">
                    {SKIN_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setSkinColor(color)}
                        className={`w-12 h-12 rounded-full border-4 transition-all ${
                          skinColor === color ? 'border-brand-cobalt scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: `#${color}` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hair' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Hair Style</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {TOPS.map(t => (
                      <button
                        key={t}
                        onClick={() => setTop(t)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                          top === t 
                            ? 'bg-brand-cobalt/20 border-brand-cobalt text-brand-cobalt' 
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {t.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Hair Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {HAIR_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setHairColor(color)}
                        className={`w-10 h-10 rounded-full border-4 transition-all ${
                          hairColor === color ? 'border-brand-cobalt scale-110' : 'border-slate-800 hover:scale-105'
                        }`}
                        style={{ backgroundColor: `#${color}` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'face' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Eyes</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {EYES.map(e => (
                      <button
                        key={e}
                        onClick={() => setEyes(e)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                          eyes === e 
                            ? 'bg-brand-cobalt/20 border-brand-cobalt text-brand-cobalt' 
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {e.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Mouth</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {MOUTHS.map(m => (
                      <button
                        key={m}
                        onClick={() => setMouth(m)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                          mouth === m 
                            ? 'bg-brand-cobalt/20 border-brand-cobalt text-brand-cobalt' 
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {m.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'clothes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Outfit</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CLOTHING.map(c => (
                      <button
                        key={c}
                        onClick={() => setClothing(c)}
                        className={`py-4 px-2 rounded-xl text-xs font-bold transition-all border ${
                          clothing === c 
                            ? 'bg-brand-cobalt/20 border-brand-cobalt text-brand-cobalt' 
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {c.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accessories' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Glasses & Accessories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ACCESSORIES.map(a => (
                      <button
                        key={a}
                        onClick={() => setAccessories(a)}
                        className={`py-4 px-2 rounded-xl text-xs font-bold transition-all border ${
                          accessories === a 
                            ? 'bg-brand-cobalt/20 border-brand-cobalt text-brand-cobalt' 
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {a === 'none' ? 'None' : a.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
