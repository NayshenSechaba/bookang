
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ManageBooking from "./pages/ManageBooking";
import BusinessProfile from "./components/BusinessProfile";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ClientDetail from "./pages/ClientDetail";
import AmendmentApproval from "./pages/AmendmentApproval";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/business-profile" element={<BusinessProfile />} />
          <Route path="/booking/manage/:token" element={<ManageBooking />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/client/:clientId" element={<ClientDetail />} />
          <Route path="/employee/amendments" element={<AmendmentApproval />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
