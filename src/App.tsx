

// import { Routes, Route } from "react-router-dom";
// import MainLayout from "@/layouts/MainLayout";
// import ProtectedRoute from "@/routes/ProtectedRoute";
// import GuestRoute from "@/routes/GuestRoute";
// import RequireOpenShift from "@/routes/RequireOpenShift";

// import LoginPage from "@/pages/LoginPage";
// import OpenShiftPage from "@/pages/OpenShiftPage";
// import DashboardPage from "@/pages/DashboardPage";
// import StaffPage from "@/pages/StaffPage";
// import RolesPage from "@/pages/RolesPage";
// import DepartmentsPage from "@/pages/DepartmentsPage";
// import ServicesPage from "@/pages/ServicesPage";
// import SettingsPage from "@/pages/SettingsPage";
// import SuppliersPage from "@/pages/SuppliersPage";
// import ItemsPage from "@/pages/ItemsPage";
// import PurchaseInvoicesPage from "@/pages/PurchaseInvoicesPage";
// import PatientsPage from "@/pages/PatientsPage";
// import AppointmentsPage from "@/pages/AppointmentsPage";
// import ShiftsPage from "@/pages/ShiftsPage";
// import InvoicesPage from "@/pages/InvoicesPage";
// import ExpensesPage from "@/pages/ExpensesPage";
// import NotFoundPage from "@/pages/NotFoundPage";
// import ReceptionPage from "./pages/ReceptionPage";
// import InvoiceCreatePage from "./pages/InvoiceCreatePage";
// import FollowPage from "./pages/FollowUpsPage";
// import ContractsPage from "./pages/Contractspage";
// import PayrollsPage from "./pages/Payrollspage";
// import StaffContractsPage from "./pages/StaffContractsPage";
// import StaffContractFormPage from "./components/staff/StaffContractFormPage";
// import NotificationsPage from "./pages/NotificationsPage";
// import ReportsPage from "./pages/ReportsPage";
// import ReportDetailPage from "./pages/ReportDetailPage";
// import PatientProfilePage from "./components/patients/PatientProfilePage";
// import OffersPage from "./pages/OffersPage";
// import ReportsDashboardPage from "./pages/ReportsDashboardPage";

// function App() {
//   return (
//     <Routes>
//       <Route element={<GuestRoute />}>
//         <Route path="/login" element={<LoginPage />} />
//       </Route>

//       <Route element={<ProtectedRoute />}>
//         <Route path="/open-shift" element={<OpenShiftPage />} />

//         <Route element={<RequireOpenShift />}>
//           <Route element={<MainLayout />}>
//             <Route path="/" element={<ReportsDashboardPage />} />
//             {/* <Route path="/staff" element={<StaffPage />} /> */}
//             <Route path="/staff" element={<StaffContractsPage />} />
//             <Route path="/staff/new" element={<StaffContractFormPage />} />
//             <Route path="/offers" element={<OffersPage />} />
//             <Route path="/staff/:id/edit" element={<StaffContractFormPage />} />
//             <Route path="/roles" element={<RolesPage />} />
//             <Route path="/notifications" element={<NotificationsPage />} />
//             <Route path="/reports" element={<ReportsPage />} />
//             <Route path="/reports/:key" element={<ReportDetailPage />} />
//             <Route path="/reception" element={<ReceptionPage />} />
//             <Route path="/invoices/new" element={<InvoiceCreatePage />} />
//             <Route path="/departments" element={<DepartmentsPage />} />
//             <Route path="/services" element={<ServicesPage />} />
//             <Route path="/settings" element={<SettingsPage />} />
//             <Route path="/suppliers" element={<SuppliersPage />} />
//             <Route path="/items" element={<ItemsPage />} />
//             <Route path="/purchase-invoices" element={<PurchaseInvoicesPage />} />
//             <Route path="/patients" element={<PatientsPage />} />
//             <Route path="/patients/:id" element={<PatientProfilePage />} />
//             <Route path="/appointments" element={<AppointmentsPage />} />
//             <Route path="/shifts" element={<ShiftsPage />} />
//             <Route path="/follow-ups" element={<FollowPage />} />
//             <Route path="/invoices" element={<InvoicesPage />} />
//             <Route path="/expenses" element={<ExpensesPage />} />
//             <Route path="/contracts" element={<ContractsPage />} />
//             <Route path="/payrolls" element={<PayrollsPage />} />
//           </Route>
//         </Route>
//       </Route>

//       <Route path="*" element={<NotFoundPage />} />
//     </Routes>
//   );
// }

// export default App;


import type { ReactElement } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute";
import RequireOpenShift from "@/routes/RequireOpenShift";
import PermissionRoute from "@/routes/PermissionRoute";

import LoginPage from "@/pages/LoginPage";
import OpenShiftPage from "@/pages/OpenShiftPage";
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
import ExpensesPage from "@/pages/ExpensesPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ReceptionPage from "./pages/ReceptionPage";
import InvoiceCreatePage from "./pages/InvoiceCreatePage";
import FollowPage from "./pages/FollowUpsPage";
import ContractsPage from "./pages/Contractspage";
import PayrollsPage from "./pages/Payrollspage";
import StaffContractsPage from "./pages/StaffContractsPage";
import StaffContractFormPage from "./components/staff/StaffContractFormPage";
import NotificationsPage from "./pages/NotificationsPage";
import ReportsPage from "./pages/ReportsPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import PatientProfilePage from "./components/patients/PatientProfilePage";
import OffersPage from "./pages/OffersPage";
import ReportsDashboardPage from "./pages/ReportsDashboardPage";

// دالة صغيرة تلف الصفحة بالصلاحية المطلوبة
const guard = (permission: string, page: ReactElement) => (
  <PermissionRoute permission={permission}>{page}</PermissionRoute>
);

function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/open-shift" element={<OpenShiftPage />} />

        <Route element={<RequireOpenShift />}>
          <Route element={<MainLayout />}>
            {/* صفحات مفتوحة للكل */}
            <Route path="/" element={<ReportsDashboardPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* الموظفين */}
            <Route path="/staff" element={guard("read staff", <StaffContractsPage />)} />
            <Route path="/staff/new" element={guard("create staff", <StaffContractFormPage />)} />
            <Route path="/staff/:id/edit" element={guard("update staff", <StaffContractFormPage />)} />
            <Route path="/contracts" element={guard("read staff_contracts", <ContractsPage />)} />
            <Route path="/payrolls" element={guard("read payrolls", <PayrollsPage />)} />

            {/* الإدارة */}
            <Route path="/roles" element={guard("read roles", <RolesPage />)} />
            <Route path="/departments" element={guard("read departments", <DepartmentsPage />)} />
            <Route path="/services" element={guard("read services", <ServicesPage />)} />
            <Route path="/settings" element={guard("read settings", <SettingsPage />)} />
            <Route path="/expenses" element={guard("read expenses", <ExpensesPage />)} />

            {/* التقارير */}
            <Route path="/reports" element={guard("read reports", <ReportsPage />)} />
            <Route path="/reports/:key" element={guard("read reports", <ReportDetailPage />)} />

            {/* العيادة */}
            <Route path="/reception" element={guard("read appointments", <ReceptionPage />)} />
            <Route path="/appointments" element={guard("read appointments", <AppointmentsPage />)} />
            <Route path="/patients" element={guard("read patients", <PatientsPage />)} />
            <Route path="/patients/:id" element={guard("show patients", <PatientProfilePage />)} />
            <Route path="/invoices" element={guard("read invoices", <InvoicesPage />)} />
            <Route path="/invoices/new" element={guard("create invoices", <InvoiceCreatePage />)} />
            <Route path="/follow-ups" element={guard("read follow_ups", <FollowPage />)} />
            <Route path="/shifts" element={guard("manage shifts", <ShiftsPage />)} />

            {/* المخازن والمشتريات */}
            <Route path="/suppliers" element={guard("read suppliers", <SuppliersPage />)} />
            <Route path="/items" element={guard("read items", <ItemsPage />)} />
            <Route path="/purchase-invoices" element={guard("read purchase_invoices", <PurchaseInvoicesPage />)} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;