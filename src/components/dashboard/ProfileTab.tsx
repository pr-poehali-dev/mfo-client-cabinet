import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import funcUrls from '@/../backend/func2url.json';

interface ProfileTabProps {
  clientName: string;
  clientFirstName: string;
  clientLastName: string;
  clientMiddleName: string;
  clientGender: 'male' | 'female';
  clientPhone: string;
  clientEmail: string;
  clientLimit?: {
    max_loan_amount: number;
    current_debt: number;
    available_limit: number;
    credit_rating: string;
    is_blocked: boolean;
  };
}

const ProfileTab = ({ 
  clientName,
  clientFirstName, 
  clientLastName, 
  clientMiddleName,
  clientGender,
  clientPhone, 
  clientEmail,
  clientLimit
}: ProfileTabProps) => {
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const defaultMaleAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=male&backgroundColor=c0aede';
  const defaultFemaleAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=female&backgroundColor=b6e3f4';
  
  const avatarOptions = clientGender === 'female' ? [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=female1&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=female2&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=female3&backgroundColor=e0c3fc',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=female4&backgroundColor=ffeaa7',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=female5&backgroundColor=fab1a0',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=female6&backgroundColor=a29bfe',
  ] : [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=male1&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=male2&backgroundColor=74b9ff',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=male3&backgroundColor=81ecec',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=male4&backgroundColor=a8e6cf',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=male5&backgroundColor=dfe6e9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=male6&backgroundColor=ffeaa7',
  ];

  const currentAvatar = customAvatar || (clientGender === 'female' ? defaultFemaleAvatar : defaultMaleAvatar);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Можно загружать только изображения');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 10 МБ');
      return;
    }

    if (type === 'passport') {
      setPassportPhoto(file);
    } else {
      setSelfiePhoto(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadDocuments = async () => {
    console.log('[UPLOAD] Starting upload process');
    console.log('[UPLOAD] Passport photo:', passportPhoto);
    console.log('[UPLOAD] Selfie photo:', selfiePhoto);
    console.log('[UPLOAD] Client phone:', clientPhone);
    
    if (!passportPhoto || !selfiePhoto) {
      toast.error('Загрузите оба документа');
      return;
    }

    setUploading(true);
    try {
      console.log('[UPLOAD] Converting files to base64...');
      const passportBase64 = await fileToBase64(passportPhoto);
      const selfieBase64 = await fileToBase64(selfiePhoto);
      
      console.log('[UPLOAD] Passport base64 length:', passportBase64.length);
      console.log('[UPLOAD] Selfie base64 length:', selfieBase64.length);

      const payload = {
        phone: clientPhone,
        passport: passportBase64,
        selfie: selfieBase64
      };
      
      console.log('[UPLOAD] Sending request to AmoCRM...');
      console.log('[UPLOAD] Payload:', { ...payload, passport: `${passportBase64.substring(0, 50)}...`, selfie: `${selfieBase64.substring(0, 50)}...` });

      const response = await fetch(funcUrls['amocrm-sync'], {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('[UPLOAD] Response status:', response.status);
      const responseData = await response.json();
      console.log('[UPLOAD] Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Ошибка загрузки');
      }

      toast.success('Документы успешно отправлены в AmoCRM!');
      setPassportPhoto(null);
      setSelfiePhoto(null);
    } catch (error) {
      console.error('[UPLOAD] Error:', error);
      toast.error(`Не удалось отправить документы: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/30 bg-card/80 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        
        <CardHeader className="relative pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <Avatar className="w-28 h-28 border-4 border-background shadow-2xl cursor-pointer transition-transform hover:scale-105" onClick={() => setIsAvatarDialogOpen(true)}>
                <AvatarImage src={currentAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-3xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full p-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsAvatarDialogOpen(true)}
              >
                <Icon name="Camera" size={18} />
              </Button>
            </div>
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

          {clientLimit && (
            <div className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                  <Icon name="Wallet" size={20} className="text-green-500" />
                </div>
                Ваш кредитный лимит
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Максимальная сумма</Label>
                  <div className="p-3 bg-background/60 rounded-lg border border-border/50">
                    <p className="font-bold text-2xl text-green-500">{clientLimit.max_loan_amount.toLocaleString('ru-RU')} ₽</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Текущий долг</Label>
                  <div className="p-3 bg-background/60 rounded-lg border border-border/50">
                    <p className="font-bold text-2xl text-orange-500">{clientLimit.current_debt.toLocaleString('ru-RU')} ₽</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Доступно для займа</Label>
                  <div className="p-3 bg-background/60 rounded-lg border border-border/50">
                    <p className="font-bold text-2xl text-blue-500">{clientLimit.available_limit.toLocaleString('ru-RU')} ₽</p>
                  </div>
                </div>
              </div>
              {clientLimit.is_blocked && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <Icon name="AlertCircle" size={18} className="text-red-500" />
                  <p className="text-sm text-red-500 font-semibold">
                    {clientLimit.blocked_reason || 'Новые займы временно недоступны'}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-accent/10 border-2 border-accent/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Icon name="Info" size={20} className="text-accent" />
              </div>
              <div className="text-sm flex-1">
                <p className="font-bold mb-1.5 text-base">Автоматическая синхронизация</p>
                <p className="text-muted-foreground leading-relaxed">
                  Информация автоматически обновляется из AmoCRM при входе. 
                  Изменения в AmoCRM сразу отображаются в личном кабинете.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/30 bg-card/80 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10" />
        
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg">
              <Icon name="FileText" size={24} className="text-secondary" />
            </div>
            Документы для верификации
          </CardTitle>
          <CardDescription>
            Загрузите документы для подтверждения личности
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Icon name="CreditCard" size={16} className="text-primary" />
                Фото паспорта
              </Label>
              <div className="relative">
                <input
                  type="file"
                  id="passport-upload"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'passport')}
                  className="hidden"
                />
                <label
                  htmlFor="passport-upload"
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  {passportPhoto ? (
                    <div className="text-center">
                      <Icon name="CheckCircle" size={32} className="text-accent mx-auto mb-2" />
                      <p className="text-sm font-semibold text-accent">{passportPhoto.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(passportPhoto.size / 1024 / 1024).toFixed(2)} МБ
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Нажмите для загрузки</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Icon name="Camera" size={16} className="text-secondary" />
                Селфи с паспортом
              </Label>
              <div className="relative">
                <input
                  type="file"
                  id="selfie-upload"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'selfie')}
                  className="hidden"
                />
                <label
                  htmlFor="selfie-upload"
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-secondary/50 hover:bg-secondary/5 transition-all"
                >
                  {selfiePhoto ? (
                    <div className="text-center">
                      <Icon name="CheckCircle" size={32} className="text-accent mx-auto mb-2" />
                      <p className="text-sm font-semibold text-accent">{selfiePhoto.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selfiePhoto.size / 1024 / 1024).toFixed(2)} МБ
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Нажмите для загрузки</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleUploadDocuments}
            disabled={!passportPhoto || !selfiePhoto || uploading}
            className="w-full bg-gradient-to-r from-primary to-secondary"
            size="lg"
          >
            {uploading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Отправка в AmoCRM...
              </>
            ) : (
              <>
                <Icon name="Send" size={20} className="mr-2" />
                Отправить документы в AmoCRM
              </>
            )}
          </Button>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Shield" size={18} className="text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Безопасность данных</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Документы отправляются напрямую в AmoCRM по защищённому каналу. 
                  Максимальный размер файла - 10 МБ.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="ImageIcon" size={24} className="text-primary" />
              Выберите аватар
            </DialogTitle>
            <DialogDescription>
              Выберите один из предложенных вариантов
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            {avatarOptions.map((avatarUrl, index) => (
              <button
                key={index}
                onClick={() => {
                  setCustomAvatar(avatarUrl);
                  setIsAvatarDialogOpen(false);
                  toast.success('Аватар обновлён!');
                }}
                className={`relative group rounded-full overflow-hidden border-4 transition-all hover:scale-110 ${
                  customAvatar === avatarUrl 
                    ? 'border-primary shadow-lg shadow-primary/50' 
                    : 'border-border/50 hover:border-primary/50'
                }`}
              >
                <img src={avatarUrl} alt={`Avatar ${index + 1}`} className="w-full h-full" />
                {customAvatar === avatarUrl && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Icon name="Check" size={24} className="text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
          {customAvatar && (
            <Button
              variant="outline"
              onClick={() => {
                setCustomAvatar(null);
                setIsAvatarDialogOpen(false);
                toast.success('Аватар сброшен по умолчанию');
              }}
              className="w-full"
            >
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Сбросить по умолчанию
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileTab;