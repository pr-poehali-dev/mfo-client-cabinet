import Icon from '@/components/ui/icon';

interface LoadingBannerProps {
  loading: boolean;
}

const LoadingBanner = ({ loading }: LoadingBannerProps) => {
  if (!loading) return null;

  return (
    <div className="mb-6 p-4 bg-secondary/10 border border-secondary/30 rounded-lg flex items-center gap-3">
      <div className="animate-spin">
        <Icon name="Loader2" size={20} className="text-secondary" />
      </div>
      <p className="text-sm text-muted-foreground">Загрузка данных из AmoCRM...</p>
    </div>
  );
};

export default LoadingBanner;
