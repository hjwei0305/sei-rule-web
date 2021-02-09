import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import { get, isEqual } from 'lodash';
import cls from 'classnames';
import { Button, Popconfirm } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon, PageLoader } from 'suid';
import { constants } from '@/utils';
import FormModal from './FormModal';
import styles from './index.less';

const RuleLegend = React.lazy(() => import('../RuleLegend'));
const RuleTest = React.lazy(() => import('../RuleTest'));
const { SERVER_PATH } = constants;

@connect(({ ruleRootNode, loading }) => ({ ruleRootNode, loading }))
class RuleRootList extends Component {
  static tablRef;

  constructor(props) {
    super(props);
    this.state = {
      delRowId: null,
    };
  }

  componentDidMount() {
    this.setCurrentRuleType();
  }

  componentDidUpdate(preProps) {
    const { ruleType } = this.props;
    if (!isEqual(preProps.ruleType, ruleType)) {
      this.setCurrentRuleType();
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleRootNode/updateState',
      payload: {
        currentRuleType: null,
        currentRuleRoot: null,
        matchedNodeId: null,
        showModal: false,
        showRuleLegend: false,
        showRuleTest: false,
      },
    });
  }

  setCurrentRuleType = () => {
    const { ruleType, dispatch } = this.props;
    dispatch({
      type: 'ruleRootNode/updateState',
      payload: {
        currentRuleType: ruleType,
      },
    });
  };

  reloadData = () => {
    if (this.tablRef) {
      this.tablRef.remoteDataRefresh();
    }
  };

  add = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleRootNode/updateState',
      payload: {
        showRuleLegend: true,
        currentRuleRoot: null,
      },
    });
  };

  edit = currentRuleRoot => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleRootNode/updateState',
      payload: {
        showRuleLegend: true,
        currentRuleRoot,
      },
    });
  };

  set = currentRuleRoot => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleRootNode/updateState',
      payload: {
        showModal: true,
        currentRuleRoot,
      },
    });
  };

  saveSet = data => {
    const { dispatch, ruleType } = this.props;
    dispatch({
      type: 'ruleRootNode/saveRuleRootNode',
      payload: {
        ruleTypeId: get(ruleType, 'id'),
        ...data,
      },
      callback: res => {
        if (res.success) {
          this.reloadData();
        }
      },
    });
  };

  del = record => {
    const { dispatch } = this.props;
    this.setState(
      {
        delRowId: record.id,
      },
      () => {
        dispatch({
          type: 'ruleRootNode/delRule',
          payload: {
            id: record.id,
          },
          callback: res => {
            if (res.success) {
              this.setState({
                delRowId: null,
              });
              this.reloadData();
            }
          },
        });
      },
    );
  };

  showRuleLegend = (currentRuleRoot, matchedNodeId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleRootNode/updateState',
      payload: {
        showRuleLegend: true,
        matchedNodeId,
        currentRuleRoot,
      },
    });
  };

  closeModal = needReload => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleRootNode/updateState',
      payload: {
        showModal: false,
        currentRuleRoot: null,
        matchedNodeId: null,
        showRuleLegend: false,
      },
    });
    if (needReload) {
      this.reloadData();
    }
  };

  showRuleTest = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleRootNode/updateState',
      payload: {
        showRuleTest: true,
      },
    });
  };

  closeTestModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleRootNode/updateState',
      payload: {
        currentRuleRoot: null,
        matchedNodeId: null,
        showRuleTest: false,
      },
    });
  };

  renderDelBtn = row => {
    const { loading } = this.props;
    const { delRowId } = this.state;
    if (loading.effects['ruleRootNode/delRule'] && delRowId === row.id) {
      return <ExtIcon className="del-loading" type="loading" antd />;
    }
    return <ExtIcon className="del" type="delete" antd />;
  };

  render() {
    const { ruleRootNode, loading, ruleType } = this.props;
    const {
      showModal,
      currentRuleRoot,
      showRuleLegend,
      showRuleTest,
      currentRuleType,
      matchedNodeId,
    } = ruleRootNode;
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 160,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (text, record) => (
          <span className={cls('action-box')}>
            <ExtIcon className="edit" onClick={() => this.edit(record)} type="edit" antd />
            <ExtIcon className="edit" onClick={() => this.set(record)} type="setting" antd />
            <Popconfirm
              placement="topLeft"
              title={formatMessage({
                id: 'global.delete.confirm',
                defaultMessage: '确定要删除吗？提示：删除后不可恢复',
              })}
              onConfirm={() => this.del(record)}
            >
              {this.renderDelBtn(record)}
            </Popconfirm>
          </span>
        ),
      },
      {
        title: '优先级',
        dataIndex: 'rank',
        width: 80,
        align: 'center',
        required: true,
      },
      {
        title: '规则名称',
        dataIndex: 'name',
        width: 380,
        required: true,
      },
      {
        title: '启用',
        dataIndex: 'enabled',
        width: 80,
        required: true,
        align: 'center',
        render: t => {
          let color = '#f5222d';
          let icon = 'close';
          if (t) {
            icon = 'check';
            color = '#52c41a';
          }
          return <ExtIcon type={icon} style={{ color }} antd />;
        },
      },
    ];
    const formModalProps = {
      save: this.saveSet,
      currentRuleRoot,
      showModal,
      closeFormModal: this.closeModal,
      saving: loading.effects['ruleRootNode/saveRuleRootNode'],
    };
    const toolBarProps = {
      left: (
        <>
          <Button type="primary" onClick={this.add} ignore="true">
            <FormattedMessage id="global.add" defaultMessage="新建" />
          </Button>
          <Button onClick={this.showRuleTest}>规则测试</Button>
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </>
      ),
    };
    const tableProps = {
      toolBar: toolBarProps,
      columns,
      lineNumber: false,
      searchWidth: 260,
      searchPlaceHolder: '输入规则名称',
      searchProperties: ['name'],
      onTableRef: ref => (this.tablRef = ref),
      store: {
        url: `${SERVER_PATH}/sei-rule/ruleTreeNode/findRootNodes`,
      },
      cascadeParams: {
        ruleTypeId: get(ruleType, 'id'),
      },
    };
    const ruleLegendProps = {
      ruleRoot: currentRuleRoot,
      ruleType: currentRuleType,
      matchedNodeId,
      closeRuleModal: this.closeModal,
    };
    const ruleTestProps = {
      ruleType: currentRuleType,
      showTest: showRuleTest,
      closeTest: this.closeTestModal,
      showRuleLegend: this.showRuleLegend,
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...tableProps} />
        <FormModal {...formModalProps} />
        {showRuleLegend ? (
          <Suspense fallback={<PageLoader />}>
            <RuleLegend {...ruleLegendProps} />
          </Suspense>
        ) : null}
        {showRuleTest ? (
          <Suspense fallback={<PageLoader />}>
            <RuleTest {...ruleTestProps} />
          </Suspense>
        ) : null}
      </div>
    );
  }
}

export default RuleRootList;
