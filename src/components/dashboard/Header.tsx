import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { Notification } from './types';

interface HeaderProps {
  lastUpdate: Date | null;
  loading: boolean;
  notifications: Notification[];
  onRefresh: () => void;
}

const Header = ({ lastUpdate, loading, notifications, onRefresh }: HeaderProps) => {
  return (
    <div className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Icon name="Wallet" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">МФО Личный Кабинет</h1>
            {lastUpdate && (
              <p className="text-xs text-muted-foreground">
                Обновлено: {lastUpdate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onRefresh}
            disabled={loading}
            title="Обновить данные из AmoCRM"
          >
            <Icon name={loading ? 'Loader2' : 'RefreshCw'} size={20} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Icon name="Bell" size={20} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </Button>
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-white font-semibold">АИ</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default Header;
