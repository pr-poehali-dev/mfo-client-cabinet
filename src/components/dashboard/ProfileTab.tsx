import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ProfileInfoCard from './profile/ProfileInfoCard';
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