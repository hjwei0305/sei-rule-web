import { formatMessage } from 'umi-plugin-react/locale';
import { get } from 'lodash';
import { utils, message } from 'suid';
import { getRuleTypeNodes, saveRuleNode, delRuleNode } from '../services/ruleLegend';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'ruleLegend',

  state: {
    ruleType: null,
    ruleTypeNodes: {},
    nodeData: null,
    showNodeFormDrawer: false,
    onlyView: false,
    needReload: false,
  },
  effects: {
    *getRuleTypeNodes({ payload }, { call, put }) {
      const { ruleType, ruleRoot = null } = payload;
      if (ruleType) {
        yield put({
          type: 'updateState',
          payload: {
            ruleType,
            nodeData: null,
          },
        });
        const ruleRootId = get(ruleRoot, 'id');
        if (ruleRootId) {
          const re = yield call(getRuleTypeNodes, { rootNodeId: ruleRootId });
          message.destroy();
          if (re.success) {
            yield put({
              type: 'updateState',
              payload: {
                ruleTypeNodes: re.data,
              },
            });
          } else {
            message.error(re.message);
          }
        }
      }
    },
    *saveRuleNode({ payload, callback }, { call, put }) {
      const re = yield call(saveRuleNode, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
        const nodeData = re.data;
        if (nodeData && nodeData.parentId === null) {
          yield put({
            type: 'updateState',
            payload: {
              needReload: true,
            },
          });
          yield put({
            type: 'ruleRootNode/updateState',
            payload: {
              currentRuleRoot: re.data,
            },
          });
        }
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *delRuleNode({ payload, callback }, { call, put, select }) {
      const { needReload: originNeedReload } = yield select(sel => sel.ruleLegend);
      const { nodeData } = payload;
      const re = yield call(delRuleNode, { id: get(nodeData, 'id') });
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.delete-success', defaultMessage: '删除成功' }));
        let needReload = originNeedReload;
        if (nodeData && nodeData.parentId === null) {
          needReload = true;
        }
        yield put({
          type: 'updateState',
          payload: {
            nodeData: null,
            needReload,
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
