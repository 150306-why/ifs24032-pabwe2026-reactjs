import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../api/lostFoundApi", () => ({
  default: { putLostFound: vi.fn() },
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
import ChangeModal from "./ChangeModal";

const item = {
  id: 7, title: "Kunci", description: "Gantungan biru", status: "lost", is_completed: 0,
};

describe("ChangeModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("tidak render saat tertutup atau tanpa data", () => {
    const { unmount } = renderWithProviders(<ChangeModal open={false} lostFound={item} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<ChangeModal open lostFound={null} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("terisi data awal", () => {
    renderWithProviders(<ChangeModal open lostFound={item} onClose={() => {}} />);
    expect(screen.getByLabelText("Judul")).toHaveValue("Kunci");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Gantungan biru");
    expect(screen.getByLabelText("Jenis Laporan")).toHaveValue("lost");
    expect(screen.getByLabelText("Tandai selesai")).not.toBeChecked();
  });

  it("validasi judul kosong", async () => {
    renderWithProviders(<ChangeModal open lostFound={item} onClose={() => {}} />);
    await userEvent.clear(screen.getByLabelText("Judul"));
    await userEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    expect(showWarningDialog).toHaveBeenCalled();
    expect(api.putLostFound).not.toHaveBeenCalled();
  });

  it("menyimpan perubahan dengan toggle selesai", async () => {
    api.putLostFound.mockResolvedValue({ success: true, message: "ok" });
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    renderWithProviders(<ChangeModal open lostFound={{ ...item, is_completed: 1 }} onClose={onClose} onSuccess={onSuccess} />);
    expect(screen.getByLabelText("Tandai selesai")).toBeChecked();
    await userEvent.click(screen.getByLabelText("Tandai selesai"));
    await userEvent.selectOptions(screen.getByLabelText("Jenis Laporan"), "found");
    await userEvent.type(screen.getByLabelText("Judul"), " baru");
    await userEvent.type(screen.getByLabelText("Deskripsi"), "!");
    await userEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSuccess).toHaveBeenCalled();
    expect(api.putLostFound).toHaveBeenCalledWith(7, {
      title: "Kunci baru", description: "Gantungan biru!", status: "found", isCompleted: false,
    });
  });

  it("sukses tanpa onSuccess", async () => {
    api.putLostFound.mockResolvedValue({ success: true, message: "ok" });
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal open lostFound={item} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("gagal tidak menutup modal", async () => {
    api.putLostFound.mockResolvedValue({ success: false, message: "err" });
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal open lostFound={item} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("err"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol tutup", async () => {
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal open lostFound={item} onClose={onClose} />);
    await userEvent.click(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalled();
  });
});
