import { useNavigate } from 'react-router-dom';

export function useProfileDrawer() {
  const navigate = useNavigate();

  const openProfile = (id: string | number) => {
    navigate(`/profile/${String(id)}`);
  };

  const closeProfile = () => {
    navigate(-1);
  };

  return { openProfile, closeProfile };
}
