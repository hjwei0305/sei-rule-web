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

@connect(({ ruleAttribute, loading }) => ({ ruleAttribute, loading }))
class RuleAttribute extends Component {
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
      type: 'ruleAttribute/updateState',
      payload: {
        showModal: true,
        rowData: null,
      },
    });
  };

  edit = rowData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleAttribute/updateState',
      payload: {
        showModal: true,
        rowData,
      },
    });
  };

  save = data => {
    const { dispatch, ruleEntityType } = this.props;
    dispatch({
      type: 'ruleAttribute/save',
      payload: {
        ruleEntityTypeId: get(ruleEntityType, 'id'),
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'ruleAttribute/updateState',
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
          type: 'ruleAttribute/del',
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
      type: 'ruleAttribute/updateState',
      payload: {
        showModal: false,
        rowData: null,
      },
    });
  };

  renderDelBtn = row => {
    const { loading } = this.props;
    const { delRowId } = this.state;
    if (loading.effects['ruleAttribute/del'] && delRowId === row.id) {
      return <ExtIcon className="del-loading" type="loading" antd />;
    }
    return <ExtIcon className="del" type="delete" antd />;
  };

  render() {
    const { ruleAttribute, loading, ruleEntityType } = this.props;
    const { showModal, rowData } = ruleAttribute;
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
        title: '属性名',
        dataIndex: 'attribute',
        width: 180,
        required: true,
      },
      {
        title: '属性描述',
        dataIndex: 'name',
        width: 180,
        required: true,
      },
      {
        title: '数据类型',
        dataIndex: 'ruleAttributeType',
        width: 160,
        required: true,
        render: (t, r) => `${r.ruleAttributeTypeRemark}(${t})`,
      },
      {
        title: 'UI组件',
        dataIndex: 'uiComponent',
        width: 160,
        required: true,
        render: t => t || '-',
      },
      {
        title: '值源字段名',
        dataIndex: 'valueField',
        width: 160,
        render: t => t || '-',
      },
      {
        title: '显示字段名',
        dataIndex: 'displayField',
        width: 160,
        render: t => t || '-',
      },
      {
        title: '数据源接口地址',
        dataIndex: 'findDataUrl',
        width: 380,
        render: t => t || '-',
      },
    ];
    const formModalProps = {
      save: this.save,
      rowData,
      showModal,
      closeFormModal: this.closeFormModal,
      saving: loading.effects['ruleAttribute/save'],
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
      lineNumber: false,
      allowCustomColumns: false,
      searchPlaceHolder: '输入属性名、属性描述',
      searchProperties: ['attribute', 'name'],
      onTableRef: ref => (this.tablRef = ref),
      store: {
        url: `${SERVER_PATH}/sei-rule/ruleAttribute/findByRuleEntityTypeId`,
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

export default RuleAttribute;
