import lostFoundApi from "../api/lostFoundApi";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

export const ActionType = {
  SET_LOST_FOUNDS: "SET_LOST_FOUNDS",
  SET_LOST_FOUND: "SET_LOST_FOUND",
  SET_IS_LOST_FOUND: "SET_IS_LOST_FOUND",
  SET_IS_LOST_FOUND_ADD: "SET_IS_LOST_FOUND_ADD",
  SET_IS_LOST_FOUND_ADDED: "SET_IS_LOST_FOUND_ADDED",
  SET_IS_LOST_FOUND_CHANGE: "SET_IS_LOST_FOUND_CHANGE",
  SET_IS_LOST_FOUND_CHANGED: "SET_IS_LOST_FOUND_CHANGED",
  SET_IS_LOST_FOUND_CHANGE_COVER: "SET_IS_LOST_FOUND_CHANGE_COVER",
  SET_IS_LOST_FOUND_CHANGED_COVER: "SET_IS_LOST_FOUND_CHANGED_COVER",
  SET_IS_LOST_FOUND_DELETE: "SET_IS_LOST_FOUND_DELETE",
  SET_IS_LOST_FOUND_DELETED: "SET_IS_LOST_FOUND_DELETED",
  SET_LOST_FOUND_STATS: "SET_LOST_FOUND_STATS",
};

export function setLostFoundsActionCreator(lostFounds) {
  return { type: ActionType.SET_LOST_FOUNDS, payload: { lostFounds } };
}

export function setLostFoundActionCreator(lostFound) {
  return { type: ActionType.SET_LOST_FOUND, payload: { lostFound } };
}

export function setIsLostFoundActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND, payload: { status } };
}

export function setIsLostFoundAddActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND_ADD, payload: { status } };
}

export function setIsLostFoundAddedActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND_ADDED, payload: { status } };
}

export function setIsLostFoundChangeActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND_CHANGE, payload: { status } };
}

export function setIsLostFoundChangedActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND_CHANGED, payload: { status } };
}

export function setIsLostFoundChangeCoverActionCreator(status) {
  return {
    type: ActionType.SET_IS_LOST_FOUND_CHANGE_COVER,
    payload: { status },
  };
}

export function setIsLostFoundChangedCoverActionCreator(status) {
  return {
    type: ActionType.SET_IS_LOST_FOUND_CHANGED_COVER,
    payload: { status },
  };
}

export function setIsLostFoundDeleteActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND_DELETE, payload: { status } };
}

export function setIsLostFoundDeletedActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND_DELETED, payload: { status } };
}

export function setLostFoundStatsActionCreator(stats) {
  return { type: ActionType.SET_LOST_FOUND_STATS, payload: { stats } };
}

export function asyncSetLostFounds(filter = {}) {
  return async (dispatch) => {
    dispatch(setIsLostFoundActionCreator(true));
    const result = await lostFoundApi.getLostFounds(filter);
    dispatch(setIsLostFoundActionCreator(false));

    if (!result.success) {
      showErrorDialog(result.message);
      return false;
    }

    dispatch(setLostFoundsActionCreator(result.data.lost_founds));
    return true;
  };
}

export function asyncSetLostFound(id) {
  return async (dispatch) => {
    dispatch(setIsLostFoundActionCreator(true));
    const result = await lostFoundApi.getLostFound(id);
    dispatch(setIsLostFoundActionCreator(false));

    if (!result.success) {
      dispatch(setLostFoundActionCreator(null));
      showErrorDialog(result.message);
      return false;
    }

    dispatch(setLostFoundActionCreator(result.data.lost_found));
    return true;
  };
}

export function asyncSetIsLostFoundAdd({ title, description, status }) {
  return async (dispatch) => {
    dispatch(setIsLostFoundAddedActionCreator(false));
    dispatch(setIsLostFoundAddActionCreator(true));
    const result = await lostFoundApi.postLostFound({
      title,
      description,
      status,
    });
    dispatch(setIsLostFoundAddActionCreator(false));

    if (!result.success) {
      showErrorDialog(result.message);
      return false;
    }

    dispatch(setIsLostFoundAddedActionCreator(true));
    showSuccessDialog(result.message);
    return true;
  };
}

export function asyncSetIsLostFoundChange(
  id,
  { title, description, status, isCompleted }
) {
  return async (dispatch) => {
    dispatch(setIsLostFoundChangedActionCreator(false));
    dispatch(setIsLostFoundChangeActionCreator(true));
    const result = await lostFoundApi.putLostFound(id, {
      title,
      description,
      status,
      isCompleted,
    });
    dispatch(setIsLostFoundChangeActionCreator(false));

    if (!result.success) {
      showErrorDialog(result.message);
      return false;
    }

    dispatch(setIsLostFoundChangedActionCreator(true));
    showSuccessDialog(result.message);
    return true;
  };
}

export function asyncSetIsLostFoundChangeCover(id, file) {
  return async (dispatch) => {
    dispatch(setIsLostFoundChangedCoverActionCreator(false));
    dispatch(setIsLostFoundChangeCoverActionCreator(true));
    const result = await lostFoundApi.postLostFoundCover(id, file);
    dispatch(setIsLostFoundChangeCoverActionCreator(false));

    if (!result.success) {
      showErrorDialog(result.message);
      return false;
    }

    dispatch(setIsLostFoundChangedCoverActionCreator(true));
    showSuccessDialog(result.message);
    return true;
  };
}

export function asyncSetIsLostFoundDelete(id) {
  return async (dispatch) => {
    const confirmed = await showConfirmDialog(
      "Laporan yang dihapus tidak dapat dikembalikan.",
      "Ya, hapus"
    );
    if (!confirmed) {
      return false;
    }

    dispatch(setIsLostFoundDeletedActionCreator(false));
    dispatch(setIsLostFoundDeleteActionCreator(true));
    const result = await lostFoundApi.deleteLostFound(id);
    dispatch(setIsLostFoundDeleteActionCreator(false));

    if (!result.success) {
      showErrorDialog(result.message);
      return false;
    }

    dispatch(setIsLostFoundDeletedActionCreator(true));
    showSuccessDialog(result.message);
    return true;
  };
}

export function asyncSetLostFoundStats() {
  return async (dispatch) => {
    const [daily, monthly] = await Promise.all([
      lostFoundApi.getStatsDaily(),
      lostFoundApi.getStatsMonthly(),
    ]);

    if (!daily.success || !monthly.success) {
      showErrorDialog((!daily.success ? daily : monthly).message);
      return false;
    }

    dispatch(
      setLostFoundStatsActionCreator({
        daily: daily.data,
        monthly: monthly.data,
      })
    );
    return true;
  };
}
