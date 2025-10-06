import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SupportTabProps {
  clientPhone: string;
  contactId: string;
  onMessagesUpdate?: (count: number) => void;
}

const SupportTab = ({ clientPhone, contactId, onMessagesUpdate }: SupportTabProps) => {
  const openChat = () => {
    if (typeof window.amoSocialButton === 'function') {
      window.amoSocialButton('open');
    }
  };

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
          <div className="text-center py-12 space-y-6">
            <Icon name="MessageCircle" size={64} className="text-muted-foreground/30 mx-auto" />
            <div>
              <p className="text-lg font-medium mb-2">Нужна помощь?</p>
              <p className="text-sm text-muted-foreground mb-6">
                Нажмите на кнопку, чтобы открыть чат с поддержкой
              </p>
              <Button 
                onClick={openChat}
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Icon name="MessageCircle" size={20} className="mr-2" />
                Открыть чат
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTab;