import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api/userApi", () => ({
  default: {
    getUsers: vi.fn(), getMe: vi.fn(), putMe: vi.fn(),
    postMePhoto: vi.fn(), putMePassword: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

import userApi from "../api/userApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import * as A from "./action";

const fail = { success: false, message: "gagal" };
const ok = { success: true, message: "ok" };

describe("users action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("action creators", () => {
    expect(A.setUsersActionCreator([1])).toEqual({ type: A.ActionType.SET_USERS, payload: { users: [1] } });
    expect(A.setUserActionCreator({ a: 1 })).toEqual({ type: A.ActionType.SET_USER, payload: { user: { a: 1 } } });
    expect(A.setProfileActionCreator({ a: 1 })).toEqual({ type: A.ActionType.SET_PROFILE, payload: { profile: { a: 1 } } });
    expect(A.setIsProfileActionCreator(true)).toEqual({ type: A.ActionType.SET_IS_PROFILE, payload: { status: true } });
    expect(A.setIsChangeProfileActionCreator(true)).toEqual({ type: A.ActionType.SET_IS_CHANGE_PROFILE, payload: { status: true } });
    expect(A.setIsChangeProfilePhotoActionCreator(true)).toEqual({ type: A.ActionType.SET_IS_CHANGE_PROFILE_PHOTO, payload: { status: true } });
    expect(A.setIsChangeProfilePasswordActionCreator(true)).toEqual({ type: A.ActionType.SET_IS_CHANGE_PROFILE_PASSWORD, payload: { status: true } });
  });

  it("asyncSetUsers sukses & gagal", async () => {
    userApi.getUsers.mockResolvedValueOnce({ success: true, data: { users: [{ id: 1 }] } });
    let dispatch = vi.fn();
    expect(await A.asyncSetUsers()(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(A.setUsersActionCreator([{ id: 1 }]));

    userApi.getUsers.mockResolvedValueOnce(fail);
    dispatch = vi.fn();
    expect(await A.asyncSetUsers()(dispatch)).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("gagal");
  });

  it("asyncSetProfile sukses & gagal", async () => {
    userApi.getMe.mockResolvedValueOnce({ success: true, data: { user: { id: 1 } } });
    let dispatch = vi.fn();
    expect(await A.asyncSetProfile()(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(A.setProfileActionCreator({ id: 1 }));
    expect(dispatch).toHaveBeenCalledWith(A.setIsProfileActionCreator(true));

    userApi.getMe.mockResolvedValueOnce(fail);
    dispatch = vi.fn();
    expect(await A.asyncSetProfile()(dispatch)).toBe(false);
    expect(dispatch).toHaveBeenCalledWith(A.setProfileActionCreator(null));
  });

  it("asyncSetIsChangeProfile sukses & gagal", async () => {
    userApi.putMe.mockResolvedValueOnce(ok);
    let dispatch = vi.fn().mockResolvedValue(true);
    expect(await A.asyncSetIsChangeProfile({ name: "n", email: "e" })(dispatch)).toBe(true);
    expect(showSuccessDialog).toHaveBeenCalledWith("ok");
    expect(dispatch).toHaveBeenCalledWith(A.setIsChangeProfileActionCreator(true));
    expect(dispatch).toHaveBeenCalledWith(A.setIsChangeProfileActionCreator(false));

    userApi.putMe.mockResolvedValueOnce(fail);
    dispatch = vi.fn();
    expect(await A.asyncSetIsChangeProfile({ name: "n", email: "e" })(dispatch)).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("gagal");
  });

  it("asyncSetIsChangeProfilePhoto sukses & gagal", async () => {
    userApi.postMePhoto.mockResolvedValueOnce(ok);
    let dispatch = vi.fn().mockResolvedValue(true);
    expect(await A.asyncSetIsChangeProfilePhoto("f")(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(A.setIsChangeProfilePhotoActionCreator(false));

    userApi.postMePhoto.mockResolvedValueOnce(fail);
    dispatch = vi.fn();
    expect(await A.asyncSetIsChangeProfilePhoto("f")(dispatch)).toBe(false);
  });

  it("asyncSetIsChangeProfilePassword sukses & gagal", async () => {
    userApi.putMePassword.mockResolvedValueOnce(ok);
    let dispatch = vi.fn();
    expect(await A.asyncSetIsChangeProfilePassword({ password: "a", newPassword: "b" })(dispatch)).toBe(true);
    expect(showSuccessDialog).toHaveBeenCalledWith("ok");

    userApi.putMePassword.mockResolvedValueOnce(fail);
    dispatch = vi.fn();
    expect(await A.asyncSetIsChangeProfilePassword({ password: "a", newPassword: "b" })(dispatch)).toBe(false);
  });
});
