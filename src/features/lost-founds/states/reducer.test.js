import { describe, expect, it } from "vitest";
import * as R from "./reducer";
import { ActionType } from "./action";

describe("lost-founds reducer", () => {
  it("lostFoundsReducer", () => {
    expect(R.lostFoundsReducer()).toEqual([]);
    expect(R.lostFoundsReducer([1], { type: "X" })).toEqual([1]);
    expect(R.lostFoundsReducer([], { type: ActionType.SET_LOST_FOUNDS, payload: { lostFounds: [2] } })).toEqual([2]);
  });

  it("lostFoundReducer", () => {
    expect(R.lostFoundReducer()).toBeNull();
    expect(R.lostFoundReducer({ a: 1 }, { type: "X" })).toEqual({ a: 1 });
    expect(R.lostFoundReducer(null, { type: ActionType.SET_LOST_FOUND, payload: { lostFound: { a: 2 } } })).toEqual({ a: 2 });
  });

  it("lostFoundStatsReducer", () => {
    expect(R.lostFoundStatsReducer()).toBeNull();
    expect(R.lostFoundStatsReducer({ a: 1 }, { type: "X" })).toEqual({ a: 1 });
    expect(R.lostFoundStatsReducer(null, { type: ActionType.SET_LOST_FOUND_STATS, payload: { stats: { a: 2 } } })).toEqual({ a: 2 });
  });

  it.each([
    ["isLostFound", R.isLostFoundReducer, ActionType.SET_IS_LOST_FOUND],
    ["isLostFoundAdd", R.isLostFoundAddReducer, ActionType.SET_IS_LOST_FOUND_ADD],
    ["isLostFoundAdded", R.isLostFoundAddedReducer, ActionType.SET_IS_LOST_FOUND_ADDED],
    ["isLostFoundChange", R.isLostFoundChangeReducer, ActionType.SET_IS_LOST_FOUND_CHANGE],
    ["isLostFoundChanged", R.isLostFoundChangedReducer, ActionType.SET_IS_LOST_FOUND_CHANGED],
    ["isLostFoundChangeCover", R.isLostFoundChangeCoverReducer, ActionType.SET_IS_LOST_FOUND_CHANGE_COVER],
    ["isLostFoundChangedCover", R.isLostFoundChangedCoverReducer, ActionType.SET_IS_LOST_FOUND_CHANGED_COVER],
    ["isLostFoundDelete", R.isLostFoundDeleteReducer, ActionType.SET_IS_LOST_FOUND_DELETE],
    ["isLostFoundDeleted", R.isLostFoundDeletedReducer, ActionType.SET_IS_LOST_FOUND_DELETED],
  ])("%s", (_n, reducer, type) => {
    expect(reducer()).toBe(false);
    expect(reducer(false, { type: "X" })).toBe(false);
    expect(reducer(false, { type, payload: { status: true } })).toBe(true);
  });
});
