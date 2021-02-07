import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/**
 * 获取规则类型的规则树
 * @rootNodeId string
 */
export async function getRuleTypeNodes(params) {
  const url = `${SERVER_PATH}/sei-rule/ruleTreeNode/getRuleTree`;
  return request({
    url,
    params,
  });
}

/**
 * 获取规则类型的规则树
 * @nodeId string
 */
export async function getNodeSynthesisExpressions(params) {
  const url = `${SERVER_PATH}/sei-rule/ruleTreeNode/getNodeSynthesisExpressions`;
  return request({
    url,
    params,
  });
}

/** 保存规则节点信息 */
export async function saveRuleNode(data) {
  const url = `${SERVER_PATH}/sei-rule/ruleTreeNode/save`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 删除 */
export async function delRuleNode(data) {
  const url = `${SERVER_PATH}/sei-rule/ruleTreeNode/deleteNode/${data.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}
