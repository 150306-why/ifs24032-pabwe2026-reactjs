import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

import Swal from "sweetalert2";
import {
  formatDate,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "./toolsHelper";

describe("toolsHelper", () => {
  beforeEach(() => {
    Swal.fire.mockReset();
    Swal.fire.mockResolvedValue({ isConfirmed: true });
  });

  it("showSuccessDialog", async () => {
    await showSuccessDialog("sukses");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success", text: "sukses" })
    );
  });

  it("showErrorDialog", async () => {
    await showErrorDialog("gagal");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "error", text: "gagal" })
    );
  });

  it("showWarningDialog", async () => {
    await showWarningDialog("awas");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "warning", text: "awas" })
    );
  });

  it("showConfirmDialog mengembalikan true saat dikonfirmasi (teks default)", async () => {
    expect(await showConfirmDialog("yakin?")).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        showCancelButton: true,
        confirmButtonText: "Ya, lanjutkan",
      })
    );
  });

  it("showConfirmDialog mengembalikan false saat dibatalkan (teks kustom)", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });
    expect(await showConfirmDialog("yakin?", "Hapus")).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ confirmButtonText: "Hapus" })
    );
  });

  it("formatDate", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("bukan-tanggal")).toBe("-");
    const text = formatDate("2026-03-05T10:00:00Z");
    expect(text).toContain("2026");
    expect(text).toContain("Maret");
  });
});
