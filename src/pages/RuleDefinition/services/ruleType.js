import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 获取规则类型树 */
export async function getRuleTypes() {
  const url = `${SERVER_PATH}/sei-rule/ruleType/getRuleTypeTrees`;
  return request({
    url,
  });
}

/** 保存 */
export async function saveRuleType(data) {
  const url = `${SERVER_PATH}/sei-rule/ruleType/save`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 删除 */
export async function delRuleType(data) {
  const url = `${SERVER_PATH}/sei-rule/ruleType/delete/${data.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}
