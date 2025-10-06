import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import ProfileHeader from './ProfileHeader';

interface EditData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  birthDate: string;
}

interface ProfileInfoCardProps {
  clientName: string;
  clientFirstName: string;
  clientLastName: string;
  clientMiddleName: string;
  clientEmail: string;
  clientPhone: string;
  currentAvatar: string;
  isEditMode: boolean;
  editData: EditData;
  saving: boolean;
  onEditDataChange: (data: EditData) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onAvatarClick: () => void;
}

const ProfileInfoCard = ({
  clientName,
  clientFirstName,
  clientLastName,
  clientMiddleName,
  clientEmail,
  clientPhone,
  currentAvatar,
  isEditMode,
  editData,
  saving,
  onEditDataChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onAvatarClick
}: ProfileInfoCardProps) => {
  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    }
    return phone;
  };

  return (
    <Card className="border-border/30 bg-card/80 backdrop-blur-md overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      
      <ProfileHeader
        clientName={clientName}
        clientFirstName={clientFirstName}
        clientLastName={clientLastName}
        currentAvatar={currentAvatar}
        onAvatarClick={onAvatarClick}
      />
      
      <CardContent className="relative space-y-6">
        <div className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                <Icon name="User" size={20} className="text-primary" />
              </div>
              Личные данные
            </h3>
            {!isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={onStartEdit}
                className="gap-2"
              >
                <Icon name="Edit" size={16} />
                Редактировать
              </Button>
            )}
          </div>
          
          {isEditMode ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Фамилия</Label>
                  <Input
                    id="lastName"
                    value={editData.lastName}
                    onChange={(e) => onEditDataChange({...editData, lastName: e.target.value})}
                    placeholder="Иванов"
                    className="bg-background/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Имя</Label>
                  <Input
                    id="firstName"
                    value={editData.firstName}
                    onChange={(e) => onEditDataChange({...editData, firstName: e.target.value})}
                    placeholder="Иван"
                    className="bg-background/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Отчество</Label>
                  <Input
                    id="middleName"
                    value={editData.middleName}
                    onChange={(e) => onEditDataChange({...editData, middleName: e.target.value})}
                    placeholder="Иванович"
                    className="bg-background/60"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => onEditDataChange({...editData, email: e.target.value})}
                    placeholder="example@mail.com"
                    className="bg-background/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Дата рождения</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={editData.birthDate}
                    onChange={(e) => onEditDataChange({...editData, birthDate: e.target.value})}
                    className="bg-background/60"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <Button
                  onClick={onSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  {saving ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Icon name="Save" size={18} className="mr-2" />
                      Сохранить
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancelEdit}
                  disabled={saving}
                  className="sm:w-auto"
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Фамилия</Label>
                <div className="p-3 bg-background/60 rounded-lg border border-border/50">
                  <p className="font-semibold break-words">{clientLastName || '-'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Имя</Label>
                <div className="p-3 bg-background/60 rounded-lg border border-border/50">
                  <p className="font-semibold break-words">{clientFirstName || '-'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Отчество</Label>
                <div className="p-3 bg-background/60 rounded-lg border border-border/50">
                  <p className="font-semibold break-words">{clientMiddleName || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 bg-gradient-to-br from-secondary/5 to-primary/5 rounded-xl border border-secondary/20">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg">
              <Icon name="Contact" size={20} className="text-secondary" />
            </div>
            Контактная информация
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Icon name="Phone" size={14} />
                Телефон
              </Label>
              <div className="p-3 bg-background/60 rounded-lg border border-border/50 flex items-center gap-3">
                <Icon name="Phone" size={18} className="text-accent shrink-0" />
                <p className="font-semibold break-all">{formatPhone(clientPhone) || '-'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Icon name="Mail" size={14} />
                Email
              </Label>
              <div className="p-3 bg-background/60 rounded-lg border border-border/50 flex items-center gap-3">
                <Icon name="Mail" size={18} className="text-accent shrink-0" />
                <p className="font-semibold break-all">{clientEmail || 'Не указан'}</p>
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
                Информация обновляется автоматически при изменении статусов в AmoCRM. 
                Вы получите уведомление при любых изменениях по вашим заявкам.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInfoCard;