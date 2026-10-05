import { apiFetch } from "../../../helpers/apiHelper";

const lostFoundApi = {
  /** filter: { status: "lost"|"found", is_completed: 1|0, is_me: 1 } */
  getLostFounds(filter = {}) {
    return apiFetch("/lost-founds", { params: filter });
  },

  getLostFound(id) {
    return apiFetch(`/lost-founds/${id}`);
  },

  postLostFound({ title, description, status }) {
    return apiFetch("/lost-founds", {
      method: "POST",
      body: { title, description, status },
    });
  },

  putLostFound(id, { title, description, status, isCompleted }) {
    return apiFetch(`/lost-founds/${id}`, {
      method: "PUT",
      body: {
        title,
        description,
        status,
        is_completed: isCompleted ? 1 : 0,
      },
    });
  },

  postLostFoundCover(id, file) {
    const formData = new FormData();
    formData.append("cover", file);
    return apiFetch(`/lost-founds/${id}/cover`, { method: "POST", formData });
  },

  deleteLostFound(id) {
    return apiFetch(`/lost-founds/${id}`, { method: "DELETE" });
  },

  getStatsDaily() {
    return apiFetch("/lost-founds/stats/daily");
  },

  getStatsMonthly() {
    return apiFetch("/lost-founds/stats/monthly");
  },
};

export default lostFoundApi;
