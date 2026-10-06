import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthLayout from "./features/auth/layouts/AuthLayout";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import { getAccessToken } from "./helpers/apiHelper";

// Halaman dashboard dimuat lazy: pengunjung yang belum login (halaman login)
// tidak perlu mengunduh JavaScript dashboard (Reduce unused JavaScript).
const LostFoundLayout = lazy(() =>
  import("./features/lost-founds/layouts/LostFoundLayout")
);
const HomePage = lazy(() => import("./features/lost-founds/pages/HomePage"));
const DetailPage = lazy(() => import("./features/lost-founds/pages/DetailPage"));
const UsersPage = lazy(() => import("./features/users/pages/UsersPage"));
const ProfilePage = lazy(() => import("./features/users/pages/ProfilePage"));

const fallback = (
  <p className="p-4 text-slate-600" role="status">
    Memuat halaman...
  </p>
);

// Penjaga ringan (eager): tanpa token langsung ke login tanpa memuat chunk dashboard.
function Dashboard() {
  // dipantau agar rute dirender ulang setelah logout menghapus token
  useSelector((state) => state.isAuthLogout);

  if (!getAccessToken()) {
    return <Navigate to="/auth/login" replace />;
  }

  return <LostFoundLayout />;
}

function App() {
  return (
    <Suspense fallback={fallback}>
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route path="/" element={<Dashboard />}>
          <Route index element={<HomePage />} />
          <Route path="lost-founds/:id" element={<DetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
