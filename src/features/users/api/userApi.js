import { apiFetch } from "../../../helpers/apiHelper";

const userApi = {
  getUsers() {
    return apiFetch("/users");
  },

  getMe() {
    return apiFetch("/users/me");
  },

  putMe({ name, email }) {
    return apiFetch("/users/me", {
      method: "PUT",
      body: { name, email },
    });
  },

  postMePhoto(file) {
    const formData = new FormData();
    formData.append("photo", file);
    return apiFetch("/users/me/photo", { method: "POST", formData });
  },

  putMePassword({ password, newPassword }) {
    return apiFetch("/users/me/password", {
      method: "PUT",
      body: { password, new_password: newPassword },
    });
  },
};

export default userApi;
