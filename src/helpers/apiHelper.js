const ACCESS_TOKEN_KEY = "accessToken";

/* global DELCOM_BASEURL */
export const BASE_URL = DELCOM_BASEURL;

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function putAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

/**
 * Menentukan berhasil/tidaknya sebuah respons API.
 * Mendukung { success: boolean }, { status: "success" | "fail" },
 * dan sebagai cadangan memakai status HTTP (response.ok).
 */
function isSuccess(body, response) {
  if (typeof body.success === "boolean") return body.success;
  if (typeof body.status === "string") {
    return body.status.toLowerCase() === "success";
  }
  return response.ok;
}

/**
 * Wrapper fetch ke REST API Delcom.
 * - params   : query string
 * - body     : objek -> application/x-www-form-urlencoded
 * - formData : FormData -> multipart/form-data
 * - auth     : sertakan Authorization: Bearer <token> (default true)
 * Selalu mengembalikan { success, message, data }.
 */
export async function apiFetch(
  path,
  { method = "GET", params, body, formData, auth = true } = {}
) {
  const headers = {};

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const options = { method, headers };

  if (formData) {
    options.body = formData;
  } else if (body) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = new URLSearchParams(body).toString();
  }

  try {
    const response = await fetch(
      `${BASE_URL}${path}${buildQuery(params)}`,
      options
    );
    const body = await response.json();
    return { ...body, success: isSuccess(body, response) };
  } catch (error) {
    return { success: false, message: error.message, data: null };
  }
}
