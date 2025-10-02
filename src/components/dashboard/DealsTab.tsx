import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Deal } from './types';

interface DealsTabProps {
  deals: Deal[];
}

const DealsTab = ({ deals }: DealsTabProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активная';
      case 'completed': return 'Завершена';
      case 'overdue': return 'Просрочена';
      default: return status;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold font-montserrat">Сделки из AmoCRM</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Всего: {deals.length}
          </Badge>
        </div>
      </div>

      {deals.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
              <Icon name="Briefcase" size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Нет сделок</h3>
            <p className="text-muted-foreground">
              Сделки из AmoCRM будут отображаться здесь
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deals.map((deal) => (
            <Card key={deal.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{deal.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`${getStatusColor(deal.status)} border-0`}>
                        {getStatusText(deal.status)}
                      </Badge>
                      <Badge variant="outline">ID: {deal.id}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-montserrat">
                      {deal.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Создана</p>
                    <p className="font-medium text-sm">{deal.created_at}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Обновлена</p>
                    <p className="font-medium text-sm">{deal.updated_at}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Воронка</p>
                    <p className="font-medium text-sm">#{deal.pipeline_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ответственный</p>
                    <p className="font-medium text-sm">#{deal.responsible_user_id}</p>
                  </div>
                </div>

                {deal.custom_fields && deal.custom_fields.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Дополнительные поля:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {deal.custom_fields.map((field, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Icon name="Tag" size={14} className="text-muted-foreground" />
                          <span className="text-muted-foreground">{field.field_name}:</span>
                          <span className="font-medium">
                            {field.values && field.values.length > 0 
                              ? String(field.values[0].value) 
                              : '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DealsTab;
