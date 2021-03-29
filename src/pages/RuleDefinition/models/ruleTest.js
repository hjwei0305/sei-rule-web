import { utils, message } from 'suid';
import { ruleTestRun } from '../services/ruleTest';

const { dvaModel, getUUID } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'ruleTestRun',

  state: {
    ruleTestResult: null,
    error: null,
  },
  effects: {
    *ruleTestStartRun({ payload, callback }, { call, put }) {
      message.destroy();
      const messageKey = getUUID();
      message.loading({ content: '测试正在进行...', key: messageKey });
      const re = yield call(ruleTestRun, payload);
      let ruleTestResult = null;
      let error = null;
      if (re.success) {
        message.success({ content: '测试运行完成,请查看测试结果', key: messageKey });
        ruleTestResult = re.data;
      } else {
        message.destroy();
        error = re.message;
      }
      yield put({
        type: 'updateState',
        payload: {
          ruleTestResult,
          error,
        },
      });
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
  },
});
