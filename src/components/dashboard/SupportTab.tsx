import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface SupportTabProps {
  clientPhone: string;
  contactId: string;
  onMessagesUpdate?: (count: number) => void;
}

const SupportTab = ({ clientPhone, contactId, onMessagesUpdate }: SupportTabProps) => {
  useEffect(() => {
    const container = document.getElementById('amo_inline_chat');
    if (!container) return;

    const script = document.createElement('script');
    script.innerHTML = `
      (function(a,m,o,c,r,m){
        a[m]={
          id:"435659",
          hash:"b37e36919def34b9611aaa7217bddca108a91f825271662291e9fb95592a2baa",
          locale:"ru",
          inline:true,
          setMeta:function(p){
            this.params=(this.params||[]).concat([p])
          }
        };
        a[o]=a[o]||function(){
          (a[o].q=a[o].q||[]).push(arguments)
        };
        var d=a.document,s=d.createElement('script');
        s.async=true;
        s.id=m+'_inline_script';
        s.src='https://gso.amocrm.ru/js/button.js';
        if(d.head){d.head.appendChild(s)}
      }(window,0,'amoSocialButton',0,0,'amo_social_button'));
    `;
    
    container.appendChild(script);
    
    return () => {
      const inlineScript = document.getElementById('amo_social_button_inline_script');
      if (inlineScript) {
        inlineScript.remove();
      }
    };
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="border-border/30 bg-card/80 backdrop-blur-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
              <Icon name="MessageCircle" size={20} className="text-primary" />
            </div>
            Чат с поддержкой
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Задайте вопрос нашим специалистам. Мы отвечаем в течение нескольких минут.
          </p>
        </CardHeader>
        <CardContent>
          <div 
            id="amo_inline_chat" 
            className="min-h-[700px] w-full"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTab;