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
import RegisterPage from "./RegisterPage";

function ui() {
  return (
    <Routes>
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/login" element={<div>halaman login</div>} />
    </Routes>
  );
}

async function fill(name, email, password) {
  if (name) await userEvent.type(screen.getByLabelText("Nama"), name);
  if (email) await userEvent.type(screen.getByLabelText("Email"), email);
  if (password) await userEvent.type(screen.getByLabelText("Kata Sandi"), password);
}

describe("RegisterPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("memvalidasi input kosong", async () => {
    renderWithProviders(ui(), { route: "/auth/register" });
    await userEvent.click(screen.getByRole("button", { name: "Daftar" }));
    expect(showWarningDialog).toHaveBeenCalledWith("Nama, email, dan kata sandi wajib diisi.");
  });

  it("memvalidasi panjang kata sandi", async () => {
    renderWithProviders(ui(), { route: "/auth/register" });
    await fill("Ani", "a@b.c", "123");
    await userEvent.click(screen.getByRole("button", { name: "Daftar" }));
    expect(showWarningDialog).toHaveBeenCalledWith("Kata sandi minimal 6 karakter.");
    expect(authApi.postRegister).not.toHaveBeenCalled();
  });

  it("registrasi berhasil lalu menuju login", async () => {
    authApi.postRegister.mockResolvedValue({ success: true, message: "ok" });
    renderWithProviders(ui(), { route: "/auth/register" });
    await fill("Ani", "a@b.c", "123456");
    await userEvent.click(screen.getByRole("button", { name: "Daftar" }));
    expect(await screen.findByText("halaman login")).toBeInTheDocument();
  });

  it("registrasi gagal", async () => {
    authApi.postRegister.mockResolvedValue({ success: false, message: "dup" });
    renderWithProviders(ui(), { route: "/auth/register" });
    await fill("Ani", "a@b.c", "123456");
    await userEvent.click(screen.getByRole("button", { name: "Daftar" }));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("dup"));
    expect(screen.getByRole("button", { name: "Daftar" })).toBeEnabled();
  });

  it("tautan ke halaman login", async () => {
    renderWithProviders(ui(), { route: "/auth/register" });
    await userEvent.click(screen.getByRole("link", { name: "Masuk" }));
    expect(screen.getByText("halaman login")).toBeInTheDocument();
  });
});
