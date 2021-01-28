import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { Empty, Layout } from 'antd';
import empty from '@/assets/item_empty.svg';
import RuleTypeTree from './components/RuleTypeTree';
import styles from './index.less';

const { Sider, Content } = Layout;

@connect(({ ruleType, loading }) => ({
  ruleType,
  loading,
}))
class RuleDefinition extends Component {
  reloadData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleType/getRuleTypes',
    });
  };

  saveRuleType = (data, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleType/saveRuleType',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          callback();
          this.reloadData();
        }
      },
    });
  };

  delRuleType = (id, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleType/delRuleType',
      payload: {
        id,
      },
      callback: res => {
        if (res.success) {
          callback();
          this.reloadData();
        }
      },
    });
  };

  handlerNodeSelect = selectedRuleType => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleType/updateState',
      payload: {
        selectedRuleType,
      },
    });
  };

  render() {
    const { loading, ruleType } = this.props;
    const { selectedRuleType, ruleTypeData } = ruleType;
    const ruleTypeTreeProps = {
      ruleTypeData,
      currentNode: selectedRuleType,
      onNodeSelect: this.handlerNodeSelect,
      loading: loading.effects['ruleType/getRuleTypes'],
      save: this.saveRuleType,
      saving: loading.effects['ruleType/saveRuleType'],
      del: this.delRuleType,
      deleting: loading.effects['ruleType/delRuleType'],
    };
    return (
      <div className={cls(styles['container-box'])}>
        <Layout className="auto-height">
          <Sider width={320} className={cls('left-content', 'auto-height')} theme="light">
            <RuleTypeTree {...ruleTypeTreeProps} />
          </Sider>
          <Content className={cls('main-content', 'auto-height')} style={{ paddingLeft: 4 }}>
            {selectedRuleType ? null : (
              <div className="blank-empty">
                <Empty image={empty} description="选择规则类型进行规则定义" />
              </div>
            )}
          </Content>
        </Layout>
      </div>
    );
  }
}

export default RuleDefinition;
