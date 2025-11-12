import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import funcUrls from '@/../backend/func2url.json';

interface DocumentUploadCardProps {
  clientPhone: string;
}

const DocumentUploadCard = ({ clientPhone }: DocumentUploadCardProps) => {
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
  );
};

export default DocumentUploadCard;
