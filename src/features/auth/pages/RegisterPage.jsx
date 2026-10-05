import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import useInput from "../../../hooks/useInput";
import { asyncSetIsAuthRegister } from "../states/action";
import { showWarningDialog } from "../../../helpers/toolsHelper";

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, onNameChange] = useInput("");
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      showWarningDialog("Nama, email, dan kata sandi wajib diisi.");
      return;
    }
    if (password.length < 6) {
      showWarningDialog("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const ok = await dispatch(
      asyncSetIsAuthRegister({ name, email, password })
    );
    setLoading(false);

    if (ok) {
      navigate("/auth/login");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Daftar</h1>
        <p className="text-sm text-slate-600">Buat akun baru Anda.</p>
      </div>
      <div>
        <label htmlFor="register-name-input" className="mb-1 block text-sm font-medium">
          Nama
        </label>
        <input
          id="register-name-input"
          type="text"
          value={name}
          onChange={onNameChange}
          placeholder="Nama lengkap"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="register-email-input" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="register-email-input"
          type="email"
          value={email}
          onChange={onEmailChange}
          placeholder="nama@email.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="register-password-input" className="mb-1 block text-sm font-medium">
          Kata Sandi
        </label>
        <input
          id="register-password-input"
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder="Minimal 6 karakter"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
        />
      </div>
      <button
        id="register-submit-button"
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Daftar"}
      </button>
      <p className="text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link to="/auth/login" className="font-semibold text-indigo-600">
          Masuk
        </Link>
      </p>
    </form>
  );
}

export default RegisterPage;
