// src/components/profile-setup/StepRenderer.tsx
import type { ProfileFormData } from '../../types/profileSetup';
import { Step0Birthdate } from  './steps/Step0Birthdate';
import { Step1Gender } from './steps/Step1Gender';
import { Step2Preference } from './steps/Step2Preference';
import { Step3Bio } from './steps/Step3Bio';
import { Step4Tags } from './steps/Step4Tags';
import { Step5Location } from './steps/Step5Location';
import { Step6Photos } from './steps/Step6Photos';

interface StepRendererProps {
  step: number;
  form: ProfileFormData;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  isAnimating: boolean;
}

export const StepRenderer = ({
  step,
  form,
  setForm,
  isAnimating,
}: StepRendererProps) => {
  // Using structural opacity to enforce smooth transitions established in parent container
  const displayClass = isAnimating ? 'opacity-0' : 'opacity-100 transition-opacity duration-300';

  const renderContent = () => {
    switch (step) {
      case 0: return <Step0Birthdate form={form} setForm={setForm} />;
      case 1: return <Step1Gender form={form} setForm={setForm} />;
      case 2: return <Step2Preference form={form} setForm={setForm} />;
      case 3: return <Step3Bio form={form} setForm={setForm} />;
      case 4: return <Step4Tags form={form} setForm={setForm} />;
      case 5: return <Step5Location form={form} setForm={setForm} />;
      case 6: return <Step6Photos form={form} setForm={setForm} />;
      default: return null;
    }
  };

  return (
    <div className={`w-full ${displayClass}`}>
      {renderContent()}
    </div>
  );
};
