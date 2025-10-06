import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface SupportTabProps {
  clientPhone: string;
  contactId: string;
  onMessagesUpdate?: (count: number) => void;
}

const SupportTab = ({ clientPhone, contactId, onMessagesUpdate }: SupportTabProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="border-border/30 bg-card/80 backdrop-blur-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
              <Icon name="MessageCircle" size={20} className="text-primary" />
            </div>
            Поддержка
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Свяжитесь с нами для получения помощи
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Icon name="MessageCircle" size={64} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Раздел поддержки в разработке
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTab;