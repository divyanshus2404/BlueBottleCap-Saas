"use client";

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import styles from './AuthPage.module.css';

// SVG Icons (Inline for zero dependencies)
const LogoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {visible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

type Mode = 'signin' | 'signup';
type Method = 'email' | 'phone';
type Step = 1 | 2 | 3;
type Badge = { id: number; message: string; type: 'success' | 'error' | 'info' };

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [method, setMethod] = useState<Method>('email');
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  
  // Badges
  const [badges, setBadges] = useState<Badge[]>([]);

  // Calculate Password Strength (0-4)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };
  const strength = getPasswordStrength(password);

  const addBadge = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setBadges(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setBadges(prev => prev.filter(b => b.id !== id));
    }, 5000);
  };

  // Timer Effect
  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setStep(1);
    // Reset fields if needed, or keep them
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    const target = method === 'email' ? email : `+91${phone}`;

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: method === 'email' ? 'email' : 'sms', target })
      });
      const data = await res.json();
      
      if (data.success) {
        setStep(2);
        setTimeLeft(300);
        setOtp(Array(6).fill(''));
        addBadge(`OTP sent to ${target}`, 'success');
        // Auto-focus first OTP box
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        addBadge(data.error || 'Failed to send OTP', 'error');
      }
    } catch (err) {
      addBadge('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) return;
    setLoading(true);

    const target = method === 'email' ? email : `+91${phone}`;

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: method === 'email' ? 'email' : 'sms', target, otp: otpValue })
      });
      const data = await res.json();
      
      if (data.success) {
        setStep(3);
      } else {
        addBadge(data.error || 'Invalid OTP', 'error');
      }
    } catch (err) {
      addBadge('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Logic
  const handleOtpChange = (index: number, val: string) => {
    if (!/^[0-9]*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-advance
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit if last digit
    if (val && index === 5 && newOtp.every(d => d !== '')) {
      // Small delay to allow state update before submitting
      setTimeout(() => handleVerifyOtp(), 50);
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      handleVerifyOtp();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus appropriate input
    const nextIndex = Math.min(pastedData.length, 5);
    otpRefs.current[nextIndex]?.focus();
    
    if (pastedData.length === 6) {
      setTimeout(() => handleVerifyOtp(), 50);
    }
  };

  // Password Strength Colors
  const strengthColors = ['#e2e8f0', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  const getSegmentColor = (index: number) => {
    if (strength === 0) return strengthColors[0];
    if (index <= strength) return strengthColors[strength];
    return strengthColors[0];
  };

  return (
    <div className={styles.container}>
      {/* Badges Container */}
      <div className={styles.badgeContainer}>
        {badges.map(b => (
          <div key={b.id} className={`${styles.badge} ${styles[b.type]}`} style={{ marginBottom: '8px' }}>
            {b.message}
          </div>
        ))}
      </div>

      <div className={styles.card}>
        {/* LEFT PANEL */}
        <div className={styles.formPanel}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <LogoIcon />
              </div>
              <span className={styles.logoText}>VAULTID</span>
            </div>
            
            {step === 1 && (
              <div className={styles.toggleContainer}>
                <button 
                  className={`${styles.toggleBtn} ${mode === 'signin' ? styles.active : ''}`}
                  onClick={() => handleModeChange('signin')}
                >
                  Sign in
                </button>
                <button 
                  className={`${styles.toggleBtn} ${mode === 'signup' ? styles.active : ''}`}
                  onClick={() => handleModeChange('signup')}
                >
                  Create account
                </button>
              </div>
            )}
          </div>

          {step === 1 && (
            <div>
              <div className={styles.methodTabs}>
                <button 
                  className={`${styles.methodTab} ${method === 'email' ? styles.active : ''}`}
                  onClick={() => setMethod('email')}
                >
                  Email
                </button>
                <button 
                  className={`${styles.methodTab} ${method === 'phone' ? styles.active : ''}`}
                  onClick={() => setMethod('phone')}
                >
                  Phone
                </button>
              </div>

              <form onSubmit={handleSendOtp}>
                {mode === 'signup' && (
                  <div className={styles.rowGroup}>
                    <div>
                      <label className={styles.label}>First Name</label>
                      <input 
                        type="text" 
                        required 
                        value={firstName} 
                        onChange={e => setFirstName(e.target.value)}
                        className={styles.input} 
                        placeholder="John" 
                      />
                    </div>
                    <div>
                      <label className={styles.label}>Last Name</label>
                      <input 
                        type="text" 
                        required 
                        value={lastName} 
                        onChange={e => setLastName(e.target.value)}
                        className={styles.input} 
                        placeholder="Doe" 
                      />
                    </div>
                  </div>
                )}

                {method === 'email' ? (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={styles.input} 
                      placeholder="you@company.com" 
                    />
                  </div>
                ) : (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.prefix}>+91</span>
                      <input 
                        type="tel" 
                        required 
                        maxLength={10}
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        className={`${styles.input} ${styles.withPrefix}`} 
                        placeholder="99999 99999" 
                      />
                    </div>
                  </div>
                )}

                {method === 'email' && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrapper}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={styles.input} 
                        placeholder="••••••••" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.togglePassword}
                        tabIndex={-1}
                      >
                        <EyeIcon visible={showPassword} />
                      </button>
                    </div>
                    {mode === 'signup' && password.length > 0 && (
                      <div className={styles.strengthBar}>
                        {[1, 2, 3, 4].map(num => (
                          <div 
                            key={num} 
                            className={styles.strengthSegment} 
                            style={{ backgroundColor: getSegmentColor(num) }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Please wait..." : "Continue"}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className={styles.otpContainer}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
                Enter verification code
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '2rem', textAlign: 'center' }}>
                We sent a 6-digit code to <br/>
                <strong>{method === 'email' ? email : `+91 ${phone}`}</strong>
              </p>

              <div className={styles.otpGrid}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el: HTMLInputElement | null) => { otpRefs.current[index] = el; }}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className={`${styles.otpInput} ${digit ? styles.filled : ''}`}
                  />
                ))}
              </div>

              <div className={styles.timer}>
                {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'Code expired'}
              </div>

              <button 
                type="button" 
                onClick={handleSendOtp} 
                className={styles.resendLink}
                disabled={loading || timeLeft > 270} // Disable for 30s after sending
              >
                {loading ? "Sending..." : "Resend code"}
              </button>
              
              <button 
                type="button" 
                style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setStep(1)}
              >
                Change {method}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className={styles.successScreen}>
              <div className={styles.successIcon}>
                <CheckIcon />
              </div>
              <h2 className={styles.successTitle}>You're in!</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Your identity has been verified.</p>
              
              <button 
                className={`${styles.submitBtn} ${styles.successBtn}`}
                onClick={() => window.location.href = '/dashboard'}
              >
                Go to Dashboard &rarr;
              </button>
            </div>
          )}

        </div>

        {/* RIGHT PANEL (Sidebar) */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarGrid}></div>
          <div className={styles.sidebarGlow}></div>
          
          <div className={styles.sidebarContent}>
            <div className={`${styles.step} ${step < 1 ? styles.inactive : ''}`}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepText}>Enter<br/>credentials</div>
            </div>
            <div className={`${styles.step} ${step < 2 ? styles.inactive : ''}`}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepText}>Receive<br/>OTP</div>
            </div>
            <div className={`${styles.step} ${step < 3 ? styles.inactive : ''}`}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepText}>Verified<br/>access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
