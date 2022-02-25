import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;
const { SERVER_PATH } = constants;

/**
 * 获取初始化任务清单
 */
export async function getInitializeTasks() {
  const url = `${SERVER_PATH}/sei-rule/initialize/getInitializeTasks`;
  return request({
    url,
  });
}

/**
 * 执行初始化任务
 * @id string
 */
export async function performTask(id) {
  const url = `${SERVER_PATH}/sei-rule/initialize/performTask/${id}`;
  return request({
    url,
    method: 'POST',
  });
}
