import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ProfileHeaderProps {
  clientName: string;
  clientFirstName: string;
  clientLastName: string;
  currentAvatar: string;
  onAvatarClick: () => void;
}

const ProfileHeader = ({ 
  clientName, 
  clientFirstName, 
  clientLastName, 
  currentAvatar, 
  onAvatarClick 
}: ProfileHeaderProps) => {
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
    <CardHeader className="relative pb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group">
          <Avatar className="w-28 h-28 border-4 border-background shadow-2xl cursor-pointer transition-transform hover:scale-105" onClick={onAvatarClick}>
            <AvatarImage src={currentAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-3xl font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <Button
            size="sm"
            variant="secondary"
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full p-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onAvatarClick}
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
  );
};

export default ProfileHeader;
