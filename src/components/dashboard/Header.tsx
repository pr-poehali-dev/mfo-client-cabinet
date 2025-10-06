import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import { AppNotification } from './types';

interface HeaderProps {
  lastUpdate: Date | null;
  loading: boolean;
  notifications: AppNotification[];
  onRefresh: () => void;
  onLogout: () => void;
}

const Header = ({ lastUpdate, loading, notifications, onRefresh, onLogout }: HeaderProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-secondary flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-background">
              <Icon name="CheckCircle" size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Личный кабинет</h1>
              {lastUpdate && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Icon name="Clock" size={11} />
                  {lastUpdate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="relative"
                title="Уведомления"
              >
                <Icon name="Bell" size={20} />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <Icon name="Bell" size={18} />
                  Уведомления
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {unreadCount}
                    </Badge>
                  )}
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Icon name="BellOff" size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Нет уведомлений</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 hover:bg-muted/50 transition-colors ${
                          !notification.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            notification.type === 'warning' ? 'bg-yellow-500/10' :
                            notification.type === 'success' ? 'bg-green-500/10' :
                            'bg-blue-500/10'
                          }`}>
                            <Icon 
                              name={
                                notification.type === 'warning' ? 'AlertTriangle' :
                                notification.type === 'success' ? 'CheckCircle' :
                                'Info'
                              }
                              size={18}
                              className={
                                notification.type === 'warning' ? 'text-yellow-500' :
                                notification.type === 'success' ? 'text-green-500' :
                                'text-blue-500'
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm mb-1">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onRefresh}
            disabled={loading}
            title="Обновить данные из AmoCRM"
          >
            <Icon name={loading ? 'Loader2' : 'RefreshCw'} size={20} className={loading ? 'animate-spin' : ''} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-white font-semibold">АИ</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRefresh} disabled={loading}>
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить данные
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;