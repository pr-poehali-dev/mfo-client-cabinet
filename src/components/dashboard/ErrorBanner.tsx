import Icon from '@/components/ui/icon';

interface ErrorBannerProps {
  error: string;
}

const ErrorBanner = ({ error }: ErrorBannerProps) => {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
      <Icon name="AlertCircle" size={20} className="text-yellow-500" />
      <p className="text-sm text-yellow-200">{error}</p>
    </div>
  );
};

export default ErrorBanner;
