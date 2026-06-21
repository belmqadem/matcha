// src/components/profile/EditFullProfileModal.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Sparkles, MapPin, Tag, Shield, Loader2, ChevronDown, X, Check, Search } from 'lucide-react';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { mapService } from '@/services/mapService';
import type { UserProfile } from '@/types/user';
import { GENDERS, PREFERENCES, SUGGESTED_TAGS } from './profileConstants';
import { SaveBar } from './SaveBar';
import { ConfirmModal } from './EditModal';
import DatePicker from '@/components/DatePicker';

const inputCls =
  'w-full bg-background border-2 border-transparent rounded-2xl px-4 py-3 text-sm font-bold text-text placeholder-text-muted outline-none focus:border-primary transition-all';
const labelCls =
  'block text-[0.65rem] sm:text-xs font-bold tracking-widest uppercase text-text-muted mb-2';

interface Props {
  user: UserProfile;
  onUpdate: (_u: UserProfile) => void;
  onClose: () => void;
  initialTab?: 'identity' | 'about' | 'tags' | 'location';
}

export function EditFullProfileModal({ user, onUpdate, onClose, initialTab = 'identity' }: Props) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'identity' | 'about' | 'location' | 'tags'>(
    initialTab,
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- TAB 1: IDENTITY STATE ---
  const [identityForm, setIdentityForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    email: user.email,
  });
  const [identitySaving, setIdentitySaving] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  const handleSaveIdentity = async () => {
    if (!identityForm.first_name.trim() || !identityForm.last_name.trim()) {
      toast.error('Name is required.');
      return;
    }
    if (identityForm.email !== user.email) {
      setShowEmailConfirm(true);
      return;
    }
    await doSaveIdentity(false);
  };

  const doSaveIdentity = async (emailChanged: boolean) => {
    setIdentitySaving(true);
    try {
      const updated = await userService.patchUser(identityForm);
      if (emailChanged) {
        await authService.logout();
        navigate('/login');
        return;
      }
      onUpdate(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
        navigate('/profile/me');
      }, 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setIdentitySaving(false);
    }
  };

  // --- TAB 2: ABOUT STATE ---
  const [aboutForm, setAboutForm] = useState({
    gender: user.gender ?? '',
    sexual_preference: user.sexual_preference ?? '',
    biography: user.biography ?? '',
    birth_date: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
  });
  const [aboutSaving, setAboutSaving] = useState(false);

  const handleSaveAbout = async () => {
    if (!aboutForm.birth_date) {
      toast.error('Birth date is required.');
      return;
    }
    setAboutSaving(true);
    try {
      const updated = await userService.patchProfile({
        gender: aboutForm.gender || undefined,
        sexual_preference: aboutForm.sexual_preference || undefined,
        biography: aboutForm.biography || undefined,
        birth_date: aboutForm.birth_date,
      } as Partial<UserProfile>);

      onUpdate({
        ...user,
        ...updated,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
        navigate('/profile/me');
      }, 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setAboutSaving(false);
    }
  };

  // --- TAB 3: LOCATION STATE ---
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(
    user.latitude && user.longitude
      ? { lat: Number(user.latitude), lng: Number(user.longitude) }
      : null,
  );
  const [resolvedCity, setResolvedCity] = useState(user.location_city ?? '');
  const [citySearchInput, setCitySearchInput] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);

  const useGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        const city = await mapService.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setResolvedCity(city ?? '');
        setGpsLoading(false);
      },
      () => {
        toast.error('GPS access denied. Enter your city below.');
        setGpsLoading(false);
      },
    );
  };

  const searchCity = async () => {
    const q = citySearchInput.trim();
    if (!q) {
      toast.error('Please enter a city name.');
      return;
    }
    setSearchLoading(true);
    const result = await mapService.forwardGeocode(q);
    setSearchLoading(false);
    if (!result) {
      toast.error('City not found. Try a different name.');
      return;
    }
    const shortName = result.displayName.split(',')[0].trim();
    setGpsCoords({ lat: result.lat, lng: result.lng });
    setResolvedCity(shortName);
    setCitySearchInput('');
  };

  const handleSaveLocation = async () => {
    const finalLat = gpsCoords?.lat ?? user.latitude;
    const finalLng = gpsCoords?.lng ?? user.longitude;
    if (finalLat == null || finalLng == null) {
      toast.error('Please set your location using GPS or city search.');
      return;
    }
    setLocationSaving(true);
    try {
      await userService.updateLocation({
        latitude: finalLat,
        longitude: finalLng,
        location_city: resolvedCity || undefined,
      });
      onUpdate({
        ...user,
        latitude: finalLat,
        longitude: finalLng,
        location_city: resolvedCity || user.location_city,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
        navigate('/profile/me');
      }, 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save location.');
    } finally {
      setLocationSaving(false);
    }
  };

  // --- TAB 4: TAGS STATE ---
  const [tags, setTags] = useState<string[]>(user.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [tagsSaving, setTagsSaving] = useState(false);

  const addTag = (tag: string) => {
    const n = tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
    if (!n || n === '#' || tags.includes(n) || n.length < 2) return;
    setTags((t) => [...t, n]);
    setTagInput('');
  };

  const handleSaveTags = async () => {
    setTagsSaving(true);
    try {
      const updated = await userService.updateTags(tags);
      onUpdate({ ...user, tags: updated });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
        navigate('/profile/me');
      }, 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setTagsSaving(false);
    }
  };

  const availableTags = SUGGESTED_TAGS.filter((t) => !tags.includes(t));

  return (
    <>
    {showEmailConfirm && (
      <ConfirmModal
        title="Change email?"
        message="Changing your email will sign you out. You will need to verify your new email before logging back in."
        confirmLabel="Continue"
        danger
        onConfirm={() => {
          setShowEmailConfirm(false);
          void doSaveIdentity(true);
        }}
        onClose={() => setShowEmailConfirm(false)}
      />
    )}
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 backdrop-blur-xs p-4 pt-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {saveSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] bg-primary text-on-primary px-6 py-3 rounded-full flex items-center gap-2 text-xs sm:text-sm font-black shadow-xl shadow-primary/30 border border-primary-light/20 animate-in fade-in zoom-in-95 duration-200">
          <Check className="w-4 h-4 shrink-0" />
          <span>Saved successfully!</span>
        </div>
      )}
      <div className="bg-surface rounded-3xl w-full max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden shadow-premium animate-in fade-in zoom-in-95 duration-200 border border-border/80 text-text">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-surface/85 backdrop-blur-md shrink-0">
          <h3 className="text-lg sm:text-xl font-black text-text tracking-tight">Edit Profile</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border/80 bg-surface flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-all active:scale-90 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex border-b border-border/40 overflow-x-auto scrollbar-none shrink-0 bg-background/30 px-4">
          <button
            onClick={() => setActiveTab('identity')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'identity'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Account
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            About Me
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'location'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Location
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tags'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Tags
          </button>
        </div>

        {/* Tab content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin">
          {/* TAB 1: IDENTITY */}
          {activeTab === 'identity' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveIdentity();
              }}
              className="space-y-4 animate-in fade-in duration-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name</label>
                  <input
                    value={identityForm.first_name}
                    onChange={(e) => setIdentityForm((p) => ({ ...p, first_name: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <input
                    value={identityForm.last_name}
                    onChange={(e) => setIdentityForm((p) => ({ ...p, last_name: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Username</label>
                <input
                  value={identityForm.username}
                  onChange={(e) => setIdentityForm((p) => ({ ...p, username: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input
                  value={identityForm.email}
                  type="email"
                  onChange={(e) => setIdentityForm((p) => ({ ...p, email: e.target.value }))}
                  className={inputCls}
                />
                <p className="text-[10px] font-bold text-error/85 mt-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Changing your email will require log out and
                  re-verification.
                </p>
              </div>

              <div className="pt-4">
                <SaveBar
                  saving={identitySaving}
                  onSave={handleSaveIdentity}
                  onCancel={onClose}
                />
              </div>
            </form>
          )}

          {/* TAB 2: ABOUT */}
          {activeTab === 'about' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAbout();
              }}
              className="space-y-4 animate-in fade-in duration-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Birth Date</label>
                  <DatePicker
                    value={
                      aboutForm.birth_date
                        ? (() => {
                            const [y, m, d] = aboutForm.birth_date.split('-').map(Number);
                            return new Date(y, m - 1, d);
                          })()
                        : null
                    }
                    onChange={(date) => {
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, '0');
                      const d = String(date.getDate()).padStart(2, '0');
                      setAboutForm((p) => ({ ...p, birth_date: `${y}-${m}-${d}` }));
                    }}
                  />
                </div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <div className="relative">
                    <select
                      value={aboutForm.gender}
                      onChange={(e) => setAboutForm((p) => ({ ...p, gender: e.target.value }))}
                      className={`${inputCls} appearance-none pr-10 cursor-pointer`}
                    >
                      <option value="">Not specified</option>
                      {GENDERS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Looking for</label>
                <div className="relative">
                  <select
                    value={aboutForm.sexual_preference}
                    onChange={(e) =>
                      setAboutForm((p) => ({ ...p, sexual_preference: e.target.value }))
                    }
                    className={`${inputCls} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="">Bisexual (Default)</option>
                    {PREFERENCES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Biography</label>
                <textarea
                  value={aboutForm.biography}
                  onChange={(e) => setAboutForm((p) => ({ ...p, biography: e.target.value }))}
                  maxLength={500}
                  rows={4}
                  placeholder="Introduce yourself to the world..."
                  className={`${inputCls} resize-none scrollbar-thin`}
                />
                <p className="text-right text-[10px] font-bold text-text-muted mt-1">
                  {aboutForm.biography.length}/500
                </p>
              </div>

              <div className="pt-4">
                <SaveBar
                  saving={aboutSaving}
                  onSave={handleSaveAbout}
                  onCancel={onClose}
                />
              </div>
            </form>
          )}

          {/* TAB 3: LOCATION */}
          {activeTab === 'location' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSaveLocation();
              }}
              className="space-y-4 animate-in fade-in duration-200"
            >
              {/* GPS button */}
              <div>
                <label className={labelCls}>GPS Location</label>
                <button
                  type="button"
                  onClick={useGPS}
                  disabled={gpsLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-bold cursor-pointer transition-all active:scale-95 disabled:opacity-60 ${
                    gpsCoords && !resolvedCity
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-text-muted hover:text-text'
                  }`}
                >
                  {gpsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  {gpsLoading
                    ? 'Detecting…'
                    : gpsCoords && !resolvedCity
                      ? 'GPS detected ✓'
                      : 'Detect my GPS location'}
                </button>
                <p className="text-[10px] font-bold text-primary/80 mt-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Used exclusively to calculate distances.
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">or enter manually</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* City search */}
              <div>
                <label className={labelCls}>Search by city</label>
                <div className="flex gap-2">
                  <input
                    value={citySearchInput}
                    onChange={(e) => setCitySearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void searchCity();
                      }
                    }}
                    placeholder="e.g. Paris, Berlin…"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => void searchCity()}
                    disabled={searchLoading}
                    className="flex items-center justify-center w-11 rounded-2xl bg-primary text-white transition-all active:scale-95 disabled:opacity-60 shrink-0"
                  >
                    {searchLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmed location */}
              {gpsCoords && resolvedCity && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-primary/10 border border-primary/20 rounded-2xl animate-fade-in-up">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-bold text-primary">{resolvedCity} ✓</span>
                </div>
              )}

              <div className="pt-2">
                <SaveBar
                  saving={locationSaving}
                  error=""
                  onSave={handleSaveLocation}
                  onCancel={onClose}
                />
              </div>
            </form>
          )}

          {/* TAB 4: TAGS */}
          {activeTab === 'tags' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTags();
              }}
              className="space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addTag(tagInput.trim());
                    }
                  }}
                  placeholder="Add custom tag (e.g. #art, #music)..."
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput.trim())}
                  className="px-5 py-3 rounded-2xl bg-primary text-white font-bold cursor-pointer hover:shadow-md active:scale-95 transition-all text-sm shrink-0"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div>
                  <label className={labelCls}>My Tags</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold shadow-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags((t) => t.filter((x) => x !== tag))}
                          className="bg-surface/25 rounded-full p-0.5 hover:bg-surface/40 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {availableTags.length > 0 && (
                <div>
                  <label className={labelCls}>Suggested Tags</label>
                  <div className="flex flex-wrap gap-2 mt-2 max-h-[160px] overflow-y-auto scrollbar-thin pr-1">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="px-3 py-1.5 rounded-full border-2 border-border bg-surface text-text-muted text-xs font-bold cursor-pointer hover:border-primary hover:text-primary transition-all active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <SaveBar
                  saving={tagsSaving}
                  onSave={handleSaveTags}
                  onCancel={onClose}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
