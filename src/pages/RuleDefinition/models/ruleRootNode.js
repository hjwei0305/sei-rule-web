import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import { saveRuleRootNode, delRule, saveCopyRule } from '../services/ruleRootNode';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'ruleRootNode',

  state: {
    currentRuleType: null,
    currentRuleRoot: null,
    showModal: false,
    showCopyModal: false,
    showRuleLegend: false,
    showRuleTest: false,
    matchedNodeIds: null,
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
            currentRuleRoot: null,
          },
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *saveCopyRule({ payload, callback }, { call, put }) {
      const re = yield call(saveCopyRule, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
        yield put({
          type: 'updateState',
          payload: {
            showCopyModal: false,
            currentRuleRoot: null,
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
            currentRuleRoot: null,
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
