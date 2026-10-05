import { ActionType } from "./action";

export function lostFoundsReducer(lostFounds = [], action = {}) {
  if (action.type === ActionType.SET_LOST_FOUNDS) {
    return action.payload.lostFounds;
  }
  return lostFounds;
}

export function lostFoundReducer(lostFound = null, action = {}) {
  if (action.type === ActionType.SET_LOST_FOUND) {
    return action.payload.lostFound;
  }
  return lostFound;
}

function createStatusReducer(actionType) {
  return (status = false, action = {}) =>
    action.type === actionType ? action.payload.status : status;
}

export const isLostFoundReducer = createStatusReducer(
  ActionType.SET_IS_LOST_FOUND
);
export const isLostFoundAddReducer = createStatusReducer(
  ActionType.SET_IS_LOST_FOUND_ADD
);
export const isLostFoundAddedReducer = createStatusReducer(
  ActionType.SET_IS_LOST_FOUND_ADDED
);
export const isLostFoundChangeReducer = createStatusReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGE
);
export const isLostFoundChangedReducer = createStatusReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGED
);
export const isLostFoundChangeCoverReducer = createStatusReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGE_COVER
);
export const isLostFoundChangedCoverReducer = createStatusReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGED_COVER
);
export const isLostFoundDeleteReducer = createStatusReducer(
  ActionType.SET_IS_LOST_FOUND_DELETE
);
export const isLostFoundDeletedReducer = createStatusReducer(
  ActionType.SET_IS_LOST_FOUND_DELETED
);

export function lostFoundStatsReducer(stats = null, action = {}) {
  if (action.type === ActionType.SET_LOST_FOUND_STATS) {
    return action.payload.stats;
  }
  return stats;
}
