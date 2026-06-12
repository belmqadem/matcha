// src/pages/Profilesetuppage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

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
  const progress = (step / (STEPS.length - 1)) * 100;

  const goToStep = (nextStep: number) => {
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
    goToStep(nextStep);
  };

  const handleNext = () => handleValidateAndGo(step + 1);
  const handleBack = () => goToStep(step - 1);

  const handleSkipStep = () => {
    setError('');
    goToStep(step + 1);
  };

  const handleCompletion = async () => {
    window.location.href = '/browse';
  };

  const handleSkipAll = async () => {
    setLoading(true);
    try {
      const skipForm: ProfileFormData = {
        birthdate: form.birthdate,
        gender: form.gender || 'other', // Keep minimal fallback to bypass the RequireProfile router guard
        sexual_preference: form.sexual_preference || 'bisexual',
        biography: form.biography,
        tags: form.tags,
        location_city: form.location_city, // No fallback
        latitude: form.latitude, // No fallback
        longitude: form.longitude, // No fallback
        photos: form.photos,
      };
      await saveCompleteProfile(skipForm);
      handleCompletion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip setup.');
    } finally {
      setLoading(false);
    }
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
      handleCompletion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4 sm:p-5 relative overflow-hidden font-primary">
      <FloatingHearts />

      {/* Decorative blobs */}
      <div className="fixed top-[-7.5rem] right-[-6.25rem] w-[18rem] h-[18rem] sm:w-[21.25rem] sm:h-[21.25rem] rounded-full pointer-events-none z-0 bg-primary/10 blur-3xl" />
      <div className="fixed bottom-[-7.5rem] left-[-5rem] w-[15rem] h-[15rem] sm:w-[18.75rem] sm:h-[18.75rem] rounded-full pointer-events-none z-0 bg-primary/10 blur-3xl" />

      {/* Main card */}
      <div className="w-full max-w-[95%] sm:max-w-md bg-surface rounded-3xl shadow-xl p-6 sm:p-8 relative z-10 border border-border">
        <div className="text-center mb-5 sm:mb-6">
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-current" />
            <span className="text-xl sm:text-2xl font-black italic text-primary tracking-tight">
              Matcha
            </span>
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-current" />
          </div>
          <div className="w-6 h-0.5 bg-primary rounded-full mx-auto mt-2 opacity-30" />
        </div>

        <div className="h-1 rounded-full bg-border mb-5 sm:mb-6 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary opacity-90 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

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
