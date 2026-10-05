import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../api/lostFoundApi", () => ({
  default: { postLostFoundCover: vi.fn() },
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
import ChangeCoverModal from "./ChangeCoverModal";

const file = new File(["x"], "a.png", { type: "image/png" });

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:preview");
  });

  it("tidak render saat tertutup", () => {
    renderWithProviders(<ChangeCoverModal open={false} lostFoundId={1} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("peringatan jika belum memilih file", async () => {
    renderWithProviders(<ChangeCoverModal open lostFoundId={1} onClose={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Unggah" }));
    expect(showWarningDialog).toHaveBeenCalled();
    expect(api.postLostFoundCover).not.toHaveBeenCalled();
  });

  it("menampilkan pratinjau dan menghapusnya bila pilihan dibatalkan", () => {
    renderWithProviders(<ChangeCoverModal open lostFoundId={1} onClose={() => {}} />);
    const input = screen.getByLabelText("Gambar Cover");
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByAltText("Pratinjau cover")).toHaveAttribute("src", "blob:preview");
    fireEvent.change(input, { target: { files: [] } });
    expect(screen.queryByAltText("Pratinjau cover")).not.toBeInTheDocument();
  });

  it("mengunggah cover lalu menutup dan memanggil onSuccess", async () => {
    api.postLostFoundCover.mockResolvedValue({ success: true, message: "ok" });
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    renderWithProviders(<ChangeCoverModal open lostFoundId={4} onClose={onClose} onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText("Gambar Cover"), { target: { files: [file] } });
    await userEvent.click(screen.getByRole("button", { name: "Unggah" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSuccess).toHaveBeenCalled();
    expect(api.postLostFoundCover).toHaveBeenCalledWith(4, file);
  });

  it("sukses tanpa onSuccess", async () => {
    api.postLostFoundCover.mockResolvedValue({ success: true, message: "ok" });
    const onClose = vi.fn();
    renderWithProviders(<ChangeCoverModal open lostFoundId={4} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText("Gambar Cover"), { target: { files: [file] } });
    await userEvent.click(screen.getByRole("button", { name: "Unggah" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("gagal tidak menutup modal", async () => {
    api.postLostFoundCover.mockResolvedValue({ success: false, message: "err" });
    const onClose = vi.fn();
    renderWithProviders(<ChangeCoverModal open lostFoundId={4} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText("Gambar Cover"), { target: { files: [file] } });
    await userEvent.click(screen.getByRole("button", { name: "Unggah" }));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("err"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol tutup", async () => {
    const onClose = vi.fn();
    renderWithProviders(<ChangeCoverModal open lostFoundId={1} onClose={onClose} />);
    await userEvent.click(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalled();
  });
});
