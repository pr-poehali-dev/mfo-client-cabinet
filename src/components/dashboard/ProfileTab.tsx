import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ProfileInfoCard from './profile/ProfileInfoCard';
import DocumentsUploadSection from './profile/DocumentsUploadSection';
import AvatarDialog from './profile/AvatarDialog';

interface ProfileTabProps {
  clientName: string;
  clientFirstName: string;
  clientLastName: string;
  clientMiddleName: string;
  clientGender: 'male' | 'female';
  clientPhone: string;
  clientEmail: string;
}

const ProfileTab = ({ 
  clientName,
  clientFirstName, 
  clientLastName, 
  clientMiddleName,
  clientGender,
  clientPhone, 
  clientEmail 
}: ProfileTabProps) => {
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    firstName: clientFirstName,
    lastName: clientLastName,
    middleName: clientMiddleName,
    email: clientEmail,
    birthDate: ''
  });
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    setEditData({
      firstName: clientFirstName,
      lastName: clientLastName,
      middleName: clientMiddleName,
      email: clientEmail,
      birthDate: ''
    });
  }, [clientFirstName, clientLastName, clientMiddleName, clientEmail]);

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

  const handleSaveProfile = async () => {
    if (!clientPhone) {
      toast.error('Номер телефона не найден');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('https://functions.poehali.dev/9edfcddf-aeb9-4d91-8ca8-9a0af13c0697', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clientPhone,
          first_name: editData.firstName,
          last_name: editData.lastName,
          middle_name: editData.middleName,
          email: editData.email,
          birth_date: editData.birthDate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сохранения');
      }

      toast.success('Данные успешно обновлены в AmoCRM!');
      setIsEditMode(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Не удалось сохранить данные: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setSaving(false);
    }
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

      const response = await fetch('https://functions.poehali.dev/6e80b3d4-1759-415b-bd93-5e37f93088a5', {
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

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditData({
      firstName: clientFirstName,
      lastName: clientLastName,
      middleName: clientMiddleName,
      email: clientEmail,
      birthDate: ''
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ProfileInfoCard
        clientName={clientName}
        clientFirstName={clientFirstName}
        clientLastName={clientLastName}
        clientMiddleName={clientMiddleName}
        clientEmail={clientEmail}
        clientPhone={clientPhone}
        currentAvatar={currentAvatar}
        isEditMode={isEditMode}
        editData={editData}
        saving={saving}
        onEditDataChange={setEditData}
        onStartEdit={() => setIsEditMode(true)}
        onCancelEdit={handleCancelEdit}
        onSave={handleSaveProfile}
        onAvatarClick={() => setIsAvatarDialogOpen(true)}
      />

      <DocumentsUploadSection
        passportPhoto={passportPhoto}
        selfiePhoto={selfiePhoto}
        uploading={uploading}
        onFileChange={handleFileChange}
        onUpload={handleUploadDocuments}
      />

      <AvatarDialog
        isOpen={isAvatarDialogOpen}
        onOpenChange={setIsAvatarDialogOpen}
        avatarOptions={avatarOptions}
        customAvatar={customAvatar}
        onSelectAvatar={setCustomAvatar}
        onResetAvatar={() => setCustomAvatar(null)}
      />
    </div>
  );
};

export default ProfileTab;
