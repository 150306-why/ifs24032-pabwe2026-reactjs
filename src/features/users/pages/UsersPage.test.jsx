import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

vi.mock("../api/userApi", () => ({ default: { getUsers: vi.fn() } }));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

import userApi from "../api/userApi";
import { renderWithProviders } from "../../../test-utils";
import UsersPage from "./UsersPage";

describe("UsersPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menampilkan pesan saat kosong", async () => {
    userApi.getUsers.mockResolvedValue({ success: true, data: { users: [] } });
    renderWithProviders(<UsersPage />);
    expect(await screen.findByText("Belum ada pengguna.")).toBeInTheDocument();
  });

  it("menampilkan daftar pengguna dengan foto dan inisial", async () => {
    userApi.getUsers.mockResolvedValue({
      success: true,
      data: {
        users: [
          { id: 1, name: "Ani", email: "ani@x.id", photo: "http://x/a.png" },
          { id: 2, name: "budi", email: "budi@x.id", photo: null },
        ],
      },
    });
    renderWithProviders(<UsersPage />);
    expect(await screen.findByText("Ani")).toBeInTheDocument();
    expect(screen.getByAltText("Ani")).toHaveAttribute("src", "http://x/a.png");
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("budi@x.id")).toBeInTheDocument();
  });
});
