import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { formatMessage } from 'umi-plugin-react/locale';
import { Empty, Input, Popconfirm, Layout, Button } from 'antd';
import { ListCard, ExtIcon } from 'suid';
import empty from '@/assets/item_empty.svg';
import { constants } from '@/utils';
import FormModal from './FormModal';
import RuleDefinition from './components/RuleDefinition';
import styles from './index.less';

const { Search } = Input;
const { Sider, Content } = Layout;
const { SERVER_PATH } = constants;

@connect(({ ruleEntity, loading }) => ({
  ruleEntity,
  loading,
}))
class RuleEntity extends Component {
  static listCardRef = null;

  constructor(props) {
    super(props);
    this.state = {
      delId: null,
    };
  }

  reloadData = () => {
    if (this.listCardRef) {
      this.listCardRef.remoteDataRefresh();
    }
  };

  add = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleEntity/updateState',
      payload: {
        showRuleEntityTypeFormModal: true,
        currentRuleEntityType: null,
      },
    });
  };

  edit = (currentRuleEntityType, e) => {
    e.stopPropagation();
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleEntity/updateState',
      payload: {
        showRuleEntityTypeFormModal: true,
        currentRuleEntityType,
      },
    });
  };

  closeRuleEntityTypeFormModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleEntity/updateState',
      payload: {
        showRuleEntityTypeFormModal: false,
        currentRuleEntityType: null,
      },
    });
  };

  handlerRuleEntityTypeSelect = (keys, items) => {
    const { dispatch } = this.props;
    const selectedRuleEntityType = keys.length === 1 ? items[0] : null;
    dispatch({
      type: 'ruleEntity/updateState',
      payload: {
        selectedRuleEntityType,
      },
    });
  };

  saveRuleEntityType = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleEntity/saveRuleEntityType',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          this.closeRuleEntityTypeFormModal();
          this.reloadData();
        }
      },
    });
  };

  delRuleEntityType = (data, e) => {
    e.stopPropagation();
    const { dispatch } = this.props;
    this.setState(
      {
        delId: data.id,
      },
      () => {
        dispatch({
          type: 'ruleEntity/delRuleEntityType',
          payload: {
            id: data.id,
          },
          callback: res => {
            if (res.success) {
              this.setState({
                delId: null,
              });
              this.reloadData();
            }
          },
        });
      },
    );
  };

  handlerTabChange = currentTabKey => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleEntity/updateState',
      payload: {
        currentTabKey,
      },
    });
  };

  handlerSearchChange = v => {
    this.listCardRef.handlerSearchChange(v);
  };

  handlerPressEnter = () => {
    this.listCardRef.handlerPressEnter();
  };

  handlerSearch = v => {
    this.listCardRef.handlerSearch(v);
  };

  renderCustomTool = () => (
    <>
      <Search
        allowClear
        placeholder="输入名称关键字查询"
        onChange={e => this.handlerSearchChange(e.target.value)}
        onSearch={this.handlerSearch}
        onPressEnter={this.handlerPressEnter}
        style={{ width: '100%' }}
      />
    </>
  );

  renderItemAction = item => {
    const { loading } = this.props;
    const { delId } = this.state;
    return (
      <>
        <div className="tool-action" onClick={e => e.stopPropagation()}>
          <ExtIcon
            className={cls('action-item')}
            type="edit"
            antd
            onClick={e => this.edit(item, e)}
          />
          <Popconfirm
            title={formatMessage({ id: 'global.delete.confirm', defaultMessage: '确定要删除吗?' })}
            onConfirm={e => this.delRuleEntityType(item, e)}
          >
            {loading.effects['ruleEntity/delRuleEntityType'] && delId === item.id ? (
              <ExtIcon className={cls('del', 'action-item')} type="loading" antd />
            ) : (
              <ExtIcon className={cls('del', 'action-item')} type="delete" antd />
            )}
          </Popconfirm>
        </div>
      </>
    );
  };

  render() {
    const { loading, ruleEntity } = this.props;
    const {
      currentRuleEntityType,
      selectedRuleEntityType,
      showRuleEntityTypeFormModal,
      currentTabKey,
    } = ruleEntity;
    const selectedKeys = selectedRuleEntityType ? [selectedRuleEntityType.id] : [];
    const ruleEntityTypeProps = {
      className: 'left-content',
      title: '规则业务实体列表',
      showSearch: false,
      onSelectChange: this.handlerRuleEntityTypeSelect,
      customTool: this.renderCustomTool,
      onListCardRef: ref => (this.listCardRef = ref),
      selectedKeys,
      itemField: {
        title: item => item.name,
        description: item => item.code,
      },
      store: {
        url: `${SERVER_PATH}/sei-rule/ruleEntityType/findAll`,
      },
      extra: (
        <Button type="link" icon="plus" onClick={this.add}>
          新建
        </Button>
      ),
      itemTool: this.renderItemAction,
    };
    const formModalProps = {
      save: this.saveRuleEntityType,
      currentRuleEntityType,
      showRuleEntityTypeFormModal,
      closeRuleEntityTypeFormModal: this.closeRuleEntityTypeFormModal,
      saving: loading.effects['ruleEntity/saveRuleEntityType'],
    };
    const ruleDefinitionProps = {
      selectedRuleEntityType,
      currentTabKey,
      onTabChange: this.handlerTabChange,
    };
    return (
      <div className={cls(styles['container-box'])}>
        <Layout className="auto-height">
          <Sider width={320} className={cls('left-content', 'auto-height')} theme="light">
            <ListCard {...ruleEntityTypeProps} />
          </Sider>
          <Content className={cls('main-content', 'auto-height')} style={{ paddingLeft: 4 }}>
            {selectedRuleEntityType ? (
              <RuleDefinition {...ruleDefinitionProps} />
            ) : (
              <div className="blank-empty">
                <Empty image={empty} description="选择规则业务实体列表项进行配置" />
              </div>
            )}
          </Content>
        </Layout>
        <FormModal {...formModalProps} />
      </div>
    );
  }
}

export default RuleEntity;
