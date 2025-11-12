import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface PersonalInfoSectionProps {
  clientFirstName: string;
  clientLastName: string;
  clientMiddleName: string;
}

const PersonalInfoSection = ({ 
  clientFirstName, 
  clientLastName, 
  clientMiddleName 
}: PersonalInfoSectionProps) => {
  return (
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
  );
};

export default PersonalInfoSection;
