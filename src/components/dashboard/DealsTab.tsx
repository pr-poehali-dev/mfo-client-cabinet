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

  const nonRejectedDeals = deals.filter(deal => deal.status_name !== 'Заявка отклонена');
  const hasOtherDeals = nonRejectedDeals.length > 0;
  
  const filteredDeals = hasOtherDeals 
    ? nonRejectedDeals 
    : deals;

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
          {filteredDeals.map((deal) => {
            const isRejected = deal.status_name === 'Заявка отклонена';
            const isApproved = deal.status_name === 'Заявка одобрена';

            if (isApproved) {
              return <ApprovedDealCard key={deal.id} deal={deal} />;
            }

            if (isRejected) {
              return <RejectedDealCard key={deal.id} deal={deal} />;
            }

            return <RegularDealCard key={deal.id} deal={deal} />;
          })}
        </div>
      )}
    </div>
  );
};

export default DealsTab;