import { useSearchParams } from 'react-router-dom';

export function useProfileDrawer() {
  const [searchParams, setSearchParams] = useSearchParams();

  const openProfile = (id: string | number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('profileId', String(id));
        return next;
      },
      { replace: false },
    );
  };

  const closeProfile = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('profileId');
        return next;
      },
      { replace: true },
    );
  };

  const activeProfileId = searchParams.get('profileId');

  return { openProfile, closeProfile, activeProfileId };
}
