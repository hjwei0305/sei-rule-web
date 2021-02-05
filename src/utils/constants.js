/*
 * @Author: Eason
 * @Date: 2020-02-21 18:03:16
 * @Last Modified by: Eason
 * @Last Modified time: 2021-02-05 14:12:45
 */
import { base } from '../../public/app.config.json';

/** 服务接口基地址，默认是当前站点的域名地址 */
const BASE_DOMAIN = '/';

/** 网关地址 */
const GATEWAY = 'api-gateway';

/**
 * 非生产环境下是使用mocker开发，还是与真实后台开发或联调
 * 注：
 *    yarn start 使用真实后台开发或联调
 *    yarn start:mock 使用mocker数据模拟
 */
const getServerPath = () => {
  if (process.env.NODE_ENV !== 'production') {
    if (process.env.MOCK === 'yes') {
      return '/mocker.api';
    }
    return '/api-gateway';
  }
  return `${BASE_DOMAIN}${GATEWAY}`;
};

/** 项目的站点基地址 */
const APP_BASE = base;

/** 站点的地址，用于获取本站点的静态资源如json文件，xls数据导入模板等等 */
const LOCAL_PATH = process.env.NODE_ENV !== 'production' ? '..' : `../${APP_BASE}`;

const SERVER_PATH = getServerPath();

const LOGIN_STATUS = {
  SUCCESS: 'success',
  MULTI_TENANT: 'multiTenant',
  CAPTCHA_ERROR: 'captchaError',
  FROZEN: 'frozen',
  LOCKED: 'locked',
  FAILURE: 'failure',
};

/** 业务模块功能项示例 */
const APP_MODULE_BTN_KEY = {
  CREATE: `${APP_BASE}_CREATE`,
  EDIT: `${APP_BASE}_EDIT`,
  DELETE: `${APP_BASE}_DELETE`,
};

const ATTRIBUTE_UI_COMPONENT = {
  DATEPICKER: 'DatePicker',
  INPUT: 'Input',
  MONEYINPUT: 'MoneyInput',
  SWITCH: 'Switch',
  COMBOLIST: 'ComboList',
};

export default {
  APP_BASE,
  LOCAL_PATH,
  SERVER_PATH,
  APP_MODULE_BTN_KEY,
  LOGIN_STATUS,
  ATTRIBUTE_UI_COMPONENT,
};
