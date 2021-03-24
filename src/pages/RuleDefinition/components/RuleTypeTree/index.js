import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { trim, get, isEqual } from 'lodash';
import { formatMessage } from 'umi-plugin-react/locale';
import { Card, Popconfirm, Tree, Input } from 'antd';
import { ScrollBar, ListLoader, ExtIcon } from 'suid';
import Add from './FormModal/Add';
import Edit from './FormModal/Edit';
import styles from './index.less';

const { Search } = Input;
const { TreeNode } = Tree;
const childFieldKey = 'children';
const highLightColor = '#f50';

class RuleTypeTree extends Component {
  static propTypes = {
    ruleTypeData: PropTypes.array,
    currentNode: PropTypes.object,
    onNodeSelect: PropTypes.func,
    loading: PropTypes.bool,
    save: PropTypes.func,
    saving: PropTypes.bool,
    del: PropTypes.func,
    deleting: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    const { currentNode, ruleTypeData } = props;
    const expandedKeys = ruleTypeData.map(td => td.id);
    this.state = {
      delId: null,
      treeListData: ruleTypeData,
      expandedKeys,
      selectedKeys: currentNode ? [currentNode.id] : [],
      autoExpandParent: true,
      allValue: '',
    };
  }

  componentDidUpdate(preProps) {
    const { ruleTypeData } = this.props;
    if (!isEqual(preProps.ruleTypeData, ruleTypeData)) {
      const expandedKeys = ruleTypeData.map(td => td.id);
      this.setState({ expandedKeys, treeListData: ruleTypeData });
    }
  }

  save = (data, handlerModalHide) => {
    const { save } = this.props;
    if (save && save instanceof Function) {
      save(data, handlerModalHide);
    }
  };

  del = id => {
    const { del } = this.props;
    if (del && del instanceof Function) {
      del(id, () => {
        this.setState({
          delId: null,
        });
      });
    }
  };

  getExpandKeys = dataSource => {
    const { currentNode } = this.props;
    let expandedKeys = [];
    if (currentNode && currentNode.id) {
      const parentData = this.getCurrentNodeAllParents(dataSource, currentNode.id);
      expandedKeys = parentData.map(p => p.id);
    } else {
      expandedKeys = dataSource.map(p => p.id);
    }
    return expandedKeys;
  };

  getCurrentNodeAllParents = (treeData, id) => {
    const temp = [];
    const forFn = (arr, tempId) => {
      for (let i = 0; i < arr.length; i += 1) {
        const item = arr[i];
        if (item.id === tempId) {
          temp.push(item);
          forFn(treeData, item.parentId);
          break;
        } else if (item.children && item.children.length > 0) {
          forFn(item.children, tempId);
        }
      }
    };
    forFn(treeData, id);
    return temp;
  };

  renderRemoveBtn = item => {
    const { deleting } = this.props;
    const { delId } = this.state;
    if (deleting && delId === item.id) {
      return <ExtIcon type="loading" className="del-loading" antd />;
    }
    return (
      <Popconfirm
        title={formatMessage({
          id: 'global.delete.confirm',
          defaultMessage: '确定要删除吗?',
        })}
        onConfirm={() => this.del(item.id)}
        placement="topLeft"
      >
        <ExtIcon className="del" type="delete" antd />
      </Popconfirm>
    );
  };

  filterNodes = (valueKey, treeData, expandedKeys) => {
    const newArr = [];
    treeData.forEach(treeNode => {
      const nodeChildren = treeNode[childFieldKey];
      const fieldValue = treeNode.name;
      if (fieldValue.toLowerCase().indexOf(valueKey) > -1) {
        newArr.push(treeNode);
        expandedKeys.push(treeNode.id);
      } else if (nodeChildren && nodeChildren.length > 0) {
        const ab = this.filterNodes(valueKey, nodeChildren, expandedKeys);
        const obj = {
          ...treeNode,
          [childFieldKey]: ab,
        };
        if (ab && ab.length > 0) {
          newArr.push(obj);
        }
      }
    });
    return newArr;
  };

  getLocalFilterData = () => {
    const { ruleTypeData } = this.props;
    const { allValue, expandedKeys: expKeys } = this.state;
    const expandedKeys = [...expKeys];
    let newData = [...ruleTypeData];
    const searchValue = allValue;
    if (searchValue) {
      newData = this.filterNodes(searchValue.toLowerCase(), newData, expandedKeys);
    }
    return { treeListData: newData, expandedKeys };
  };

  excludeNode = (treeData, excludeNodeId) => {
    const tempData = treeData.map(treeNode => {
      if (treeNode.id !== excludeNodeId) {
        const node = { ...treeNode };
        if (node.children && node.children.length) {
          node.children = this.excludeNode(node.children, excludeNodeId);
        }
        return node;
      }
      return null;
    });
    return tempData.filter(node => !!node);
  };

  handlerSearchChange = v => {
    this.setState({ allValue: trim(v) });
  };

  handlerSearch = () => {
    const { treeListData, expandedKeys } = this.getLocalFilterData();
    this.setState({ treeListData, expandedKeys, autoExpandParent: true });
  };

  getSelectData = (selectedKey, treeData, currentNode) => {
    for (let i = 0; i < treeData.length; i += 1) {
      const item = treeData[i];
      const childData = item[childFieldKey];
      if (item.id === selectedKey) {
        Object.assign(currentNode, item);
        break;
      }
      if (childData && childData.length > 0) {
        this.getSelectData(selectedKey, childData, currentNode);
      }
    }
  };

  handlerSelect = (selectedKeys, e) => {
    const { onNodeSelect, ruleTypeData } = this.props;
    let currentNode = null;
    if (e.selected) {
      currentNode = {};
      this.getSelectData(selectedKeys[0], ruleTypeData, currentNode);
    }
    this.setState(
      {
        selectedKeys,
      },
      () => {
        if (onNodeSelect && onNodeSelect instanceof Function) {
          onNodeSelect(currentNode);
        }
      },
    );
  };

  handlerExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  renderTreeNodes = (treeData, parentNode) => {
    const { allValue } = this.state;
    const { saving } = this.props;
    const searchValue = allValue || '';
    return treeData.map(item => {
      const { nodeLevel, folderInfo } = item;
      const readerValue = item.name || '';
      const readerChildren = item[childFieldKey];
      const i = readerValue.toLowerCase().indexOf(searchValue.toLowerCase());
      const beforeStr = readerValue.substr(0, i);
      const afterStr = readerValue.substr(i + searchValue.length);
      const title =
        i > -1 ? (
          <span>
            {beforeStr}
            <span style={{ color: highLightColor }}>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{readerValue}</span>
        );
      const nodeTitle = (
        <>
          {title}
          {folderInfo ? `(${get(folderInfo, 'amount')})` : ''}
          <div className="action-box" onClick={e => e.stopPropagation()}>
            {nodeLevel === 0 ? (
              <Add parentNodeData={item} saving={saving} save={this.save} />
            ) : null}
            {nodeLevel !== 0 ? (
              <Edit parentNodeData={parentNode} nodeData={item} save={this.save} />
            ) : null}
            {nodeLevel !== 0 ? this.renderRemoveBtn(item) : null}
          </div>
        </>
      );
      if (readerChildren && readerChildren.length > 0) {
        return (
          <TreeNode title={nodeTitle} key={item.id} disabled selectable={false}>
            {this.renderTreeNodes(readerChildren, item)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          switcherIcon={<ExtIcon type="dian" style={{ fontSize: 12 }} />}
          title={nodeTitle}
          key={item.id}
          disabled={item.nodeLevel === 0}
          selectable={item.nodeLevel !== 0}
        />
      );
    });
  };

  renderTree = () => {
    const { autoExpandParent, selectedKeys, expandedKeys, treeListData } = this.state;
    return (
      <Tree
        className="node-tree"
        blockNode
        showIcon
        autoExpandParent={autoExpandParent}
        selectedKeys={selectedKeys}
        expandedKeys={expandedKeys}
        switcherIcon={<ExtIcon type="down" antd style={{ fontSize: 12 }} />}
        onSelect={this.handlerSelect}
        onExpand={this.handlerExpand}
      >
        {this.renderTreeNodes(treeListData)}
      </Tree>
    );
  };

  render() {
    const { loading } = this.props;
    return (
      <div className={cls(styles['node-box'])}>
        <Card title="规则类型" bordered={false}>
          <div className={cls('tool-box')}>
            <Search
              placeholder="输入名称关键字查询"
              disabled={loading}
              onChange={e => this.handlerSearchChange(e.target.value)}
              onSearch={this.handlerSearch}
              onPressEnter={this.handlerSearch}
              style={{ width: '100%' }}
            />
          </div>
          <div className="node-body">
            <ScrollBar>{loading ? <ListLoader /> : this.renderTree()}</ScrollBar>
          </div>
        </Card>
      </div>
    );
  }
}

export default RuleTypeTree;
