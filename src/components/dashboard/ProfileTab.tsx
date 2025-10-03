import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
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

  const maskPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `+7 (${digits.slice(1, 4)}) ***-**-${digits.slice(9, 11)}`;
    }
    return phone;
  };

  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return email;
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return email;
    const visibleStart = localPart.slice(0, 2);
    const visibleEnd = localPart.slice(-1);
    return `${visibleStart}***${visibleEnd}@${domain}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/30 bg-card/80 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        
        <CardHeader className="relative pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-28 h-28 border-4 border-background shadow-2xl">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-3xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <CardTitle className="text-3xl font-montserrat mb-2">{clientName || 'Клиент'}</CardTitle>
              <CardDescription className="text-base flex items-center gap-2 justify-center sm:justify-start">
                <Icon name="CheckCircle" size={16} className="text-accent" />
                Данные синхронизированы с AmoCRM
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-6">
          <div className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                <Icon name="User" size={20} className="text-primary" />
              </div>
              Личные данные
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Фамилия</Label>
                <div className="p-3 bg-background/60 rounded-lg border border-border/50">
                  <p className="font-semibold">{clientLastName || '-'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Имя</Label>
                <div className="p-3 bg-background/60 rounded-lg border border-border/50">
                  <p className="font-semibold">{clientFirstName || '-'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Отчество</Label>
                <div className="p-3 bg-background/60 rounded-lg border border-border/50">
                  <p className="font-semibold">{clientMiddleName || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-secondary/5 to-primary/5 rounded-xl border border-secondary/20">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg">
                <Icon name="Contact" size={20} className="text-secondary" />
              </div>
              Контактная информация
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Icon name="Phone" size={14} />
                  Телефон
                </Label>
                <div className="p-3 bg-background/60 rounded-lg border border-border/50 flex items-center gap-3">
                  <Icon name="Phone" size={18} className="text-accent" />
                  <p className="font-semibold">{maskPhone(clientPhone) || '-'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Icon name="Mail" size={14} />
                  Email
                </Label>
                <div className="p-3 bg-background/60 rounded-lg border border-border/50 flex items-center gap-3">
                  <Icon name="Mail" size={18} className="text-accent" />
                  <p className="font-semibold truncate">{maskEmail(clientEmail) || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-accent/10 border-2 border-accent/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Icon name="Info" size={20} className="text-accent" />
              </div>
              <div className="text-sm flex-1">
                <p className="font-bold mb-1.5 text-base">Автоматическая синхронизация</p>
                <p className="text-muted-foreground leading-relaxed">
                  Информация обновляется автоматически каждые 5 минут из AmoCRM. 
                  Для изменения данных обратитесь к менеджеру.
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