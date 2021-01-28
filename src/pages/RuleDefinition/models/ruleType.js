import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import { delRuleType, saveRuleType, getRuleTypes } from '../services/ruleType';

const { dvaModel, pathMatchRegexp } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'ruleType',

  state: {
    currentRuleType: null,
    selectedRuleType: null,
    showRuleTypeFormModal: false,
    ruleTypeData: [],
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/rule/definition', location.pathname)) {
          dispatch({
            type: 'getRuleTypes',
          });
        }
      });
    },
  },
  effects: {
    *getRuleTypes({ payload, callback }, { call, put }) {
      const re = yield call(getRuleTypes, payload);
      message.destroy();
      if (re.success) {
        yield put({
          type: 'updateState',
          payload: {
            ruleTypeData: re.data,
          },
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *saveRuleType({ payload, callback }, { call, put }) {
      const re = yield call(saveRuleType, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
        yield put({
          type: 'updateState',
          payload: {
            currentRuleType: re.data,
          },
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *delRuleType({ payload, callback }, { call, put }) {
      const re = yield call(delRuleType, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.delete-success', defaultMessage: '删除成功' }));
        yield put({
          type: 'updateState',
          payload: {
            selectedRuleType: null,
            currentRuleType: null,
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
