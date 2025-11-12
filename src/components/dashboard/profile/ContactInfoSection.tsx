import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ContactInfoSectionProps {
  clientPhone: string;
  clientEmail: string;
}

const ContactInfoSection = ({ clientPhone, clientEmail }: ContactInfoSectionProps) => {
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
  );
};

export default ContactInfoSection;
