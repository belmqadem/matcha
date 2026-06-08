// src/pages/Profilesetuppage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

// FIXED: Added the 'type' keyword here to satisfy verbatimModuleSyntax
import type { ProfileFormData } from '@/types/profileSetup';

import { saveCompleteProfile } from '@/services/profileService';
import { validateStep } from '@/utils/profileValidation';
import { STEPS } from '@/components/profile-setup/profileSetupConstants';
import { FloatingHearts } from '@/components/profile-setup/FloatingHearts';
import { StepDots } from '@/components/ui/StepDots';
import { StepHeader } from '@/components/profile-setup/StepHeader';
import { StepRenderer } from '@/components/profile-setup/StepRenderer';
import { StepNavigation } from '@/components/profile-setup/StepNavigation';
import { useAuth } from '@/context/AuthContext';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward');

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

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = (step / (STEPS.length - 1)) * 100;

  const goToStep = (nextStep: number, direction: 'forward' | 'back') => {
    setAnimDir(direction);
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 200);
  };

  const handleValidateAndGo = (nextStep: number) => {
    setError('');
    const { valid, message } = validateStep(step, form);
    if (!valid) {
      setError(message);
      return;
    }
    goToStep(nextStep, step < nextStep ? 'forward' : 'back');
  };

  const handleNext = () => handleValidateAndGo(step + 1);
  const handleBack = () => handleValidateAndGo(step - 1);

  const handleSkipStep = () => {
    setError('');
    goToStep(step + 1, 'forward');
  };

  const handleSkipAll = async () => {
    try {
      await saveCompleteProfile(form);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
    // Hard refresh to reload the AuthContext with the new gender/profile data
    window.location.href = '/browse';
  };

  const handleSubmit = async () => {
    setError('');
    const { valid, message } = validateStep(step, form);
    if (!valid) {
      setError(message);
      return;
    }
    setLoading(true);
    try {
      await saveCompleteProfile(form);
      // Hard refresh to reload the AuthContext with the new gender/profile data
      window.location.href = '/browse';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Prevent users who already finished setup from being here
  if (user?.gender) {
    navigate('/browse');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5 relative overflow-hidden font-primary">
      <FloatingHearts />

      {/* Decorative blobs */}
      <div className="fixed top-[-7.5rem] right-[-6.25rem] w-[21.25rem] h-[21.25rem] rounded-full pointer-events-none z-0 bg-primary/10 blur-3xl" />
      <div className="fixed bottom-[-7.5rem] left-[-5rem] w-[18.75rem] h-[18.75rem] rounded-full pointer-events-none z-0 bg-primary/10 blur-3xl" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 relative z-10 border border-border">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <Heart size={14} fill="currentColor" className="text-primary" />
            <span className="text-2xl font-black italic text-primary tracking-tight">Matcha</span>
            <Heart size={14} fill="currentColor" className="text-primary" />
          </div>
          <div className="w-6 h-0.5 bg-primary rounded-full mx-auto mt-2 opacity-30" />
        </div>

        <div className="h-1 rounded-full bg-border mb-6 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary opacity-90 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <StepDots total={STEPS.length} current={step} />

        <div className={`transition-all duration-200 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <StepHeader step={step} totalSteps={STEPS.length} config={currentStep} />
          <div className="min-h-48">
            <StepRenderer step={step} form={form} setForm={setForm} isAnimating={animating} />
          </div>
        </div>

        <StepNavigation
          step={step}
          totalSteps={STEPS.length}
          isSkippable={currentStep.skippable}
          loading={loading}
          error={error}
          onBack={handleBack}
          onSkip={handleSkipStep}
          onNext={isLast ? handleSubmit : handleNext}
          onSkipAll={handleSkipAll}
        />
      </div>
    </div>
  );
}
