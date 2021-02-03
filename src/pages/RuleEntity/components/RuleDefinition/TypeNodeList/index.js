import React, { Component } from 'react';
import cls from 'classnames';
import { get, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Tag } from 'antd';
import { ExtTable, ComboList, message } from 'suid';
import { constants } from '../../../../RuleDefinition/RuleRootList/node_modules/@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;
class TypeNodeList extends Component {
  static propTypes = {
    currentModule: PropTypes.object,
    typeNodeData: PropTypes.array,
    refreshNodeData: PropTypes.func,
    refreshing: PropTypes.bool,
    saving: PropTypes.bool,
    save: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const { typeNodeData } = props;
    this.state = {
      editHanlderUser: false,
      typeNodeData,
    };
  }

  componentDidUpdate(prevProps) {
    const { typeNodeData } = this.props;
    if (!isEqual(prevProps.typeNodeData, typeNodeData)) {
      this.setState({ typeNodeData });
    }
  }

  cancelHandleUser = () => {
    this.setState({ editHanlderUser: false });
  };

  showHandleUser = () => {
    this.setState({ editHanlderUser: true });
  };

  submitHandleUser = () => {
    const { typeNodeData } = this.state;
    const vaildErrorCount = typeNodeData.filter(
      t => t.handleAccount === null || t.handleAccount === '',
    ).length;
    if (vaildErrorCount === 0) {
      const { currentModule, save } = this.props;
      if (save) {
        const data = {
          relation: get(currentModule, 'code'),
          taskList: typeNodeData,
        };
        save(data, this.cancelHandleUser);
      }
    } else {
      message.destroy();
      message.error('所有的评审活动都需要配置审核人!');
    }
  };

  saveHandleUser = (id, user) => {
    const { typeNodeData: originTypeNodeData } = this.state;
    const typeNodeData = [...originTypeNodeData];
    for (let i = 0; i < typeNodeData.length; i += 1) {
      const node = typeNodeData[i];
      if (node.id === id) {
        Object.assign(node, {
          handleAccount: get(user, 'account'),
          handleUserName: get(user, 'nickname'),
        });
        break;
      }
    }
    this.setState({ typeNodeData });
  };

  renderNodeName = (t, row) => {
    return (
      <>
        <Tag>{row.code}</Tag>
        {t}
      </>
    );
  };

  renderHandleUser = (t, row) => {
    const { editHanlderUser } = this.state;
    if (editHanlderUser) {
      const nodeUserListProps = {
        name: 'handleUserName',
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/sei-manager/user/findByPage`,
        },
        style: { width: '100%' },
        placeholder: '选择审核人',
        remotePaging: true,
        value: row.handleUserName,
        afterSelect: item => {
          this.saveHandleUser(row.id, item);
        },
        reader: {
          name: 'nickname',
          description: 'account',
        },
      };
      return <ComboList {...nodeUserListProps} />;
    }
    return <span style={{ padding: '12px 8px' }}>{t || '-'}</span>;
  };

  render() {
    const { editHanlderUser, typeNodeData } = this.state;
    const { refreshNodeData, saving, refreshing } = this.props;
    const columns = [
      {
        title: '审核节点名称',
        dataIndex: 'name',
        width: 220,
        render: this.renderNodeName,
      },
      {
        title: '审核人',
        dataIndex: 'handleUserName',
        width: 220,
        className: 'handler-user',
        render: this.renderHandleUser,
      },
    ];
    const toolBarProps = {
      left: (
        <>
          {editHanlderUser ? (
            <>
              <Button disabled={saving} onClick={this.cancelHandleUser}>
                取消
              </Button>
              <Button loading={saving} type="primary" onClick={this.submitHandleUser}>
                保存
              </Button>
            </>
          ) : (
            <>
              <Button type="primary" onClick={this.showHandleUser}>
                配置评审人
              </Button>
              <Button onClick={refreshNodeData}>
                <FormattedMessage id="global.refresh" defaultMessage="刷新" />
              </Button>
            </>
          )}
        </>
      ),
    };
    const extTableProps = {
      toolBar: toolBarProps,
      columns,
      loading: refreshing,
      showSearch: false,
      lineNumber: false,
      dataSource: typeNodeData,
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...extTableProps} />
      </div>
    );
  }
}

export default TypeNodeList;
