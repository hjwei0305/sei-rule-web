import { notification } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';

export default {
  onError(err, action, ...rest) {
    err.preventDefault();
    if (err.statusCode === 401) {
      // 401 触发登录只在本地开发时生效，线上环境401登录委托给主应用
      if (process.env.NODE_ENV !== 'production') {
        window.g_app._store.dispatch({
          type: 'global/redirectLogin',
          payload: {
            status: 401,
          },
        });
        notification.error({
          message: formatMessage({ id: 'app.request.401', defaultMessage: '会话异常' }),
          description: formatMessage({
            id: 'app.request.401.message',
            defaultMessage: '当前会话超时或失效，请重新登录',
          }),
        });
      }
    } else {
      const [{ effectArgs }] = rest;
      if (effectArgs.length > 0) {
        const { callback } = effectArgs[0];
        if (callback && callback instanceof Function) {
          callback({ success: false });
        }
      }
      if (err.statusCode === -1) {
        notification.info({
          message: formatMessage({ id: 'app.request.info', defaultMessage: '接口请求提示' }),
          description: err.message,
        });
      } else {
        notification.error({
          message: formatMessage({ id: 'app.request.error', defaultMessage: '请求错误' }),
          description: err.message,
        });
      }
    }
  },
};
