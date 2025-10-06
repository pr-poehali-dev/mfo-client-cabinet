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

  const sortedDeals = [...deals].sort((a, b) => {
    const aRejected = a.status_name === 'Заявка отклонена';
    const bRejected = b.status_name === 'Заявка отклонена';
    
    if (aRejected && !bRejected) return 1;
    if (!aRejected && bRejected) return -1;
    
    const aDate = new Date(a.created_at.split('.').reverse().join('-'));
    const bDate = new Date(b.created_at.split('.').reverse().join('-'));
    return bDate.getTime() - aDate.getTime();
  });
  
  const filteredDeals = sortedDeals;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold font-montserrat">Ваши заявки</h2>
          
          <NewApplicationDialog 
            clientPhone={clientPhone}
            onApplicationSubmit={onApplicationSubmit}
            canSubmitNewApplication={canSubmitNewApplication}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Всего заявок: {filteredDeals.length}
          </div>
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