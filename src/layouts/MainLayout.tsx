import { Outlet } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";

const MainLayout = () => (
  <div className="min-h-screen bg-paper">
    <Navbar />
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <Outlet />
    </main>
  </div>
);

export default MainLayout;
