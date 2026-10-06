// Dijalankan HANYA saat build (lihat vite.config.js -> prerenderLoginShellPlugin).
// Merender halaman login yang sama persis dengan yang dirender React di browser,
// lalu hasilnya disisipkan ke index.html sebagai "shell" statis.
import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import store from "../src/store";
import AuthLayout from "../src/features/auth/layouts/AuthLayout";
import LoginPage from "../src/features/auth/pages/LoginPage";

export function renderLoginShell() {
  return renderToString(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/auth/login"]}>
        <Routes>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}
