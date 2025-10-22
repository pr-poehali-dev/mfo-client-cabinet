import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Icon name="ShoppingBag" size={48} className="text-white" />
          </div>
          <CardTitle className="text-4xl font-montserrat mb-3">МегаГрупп</CardTitle>
          <CardDescription className="text-lg">
            Система управления клиентами и заказами
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate('/megagroup-login')}
            className="w-full text-lg h-14"
            size="lg"
          >
            <Icon name="LogIn" size={24} className="mr-3" />
            Вход в личный кабинет
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="Users" size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Клиентская база</h3>
              <p className="text-sm text-muted-foreground">Управление информацией о клиентах</p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="Package" size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-1">История заказов</h3>
              <p className="text-sm text-muted-foreground">Просмотр всех заказов клиента</p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="Wallet" size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Баланс и бонусы</h3>
              <p className="text-sm text-muted-foreground">Отслеживание финансовых данных</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
