import { useNavigate } from 'react-router-dom';

export function useProfileDrawer() {
  const navigate = useNavigate();

  const openProfile = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const closeProfile = () => {
    navigate(-1);
  };

  return { openProfile, closeProfile };
}
