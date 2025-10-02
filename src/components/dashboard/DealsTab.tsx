import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Deal } from './types';

interface DealsTabProps {
  deals: Deal[];
}

const DealsTab = ({ deals }: DealsTabProps) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 204, g: 204, b: 204 };
  };

  const filteredDeals = deals.filter(deal => {
    if (filter === 'all') return true;
    return deal.status === filter;
  });

  const activeCount = deals.filter(d => d.status === 'active').length;
  const completedCount = deals.filter(d => d.status === 'completed').length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-montserrat mb-4">Сделки из AmoCRM</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            <Icon name="Briefcase" size={16} className="mr-2" />
            Все ({deals.length})
          </Button>
          
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            <Icon name="Play" size={16} className="mr-2" />
            Активные ({activeCount})
          </Button>
          
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            <Icon name="CheckCircle" size={16} className="mr-2" />
            Завершенные ({completedCount})
          </Button>
        </div>
      </div>

      {filteredDeals.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
              <Icon name="Briefcase" size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Нет сделок</h3>
            <p className="text-muted-foreground">
              {deals.length === 0 
                ? 'Сделки из AmoCRM будут отображаться здесь'
                : `Нет ${filter === 'active' ? 'активных' : 'завершенных'} сделок`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDeals.map((deal) => {
            const rgb = hexToRgb(deal.status_color);
            const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
            const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
            const textColor = deal.status_color;

            return (
              <Card key={deal.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{deal.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div 
                          className="px-3 py-1 rounded-md text-sm font-medium border"
                          style={{ 
                            backgroundColor: bgColor,
                            borderColor: borderColor,
                            color: textColor
                          }}
                        >
                          {deal.status_name}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Icon name="GitBranch" size={12} className="mr-1" />
                          {deal.pipeline_name}
                        </Badge>
                        <Badge variant="outline" className="text-xs">ID: {deal.id}</Badge>
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Icon name="Calendar" size={12} />
                        Создана
                      </p>
                      <p className="font-medium text-sm">{deal.created_at}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Icon name="Clock" size={12} />
                        Обновлена
                      </p>
                      <p className="font-medium text-sm">{deal.updated_at}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Icon name="User" size={12} />
                        Ответственный
                      </p>
                      <p className="font-medium text-sm">ID: {deal.responsible_user_id}</p>
                    </div>
                  </div>

                  {deal.custom_fields && deal.custom_fields.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Icon name="Tags" size={12} />
                        Дополнительные поля:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {deal.custom_fields.map((field, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded">
                            <Icon name="Tag" size={14} className="text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">{field.field_name}:</span>
                            <span className="font-medium truncate">
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DealsTab;