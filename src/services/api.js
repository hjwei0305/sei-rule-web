import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;
const { SERVER_PATH } = constants;

/** 登录 */
export async function login(params) {
  const url = `${SERVER_PATH}/sei-auth/auth/login`;
  return request({
    url,
    method: 'POST',
    headers: {
      needToken: false,
    },
    data: params,
  });
}

/** 退出 */
export async function logout(params) {
  const url = `${SERVER_PATH}/sei-auth/auth/logout`;
  return request({
    url,
    method: 'POST',
    headers: {
      needToken: false,
    },
    data: params,
  });
}

/** 获取当前用户有权限的功能项集合 */
export async function getAuthorizedFeatures(userId) {
  const url = `${SERVER_PATH}/sei-auth/auth/getAuthorizedFeatures`;
  return request({
    url,
    params: { userId },
  });
}

/** 获取验证码 */
export async function getVerifyCode(reqId) {
  const url = `${SERVER_PATH}/sei-auth/verifyCode/generate?reqId=${reqId}`;
  return request({
    url,
    headers: {
      needToken: false,
    },
  });
}
