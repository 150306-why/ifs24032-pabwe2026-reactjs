import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(),
    getStatsDaily: vi.fn(),
    getStatsMonthly: vi.fn(),
    postLostFound: vi.fn(),
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
import { renderWithProviders } from "../../../test-utils";
import HomePage, { normalizeStats } from "./HomePage";

const items = [
  { id: 1, title: "Dompet", description: "Hitam kulit", status: "lost", is_completed: 0, created_at: "d1" },
  { id: 2, title: "Kunci", description: "Gantungan biru", status: "found", is_completed: 1, created_at: "d2" },
  { id: 3, title: "Payung", description: "Merah", status: "lost", is_completed: 1, created_at: "d3" },
];

function ui() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/lost-founds/:id" element={<div>halaman detail</div>} />
    </Routes>
  );
}

function mockList(list = items) {
  api.getLostFounds.mockResolvedValue({ success: true, data: { lost_founds: list } });
}

describe("normalizeStats", () => {
  it("menangani berbagai bentuk data", () => {
    expect(normalizeStats(null)).toEqual([]);
    expect(normalizeStats({ x: 1 })).toEqual([]);
    expect(normalizeStats([{ date: "2026-01-01", total: 3 }, { month: "Jan", count: 2 }, { label: "L", value: 5 }, {}]))
      .toEqual([
        { label: "2026-01-01", value: 3 },
        { label: "Jan", value: 2 },
        { label: "L", value: 5 },
        { label: "4", value: 0 },
      ]);
    expect(normalizeStats({ stats: [{ date: "a", total: 1 }] })).toEqual([{ label: "a", value: 1 }]);
  });
});

describe("HomePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menampilkan metrik dan daftar laporan", async () => {
    mockList();
    renderWithProviders(ui());
    expect(await screen.findByText("Dompet")).toBeInTheDocument();
    expect(screen.getByTestId("metric-Total")).toHaveTextContent("3");
    expect(screen.getByTestId("metric-Barang Hilang")).toHaveTextContent("2");
    expect(screen.getByTestId("metric-Barang Ditemukan")).toHaveTextContent("1");
    expect(screen.getByTestId("metric-Selesai")).toHaveTextContent("2");
    expect(screen.getAllByText("Selesai").length).toBeGreaterThan(0);
    expect(screen.getByText("Ditemukan", { selector: "span" })).toBeInTheDocument();
  });

  it("menampilkan loading dan kondisi kosong", async () => {
    let resolve;
    api.getLostFounds.mockReturnValue(new Promise((r) => (resolve = r)));
    renderWithProviders(ui());
    expect(await screen.findByText("Memuat data...")).toBeInTheDocument();
    resolve({ success: true, data: { lost_founds: [] } });
    expect(await screen.findByText("Tidak ada laporan.")).toBeInTheDocument();
  });

  it("live search memfilter berdasarkan judul/deskripsi", async () => {
    mockList();
    renderWithProviders(ui());
    await screen.findByText("Dompet");
    await userEvent.type(screen.getByLabelText("Cari laporan"), "biru");
    expect(screen.queryByText("Dompet")).not.toBeInTheDocument();
    expect(screen.getByText("Kunci")).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("Cari laporan"));
    await userEvent.type(screen.getByLabelText("Cari laporan"), "dompet");
    expect(screen.getByText("Dompet")).toBeInTheDocument();
    expect(screen.queryByText("Kunci")).not.toBeInTheDocument();
  });

  it("filter status, selesai, dan laporan saya memanggil API dengan parameter", async () => {
    mockList();
    renderWithProviders(ui());
    await screen.findByText("Dompet");
    await userEvent.selectOptions(screen.getByLabelText("Filter status"), "lost");
    await waitFor(() =>
      expect(api.getLostFounds).toHaveBeenLastCalledWith({ status: "lost", is_completed: "", is_me: "" })
    );
    await userEvent.selectOptions(screen.getByLabelText("Filter penyelesaian"), "1");
    await waitFor(() =>
      expect(api.getLostFounds).toHaveBeenLastCalledWith({ status: "lost", is_completed: "1", is_me: "" })
    );
    await userEvent.click(screen.getByLabelText("Laporan saya"));
    await waitFor(() =>
      expect(api.getLostFounds).toHaveBeenLastCalledWith({ status: "lost", is_completed: "1", is_me: 1 })
    );
  });

  it("klik kartu menuju detail", async () => {
    mockList();
    renderWithProviders(ui());
    await userEvent.click(await screen.findByText("Kunci"));
    expect(screen.getByText("halaman detail")).toBeInTheDocument();
  });

  it("tambah laporan memuat ulang daftar", async () => {
    mockList();
    api.postLostFound.mockResolvedValue({ success: true, message: "ok" });
    renderWithProviders(ui());
    await screen.findByText("Dompet");
    const before = api.getLostFounds.mock.calls.length;
    await userEvent.click(screen.getByRole("button", { name: /Tambah Laporan/ }));
    const dialog = screen.getByRole("dialog");
    await userEvent.type(within(dialog).getByLabelText("Judul"), "Baru");
    await userEvent.type(within(dialog).getByLabelText("Deskripsi"), "Desk");
    await userEvent.click(within(dialog).getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(api.getLostFounds.mock.calls.length).toBeGreaterThan(before));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("menutup modal tambah", async () => {
    mockList();
    renderWithProviders(ui());
    await screen.findByText("Dompet");
    await userEvent.click(screen.getByRole("button", { name: /Tambah Laporan/ }));
    await userEvent.click(screen.getByLabelText("Tutup"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("tampilan statistik (view=stats) dengan data", async () => {
    mockList();
    api.getStatsDaily.mockResolvedValue({ success: true, data: { stats: [{ date: "2026-01-01", total: 4 }] } });
    api.getStatsMonthly.mockResolvedValue({ success: true, data: [{ month: "Jan", total: 9 }] });
    renderWithProviders(ui(), { route: "/?view=stats" });
    expect(screen.getByRole("heading", { name: "Statistik" })).toBeInTheDocument();
    expect(await screen.findByText("2026-01-01")).toBeInTheDocument();
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Statistik Harian")).toBeInTheDocument();
  });

  it("statistik kosong menampilkan pesan", async () => {
    mockList();
    renderWithProviders(ui(), { route: "/?view=stats" });
    api.getStatsDaily.mockResolvedValue({ success: false, message: "x" });
    api.getStatsMonthly.mockResolvedValue({ success: false, message: "x" });
    expect(screen.getAllByText("Belum ada data.")).toHaveLength(2);
  });
});
