import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute";

import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import StaffPage from "@/pages/StaffPage";
import RolesPage from "@/pages/RolesPage";
import DepartmentsPage from "@/pages/DepartmentsPage";
import ServicesPage from "@/pages/ServicesPage";
import SettingsPage from "@/pages/SettingsPage";
import SuppliersPage from "@/pages/SuppliersPage";
import ItemsPage from "@/pages/ItemsPage";
import PurchaseInvoicesPage from "@/pages/PurchaseInvoicesPage";
import PatientsPage from "@/pages/PatientsPage";
import AppointmentsPage from "@/pages/AppointmentsPage";
import ShiftsPage from "@/pages/ShiftsPage";
import InvoicesPage from "@/pages/InvoicesPage";
import NotFoundPage from "@/pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/purchase-invoices" element={<PurchaseInvoicesPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/shifts" element={<ShiftsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
