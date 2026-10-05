import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import useInput from "../../../hooks/useInput";
import { asyncSetIsAuthLogin } from "../states/action";
import { showWarningDialog } from "../../../helpers/toolsHelper";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      showWarningDialog("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    const ok = await dispatch(asyncSetIsAuthLogin({ email, password }));
    setLoading(false);

    if (ok) {
      navigate("/");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Masuk</h2>
        <p className="text-sm text-slate-500">
          Silakan masuk untuk melanjutkan.
        </p>
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={onEmailChange}
          placeholder="nama@email.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Kata Sandi
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder="••••••••"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>
      <p className="text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link to="/auth/register" className="font-semibold text-indigo-600">
          Daftar
        </Link>
      </p>
    </form>
  );
}

export default LoginPage;
