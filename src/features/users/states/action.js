import userApi from "../api/userApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

export const ActionType = {
  SET_USERS: "SET_USERS",
  SET_USER: "SET_USER",
  SET_PROFILE: "SET_PROFILE",
  SET_IS_PROFILE: "SET_IS_PROFILE",
  SET_IS_CHANGE_PROFILE: "SET_IS_CHANGE_PROFILE",
  SET_IS_CHANGE_PROFILE_PHOTO: "SET_IS_CHANGE_PROFILE_PHOTO",
  SET_IS_CHANGE_PROFILE_PASSWORD: "SET_IS_CHANGE_PROFILE_PASSWORD",
};

export function setUsersActionCreator(users) {
  return { type: ActionType.SET_USERS, payload: { users } };
}

export function setUserActionCreator(user) {
  return { type: ActionType.SET_USER, payload: { user } };
}

export function setProfileActionCreator(profile) {
  return { type: ActionType.SET_PROFILE, payload: { profile } };
}

export function setIsProfileActionCreator(status) {
  return { type: ActionType.SET_IS_PROFILE, payload: { status } };
}

export function setIsChangeProfileActionCreator(status) {
  return { type: ActionType.SET_IS_CHANGE_PROFILE, payload: { status } };
}

export function setIsChangeProfilePhotoActionCreator(status) {
  return { type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO, payload: { status } };
}

export function setIsChangeProfilePasswordActionCreator(status) {
  return {
    type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD,
    payload: { status },
  };
}

export function asyncSetUsers() {
  return async (dispatch) => {
    const result = await userApi.getUsers();

    if (!result.success) {
      showErrorDialog(result.message);
      return false;
    }

    dispatch(setUsersActionCreator(result.data.users));
    return true;
  };
}

export function asyncSetProfile() {
  return async (dispatch) => {
    dispatch(setIsProfileActionCreator(false));
    const result = await userApi.getMe();

    if (!result.success) {
      dispatch(setProfileActionCreator(null));
      return false;
    }

    dispatch(setProfileActionCreator(result.data.user));
    dispatch(setIsProfileActionCreator(true));
    return true;
  };
}

export function asyncSetIsChangeProfile({ name, email }) {
  return async (dispatch) => {
    dispatch(setIsChangeProfileActionCreator(true));
    const result = await userApi.putMe({ name, email });
    dispatch(setIsChangeProfileActionCreator(false));

    if (!result.success) {
      showErrorDialog(result.message);
      return false;
    }

    await dispatch(asyncSetProfile());
    showSuccessDialog(result.message);
    return true;
  };
}

export function asyncSetIsChangeProfilePhoto(file) {
  return async (dispatch) => {
    dispatch(setIsChangeProfilePhotoActionCreator(true));
    const result = await userApi.postMePhoto(file);
    dispatch(setIsChangeProfilePhotoActionCreator(false));

    if (!result.success) {
      showErrorDialog(result.message);
      return false;
    }

    await dispatch(asyncSetProfile());
    showSuccessDialog(result.message);
    return true;
  };
}

export function asyncSetIsChangeProfilePassword({ password, newPassword }) {
  return async (dispatch) => {
    dispatch(setIsChangeProfilePasswordActionCreator(true));
    const result = await userApi.putMePassword({ password, newPassword });
    dispatch(setIsChangeProfilePasswordActionCreator(false));

    if (!result.success) {
      showErrorDialog(result.message);
      return false;
    }

    showSuccessDialog(result.message);
    return true;
  };
}
