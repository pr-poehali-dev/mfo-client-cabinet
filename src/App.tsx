
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AmoCRMAuth from "./pages/AmoCRMAuth";
import AmoCRMSetup from "./pages/AmoCRMSetup";
import CleanupDeals from "./pages/CleanupDeals";
import AdminCleanup from "./pages/AdminCleanup";
import ClientLogin from "./pages/ClientLogin";
import ClientCabinet from "./pages/ClientCabinet";
import DealsDistribution from "./pages/DealsDistribution";
import MegagroupLogin from "./pages/MegagroupLogin";
import MegagroupCabinet from "./pages/MegagroupCabinet";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/amocrm-setup" element={<AmoCRMSetup />} />
          <Route path="/amocrm-auth" element={<AmoCRMAuth />} />
          <Route path="/cleanup-deals" element={<CleanupDeals />} />
          <Route path="/admin-cleanup" element={<AdminCleanup />} />
          <Route path="/login" element={<ClientLogin />} />
          <Route path="/cabinet" element={<ClientCabinet />} />
          <Route path="/distribution" element={<DealsDistribution />} />
          <Route path="/megagroup-login" element={<MegagroupLogin />} />
          <Route path="/megagroup-cabinet" element={<MegagroupCabinet />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;