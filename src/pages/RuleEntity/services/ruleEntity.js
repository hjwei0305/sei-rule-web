import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 保存 */
export async function saveRuleEntityType(data) {
  const url = `${SERVER_PATH}/sei-rule/ruleEntityType/save`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 删除 */
export async function delRuleEntityType(data) {
  const url = `${SERVER_PATH}/sei-rule/ruleEntityType/delete/${data.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}
