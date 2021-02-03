import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import { saveRuleRootNode, delRule } from '../services/ruleRootNode';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'ruleRootNode',

  state: {
    currentRuleType: null,
    currentRuleRoot: null,
    showModal: false,
    showRuleLegend: false,
  },
  effects: {
    *saveRuleRootNode({ payload, callback }, { call, put }) {
      const re = yield call(saveRuleRootNode, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
        yield put({
          type: 'updateState',
          payload: {
            showModal: false,
          },
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *delRule({ payload, callback }, { call, put }) {
      const re = yield call(delRule, payload);
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
