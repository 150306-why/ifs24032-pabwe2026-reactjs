import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../helpers/apiHelper", () => ({
  apiFetch: vi.fn().mockResolvedValue({ success: true }),
}));

import { apiFetch } from "../../../helpers/apiHelper";
import lostFoundApi from "./lostFoundApi";

describe("lostFoundApi", () => {
  beforeEach(() => apiFetch.mockClear());

  it("getLostFounds tanpa filter", async () => {
    await lostFoundApi.getLostFounds();
    expect(apiFetch).toHaveBeenCalledWith("/lost-founds", { params: {} });
  });

  it("getLostFounds dengan filter", async () => {
    await lostFoundApi.getLostFounds({ status: "lost", is_completed: 1, is_me: 1 });
    expect(apiFetch).toHaveBeenCalledWith("/lost-founds", {
      params: { status: "lost", is_completed: 1, is_me: 1 },
    });
  });

  it("getLostFound", async () => {
    await lostFoundApi.getLostFound(5);
    expect(apiFetch).toHaveBeenCalledWith("/lost-founds/5");
  });

  it("postLostFound", async () => {
    await lostFoundApi.postLostFound({ title: "t", description: "d", status: "lost" });
    expect(apiFetch).toHaveBeenCalledWith("/lost-founds", {
      method: "POST",
      body: { title: "t", description: "d", status: "lost" },
    });
  });

  it("putLostFound (selesai & belum)", async () => {
    await lostFoundApi.putLostFound(1, {
      title: "t", description: "d", status: "found", isCompleted: true,
    });
    expect(apiFetch).toHaveBeenLastCalledWith("/lost-founds/1", {
      method: "PUT",
      body: { title: "t", description: "d", status: "found", is_completed: 1 },
    });
    await lostFoundApi.putLostFound(1, {
      title: "t", description: "d", status: "found", isCompleted: false,
    });
    expect(apiFetch.mock.lastCall[1].body.is_completed).toBe(0);
  });

  it("postLostFoundCover", async () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    await lostFoundApi.postLostFoundCover(3, file);
    const [path, options] = apiFetch.mock.calls[0];
    expect(path).toBe("/lost-founds/3/cover");
    expect(options.formData.get("cover")).toBe(file);
  });

  it("deleteLostFound", async () => {
    await lostFoundApi.deleteLostFound(9);
    expect(apiFetch).toHaveBeenCalledWith("/lost-founds/9", { method: "DELETE" });
  });

  it("stats harian & bulanan", async () => {
    await lostFoundApi.getStatsDaily();
    expect(apiFetch).toHaveBeenLastCalledWith("/lost-founds/stats/daily");
    await lostFoundApi.getStatsMonthly();
    expect(apiFetch).toHaveBeenLastCalledWith("/lost-founds/stats/monthly");
  });
});
