import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import SidebarComponent, { MENUS } from "./SidebarComponent";

describe("SidebarComponent", () => {
  it("menampilkan seluruh menu", () => {
    renderWithProviders(<SidebarComponent open={false} onClose={() => {}} />);
    MENUS.forEach((menu) => {
      expect(screen.getByText(menu.label)).toBeInTheDocument();
    });
    expect(screen.getByTestId("sidebar").className).toContain("-translate-x-full");
    expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
  });

  it("drawer terbuka menampilkan overlay dan bisa ditutup", async () => {
    const onClose = vi.fn();
    renderWithProviders(<SidebarComponent open onClose={onClose} />);
    expect(screen.getByTestId("sidebar").className).toContain("translate-x-0");
    await userEvent.click(screen.getByTestId("sidebar-overlay"));
    await userEvent.click(screen.getByLabelText("Tutup menu"));
    await userEvent.click(screen.getByText("Pengguna"));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
