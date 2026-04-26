// src/utils/cookie.js
import Cookies from "js-cookie";

export const getCookie = (key) => {
  return Cookies.get(key);
};

export const setCookie = (key, value, expireDays) => {
  if (!value) {
    Cookies.remove(key, { path: "/" });
  } else {
    Cookies.set(key, value, { expires: expireDays, path: "/" });
  }
};

export const removeCookie = (key) => {
  Cookies.remove(key, { path: "/" });
};