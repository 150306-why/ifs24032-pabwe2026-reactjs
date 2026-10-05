import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(), getLostFound: vi.fn(), postLostFound: vi.fn(),
    putLostFound: vi.fn(), postLostFoundCover: vi.fn(), deleteLostFound: vi.fn(),
    getStatsDaily: vi.fn(), getStatsMonthly: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

import api from "../api/lostFoundApi";
import {
  showConfirmDialog, showErrorDialog, showSuccessDialog,
} from "../../../helpers/toolsHelper";
import * as A from "./action";

const fail = { success: false, message: "gagal" };
const ok = { success: true, message: "ok" };

describe("lost-founds action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("action creators", () => {
    const T = A.ActionType;
    expect(A.setLostFoundsActionCreator([1])).toEqual({ type: T.SET_LOST_FOUNDS, payload: { lostFounds: [1] } });
    expect(A.setLostFoundActionCreator({ a: 1 })).toEqual({ type: T.SET_LOST_FOUND, payload: { lostFound: { a: 1 } } });
    const statusCases = [
      [A.setIsLostFoundActionCreator, T.SET_IS_LOST_FOUND],
      [A.setIsLostFoundAddActionCreator, T.SET_IS_LOST_FOUND_ADD],
      [A.setIsLostFoundAddedActionCreator, T.SET_IS_LOST_FOUND_ADDED],
      [A.setIsLostFoundChangeActionCreator, T.SET_IS_LOST_FOUND_CHANGE],
      [A.setIsLostFoundChangedActionCreator, T.SET_IS_LOST_FOUND_CHANGED],
      [A.setIsLostFoundChangeCoverActionCreator, T.SET_IS_LOST_FOUND_CHANGE_COVER],
      [A.setIsLostFoundChangedCoverActionCreator, T.SET_IS_LOST_FOUND_CHANGED_COVER],
      [A.setIsLostFoundDeleteActionCreator, T.SET_IS_LOST_FOUND_DELETE],
      [A.setIsLostFoundDeletedActionCreator, T.SET_IS_LOST_FOUND_DELETED],
    ];
    statusCases.forEach(([creator, type]) => {
      expect(creator(true)).toEqual({ type, payload: { status: true } });
    });
    expect(A.setLostFoundStatsActionCreator({ x: 1 })).toEqual({ type: T.SET_LOST_FOUND_STATS, payload: { stats: { x: 1 } } });
  });

  it("asyncSetLostFounds sukses & gagal", async () => {
    api.getLostFounds.mockResolvedValueOnce({ success: true, data: { lost_founds: [{ id: 1 }] } });
    let dispatch = vi.fn();
    expect(await A.asyncSetLostFounds({ status: "lost" })(dispatch)).toBe(true);
    expect(api.getLostFounds).toHaveBeenCalledWith({ status: "lost" });
    expect(dispatch).toHaveBeenCalledWith(A.setLostFoundsActionCreator([{ id: 1 }]));

    api.getLostFounds.mockResolvedValueOnce(fail);
    dispatch = vi.fn();
    expect(await A.asyncSetLostFounds()(dispatch)).toBe(false);
    expect(api.getLostFounds).toHaveBeenLastCalledWith({});
    expect(showErrorDialog).toHaveBeenCalledWith("gagal");
  });

  it("asyncSetLostFound sukses & gagal", async () => {
    api.getLostFound.mockResolvedValueOnce({ success: true, data: { lost_found: { id: 1 } } });
    let dispatch = vi.fn();
    expect(await A.asyncSetLostFound(1)(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(A.setLostFoundActionCreator({ id: 1 }));

    api.getLostFound.mockResolvedValueOnce(fail);
    dispatch = vi.fn();
    expect(await A.asyncSetLostFound(1)(dispatch)).toBe(false);
    expect(dispatch).toHaveBeenCalledWith(A.setLostFoundActionCreator(null));
  });

  it("asyncSetIsLostFoundAdd sukses & gagal", async () => {
    api.postLostFound.mockResolvedValueOnce(ok);
    let dispatch = vi.fn();
    expect(await A.asyncSetIsLostFoundAdd({ title: "t", description: "d", status: "lost" })(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(A.setIsLostFoundAddedActionCreator(true));
    expect(showSuccessDialog).toHaveBeenCalledWith("ok");

    api.postLostFound.mockResolvedValueOnce(fail);
    dispatch = vi.fn();
    expect(await A.asyncSetIsLostFoundAdd({ title: "t", description: "d", status: "lost" })(dispatch)).toBe(false);
  });

  it("asyncSetIsLostFoundChange sukses & gagal", async () => {
    const data = { title: "t", description: "d", status: "lost", isCompleted: true };
    api.putLostFound.mockResolvedValueOnce(ok);
    let dispatch = vi.fn();
    expect(await A.asyncSetIsLostFoundChange(1, data)(dispatch)).toBe(true);
    expect(api.putLostFound).toHaveBeenCalledWith(1, data);
    expect(dispatch).toHaveBeenCalledWith(A.setIsLostFoundChangedActionCreator(true));

    api.putLostFound.mockResolvedValueOnce(fail);
    dispatch = vi.fn();
    expect(await A.asyncSetIsLostFoundChange(1, data)(dispatch)).toBe(false);
  });

  it("asyncSetIsLostFoundChangeCover sukses & gagal", async () => {
    api.postLostFoundCover.mockResolvedValueOnce(ok);
    let dispatch = vi.fn();
    expect(await A.asyncSetIsLostFoundChangeCover(1, "f")(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(A.setIsLostFoundChangedCoverActionCreator(true));

    api.postLostFoundCover.mockResolvedValueOnce(fail);
    dispatch = vi.fn();
    expect(await A.asyncSetIsLostFoundChangeCover(1, "f")(dispatch)).toBe(false);
  });

  it("asyncSetIsLostFoundDelete: batal, sukses, gagal", async () => {
    showConfirmDialog.mockResolvedValueOnce(false);
    let dispatch = vi.fn();
    expect(await A.asyncSetIsLostFoundDelete(1)(dispatch)).toBe(false);
    expect(api.deleteLostFound).not.toHaveBeenCalled();

    showConfirmDialog.mockResolvedValueOnce(true);
    api.deleteLostFound.mockResolvedValueOnce(ok);
    dispatch = vi.fn();
    expect(await A.asyncSetIsLostFoundDelete(1)(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(A.setIsLostFoundDeletedActionCreator(true));

    showConfirmDialog.mockResolvedValueOnce(true);
    api.deleteLostFound.mockResolvedValueOnce(fail);
    dispatch = vi.fn();
    expect(await A.asyncSetIsLostFoundDelete(1)(dispatch)).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("gagal");
  });

  it("asyncSetLostFoundStats: sukses, daily gagal, monthly gagal", async () => {
    api.getStatsDaily.mockResolvedValueOnce({ success: true, data: { d: 1 } });
    api.getStatsMonthly.mockResolvedValueOnce({ success: true, data: { m: 1 } });
    let dispatch = vi.fn();
    expect(await A.asyncSetLostFoundStats()(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(
      A.setLostFoundStatsActionCreator({ daily: { d: 1 }, monthly: { m: 1 } })
    );

    api.getStatsDaily.mockResolvedValueOnce({ success: false, message: "daily gagal" });
    api.getStatsMonthly.mockResolvedValueOnce({ success: true, data: {} });
    dispatch = vi.fn();
    expect(await A.asyncSetLostFoundStats()(dispatch)).toBe(false);
    expect(showErrorDialog).toHaveBeenLastCalledWith("daily gagal");

    api.getStatsDaily.mockResolvedValueOnce({ success: true, data: {} });
    api.getStatsMonthly.mockResolvedValueOnce({ success: false, message: "monthly gagal" });
    dispatch = vi.fn();
    expect(await A.asyncSetLostFoundStats()(dispatch)).toBe(false);
    expect(showErrorDialog).toHaveBeenLastCalledWith("monthly gagal");
  });
});
