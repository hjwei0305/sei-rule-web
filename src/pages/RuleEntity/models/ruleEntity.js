import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import { delRuleEntityType, saveRuleEntityType } from '../services/ruleEntity';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'ruleEntity',

  state: {
    currentRuleEntityType: null,
    selectedRuleEntityType: null,
    showRuleEntityTypeFormModal: false,
    currentTabKey: 'ruleAttribute',
  },
  effects: {
    *saveRuleEntityType({ payload, callback }, { call, put }) {
      const re = yield call(saveRuleEntityType, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
        yield put({
          type: 'updateState',
          payload: {
            selectedRuleEntityType: re.data,
          },
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *delRuleEntityType({ payload, callback }, { call, put }) {
      const re = yield call(delRuleEntityType, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.delete-success', defaultMessage: '删除成功' }));
        yield put({
          type: 'updateState',
          payload: {
            currentRuleEntityType: null,
            selectedRuleEntityType: null,
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
