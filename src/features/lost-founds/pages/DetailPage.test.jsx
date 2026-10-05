import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFound: vi.fn(),
    putLostFound: vi.fn(),
    postLostFoundCover: vi.fn(),
    deleteLostFound: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
  formatDate: (v) => `tgl:${v}`,
}));

import api from "../api/lostFoundApi";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import DetailPage from "./DetailPage";

const item = {
  id: 5, title: "Dompet", description: "Hitam", status: "lost", is_completed: 0,
  cover: "http://x/c.png", created_at: "2026", updated_at: "2026",
  user: { name: "Ani" },
};

function ui() {
  return (
    <Routes>
      <Route path="/lost-founds/:id" element={<DetailPage />} />
      <Route path="/" element={<div>beranda</div>} />
    </Routes>
  );
}

function mockDetail(data = item) {
  api.getLostFound.mockResolvedValue({ success: true, data: { lost_found: data } });
}

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:p");
  });

  it("menampilkan rincian laporan", async () => {
    mockDetail();
    renderWithProviders(ui(), { route: "/lost-founds/5" });
    expect(await screen.findByRole("heading", { name: "Dompet" })).toBeInTheDocument();
    expect(api.getLostFound).toHaveBeenCalledWith("5");
    expect(screen.getByText("Hitam")).toBeInTheDocument();
    expect(screen.getByText("Hilang")).toBeInTheDocument();
    expect(screen.getByText("Belum selesai")).toBeInTheDocument();
    expect(screen.getByText("Ani")).toBeInTheDocument();
    expect(screen.getByAltText("Dompet")).toHaveAttribute("src", "http://x/c.png");
  });

  it("variasi data: ditemukan, selesai, tanpa cover & tanpa pelapor", async () => {
    mockDetail({ ...item, status: "found", is_completed: 1, cover: null, user: null });
    renderWithProviders(ui(), { route: "/lost-founds/5" });
    expect(await screen.findByText("Ditemukan")).toBeInTheDocument();
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.getByText("Tidak ada foto")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("menampilkan loading", async () => {
    api.getLostFound.mockReturnValue(new Promise(() => {}));
    renderWithProviders(ui(), { route: "/lost-founds/5" });
    expect(await screen.findByText("Memuat data...")).toBeInTheDocument();
  });

  it("menampilkan pesan tidak ditemukan", async () => {
    api.getLostFound.mockResolvedValue({ success: false, message: "x" });
    renderWithProviders(ui(), { route: "/lost-founds/5" });
    expect(await screen.findByText("Laporan tidak ditemukan.")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Kembali ke beranda"));
    expect(screen.getByText("beranda")).toBeInTheDocument();
  });

  it("ubah data melalui modal lalu memuat ulang", async () => {
    mockDetail();
    api.putLostFound.mockResolvedValue({ success: true, message: "ok" });
    renderWithProviders(ui(), { route: "/lost-founds/5" });
    await screen.findByRole("heading", { name: "Dompet" });
    const before = api.getLostFound.mock.calls.length;
    await userEvent.click(screen.getByRole("button", { name: /Ubah Data/ }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(api.getLostFound.mock.calls.length).toBeGreaterThan(before));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("ubah cover melalui modal lalu memuat ulang", async () => {
    mockDetail();
    api.postLostFoundCover.mockResolvedValue({ success: true, message: "ok" });
    renderWithProviders(ui(), { route: "/lost-founds/5" });
    await screen.findByRole("heading", { name: "Dompet" });
    const before = api.getLostFound.mock.calls.length;
    await userEvent.click(screen.getByRole("button", { name: /Ubah Cover/ }));
    const file = new File(["x"], "a.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Gambar Cover"), { target: { files: [file] } });
    await userEvent.click(screen.getByRole("button", { name: "Unggah" }));
    await waitFor(() => expect(api.getLostFound.mock.calls.length).toBeGreaterThan(before));
  });

  it("hapus: dibatalkan tetap di halaman", async () => {
    mockDetail();
    showConfirmDialog.mockResolvedValue(false);
    renderWithProviders(ui(), { route: "/lost-founds/5" });
    await userEvent.click(await screen.findByRole("button", { name: /Hapus/ }));
    expect(api.deleteLostFound).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Dompet" })).toBeInTheDocument();
  });

  it("hapus: dikonfirmasi menuju beranda", async () => {
    mockDetail();
    showConfirmDialog.mockResolvedValue(true);
    api.deleteLostFound.mockResolvedValue({ success: true, message: "ok" });
    renderWithProviders(ui(), { route: "/lost-founds/5" });
    await userEvent.click(await screen.findByRole("button", { name: /Hapus/ }));
    expect(await screen.findByText("beranda")).toBeInTheDocument();
    expect(api.deleteLostFound).toHaveBeenCalledWith("5");
  });
});
