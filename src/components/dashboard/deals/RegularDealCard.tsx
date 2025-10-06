import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Deal } from '../types';
import ReviewTimer from './ReviewTimer';

interface RegularDealCardProps {
  deal: Deal;
}

const RegularDealCard = ({ deal }: RegularDealCardProps) => {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 204, g: 204, b: 204 };
  };

  const rgb = hexToRgb(deal.status_color);
  const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
  const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
  const textColor = deal.status_color;

  return (
    <Card className="border-border/30 bg-card/80 backdrop-blur-md hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 shadow-sm">
                <Icon name="FileText" size={22} className="text-primary" />
              </div>
              <Badge variant="outline" className="text-xs font-mono px-2.5">#{deal.id}</Badge>
            </div>
            <CardTitle className="text-lg sm:text-xl mb-3 break-words">{deal.name}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div 
                className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border-2 shadow-sm"
                style={{ 
                  backgroundColor: bgColor,
                  borderColor: borderColor,
                  color: textColor
                }}
              >
                {deal.status_name}
              </div>
              <Badge variant="secondary" className="text-xs px-2.5 sm:px-3">
                <Icon name="GitBranch" size={12} className="mr-1.5" />
                {deal.pipeline_name}
              </Badge>
            </div>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <p className="text-xs text-muted-foreground mb-1">Сумма</p>
            <p className="text-2xl sm:text-3xl font-bold font-montserrat bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {(deal.price || 0).toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative pt-0">
        {deal.status_name === 'Заявка на рассмотрение' && (
          <ReviewTimer 
            dealId={deal.id} 
            amount={deal.price}
            createdAt={deal.created_at}
          />
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/20 rounded-xl">
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
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
              {deal.custom_fields.map((field, idx) => (
                <div key={idx} className="flex items-start gap-2.5 sm:gap-3 p-3 bg-muted/30 rounded-xl border border-border/30">
                  <Icon name="ChevronRight" size={16} className="text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">{field.field_name}</p>
                    <p className="font-medium text-sm break-words">
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
};

export default RegularDealCard;