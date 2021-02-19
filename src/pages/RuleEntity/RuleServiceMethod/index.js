import React, { Component } from 'react';
import { connect } from 'dva';
import { get } from 'lodash';
import cls from 'classnames';
import { Button, Popconfirm } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon } from 'suid';
import { constants } from '@/utils';
import FormModal from './FormModal';
import styles from './index.less';

const { SERVER_PATH } = constants;

@connect(({ ruleServiceMethod, loading }) => ({ ruleServiceMethod, loading }))
class RuleServiceMethod extends Component {
  static tablRef;

  constructor(props) {
    super(props);
    this.state = {
      delRowId: null,
    };
  }

  reloadData = () => {
    if (this.tablRef) {
      this.tablRef.remoteDataRefresh();
    }
  };

  add = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleServiceMethod/updateState',
      payload: {
        showModal: true,
        rowData: null,
      },
    });
  };

  edit = rowData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleServiceMethod/updateState',
      payload: {
        showModal: true,
        rowData,
      },
    });
  };

  save = data => {
    const { dispatch, ruleEntityType } = this.props;
    dispatch({
      type: 'ruleServiceMethod/save',
      payload: {
        ruleEntityTypeId: get(ruleEntityType, 'id'),
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'ruleServiceMethod/updateState',
            payload: {
              showModal: false,
            },
          });
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
          type: 'ruleServiceMethod/del',
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

  closeFormModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleServiceMethod/updateState',
      payload: {
        showModal: false,
        rowData: null,
      },
    });
  };

  renderDelBtn = row => {
    const { loading } = this.props;
    const { delRowId } = this.state;
    if (loading.effects['ruleServiceMethod/del'] && delRowId === row.id) {
      return <ExtIcon className="del-loading" type="loading" antd />;
    }
    return <ExtIcon className="del" type="delete" antd />;
  };

  render() {
    const { ruleServiceMethod, loading, ruleEntityType } = this.props;
    const { showModal, rowData } = ruleServiceMethod;
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 100,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (text, record) => (
          <span className={cls('action-box')}>
            <ExtIcon
              className="edit"
              onClick={() => this.edit(record)}
              type="edit"
              ignore="true"
              antd
            />
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
        title: '方法名',
        dataIndex: 'method',
        width: 220,
        required: true,
      },
      {
        title: '名称',
        dataIndex: 'name',
        width: 260,
        required: true,
      },
      {
        title: 'API相对路径',
        dataIndex: 'path',
        width: 380,
        required: true,
        render: t => t || '-',
      },
    ];
    const formModalProps = {
      save: this.save,
      rowData,
      showModal,
      closeFormModal: this.closeFormModal,
      saving: loading.effects['ruleServiceMethod/save'],
    };
    const toolBarProps = {
      left: (
        <>
          <Button type="primary" onClick={this.add} ignore="true">
            <FormattedMessage id="global.add" defaultMessage="新建" />
          </Button>
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </>
      ),
    };
    const tableProps = {
      toolBar: toolBarProps,
      columns,
      searchWidth: 260,
      searchPlaceHolder: '输入方法名、名称关键字',
      searchProperties: ['method', 'name'],
      onTableRef: ref => (this.tablRef = ref),
      store: {
        url: `${SERVER_PATH}/sei-rule/ruleServiceMethod/findByRuleEntityTypeId`,
      },
      cascadeParams: {
        ruleEntityTypeId: get(ruleEntityType, 'id'),
      },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...tableProps} />
        <FormModal {...formModalProps} />
      </div>
    );
  }
}

export default RuleServiceMethod;
