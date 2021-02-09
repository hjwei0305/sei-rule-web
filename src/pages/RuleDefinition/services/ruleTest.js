import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 开始规则测试 */
export async function ruleTestRun(data) {
  const url = `${SERVER_PATH}/sei-rule/ruleEngine/testRun`;
  return request({
    url,
    method: 'POST',
    data,
  });
}
