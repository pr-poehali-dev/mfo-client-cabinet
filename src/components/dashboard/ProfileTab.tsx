import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface ProfileTabProps {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}

const ProfileTab = ({ clientName, clientPhone, clientEmail }: ProfileTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmail, setEditedEmail] = useState(clientEmail);

  const handleSave = () => {
    alert('Изменения сохранены!');
    setIsEditing(false);
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-2xl font-bold">
                АИ
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-montserrat">{clientName}</CardTitle>
              <CardDescription>Клиент с 2022 года</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" value={clientPhone} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={isEditing ? editedEmail : clientEmail} 
                onChange={(e) => setEditedEmail(e.target.value)}
                readOnly={!isEditing} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passport">Паспорт</Label>
              <Input id="passport" value="45 ** ******" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inn">ИНН</Label>
              <Input id="inn" value="7727******" readOnly />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Icon name="Settings" size={20} />
              Настройки
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Icon name="Mail" size={18} />
                  <span className="text-sm">Email уведомления</span>
                </div>
                <Badge variant="outline">Включено</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Icon name="MessageSquare" size={18} />
                  <span className="text-sm">SMS уведомления</span>
                </div>
                <Badge variant="outline">Включено</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Icon name="Shield" size={18} />
                  <span className="text-sm">Двухфакторная аутентификация</span>
                </div>
                <Badge variant="outline">Отключено</Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {!isEditing ? (
              <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>
                <Icon name="Edit" size={18} className="mr-2" />
                Редактировать
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                  <Icon name="X" size={18} className="mr-2" />
                  Отмена
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-primary to-secondary" onClick={handleSave}>
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;