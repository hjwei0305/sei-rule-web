import React, { PureComponent } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { Dropdown, Menu } from 'antd';
import { utils, ExtIcon } from 'suid';
import { constants } from '@/utils';
import styles from './ExtAction.less';

const { getUUID } = utils;
const { RULE_LIST_ACTION } = constants;
const { Item } = Menu;

const menuData = () => [
  {
    title: '编辑规则',
    key: RULE_LIST_ACTION.EDIT,
    disabled: false,
  },
  {
    title: '显示规则',
    key: RULE_LIST_ACTION.VIEW,
    disabled: false,
  },
  {
    title: '设置规则',
    key: RULE_LIST_ACTION.SETTING,
    disabled: false,
  },
  {
    title: '删除规则',
    key: RULE_LIST_ACTION.DELETE,
    disabled: false,
  },
  {
    title: '参照新建',
    key: RULE_LIST_ACTION.COPY_CREATE,
    disabled: false,
  },
];

class ExtAction extends PureComponent {
  static propTypes = {
    recordItem: PropTypes.object,
    onAction: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      menuShow: false,
      selectedKeys: '',
      menusData: [],
    };
  }

  componentDidMount() {
    this.initActionMenus();
  }

  componentDidUpdate(prevProps) {
    const { recordItem } = this.props;
    if (!isEqual(prevProps.recordItem, recordItem)) {
      this.initActionMenus();
    }
  }

  initActionMenus = () => {
    const menus = menuData();
    const mData = menus.filter(m => !m.disabled);
    this.setState({
      menusData: mData,
    });
  };

  onActionOperation = e => {
    const { onAction, recordItem } = this.props;
    e.domEvent.stopPropagation();
    this.setState(
      {
        selectedKeys: '',
        menuShow: false,
      },
      () => {
        onAction(e.key, recordItem);
      },
    );
  };

  getMenu = (menus, recordItem) => {
    const menuId = getUUID();
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e, recordItem)}
      >
        {menus.map(m => {
          return (
            <Item key={m.key}>
              <span className="menu-title">{m.title}</span>
            </Item>
          );
        })}
      </Menu>
    );
  };

  onVisibleChange = v => {
    const { selectedKeys } = this.state;
    this.setState({
      menuShow: v,
      selectedKeys: !v ? '' : selectedKeys,
    });
  };

  getRenderContent = () => {
    const { recordItem } = this.props;
    const { menuShow, menusData } = this.state;
    return (
      <>
        <Dropdown
          trigger={['click']}
          overlay={this.getMenu(menusData, recordItem)}
          className="action-drop-down"
          placement="bottomLeft"
          visible={menuShow}
          onVisibleChange={this.onVisibleChange}
        >
          <ExtIcon className={cls('action-recordItem')} type="more" antd />
        </Dropdown>
      </>
    );
  };

  render() {
    const { menusData } = this.state;
    return <>{menusData.length > 0 ? this.getRenderContent() : null}</>;
  }
}

export default ExtAction;
