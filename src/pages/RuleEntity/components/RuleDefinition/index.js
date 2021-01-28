import React from 'react';
import { get } from 'lodash';
import { Tabs, Card } from 'antd';
import { BannerTitle } from 'suid';
import RuleAttribute from '../../RuleAttribute';
import RuleReturnType from '../../RuleReturnType';
import RuleServiceMethod from '../../RuleServiceMethod';
import RuleComparator from '../../RuleComparator';
import styles from './index.less';

const { TabPane } = Tabs;

const RuleDefinition = ({ selectedRuleEntityType, currentTabKey, onTabChange }) => {
  return (
    <Card
      className={styles['view-box']}
      bordered={false}
      title={<BannerTitle title={get(selectedRuleEntityType, 'name')} subTitle="规则定义" />}
    >
      <Tabs type="card" activeKey={currentTabKey} onChange={onTabChange} animated={false}>
        <TabPane tab="规则属性" key="ruleAttribute" forceRender>
          <RuleAttribute ruleEntityType={selectedRuleEntityType} />
        </TabPane>
        <TabPane tab="返回结果" key="ruleReturnType" forceRender>
          <RuleReturnType ruleEntityType={selectedRuleEntityType} />
        </TabPane>
        <TabPane tab="服务方法" key="ruleServiceMethod" forceRender>
          <RuleServiceMethod ruleEntityType={selectedRuleEntityType} />
        </TabPane>
        <TabPane tab="比较器" key="ruleComparator" forceRender>
          <RuleComparator ruleEntityType={selectedRuleEntityType} />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default RuleDefinition;
