import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
interface HeaderProps {
  lastUpdate: Date | null;
  loading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}

const Header = ({ lastUpdate, loading, onRefresh, onLogout }: HeaderProps) => {
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