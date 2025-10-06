import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { ChatMessage } from './types';

interface SupportTabProps {
  clientPhone: string;
  contactId: string;
}

const SupportTab = ({ clientPhone, contactId }: SupportTabProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (contactId) {
      loadMessages();
      const interval = setInterval(loadMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [contactId]);

  const loadMessages = async () => {
    if (!contactId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://functions.poehali.dev/b8a1856f-8ba7-482b-b70e-c9e1916ac7bd?contact_id=${contactId}`
      );

      if (!response.ok) {
        throw new Error('Ошибка загрузки сообщений');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !contactId) return;

    try {
      setSending(true);
      const response = await fetch(
        'https://functions.poehali.dev/b8a1856f-8ba7-482b-b70e-c9e1916ac7bd',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contact_id: contactId,
            message: newMessage.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка отправки сообщения');
      }

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: newMessage.trim(),
          created_at: Math.floor(Date.now() / 1000),
          author_id: 0,
          is_client: true
        }]);
        setNewMessage('');
        toast.success('Сообщение отправлено');
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
            Чат с поддержкой
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Задайте вопрос нашим специалистам. Мы отвечаем в течение нескольких минут.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[500px] overflow-y-auto p-4 bg-muted/20 rounded-xl border border-border/30 space-y-3">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Загрузка сообщений...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <Icon name="MessageCircle" size={48} className="text-muted-foreground/50 mx-auto" />
                  <div>
                    <p className="font-semibold text-lg mb-1">Начните диалог</p>
                    <p className="text-sm text-muted-foreground">
                      Напишите ваш вопрос, и мы ответим в ближайшее время
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_client ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-[60%] p-3 sm:p-4 rounded-2xl ${
                        message.is_client
                          ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-br-sm'
                          : 'bg-card border border-border/50 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm sm:text-base break-words whitespace-pre-wrap">
                        {message.text}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          message.is_client ? 'text-white/70' : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(message.created_at * 1000).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              disabled={sending || !contactId}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending || !contactId}
              className="bg-gradient-to-r from-primary to-secondary shrink-0"
            >
              {sending ? (
                <Icon name="Loader2" size={20} className="animate-spin" />
              ) : (
                <Icon name="Send" size={20} />
              )}
            </Button>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-lg shrink-0">
                <Icon name="Info" size={18} className="text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-semibold mb-1">Быстрые ответы</p>
                <p className="text-muted-foreground text-xs">
                  Наши менеджеры отвечают на вопросы с 9:00 до 21:00 по московскому времени.
                  Среднее время ответа — 5 минут.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTab;