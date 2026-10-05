import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

vi.mock("../api/authApi", () => ({
  default: { postLogin: vi.fn(), postRegister: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
}));

import authApi from "../api/authApi";
import { showErrorDialog, showWarningDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import LoginPage from "./LoginPage";

function ui() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<div>halaman register</div>} />
      <Route path="/" element={<div>beranda</div>} />
    </Routes>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("memvalidasi input kosong", async () => {
    renderWithProviders(ui(), { route: "/auth/login" });
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(showWarningDialog).toHaveBeenCalled();
    expect(authApi.postLogin).not.toHaveBeenCalled();
  });

  it("login berhasil lalu menuju beranda", async () => {
    authApi.postLogin.mockResolvedValue({ success: true, data: { token: "T" } });
    renderWithProviders(ui(), { route: "/auth/login" });
    await userEvent.type(screen.getByLabelText("Email"), "a@b.c");
    await userEvent.type(screen.getByLabelText("Kata Sandi"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(await screen.findByText("beranda")).toBeInTheDocument();
    expect(localStorage.getItem("accessToken")).toBe("T");
  });

  it("tetap di halaman login bila gagal", async () => {
    authApi.postLogin.mockResolvedValue({ success: false, message: "salah" });
    renderWithProviders(ui(), { route: "/auth/login" });
    await userEvent.type(screen.getByLabelText("Email"), "a@b.c");
    await userEvent.type(screen.getByLabelText("Kata Sandi"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("salah"));
    expect(screen.getByRole("button", { name: "Masuk" })).toBeEnabled();
  });

  it("tautan ke halaman register", async () => {
    renderWithProviders(ui(), { route: "/auth/login" });
    await userEvent.click(screen.getByRole("link", { name: "Daftar" }));
    expect(screen.getByText("halaman register")).toBeInTheDocument();
  });
});
