import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/stores/auth.store";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyOtp from "@/pages/auth/VerifyOtp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

import Dashboard from "@/pages/app/Dashboard";
import Bills from "@/pages/app/Bills";
import CreateBill from "@/pages/app/CreateBill";
import EditBill from "@/pages/app/EditBill";
import BillDetails from "@/pages/app/BillDetails";
import Customers from "@/pages/app/Customers";
import CustomerDetails from "@/pages/app/CustomerDetails";
import Analytics from "@/pages/app/Analytics";
import Settings from "@/pages/app/Settings";
import NotFound from "@/pages/NotFound";
import { Calendar } from "./components/ui/calendar";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/app/dashboard" replace />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token?" element={<ResetPassword />} />

            <Route path="/app" element={ <ProtectedRoute> <AppShell /> </ProtectedRoute> }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="bills" element={<Bills />} />
              <Route path="bills/new" element={<CreateBill />} />
              <Route path="bills/:id" element={<BillDetails />} />
              <Route path="bills/:id/edit" element={<EditBill />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerDetails />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
