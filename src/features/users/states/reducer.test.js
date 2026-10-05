import { describe, expect, it } from "vitest";
import * as R from "./reducer";
import { ActionType } from "./action";

describe("users reducer", () => {
  it("usersReducer", () => {
    expect(R.usersReducer()).toEqual([]);
    expect(R.usersReducer([1], { type: "X" })).toEqual([1]);
    expect(R.usersReducer([], { type: ActionType.SET_USERS, payload: { users: [2] } })).toEqual([2]);
  });

  it("userReducer", () => {
    expect(R.userReducer()).toBeNull();
    expect(R.userReducer({ a: 1 }, { type: "X" })).toEqual({ a: 1 });
    expect(R.userReducer(null, { type: ActionType.SET_USER, payload: { user: { a: 2 } } })).toEqual({ a: 2 });
  });

  it("profileReducer", () => {
    expect(R.profileReducer()).toBeNull();
    expect(R.profileReducer({ a: 1 }, { type: "X" })).toEqual({ a: 1 });
    expect(R.profileReducer(null, { type: ActionType.SET_PROFILE, payload: { profile: { a: 2 } } })).toEqual({ a: 2 });
  });

  it.each([
    ["isProfile", R.isProfileReducer, ActionType.SET_IS_PROFILE],
    ["isChangeProfile", R.isChangeProfileReducer, ActionType.SET_IS_CHANGE_PROFILE],
    ["isChangeProfilePhoto", R.isChangeProfilePhotoReducer, ActionType.SET_IS_CHANGE_PROFILE_PHOTO],
    ["isChangeProfilePassword", R.isChangeProfilePasswordReducer, ActionType.SET_IS_CHANGE_PROFILE_PASSWORD],
  ])("%s", (_n, reducer, type) => {
    expect(reducer()).toBe(false);
    expect(reducer(false, { type: "X" })).toBe(false);
    expect(reducer(false, { type, payload: { status: true } })).toBe(true);
  });
});
