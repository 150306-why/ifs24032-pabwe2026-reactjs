import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api/authApi", () => ({
  default: { postLogin: vi.fn(), postRegister: vi.fn() },
}));
vi.mock("../../../helpers/apiHelper", () => ({
  putAccessToken: vi.fn(),
  removeAccessToken: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

import authApi from "../api/authApi";
import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import {
  ActionType,
  asyncSetIsAuthLogin,
  asyncSetIsAuthLogout,
  asyncSetIsAuthRegister,
  setIsAuthLoginActionCreator,
  setIsAuthLogoutActionCreator,
  setIsAuthRegisterActionCreator,
} from "./action";
import { ActionType as UserActionType } from "../../users/states/action";

describe("auth action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("action creators", () => {
    expect(setIsAuthLoginActionCreator(true)).toEqual({
      type: ActionType.SET_IS_AUTH_LOGIN, payload: { status: true },
    });
    expect(setIsAuthRegisterActionCreator(true)).toEqual({
      type: ActionType.SET_IS_AUTH_REGISTER, payload: { status: true },
    });
    expect(setIsAuthLogoutActionCreator(true)).toEqual({
      type: ActionType.SET_IS_AUTH_LOGOUT, payload: { status: true },
    });
  });

  it("login sukses", async () => {
    authApi.postLogin.mockResolvedValue({ success: true, data: { token: "T" } });
    const dispatch = vi.fn();
    const ok = await asyncSetIsAuthLogin({ email: "a", password: "b" })(dispatch);
    expect(ok).toBe(true);
    expect(putAccessToken).toHaveBeenCalledWith("T");
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLogoutActionCreator(false));
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(true));
  });

  it("login gagal", async () => {
    authApi.postLogin.mockResolvedValue({ success: false, message: "salah" });
    const dispatch = vi.fn();
    const ok = await asyncSetIsAuthLogin({ email: "a", password: "b" })(dispatch);
    expect(ok).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("salah");
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("register sukses", async () => {
    authApi.postRegister.mockResolvedValue({ success: true, message: "ok" });
    const dispatch = vi.fn();
    const ok = await asyncSetIsAuthRegister({ name: "n", email: "e", password: "p" })(dispatch);
    expect(ok).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setIsAuthRegisterActionCreator(true));
    expect(showSuccessDialog).toHaveBeenCalledWith("ok");
  });

  it("register gagal", async () => {
    authApi.postRegister.mockResolvedValue({ success: false, message: "dup" });
    const dispatch = vi.fn();
    const ok = await asyncSetIsAuthRegister({ name: "n", email: "e", password: "p" })(dispatch);
    expect(ok).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("dup");
  });

  it("logout", () => {
    const dispatch = vi.fn();
    asyncSetIsAuthLogout()(dispatch);
    expect(removeAccessToken).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: UserActionType.SET_PROFILE, payload: { profile: null },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: UserActionType.SET_IS_PROFILE, payload: { status: false },
    });
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(false));
    expect(dispatch).toHaveBeenCalledWith(setIsAuthRegisterActionCreator(false));
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLogoutActionCreator(true));
  });
});
