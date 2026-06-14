import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      navigate(`/browse?profileId=${id}`, { replace: true });
    }
  }, [id, navigate]);

  return null;
}
