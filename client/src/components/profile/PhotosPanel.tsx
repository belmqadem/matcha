// src/components/profile/PhotosPanel.tsx
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, Star, X, Loader2, Wand2 } from 'lucide-react';
import { userService } from '@/services/userService';
import * as profileService from '@/services/profileService';
import type { UserProfile, Photo } from '@/types/user';
import { PhotoEditorModal } from './PhotoEditorModal';
import { ConfirmModal } from './ConfirmModal';
import { PhotoGalleryViewer } from './PhotoGalleryViewer';
import { photoBuster } from '@/utils/photoBuster';

interface Props {
  user: UserProfile;
  onUpdate: (_u: UserProfile) => void;
}

export function PhotosPanel({ user, onUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [pendingReorder, setPendingReorder] = useState<{
    sourceIndex: number;
    targetIndex: number;
  } | null>(null);

  const photos = user.photos ?? [];
  const sorted = photos.slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const slots: (Photo | null)[] = [...sorted, ...Array(5 - sorted.length).fill(null)].slice(0, 5);

  const handleSavePhoto = (updatedPhoto: Photo) => {
    photoBuster.regenerate();
    const updatedPhotos = photos.map((item) => (item.id === updatedPhoto.id ? updatedPhoto : item));
    onUpdate(photoBuster.bustUser({ ...user, photos: updatedPhotos }));
  };

  const handleUploadFiles = async (files: File[]) => {
    if (photos.length + files.length > 5) {
      toast.error('Max 5 photos allowed.');
      return;
    }

    setUploading(true);

    try {
      let updated = { ...user };
      for (const file of files) {
        const p = await userService.uploadPhoto(file);
        updated = { ...updated, photos: [...updated.photos, p] };
        if (!updated.profile_picture_id) updated.profile_picture_id = p.id;
      }
      photoBuster.regenerate();
      onUpdate(photoBuster.bustUser(updated));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length) handleUploadFiles(files);
  };

  const handleDelete = async (id: number) => {
    try {
      await userService.deletePhoto(id);
      const remaining = photos.filter((p) => p.id !== id);
      const newPicId =
        id === user.profile_picture_id ? (remaining[0]?.id ?? null) : user.profile_picture_id;
      photoBuster.regenerate();
      onUpdate(photoBuster.bustUser({ ...user, photos: remaining, profile_picture_id: newPicId }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  const handleSetMain = async (id: number) => {
    const targetPhoto = photos.find((p) => p.id === id);
    if (!targetPhoto) return;

    const remaining = sorted.filter((p) => p.id !== id);
    const newPhotos = [targetPhoto, ...remaining];

    try {
      const updatedPhotos = await profileService.reorderPhotos(newPhotos.map((p) => p.id));
      await userService.setMainPhoto(id);
      photoBuster.regenerate();
      onUpdate(
        photoBuster.bustUser({
          ...user,
          photos: updatedPhotos,
          profile_picture_id: id,
        }),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed.');
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const executeReorder = async (sourceIndex: number, targetIndex: number) => {
    const sourcePhoto = slots[sourceIndex];
    if (!sourcePhoto) return;

    const newSlots = [...slots];
    newSlots.splice(sourceIndex, 1);
    newSlots.splice(targetIndex, 0, sourcePhoto);
    const newPhotos = newSlots.filter((x): x is Photo => x !== null);

    try {
      const updatedPhotos = await profileService.reorderPhotos(newPhotos.map((p) => p.id));
      const newMainPhoto = newPhotos[0];
      photoBuster.regenerate();
      if (newMainPhoto && newMainPhoto.id !== user.profile_picture_id) {
        await userService.setMainPhoto(newMainPhoto.id);
        onUpdate(
          photoBuster.bustUser({
            ...user,
            photos: updatedPhotos,
            profile_picture_id: newMainPhoto.id,
          }),
        );
      } else {
        onUpdate(photoBuster.bustUser({ ...user, photos: updatedPhotos }));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Reordering failed.');
    }
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    // If external files dropped
    if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleUploadFiles(files);
      return;
    }

    // Internal slot reorder
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const sourcePhoto = slots[draggedIndex];
    if (!sourcePhoto) return;

    if (targetIndex === 0) {
      setPendingReorder({ sourceIndex: draggedIndex, targetIndex });
      setDraggedIndex(null);
      return;
    }

    await executeReorder(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg sm:text-xl font-black text-text">Photos</h3>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-bold text-text-muted">{photos.length}/5</span>
          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-xs sm:text-sm font-bold text-primary bg-primary/10 px-3 sm:px-4 py-1.5 rounded-full cursor-pointer hover:bg-primary/20 transition-colors active:scale-95 disabled:opacity-50"
            >
              + Add photo
            </button>
          )}
        </div>
      </div>

      <div
        className="flex flex-col gap-3"
        onDragOver={(e) => {
          e.preventDefault();
          if (e.dataTransfer.types.includes('Files')) {
            e.dataTransfer.dropEffect = 'copy';
          }
        }}
        onDrop={(e) => handleDrop(e, slots.findIndex((x) => x === null) ?? 4)}
      >
        {/* Big Main Image (Slot 0) */}
        {(() => {
          const photo = slots[0];
          const isOver = dragOverIndex === 0;
          return (
            <div
              draggable={!!photo}
              onDragStart={(e) => photo && handleDragStart(e, 0)}
              onDragEnter={(e) => handleDragEnter(e, 0)}
              onDragOver={(e) => handleDragOver(e, 0)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 0)}
              onClick={() => {
                if (photo) {
                  const sortedIndex = sorted.findIndex((p) => p.id === photo.id);
                  if (sortedIndex !== -1) setViewerIndex(sortedIndex);
                } else {
                  fileRef.current?.click();
                }
              }}
              className={`relative rounded-2xl sm:rounded-[1.8rem] overflow-hidden bg-background/50 border-2 transition-all duration-300 group aspect-[4/3] w-full ${
                isOver ? 'border-primary ring-2 ring-primary/20 scale-[1.01]' : 'border-border'
              } ${!photo ? 'cursor-pointer hover:border-primary' : 'cursor-grab active:cursor-grabbing'}`}
            >
              {photo ? (
                <>
                  <img
                    src={photo.url}
                    alt="Main Profile"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  {photo.id === user.profile_picture_id && (
                    <span className="absolute top-3 left-3 bg-primary text-surface text-[0.6rem] sm:text-[9px] font-black px-2 py-0.5 sm:py-1 rounded-full tracking-widest shadow-md">
                      MAIN
                    </span>
                  )}

                  <div className="absolute inset-0 sm:group-hover:bg-text/30 transition-all duration-300">
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1 sm:gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {photo.id !== user.profile_picture_id && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetMain(photo.id);
                          }}
                          title="Set as main"
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface/95 flex items-center justify-center text-primary cursor-pointer shadow-sm hover:scale-110 transition-transform"
                        >
                          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhoto(photo);
                        }}
                        title="Edit photo"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface/95 flex items-center justify-center text-text cursor-pointer shadow-sm hover:scale-110 hover:text-primary transition-transform"
                      >
                        <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(photo.id);
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface/95 flex items-center justify-center text-text cursor-pointer shadow-sm hover:scale-110 hover:text-error transition-transform"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 sm:gap-2 text-text-muted opacity-60">
                  {uploading && slots.findIndex((x) => x === null) === 0 ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-primary" />
                  ) : (
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  <span className="text-[0.55rem] sm:text-[10px] font-bold uppercase tracking-wider">
                    Add Photo
                  </span>
                </div>
              )}
            </div>
          );
        })()}

        {/* Thumbnail Row (Slots 1-4) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full shrink-0">
          {slots.slice(1).map((photo, index) => {
            const i = index + 1;
            const isOver = dragOverIndex === i;
            return (
              <div
                key={photo?.id ?? `empty-${i}`}
                draggable={!!photo}
                onDragStart={(e) => photo && handleDragStart(e, i)}
                onDragEnter={(e) => handleDragEnter(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, i)}
                onClick={() => {
                  if (photo) {
                    const sortedIndex = sorted.findIndex((p) => p.id === photo.id);
                    if (sortedIndex !== -1) setViewerIndex(sortedIndex);
                  } else {
                    fileRef.current?.click();
                  }
                }}
                className={`relative rounded-xl overflow-hidden bg-background/50 border-2 transition-all duration-300 group aspect-[3/4] w-full ${
                  isOver ? 'border-primary ring-2 ring-primary/20 scale-[1.01]' : 'border-border'
                } ${!photo ? 'cursor-pointer hover:border-primary' : 'cursor-grab active:cursor-grabbing'}`}
              >
                {photo ? (
                  <>
                    <img
                      src={photo.url}
                      alt="Gallery"
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                    {photo.id === user.profile_picture_id && (
                      <span className="absolute top-1 left-1 bg-primary text-surface text-[7px] font-black px-1.5 py-0.5 rounded-full tracking-widest shadow-md scale-90">
                        MAIN
                      </span>
                    )}

                    <div className="absolute inset-0 sm:group-hover:bg-text/30 transition-all duration-300">
                      <div className="absolute top-1 right-1 flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {photo.id !== user.profile_picture_id && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetMain(photo.id);
                            }}
                            title="Set as main"
                            className="w-6 h-6 rounded-full bg-surface/95 flex items-center justify-center text-primary cursor-pointer shadow-sm hover:scale-110 transition-transform"
                          >
                            <Star className="w-3 h-3 fill-current" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhoto(photo);
                          }}
                          title="Edit photo"
                          className="w-6 h-6 rounded-full bg-surface/95 flex items-center justify-center text-text cursor-pointer shadow-sm hover:scale-110 hover:text-primary transition-transform"
                        >
                          <Wand2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(photo.id);
                          }}
                          className="w-6 h-6 rounded-full bg-surface/95 flex items-center justify-center text-text cursor-pointer shadow-sm hover:scale-110 hover:text-error transition-transform"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 text-text-muted opacity-60">
                    {uploading && slots.findIndex((x) => x === null) === i ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[8px] font-bold uppercase tracking-wider">Add</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      {selectedPhoto && (
        <PhotoEditorModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onSave={handleSavePhoto}
        />
      )}

      {viewerIndex !== null && (
        <PhotoGalleryViewer
          photos={sorted}
          currentIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onChangeIndex={setViewerIndex}
        />
      )}

      {pendingReorder && (
        <ConfirmModal
          title="Set as main photo?"
          message="Are you sure you want to set this photo as your main profile picture?"
          confirmLabel="Set as Main"
          onConfirm={async () => {
            const { sourceIndex, targetIndex } = pendingReorder;
            setPendingReorder(null);
            await executeReorder(sourceIndex, targetIndex);
          }}
          onClose={() => setPendingReorder(null)}
        />
      )}
    </div>
  );
}
