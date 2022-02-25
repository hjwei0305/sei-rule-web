import {cloneDeep} from 'lodash';
import {utils, message} from 'suid';
import {getInitializeTasks, performTask} from './service';

const {dvaModel, pathMatchRegexp} = utils;
const {modelExtend, model} = dvaModel;

export default modelExtend(model, {
  namespace: 'initialization',

  state: {
    taskData: [],
    taskIds: []
  },
  subscriptions: {
    setup({dispatch, history}) {
      history.listen(location => {
        if (pathMatchRegexp('/rule/initialization', location.pathname)) {
          dispatch({
            type: 'getInitializeTasks'
          });
        }
      });
    },
  },
  effects: {
    * getInitializeTasks({payload, callback}, {call, put}) {
      const re = yield call(getInitializeTasks, payload);
      message.destroy();
      if (re.success) {
        yield put({
          type: 'updateState',
          payload: {
            taskData: re.data,
            taskIds: re.data.map(d => d.id)
          }
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    * performTask({payload, callback}, {call, put, select}) {
      const re = yield call(performTask, payload);
      const {taskData} = yield select(sel => sel.initialization);
      const newTaskData = cloneDeep(taskData);
      newTaskData.forEach(t => {
        if (t.id === payload) {
          Object.assign(t, {
            result: {
              success: re.success,
              message: re.message
            }
          })
        }
      });
      yield put({
        type: 'updateState',
        payload: {
          taskData: newTaskData,
        }
      });
      if (callback && callback instanceof Function) {
        callback(re);
      }
    }
  },
});
