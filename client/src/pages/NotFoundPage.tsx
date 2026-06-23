import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--body-gradient)' }}
    >
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-text mb-2">Page Not Found</h2>
          <p className="text-text-muted mb-8">Sorry, we couldn't find what you're looking for.</p>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Home size={20} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text rounded-lg font-medium hover:bg-surface transition-colors"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
