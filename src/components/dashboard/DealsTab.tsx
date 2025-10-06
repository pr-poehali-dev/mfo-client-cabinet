import { useState } from 'react';
import { Deal } from './types';
import NewApplicationDialog from './deals/NewApplicationDialog';
import ApprovedDealCard from './deals/ApprovedDealCard';
import RejectedDealCard from './deals/RejectedDealCard';
import RegularDealCard from './deals/RegularDealCard';
import EmptyDealsCard from './deals/EmptyDealsCard';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface DealsTabProps {
  deals: Deal[];
  clientPhone: string;
  onApplicationSubmit: () => void;
}

const DealsTab = ({ deals, clientPhone, onApplicationSubmit }: DealsTabProps) => {
  const [showRejected, setShowRejected] = useState(false);
  
  const hasRejectedDeal = deals.some(deal => deal.status_name === 'Заявка отклонена');
  const hasApprovedDeal = deals.some(deal => deal.status_name === 'Заявка одобрена');
  const canSubmitNewApplication = !hasRejectedDeal && !hasApprovedDeal;

  const getStatusPriority = (statusName: string): number => {
    if (statusName === 'Заявка одобрена') return 1;
    if (statusName === 'Заявка на согласование') return 2;
    if (statusName === 'Заявка на рассмотрение') return 3;
    if (statusName === 'Поступила заявка') return 4;
    if (statusName === 'Заявка отклонена') return 99;
    return 5;
  };

  const sortedDeals = [...deals].sort((a, b) => {
    const aPriority = getStatusPriority(a.status_name);
    const bPriority = getStatusPriority(b.status_name);
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    const aDate = new Date(a.created_at.split('.').reverse().join('-'));
    const bDate = new Date(b.created_at.split('.').reverse().join('-'));
    return bDate.getTime() - aDate.getTime();
  });
  
  const filteredDeals = sortedDeals;

  const activeDeals = filteredDeals.filter(deal => deal.status_name !== 'Заявка отклонена');
  const rejectedDeals = filteredDeals.filter(deal => deal.status_name === 'Заявка отклонена');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-montserrat mb-2">Ваши заявки</h2>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Активных: {activeDeals.length}
              </div>
              {rejectedDeals.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  · Отклонённых: {rejectedDeals.length}
                </div>
              )}
            </div>
          </div>
          
          <NewApplicationDialog 
            clientPhone={clientPhone}
            onApplicationSubmit={onApplicationSubmit}
            canSubmitNewApplication={canSubmitNewApplication}
          />
        </div>
      </div>

      {activeDeals.length === 0 && rejectedDeals.length === 0 ? (
        <EmptyDealsCard totalDeals={deals.length} />
      ) : (
        <>
          <div className="grid gap-6">
            {activeDeals.map((deal) => {
              const isApproved = deal.status_name === 'Заявка одобрена';
              
              return (
                <div key={deal.id}>
                  {isApproved ? (
                    <ApprovedDealCard deal={deal} />
                  ) : (
                    <RegularDealCard deal={deal} />
                  )}
                </div>
              );
            })}
          </div>

          {rejectedDeals.length > 0 && (
            <div className="mt-8">
              <Button
                variant="outline"
                onClick={() => setShowRejected(!showRejected)}
                className="w-full mb-4 flex items-center justify-between gap-2 h-12 text-muted-foreground hover:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <Icon name="XCircle" size={18} className="text-red-500" />
                  <span>Отклонённые заявки ({rejectedDeals.length})</span>
                </div>
                <Icon 
                  name={showRejected ? "ChevronUp" : "ChevronDown"} 
                  size={18} 
                />
              </Button>

              {showRejected && (
                <div className="grid gap-6 animate-fade-in">
                  {rejectedDeals.map((deal) => (
                    <RejectedDealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DealsTab;