import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

vi.mock("../../users/api/userApi", () => ({
  default: { getMe: vi.fn() },
}));

import userApi from "../../users/api/userApi";
import { renderWithProviders } from "../../../test-utils";
import { putAccessToken } from "../../../helpers/apiHelper";
import LostFoundLayout from "./LostFoundLayout";

function ui() {
  return (
    <Routes>
      <Route path="/" element={<LostFoundLayout />}>
        <Route index element={<div>konten beranda</div>} />
      </Route>
      <Route path="/auth/login" element={<div>halaman login</div>} />
    </Routes>
  );
}

describe("LostFoundLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("mengalihkan ke login tanpa token", () => {
    renderWithProviders(ui());
    expect(screen.getByText("halaman login")).toBeInTheDocument();
    expect(userApi.getMe).not.toHaveBeenCalled();
  });

  it("memuat sesi lalu menampilkan navbar, sidebar, dan konten", async () => {
    putAccessToken("tok");
    userApi.getMe.mockResolvedValue({
      success: true,
      data: { user: { id: 1, name: "Ani", email: "a@b.c" } },
    });
    renderWithProviders(ui());
    expect(screen.getByText("Memuat sesi...")).toBeInTheDocument();
    expect(await screen.findByText("konten beranda")).toBeInTheDocument();
    expect(screen.getByText("Ani")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("toggle drawer sidebar dari navbar", async () => {
    putAccessToken("tok");
    userApi.getMe.mockResolvedValue({
      success: true,
      data: { user: { id: 1, name: "Ani", email: "a@b.c" } },
    });
    renderWithProviders(ui());
    await screen.findByText("konten beranda");
    await userEvent.click(screen.getByLabelText("Buka menu"));
    expect(screen.getByTestId("sidebar-overlay")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("sidebar-overlay"));
    expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
  });

  it("logout otomatis bila sesi tidak valid", async () => {
    putAccessToken("expired");
    userApi.getMe.mockResolvedValue({ success: false, message: "Unauthorized" });
    renderWithProviders(ui());
    await waitFor(() =>
      expect(screen.getByText("halaman login")).toBeInTheDocument()
    );
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});
