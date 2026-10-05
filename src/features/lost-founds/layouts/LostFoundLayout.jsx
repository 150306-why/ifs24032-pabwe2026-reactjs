import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAccessToken } from "../../../helpers/apiHelper";
import { asyncSetProfile } from "../../users/states/action";
import { asyncSetIsAuthLogout } from "../../auth/states/action";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

function LostFoundLayout() {
  const dispatch = useDispatch();
  const isProfile = useSelector((state) => state.isProfile);
  // dipantau agar layout dirender ulang setelah logout menghapus token
  useSelector((state) => state.isAuthLogout);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = getAccessToken();

  useEffect(() => {
    if (!token) return;
    dispatch(asyncSetProfile()).then((ok) => {
      if (!ok) {
        dispatch(asyncSetIsAuthLogout());
      }
    });
  }, [dispatch, token]);

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!isProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-600">
        Memuat sesi...
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <NavbarComponent onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="flex">
        <SidebarComponent
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LostFoundLayout;
