/*
 * @Author: zp
 * @Date:   2020-02-17 09:41:03
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-26 14:21:07
 */
import { utils } from 'suid';

const { getContextUser, storage } = utils;
const { sessionStorage, localStorage } = storage;
const { CONST_GLOBAL } = utils.constants;
const { CURRENT_USER, TOKEN_KEY, CURRENT_LOCALE, AUTH, POLICY } = CONST_GLOBAL;

/** 用户信息保存到session */
export const setCurrentUser = user => {
  sessionStorage.set(CURRENT_USER, user);
};

/** 获取当前用户信息 */
export const getCurrentUser = () => getContextUser();

export const getCurrentLocale = () => localStorage.get(CURRENT_LOCALE);

export const setCurrentAuth = auths => sessionStorage.set(AUTH, auths);
export const setCurrentPolicy = policy => sessionStorage.set(POLICY, policy);

export const setCurrentLocale = locale => {
  localStorage.set(CURRENT_LOCALE, locale);
};

/** sid保存到session */
export const setSessionId = sid => {
  sessionStorage.set(TOKEN_KEY, sid);
};

/** 获取当前sid */
export const getSessionId = () => sessionStorage.get(TOKEN_KEY);

/** 根据键清空 */
export const clearUserInfo = () => sessionStorage.clear([CURRENT_USER, TOKEN_KEY]);
