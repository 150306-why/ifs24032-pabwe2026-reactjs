import { apiFetch } from "../../../helpers/apiHelper";

const authApi = {
  postLogin({ email, password }) {
    return apiFetch("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
  },

  postRegister({ name, email, password }) {
    return apiFetch("/auth/register", {
      method: "POST",
      auth: false,
      body: { name, email, password },
    });
  },
};

export default authApi;
