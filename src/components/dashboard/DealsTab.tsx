import { Deal } from './types';
import NewApplicationDialog from './deals/NewApplicationDialog';
import ApprovedDealCard from './deals/ApprovedDealCard';
import RejectedDealCard from './deals/RejectedDealCard';
import RegularDealCard from './deals/RegularDealCard';
import EmptyDealsCard from './deals/EmptyDealsCard';

interface DealsTabProps {
  deals: Deal[];
  clientPhone: string;
  onApplicationSubmit: () => void;
}

const DealsTab = ({ deals, clientPhone, onApplicationSubmit }: DealsTabProps) => {
  const hasRejectedDeal = deals.some(deal => deal.status_name === 'Заявка отклонена');
  const hasApprovedDeal = deals.some(deal => deal.status_name === 'Заявка одобрена');
  const canSubmitNewApplication = !hasRejectedDeal && !hasApprovedDeal;

  const getStatusPriority = (statusName: string): number => {
    if (statusName === 'Заявка одобрена') return 1;
    if (statusName === 'Заявка на рассмотрение') return 2;
    if (statusName === 'Заявка отклонена') return 4;
    return 3;
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

      {filteredDeals.length === 0 ? (
        <EmptyDealsCard totalDeals={deals.length} />
      ) : (
        <div className="grid gap-6">
          {filteredDeals.map((deal, index) => {
            const isRejected = deal.status_name === 'Заявка отклонена';
            const isApproved = deal.status_name === 'Заявка одобрена';
            const prevDeal = index > 0 ? filteredDeals[index - 1] : null;
            const prevRejected = prevDeal ? prevDeal.status_name === 'Заявка отклонена' : false;
            const showDivider = isRejected && !prevRejected;

            return (
              <div key={deal.id}>
                {showDivider && (
                  <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="text-sm font-medium text-muted-foreground px-3">
                      Отклонённые заявки
                    </span>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                )}
                
                {isApproved ? (
                  <ApprovedDealCard deal={deal} />
                ) : isRejected ? (
                  <RejectedDealCard deal={deal} />
                ) : (
                  <RegularDealCard deal={deal} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DealsTab;