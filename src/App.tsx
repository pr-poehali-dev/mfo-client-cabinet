
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AmoCRMSetup from "./pages/AmoCRMSetup";
import TestAmoCRM from "./pages/TestAmoCRM";
import CleanupDeals from "./pages/CleanupDeals";
import SyncAmoCRM from "./pages/SyncAmoCRM";
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
          <Route path="/test-amocrm" element={<TestAmoCRM />} />
          <Route path="/cleanup-deals" element={<CleanupDeals />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;