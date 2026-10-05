import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import { putAccessToken } from "../../../helpers/apiHelper";
import NavbarComponent from "./NavbarComponent";

function ui(onToggle = () => {}) {
  return (
    <Routes>
      <Route path="/" element={<NavbarComponent onToggleSidebar={onToggle} />} />
      <Route path="/profile" element={<div>halaman profil</div>} />
      <Route path="/auth/login" element={<div>halaman login</div>} />
    </Routes>
  );
}

describe("NavbarComponent", () => {
  beforeEach(() => localStorage.clear());

  it("menampilkan nama dan inisial profil", () => {
    renderWithProviders(ui(), { preloadedState: { profile: { name: "ani" } } });
    expect(screen.getByText("ani")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("fallback tanpa profil", () => {
    renderWithProviders(ui());
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("fallback inisial saat nama kosong", () => {
    renderWithProviders(ui(), { preloadedState: { profile: { name: "" } } });
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("tombol menu memanggil onToggleSidebar", async () => {
    const onToggle = vi.fn();
    renderWithProviders(ui(onToggle));
    await userEvent.click(screen.getByLabelText("Buka menu"));
    expect(onToggle).toHaveBeenCalled();
  });

  it("dropdown dibuka/ditutup dan menuju profil", async () => {
    renderWithProviders(ui(), { preloadedState: { profile: { name: "Ani" } } });
    expect(screen.queryByTestId("profile-dropdown")).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Menu profil"));
    expect(screen.getByTestId("profile-dropdown")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Menu profil"));
    expect(screen.queryByTestId("profile-dropdown")).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Menu profil"));
    await userEvent.click(screen.getByText("Profil Saya"));
    expect(screen.getByText("halaman profil")).toBeInTheDocument();
  });

  it("logout menghapus token dan menuju login", async () => {
    putAccessToken("tok");
    const { store } = renderWithProviders(ui(), {
      preloadedState: { profile: { name: "Ani" }, isProfile: true },
    });
    await userEvent.click(screen.getByLabelText("Menu profil"));
    await userEvent.click(screen.getByRole("button", { name: /Keluar/ }));
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(store.getState().profile).toBeNull();
    expect(store.getState().isAuthLogout).toBe(true);
    expect(screen.getByText("halaman login")).toBeInTheDocument();
  });
});
