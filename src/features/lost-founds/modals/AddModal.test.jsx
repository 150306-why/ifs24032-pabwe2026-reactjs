import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../api/lostFoundApi", () => ({
  default: { postLostFound: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

import api from "../api/lostFoundApi";
import { showErrorDialog, showWarningDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import AddModal from "./AddModal";

describe("AddModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("tidak render saat tertutup", () => {
    renderWithProviders(<AddModal open={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("validasi input kosong", async () => {
    renderWithProviders(<AddModal open onClose={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(showWarningDialog).toHaveBeenCalled();
    expect(api.postLostFound).not.toHaveBeenCalled();
  });

  it("menambah laporan lalu menutup dan memanggil onSuccess", async () => {
    api.postLostFound.mockResolvedValue({ success: true, message: "ok" });
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    renderWithProviders(<AddModal open onClose={onClose} onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText("Judul"), "Dompet");
    await userEvent.type(screen.getByLabelText("Deskripsi"), "Warna hitam");
    await userEvent.selectOptions(screen.getByLabelText("Jenis Laporan"), "found");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSuccess).toHaveBeenCalled();
    expect(api.postLostFound).toHaveBeenCalledWith({
      title: "Dompet", description: "Warna hitam", status: "found",
    });
  });

  it("sukses tanpa onSuccess", async () => {
    api.postLostFound.mockResolvedValue({ success: true, message: "ok" });
    const onClose = vi.fn();
    renderWithProviders(<AddModal open onClose={onClose} />);
    await userEvent.type(screen.getByLabelText("Judul"), "A");
    await userEvent.type(screen.getByLabelText("Deskripsi"), "B");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("gagal tidak menutup modal", async () => {
    api.postLostFound.mockResolvedValue({ success: false, message: "err" });
    const onClose = vi.fn();
    renderWithProviders(<AddModal open onClose={onClose} />);
    await userEvent.type(screen.getByLabelText("Judul"), "A");
    await userEvent.type(screen.getByLabelText("Deskripsi"), "B");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("err"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol tutup", async () => {
    const onClose = vi.fn();
    renderWithProviders(<AddModal open onClose={onClose} />);
    await userEvent.click(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalled();
  });
});
