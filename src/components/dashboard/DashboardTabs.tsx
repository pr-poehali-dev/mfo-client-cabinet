import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import DealsTab from './DealsTab';
import SupportTab from './SupportTab';
import ProfileTab from './ProfileTab';
import { Deal } from './types';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadMessagesCount: number;
  deals: Deal[];
  clientPhone: string;
  contactId: string;
  clientName: string;
  clientFirstName: string;
  clientLastName: string;
  clientMiddleName: string;
  clientGender: 'male' | 'female';
  clientEmail: string;
  onApplicationSubmit: () => void;
  onMessagesUpdate: (count: number) => void;
}

const DashboardTabs = ({
  activeTab,
  onTabChange,
  unreadMessagesCount,
  deals,
  clientPhone,
  contactId,
  clientName,
  clientFirstName,
  clientLastName,
  clientMiddleName,
  clientGender,
  clientEmail,
  onApplicationSubmit,
  onMessagesUpdate
}: DashboardTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 bg-card/50 backdrop-blur-sm p-1 h-auto rounded-xl">
        <TabsTrigger value="applications" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3 rounded-lg">
          <Icon name="FileText" size={18} />
          <span className="hidden sm:inline">Заявки</span>
        </TabsTrigger>
        <TabsTrigger value="support" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3 rounded-lg relative">
          <Icon name="MessageCircle" size={18} />
          <span className="hidden sm:inline">Поддержка</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
              {unreadMessagesCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3 rounded-lg">
          <Icon name="User" size={18} />
          <span className="hidden sm:inline">Профиль</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="applications">
        <DealsTab 
          deals={deals} 
          clientPhone={clientPhone}
          onApplicationSubmit={onApplicationSubmit}
        />
      </TabsContent>

      <TabsContent value="support">
        <SupportTab 
          clientPhone={clientPhone}
          contactId={contactId}
          onMessagesUpdate={onMessagesUpdate}
        />
      </TabsContent>

      <TabsContent value="profile">
        <ProfileTab 
          clientName={clientName}
          clientFirstName={clientFirstName}
          clientLastName={clientLastName}
          clientMiddleName={clientMiddleName}
          clientGender={clientGender}
          clientPhone={clientPhone}
          clientEmail={clientEmail}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
