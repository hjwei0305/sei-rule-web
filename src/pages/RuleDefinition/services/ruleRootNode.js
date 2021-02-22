import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 编辑规则的根信息 */
export async function saveRuleRootNode(data) {
  const url = `${SERVER_PATH}/sei-rule/ruleTreeNode/updateRootNode`;
  return request({
    method: 'POST',
    url,
    data,
  });
}

/** 参照新建规则保存 */
export async function saveCopyRule(data) {
  const url = `${SERVER_PATH}/sei-rule/ruleTreeNode/referenceCreate`;
  return request({
    method: 'POST',
    url,
    data,
  });
}

/** 删除规则 */
export async function delRule(data) {
  const url = `${SERVER_PATH}/sei-rule/ruleTreeNode/deleteRuleTree/${data.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}
