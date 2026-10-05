import { describe, expect, it, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import { putAccessToken } from "../../../helpers/apiHelper";
import AuthLayout from "./AuthLayout";

function ui() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<div>form login</div>} />
      </Route>
      <Route path="/" element={<div>beranda</div>} />
    </Routes>
  );
}

describe("AuthLayout", () => {
  beforeEach(() => localStorage.clear());

  it("menampilkan banner dan outlet saat belum login", () => {
    renderWithProviders(ui(), { route: "/auth/login" });
    expect(screen.getByTestId("auth-banner")).toBeInTheDocument();
    expect(screen.getByText("form login")).toBeInTheDocument();
    expect(document.title).toBe("Lost & Founds");
  });

  it("mengalihkan ke beranda bila token ada", () => {
    putAccessToken("tok");
    renderWithProviders(ui(), { route: "/auth/login" });
    expect(screen.getByText("beranda")).toBeInTheDocument();
  });

  it("mengalihkan ke beranda bila isAuthLogin true", () => {
    renderWithProviders(ui(), {
      route: "/auth/login",
      preloadedState: { isAuthLogin: true },
    });
    expect(screen.getByText("beranda")).toBeInTheDocument();
  });
});
