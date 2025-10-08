import { useState } from 'react';
import { Deal } from './types';
import NewApplicationDialog from './deals/NewApplicationDialog';
import ApprovedDealCard from './deals/ApprovedDealCard';
import RejectedDealCard from './deals/RejectedDealCard';
import RegularDealCard from './deals/RegularDealCard';
import EmptyDealsCard from './deals/EmptyDealsCard';
import OverdueDealCard from './deals/OverdueDealCard';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface DealsTabProps {
  deals: Deal[];
  clientPhone: string;
  onApplicationSubmit: () => void;
}

const DealsTab = ({ deals, clientPhone, onApplicationSubmit }: DealsTabProps) => {
  const [showRejected, setShowRejected] = useState(false);
  const [showApproved, setShowApproved] = useState(true);
  const [showOverdue, setShowOverdue] = useState(true);
  
  const isRejectedStatus = (statusName: string) => 
    statusName.toLowerCase().includes('отклонена');
  
  const isApprovedStatus = (statusName: string) => 
    statusName.toLowerCase().includes('одобрена');
  
  const isOverdueStatus = (statusName: string) => {
    const lowerStatus = statusName.toLowerCase();
    return lowerStatus.includes('просроч') || 
           lowerStatus.includes('займ просрочен');
  };
  
  const hasApprovedDeal = deals.some(deal => isApprovedStatus(deal.status_name));
  const canSubmitNewApplication = !hasApprovedDeal;

  const getStatusPriority = (statusName: string): number => {
    if (isOverdueStatus(statusName)) return 0;
    if (isApprovedStatus(statusName)) return 1;
    if (statusName === 'Заявка на согласование') return 2;
    if (statusName === 'Заявка на рассмотрение') return 3;
    if (statusName === 'Поступила заявка') return 4;
    if (isRejectedStatus(statusName)) return 99;
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

  const overdueDeals = filteredDeals.filter(deal => isOverdueStatus(deal.status_name));
  const approvedDeals = filteredDeals.filter(deal => isApprovedStatus(deal.status_name) && !isOverdueStatus(deal.status_name));
  const activeDeals = filteredDeals.filter(deal => 
    !isRejectedStatus(deal.status_name) && 
    !isApprovedStatus(deal.status_name) && 
    !isOverdueStatus(deal.status_name)
  );
  const rejectedDeals = filteredDeals.filter(deal => isRejectedStatus(deal.status_name));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-montserrat mb-2">Ваши заявки</h2>
            <div className="flex items-center gap-3 flex-wrap">
              {overdueDeals.length > 0 && (
                <div className="text-sm text-red-500 flex items-center gap-1.5 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Просрочка: {overdueDeals.length}
                </div>
              )}
              {approvedDeals.length > 0 && (
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  {overdueDeals.length > 0 && <span>·</span>}
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Одобренных: {approvedDeals.length}
                </div>
              )}
              {activeDeals.length > 0 && (
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  {(approvedDeals.length > 0 || overdueDeals.length > 0) && <span>·</span>}
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Активных: {activeDeals.length}
                </div>
              )}
              {rejectedDeals.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  · Отклонённых: {rejectedDeals.length}
                </div>
              )}
            </div>
          </div>
          
          {canSubmitNewApplication ? (
            <NewApplicationDialog 
              clientPhone={clientPhone}
              onApplicationSubmit={onApplicationSubmit}
              canSubmitNewApplication={canSubmitNewApplication}
            />
          ) : (
            <div className="flex flex-col items-end gap-2">
              <Button disabled className="bg-gradient-to-r from-primary to-secondary opacity-50 cursor-not-allowed">
                <Icon name="Lock" size={18} className="mr-2" />
                Подать заявку
              </Button>
              <p className="text-xs text-muted-foreground text-right max-w-xs">
                У вас уже есть одобренный займ. Погасите его, чтобы подать новую заявку.
              </p>
            </div>
          )}
        </div>
      </div>

      {activeDeals.length === 0 && rejectedDeals.length === 0 && approvedDeals.length === 0 && overdueDeals.length === 0 ? (
        <EmptyDealsCard totalDeals={deals.length} />
      ) : (
        <>
          {overdueDeals.length > 0 && (
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setShowOverdue(!showOverdue)}
                className="w-full mb-4 flex items-center justify-between gap-2 h-12 bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20 hover:text-red-700"
              >
                <div className="flex items-center gap-2">
                  <Icon name="AlertCircle" size={18} className="text-red-500" />
                  <span className="font-semibold">🚨 Просрочка ({overdueDeals.length})</span>
                </div>
                <Icon 
                  name={showOverdue ? "ChevronUp" : "ChevronDown"} 
                  size={18} 
                />
              </Button>

              {showOverdue && (
                <div className="grid gap-6 animate-fade-in">
                  {overdueDeals.map((deal) => (
                    <OverdueDealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              )}
            </div>
          )}

          {approvedDeals.length > 0 && (
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setShowApproved(!showApproved)}
                className="w-full mb-4 flex items-center justify-between gap-2 h-12 text-muted-foreground hover:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={18} className="text-green-500" />
                  <span>Одобренные заявки ({approvedDeals.length})</span>
                </div>
                <Icon 
                  name={showApproved ? "ChevronUp" : "ChevronDown"} 
                  size={18} 
                />
              </Button>

              {showApproved && (
                <div className="grid gap-6 animate-fade-in">
                  {approvedDeals.map((deal) => (
                    <ApprovedDealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              )}
            </div>
          )}

          {rejectedDeals.length > 0 && (
            <div className="mb-6">
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

          {activeDeals.length > 0 && (
            <div className="grid gap-6">
              {activeDeals.map((deal) => (
                <RegularDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DealsTab;