import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BASE_URL,
  apiFetch,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, message: "ok", data: {} }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("menyimpan, mengambil, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("memakai BASE_URL dari DELCOM_BASEURL", () => {
    expect(typeof BASE_URL).toBe("string");
    expect(BASE_URL.length).toBeGreaterThan(0);
  });

  it("GET tanpa token dan tanpa params", async () => {
    const result = await apiFetch("/users");
    expect(result.success).toBe(true);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/users`);
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBeUndefined();
    expect(options.body).toBeUndefined();
  });

  it("menyertakan bearer token dan query params (kosong diabaikan)", async () => {
    putAccessToken("tok");
    await apiFetch("/lost-founds", {
      params: { status: "lost", is_completed: "", is_me: undefined, x: null, n: 0 },
    });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/lost-founds?status=lost&n=0`);
    expect(options.headers.Authorization).toBe("Bearer tok");
  });

  it("tidak menyertakan token bila auth=false", async () => {
    putAccessToken("tok");
    await apiFetch("/auth/login", { auth: false });
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("mengirim body urlencoded", async () => {
    await apiFetch("/auth/login", {
      method: "POST",
      body: { email: "a@b.c", password: "123" },
    });
    const options = fetch.mock.calls[0][1];
    expect(options.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded"
    );
    expect(options.body).toBe("email=a%40b.c&password=123");
  });

  it("mengirim FormData apa adanya", async () => {
    const formData = new FormData();
    formData.append("cover", "x");
    await apiFetch("/x", { method: "POST", formData });
    const options = fetch.mock.calls[0][1];
    expect(options.body).toBe(formData);
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("menentukan sukses dari success boolean, status string, atau HTTP ok", async () => {
    const reply = (body, ok) =>
      fetch.mockResolvedValueOnce({ ok, json: () => Promise.resolve(body) });

    reply({ success: false, message: "x" }, true);
    expect((await apiFetch("/a")).success).toBe(false);

    reply({ success: true }, false);
    expect((await apiFetch("/a")).success).toBe(true);

    reply({ status: "success", message: "ok" }, true);
    expect((await apiFetch("/a")).success).toBe(true);

    reply({ status: "FAIL", message: "x" }, true);
    expect((await apiFetch("/a")).success).toBe(false);

    reply({ message: "Berhasil melakukan pendaftaran" }, true);
    expect((await apiFetch("/a")).success).toBe(true);

    reply({ message: "Tidak ditemukan" }, false);
    expect((await apiFetch("/a")).success).toBe(false);
  });

  it("mengembalikan objek gagal saat fetch error", async () => {
    fetch.mockRejectedValueOnce(new Error("jaringan putus"));
    const result = await apiFetch("/users");
    expect(result).toEqual({
      success: false,
      message: "jaringan putus",
      data: null,
    });
  });
});
