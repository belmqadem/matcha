// src/pages/Profilesetuppage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import type { ProfileFormData } from '@/types/profileSetup';

import { saveCompleteProfile } from '@/services/profileService';
import { validateStep } from '@/utils/profileValidation';
import { STEPS } from '@/components/profile-setup/profileSetupConstants';
import FloatingHearts from '@/components/FloatingHearts';
import { StepDots } from '@/components/ui/StepDots';
import { StepHeader } from '@/components/profile-setup/StepHeader';
import { StepRenderer } from '@/components/profile-setup/StepRenderer';
import { StepNavigation } from '@/components/profile-setup/StepNavigation';
import { useAuth } from '@/context/AuthContext';
import MatchaLogo from '@/components/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const [form, setForm] = useState<ProfileFormData>({
    birthdate: '',
    gender: '',
    sexual_preference: '',
    biography: '',
    tags: [],
    location_city: '',
    latitude: null,
    longitude: null,
    photos: [],
  });

  useEffect(() => {
    if (user?.gender) {
      navigate('/browse', { replace: true });
    }
  }, [user, navigate]);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;
  // const progress = (step / (STEPS.length - 1)) * 100;

  const goToStep = (nextStep: number) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 200);
  };

  const handleValidateAndGo = (nextStep: number) => {
    const { valid, message } = validateStep(step, form);
    if (!valid) {
      toast.error(message);
      return;
    }
    goToStep(nextStep);
  };

  const handleNext = () => handleValidateAndGo(step + 1);
  const handleBack = () => goToStep(step - 1);

  const handleCompletion = async () => {
    window.location.href = '/browse';
  };

  const handleSubmit = async () => {
    const { valid, message } = validateStep(step, form);
    if (!valid) {
      toast.error(message);
      return;
    }
    setLoading(true);
    try {
      await saveCompleteProfile(form);
      handleCompletion();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-background">
      <FloatingHearts />

      <div className="absolute w-full top-0 left-0 z-20 flex justify-between px-4 md:px-8 lg:px-12 py-6">
        <MatchaLogo size="lg" />
        <ThemeToggle isDark={theme === 'dark'} onToggle={toggleTheme} />
      </div>

      {/* Main card */}
      <div className="w-full max-w-[95%] sm:max-w-md bg-surface rounded-3xl shadow-xl p-6 sm:p-8 relative z-10 border border-border">
        <StepDots total={STEPS.length} current={step} />

        <div
          className={`transition-all duration-200 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        >
          <StepHeader step={step} totalSteps={STEPS.length} config={currentStep} />
          <div className="min-h-[12rem] sm:min-h-[14rem]">
            <StepRenderer step={step} form={form} setForm={setForm} isAnimating={animating} />
          </div>
        </div>

        <StepNavigation
          step={step}
          totalSteps={STEPS.length}
          loading={loading}
          onBack={handleBack}
          onNext={isLast ? handleSubmit : handleNext}
        />
      </div>
    </div>
  );
}
