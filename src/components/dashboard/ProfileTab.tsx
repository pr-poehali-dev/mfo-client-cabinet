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
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-2xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-montserrat">{clientName || 'Клиент'}</CardTitle>
              <CardDescription>Данные из AmoCRM</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Icon name="User" size={20} />
              Личные данные
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input 
                  id="lastName" 
                  value={clientLastName || '-'} 
                  readOnly 
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input 
                  id="firstName" 
                  value={clientFirstName || '-'} 
                  readOnly 
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Отчество</Label>
                <Input 
                  id="middleName" 
                  value={clientMiddleName || '-'} 
                  readOnly 
                  className="bg-muted/30"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Icon name="Contact" size={20} />
              Контактная информация
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Icon name="Phone" size={14} />
                  Телефон
                </Label>
                <Input 
                  id="phone" 
                  value={clientPhone || '-'} 
                  readOnly 
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Icon name="Mail" size={14} />
                  Email
                </Label>
                <Input 
                  id="email" 
                  value={clientEmail || '-'} 
                  readOnly 
                  className="bg-muted/30"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Данные синхронизируются из AmoCRM</p>
                <p className="text-muted-foreground">
                  Информация обновляется автоматически каждые 5 минут. 
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
