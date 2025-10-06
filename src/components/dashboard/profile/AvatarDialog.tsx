import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface AvatarDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  avatarOptions: string[];
  customAvatar: string | null;
  onSelectAvatar: (url: string) => void;
  onResetAvatar: () => void;
}

const AvatarDialog = ({
  isOpen,
  onOpenChange,
  avatarOptions,
  customAvatar,
  onSelectAvatar,
  onResetAvatar
}: AvatarDialogProps) => {
  const handleSelectAvatar = (avatarUrl: string) => {
    onSelectAvatar(avatarUrl);
    onOpenChange(false);
    toast.success('Аватар обновлён!');
  };

  const handleResetAvatar = () => {
    onResetAvatar();
    onOpenChange(false);
    toast.success('Аватар сброшен по умолчанию');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onClick={() => handleSelectAvatar(avatarUrl)}
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
            onClick={handleResetAvatar}
            className="w-full"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Сбросить по умолчанию
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AvatarDialog;
