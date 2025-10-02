import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface ProfileTabProps {
  clientName: string;
  clientFirstName: string;
  clientLastName: string;
  clientMiddleName: string;
  clientPhone: string;
  clientEmail: string;
}

const ProfileTab = ({ 
  clientName,
  clientFirstName, 
  clientLastName, 
  clientMiddleName, 
  clientPhone, 
  clientEmail 
}: ProfileTabProps) => {
  const getInitials = () => {
    if (clientFirstName && clientLastName) {
      return `${clientFirstName[0]}${clientLastName[0]}`.toUpperCase();
    }
    if (clientName) {
      const parts = clientName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return clientName.slice(0, 2).toUpperCase();
    }
    return 'КЛ';
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-5">
            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-white text-3xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold tracking-tight mb-1">{clientName || 'Клиент'}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 text-base">
                <Icon name="Database" size={14} />
                Данные из AmoCRM
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <Separator />
          
          <div>
            <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-foreground/90">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="User" size={16} className="text-primary" />
              </div>
              Личные данные
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Фамилия</Label>
                <div className="px-3 py-2.5 bg-muted/40 rounded-lg border">
                  <p className="font-semibold">{clientLastName || '—'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Имя</Label>
                <div className="px-3 py-2.5 bg-muted/40 rounded-lg border">
                  <p className="font-semibold">{clientFirstName || '—'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Отчество</Label>
                <div className="px-3 py-2.5 bg-muted/40 rounded-lg border">
                  <p className="font-semibold">{clientMiddleName || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-foreground/90">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="Contact" size={16} className="text-primary" />
              </div>
              Контакты
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Icon name="Phone" size={13} />
                  Телефон
                </Label>
                <div className="px-3 py-2.5 bg-muted/40 rounded-lg border flex items-center gap-2">
                  <Icon name="Phone" size={16} className="text-muted-foreground" />
                  <p className="font-semibold">{clientPhone || '—'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Icon name="Mail" size={13} />
                  Email
                </Label>
                <div className="px-3 py-2.5 bg-muted/40 rounded-lg border flex items-center gap-2">
                  <Icon name="Mail" size={16} className="text-muted-foreground" />
                  <p className="font-semibold truncate">{clientEmail || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Info" size={18} className="text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-semibold mb-1.5">Автоматическая синхронизация</p>
                <p className="text-muted-foreground leading-relaxed">
                  Данные обновляются каждые 5 минут из AmoCRM. Для изменения информации свяжитесь с менеджером.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;