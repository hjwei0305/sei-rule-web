import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import { get, isEqual } from 'lodash';
import cls from 'classnames';
import { Button, Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon, PageLoader } from 'suid';
import { constants } from '@/utils';
import FormModal from './FormModal';
import CopyFormModal from './CopyFormModal';
import ExtAction from './ExtAction';
import styles from './index.less';

const RuleLegend = React.lazy(() => import('../RuleLegend'));
const RuleTest = React.lazy(() => import('../RuleTest'));
const { SERVER_PATH, RULE_LIST_ACTION } = constants;

@connect(({ ruleRootNode, loading }) => ({ ruleRootNode, loading }))
class RuleRootList extends Component {
  static tablRef;

  static confirmModal;

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
        showCopyModal: false,
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

  copyRule = currentRuleRoot => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleRootNode/updateState',
      payload: {
        showCopyModal: true,
        currentRuleRoot,
      },
    });
  };

  saveCopyRule = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleRootNode/saveCopyRule',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          this.reloadData();
        }
      },
    });
  };

  delConfirm = rowData => {
    const { dispatch } = this.props;
    this.confirmModal = Modal.confirm({
      title: `删除确认`,
      content: `提示：规则删除后不可恢复!`,
      okButtonProps: { type: 'primary' },
      style: { top: '20%' },
      okText: '确定',
      onOk: () => {
        return new Promise(resolve => {
          this.confirmModal.update({
            okButtonProps: { type: 'primary', loading: true },
            cancelButtonProps: { disabled: true },
          });
          dispatch({
            type: 'ruleRootNode/delRule',
            payload: {
              id: rowData.id,
            },
            callback: res => {
              if (res.success) {
                resolve();
                this.reloadData();
              } else {
                this.confirmModal.update({
                  okButtonProps: { loading: false },
                  cancelButtonProps: { disabled: false },
                });
              }
            },
          });
        });
      },
      cancelText: '取消',
      onCancel: () => {
        this.confirmModal.destroy();
        this.confirmModal = null;
      },
    });
  };

  showRuleLegend = (currentRuleRoot, matchedNodeIds) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleRootNode/updateState',
      payload: {
        showRuleLegend: true,
        matchedNodeIds,
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
        showCopyModal: false,
        currentRuleRoot: null,
        matchedNodeIds: null,
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

  handlerAction = (key, rowData) => {
    switch (key) {
      case RULE_LIST_ACTION.EDIT:
        this.edit(rowData);
        break;
      case RULE_LIST_ACTION.DELETE:
        this.delConfirm(rowData);
        break;
      case RULE_LIST_ACTION.SETTING:
        this.set(rowData);
        break;
      case RULE_LIST_ACTION.COPY_CREATE:
        this.copyRule(rowData);
        break;
      default:
    }
  };

  render() {
    const { ruleRootNode, loading, ruleType } = this.props;
    const {
      showModal,
      showCopyModal,
      currentRuleRoot,
      showRuleLegend,
      showRuleTest,
      currentRuleType,
      matchedNodeIds,
    } = ruleRootNode;
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 80,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (id, record) => (
          <span className={cls('action-box')}>
            <ExtAction key={id} onAction={this.handlerAction} recordItem={record} />
          </span>
        ),
      },
      {
        title: '启用',
        dataIndex: 'enabled',
        width: 60,
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
      {
        title: '优先级',
        dataIndex: 'rank',
        width: 60,
        align: 'center',
        required: true,
      },
      {
        title: '规则名称',
        dataIndex: 'name',
        width: 420,
        required: true,
      },
    ];
    const formModalProps = {
      save: this.saveSet,
      currentRuleRoot,
      showModal,
      closeFormModal: this.closeModal,
      saving: loading.effects['ruleRootNode/saveRuleRootNode'],
    };
    const copyFormModalProps = {
      save: this.saveCopyRule,
      currentRuleRoot,
      showCopyModal,
      closeFormModal: this.closeModal,
      saving: loading.effects['ruleRootNode/saveCopyRule'],
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
      matchedNodeIds,
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
        <CopyFormModal {...copyFormModalProps} />
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
