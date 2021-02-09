import { utils, message } from 'suid';
import { ruleTestRun } from '../services/ruleTest';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'ruleTestRun',

  state: {
    ruleTestResult: null,
  },
  effects: {
    *ruleTestStartRun({ payload, callback }, { call, put }) {
      const re = yield call(ruleTestRun, payload);
      message.destroy();
      if (re.success) {
        message.success('运行测试代码成功');
        yield put({
          type: 'updateState',
          payload: {
            ruleTestResult: re.data,
          },
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
  },
});
