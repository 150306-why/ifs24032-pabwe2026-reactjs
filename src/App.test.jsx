import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

vi.mock("./features/users/api/userApi", () => ({
  default: { getMe: vi.fn(), getUsers: vi.fn() },
}));
vi.mock("./features/lost-founds/api/lostFoundApi", () => ({
  default: { getLostFounds: vi.fn(), getLostFound: vi.fn() },
}));
vi.mock("./helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
  formatDate: (v) => `tgl:${v}`,
}));

import userApi from "./features/users/api/userApi";
import lostFoundApi from "./features/lost-founds/api/lostFoundApi";
import { putAccessToken } from "./helpers/apiHelper";
import { renderWithProviders } from "./test-utils";
import App from "./App";

describe("App routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    userApi.getMe.mockResolvedValue({
      success: true,
      data: { user: { id: 1, name: "Ani", email: "a@b.c", photo: null } },
    });
    userApi.getUsers.mockResolvedValue({ success: true, data: { users: [] } });
    lostFoundApi.getLostFounds.mockResolvedValue({
      success: true,
      data: { lost_founds: [] },
    });
    lostFoundApi.getLostFound.mockResolvedValue({
      success: true,
      data: {
        lost_found: {
          id: 9, title: "Tas", description: "Ransel", status: "lost",
          is_completed: 0, cover: null, user: { name: "Ani" }, created_at: "x",
        },
      },
    });
  });

  it("/auth mengarah ke halaman login", () => {
    renderWithProviders(<App />, { route: "/auth" });
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });

  it("/auth/register menampilkan registrasi", () => {
    renderWithProviders(<App />, { route: "/auth/register" });
    expect(screen.getByRole("heading", { name: "Daftar" })).toBeInTheDocument();
  });

  it("tanpa token rute dashboard mengalihkan ke login", async () => {
    renderWithProviders(<App />, { route: "/users" });
    expect(await screen.findByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });

  it("dengan token: beranda", async () => {
    putAccessToken("tok");
    renderWithProviders(<App />, { route: "/" });
    expect(await screen.findByText("Laporan Lost & Founds")).toBeInTheDocument();
  });

  it("dengan token: detail laporan", async () => {
    putAccessToken("tok");
    renderWithProviders(<App />, { route: "/lost-founds/9" });
    expect(await screen.findByRole("heading", { name: "Tas" })).toBeInTheDocument();
  });

  it("dengan token: daftar pengguna", async () => {
    putAccessToken("tok");
    renderWithProviders(<App />, { route: "/users" });
    expect(await screen.findByText("Daftar Pengguna")).toBeInTheDocument();
  });

  it("dengan token: profil", async () => {
    putAccessToken("tok");
    renderWithProviders(<App />, { route: "/profile" });
    expect(await screen.findByText("Informasi Profil")).toBeInTheDocument();
  });

  it("rute tidak dikenal diarahkan ke beranda", async () => {
    putAccessToken("tok");
    renderWithProviders(<App />, { route: "/tidak-ada" });
    expect(await screen.findByText("Laporan Lost & Founds")).toBeInTheDocument();
  });
});
