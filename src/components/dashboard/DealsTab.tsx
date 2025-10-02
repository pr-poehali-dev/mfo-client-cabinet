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
        <h2 className="text-2xl font-bold font-montserrat mb-4">Ваши заявки</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            <Icon name="FileText" size={16} className="mr-2" />
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
              <Icon name="FileText" size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Нет заявок</h3>
            <p className="text-muted-foreground">
              {deals.length === 0 
                ? 'Ваши заявки будут отображаться здесь'
                : `Нет ${filter === 'active' ? 'активных' : 'завершенных'} заявок`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredDeals.map((deal) => {
            const rgb = hexToRgb(deal.status_color);
            const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
            const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
            const textColor = deal.status_color;

            return (
              <Card key={deal.id} className="border-border/30 bg-card/80 backdrop-blur-md hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                          <Icon name="FileText" size={20} className="text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">#{deal.id}</Badge>
                      </div>
                      <CardTitle className="text-xl mb-3 truncate">{deal.name}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div 
                          className="px-4 py-1.5 rounded-full text-sm font-semibold border-2 shadow-sm"
                          style={{ 
                            backgroundColor: bgColor,
                            borderColor: borderColor,
                            color: textColor
                          }}
                        >
                          {deal.status_name}
                        </div>
                        <Badge variant="secondary" className="text-xs px-3">
                          <Icon name="GitBranch" size={12} className="mr-1.5" />
                          {deal.pipeline_name}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground mb-1">Сумма</p>
                      <p className="text-3xl font-bold font-montserrat bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {deal.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative pt-0">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Icon name="Calendar" size={14} />
                        Создана
                      </p>
                      <p className="font-semibold text-sm">{deal.created_at}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Icon name="Clock" size={14} />
                        Обновлена
                      </p>
                      <p className="font-semibold text-sm">{deal.updated_at}</p>
                    </div>
                  </div>

                  {deal.custom_fields && deal.custom_fields.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Icon name="Info" size={16} className="text-primary" />
                        Детали заявки
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {deal.custom_fields.map((field, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                            <Icon name="ChevronRight" size={16} className="text-primary mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground mb-0.5">{field.field_name}</p>
                              <p className="font-medium text-sm truncate">
                                {field.values && field.values.length > 0 
                                  ? String(field.values[0].value) 
                                  : '-'}
                              </p>
                            </div>
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