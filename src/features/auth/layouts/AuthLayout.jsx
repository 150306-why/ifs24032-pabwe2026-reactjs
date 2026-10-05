import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { IconSearch } from "@tabler/icons-react";
import { getAccessToken } from "../../../helpers/apiHelper";

function AuthLayout() {
  const isAuthLogin = useSelector((state) => state.isAuthLogin);

  useEffect(() => {
    document.title = "Lost & Founds";
  }, []);

  if (getAccessToken() || isAuthLogin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div
        data-testid="auth-banner"
        className="hidden lg:flex flex-col justify-center gap-6 bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-white"
      >
        <IconSearch size={56} stroke={1.5} />
        <h1 className="text-4xl font-extrabold leading-tight">
          Lost &amp; Founds
        </h1>
        <p className="max-w-md text-indigo-100">
          Laporkan barang hilang atau temuan, dan bantu mempertemukan barang
          dengan pemiliknya.
        </p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
