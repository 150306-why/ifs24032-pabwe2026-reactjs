import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../api/userApi", () => ({
  default: {
    getMe: vi.fn(), putMe: vi.fn(), postMePhoto: vi.fn(), putMePassword: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
}));

import userApi from "../api/userApi";
import { showErrorDialog, showSuccessDialog, showWarningDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import ProfilePage from "./ProfilePage";

const profile = { id: 1, name: "Ani", email: "ani@x.id", photo: null };
const state = { preloadedState: { profile, isProfile: true } };

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userApi.getMe.mockResolvedValue({ success: true, data: { user: profile } });
  });

  it("menampilkan data profil dan inisial", () => {
    renderWithProviders(<ProfilePage />, state);
    expect(screen.getByLabelText("Nama")).toHaveValue("Ani");
    expect(screen.getByLabelText("Email")).toHaveValue("ani@x.id");
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("menampilkan foto bila ada", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: { profile: { ...profile, photo: "http://x/p.png" }, isProfile: true },
    });
    expect(screen.getByAltText("Foto profil")).toHaveAttribute("src", "http://x/p.png");
  });

  it("tanpa profil menampilkan placeholder", () => {
    renderWithProviders(<ProfilePage />);
    expect(screen.getByText("?")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toHaveValue("");
  });

  it("validasi ubah profil kosong", async () => {
    renderWithProviders(<ProfilePage />, state);
    await userEvent.clear(screen.getByLabelText("Nama"));
    await userEvent.click(screen.getByRole("button", { name: "Simpan Profil" }));
    expect(showWarningDialog).toHaveBeenCalledWith("Nama dan email wajib diisi.");
    expect(userApi.putMe).not.toHaveBeenCalled();
  });

  it("ubah profil berhasil", async () => {
    userApi.putMe.mockResolvedValue({ success: true, message: "ok" });
    renderWithProviders(<ProfilePage />, state);
    await userEvent.type(screen.getByLabelText("Nama"), " Lestari");
    await userEvent.type(screen.getByLabelText("Email"), "m");
    await userEvent.click(screen.getByRole("button", { name: "Simpan Profil" }));
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("ok"));
    expect(userApi.putMe).toHaveBeenCalledWith({ name: "Ani Lestari", email: "ani@x.idm" });
  });

  it("validasi foto belum dipilih", async () => {
    renderWithProviders(<ProfilePage />, state);
    await userEvent.click(screen.getByRole("button", { name: "Unggah Foto" }));
    expect(showWarningDialog).toHaveBeenCalledWith("Pilih foto terlebih dahulu.");
  });

  it("unggah foto berhasil lalu mereset pilihan", async () => {
    userApi.postMePhoto.mockResolvedValue({ success: true, message: "ok" });
    renderWithProviders(<ProfilePage />, state);
    const file = new File(["x"], "a.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Foto"), { target: { files: [file] } });
    await userEvent.click(screen.getByRole("button", { name: "Unggah Foto" }));
    await waitFor(() => expect(userApi.postMePhoto).toHaveBeenCalledWith(file));
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalled());
    await userEvent.click(screen.getByRole("button", { name: "Unggah Foto" }));
    expect(showWarningDialog).toHaveBeenCalledWith("Pilih foto terlebih dahulu.");
  });

  it("unggah foto gagal mempertahankan pilihan", async () => {
    userApi.postMePhoto.mockResolvedValue({ success: false, message: "err" });
    renderWithProviders(<ProfilePage />, state);
    const file = new File(["x"], "a.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Foto"), { target: { files: [file] } });
    await userEvent.click(screen.getByRole("button", { name: "Unggah Foto" }));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("err"));
  });

  it("pilihan foto dibatalkan (files kosong)", async () => {
    renderWithProviders(<ProfilePage />, state);
    fireEvent.change(screen.getByLabelText("Foto"), { target: { files: [] } });
    await userEvent.click(screen.getByRole("button", { name: "Unggah Foto" }));
    expect(showWarningDialog).toHaveBeenCalledWith("Pilih foto terlebih dahulu.");
  });

  it("validasi ubah kata sandi kosong", async () => {
    renderWithProviders(<ProfilePage />, state);
    await userEvent.click(screen.getByRole("button", { name: "Ubah Kata Sandi" }));
    expect(showWarningDialog).toHaveBeenCalledWith("Kata sandi lama dan baru wajib diisi.");
  });

  it("ubah kata sandi berhasil mengosongkan field", async () => {
    userApi.putMePassword.mockResolvedValue({ success: true, message: "ok" });
    renderWithProviders(<ProfilePage />, state);
    await userEvent.type(screen.getByLabelText("Kata Sandi Lama"), "lama123");
    await userEvent.type(screen.getByLabelText("Kata Sandi Baru"), "baru123");
    await userEvent.click(screen.getByRole("button", { name: "Ubah Kata Sandi" }));
    await waitFor(() =>
      expect(userApi.putMePassword).toHaveBeenCalledWith({ password: "lama123", newPassword: "baru123" })
    );
    await waitFor(() => expect(screen.getByLabelText("Kata Sandi Lama")).toHaveValue(""));
    expect(screen.getByLabelText("Kata Sandi Baru")).toHaveValue("");
  });

  it("ubah kata sandi gagal mempertahankan isian", async () => {
    userApi.putMePassword.mockResolvedValue({ success: false, message: "err" });
    renderWithProviders(<ProfilePage />, state);
    await userEvent.type(screen.getByLabelText("Kata Sandi Lama"), "lama123");
    await userEvent.type(screen.getByLabelText("Kata Sandi Baru"), "baru123");
    await userEvent.click(screen.getByRole("button", { name: "Ubah Kata Sandi" }));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("err"));
    expect(screen.getByLabelText("Kata Sandi Lama")).toHaveValue("lama123");
  });

  it("status loading menonaktifkan tombol", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        profile, isProfile: true,
        isChangeProfile: true, isChangeProfilePhoto: true, isChangeProfilePassword: true,
      },
    });
    expect(screen.getAllByText(/Menyimpan\.\.\.|Mengunggah\.\.\./)).toHaveLength(3);
  });
});
