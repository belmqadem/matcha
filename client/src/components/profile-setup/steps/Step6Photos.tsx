import type { ProfileFormData } from '../../../types/profileSetup';
import { PhotoGrid } from '../PhotoGrid';

interface Step6PhotosProps {
  form: ProfileFormData;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const Step6Photos = ({ form, setForm }: Step6PhotosProps) => {
  const handleAddPhotos = (files: File[]) => {
    setForm((p) => ({
      ...p,
      photos: [...p.photos, ...files].slice(0, 5),
    }));
  };

  const handleRemovePhoto = (index: number) => {
    setForm((p) => ({
      ...p,
      photos: p.photos.filter((_, i) => i !== index),
    }));
  };

  return (
    <div>
      <p className="text-xs text-text-muted mb-4 italic">
        Add up to 5 photos. The first one will be your profile picture.
      </p>

      <PhotoGrid
        photos={form.photos}
        onAddPhotos={handleAddPhotos}
        onRemovePhoto={handleRemovePhoto}
      />
    </div>
  );
};
