import React, { Component } from 'react';
import { Icon, Menu, Layout } from 'antd';
import Link from 'umi/link';
import cls from 'classnames';
import { ScrollBar } from 'suid';
import styles from './index.less';

const { Header, Content } = Layout;
const { SubMenu } = Menu;

const menuData = [
  {
    id: '10',
    name: 'moduleName',
    children: [
      {
        id: '100',
        name: 'menuName',
        path: '/moduleName/demo',
      },
    ],
  },
];

const getIcon = icon => {
  if (typeof icon === 'string') {
    return <Icon type={icon} />;
  }
  return icon;
};

export default class Home extends Component {
  componentDidMount() {
    this.getNavMenuItems(menuData);
  }

  getNavMenuItems = menusData => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name)
      .map(item => this.getSubMenuOrItem(item))
      .filter(item => item);
  };

  getSubMenuTitle = item => {
    const { name } = item;
    return item.icon ? (
      <span>
        {getIcon(item.icon)}
        <span>{name}</span>
      </span>
    ) : (
      name
    );
  };

  getSubMenuOrItem = item => {
    if (item.children && item.children.some(child => child.name)) {
      return (
        <SubMenu title={this.getSubMenuTitle(item)} key={item.id}>
          {this.getNavMenuItems(item.children)}
        </SubMenu>
      );
    }
    return <Menu.Item key={item.id}>{this.getMenuItemPath(item)}</Menu.Item>;
  };

  getMenuItemPath = item => {
    const { name } = item;
    const { location } = this.props;
    return (
      <Link to={item.path} replace={item.path === location.pathname}>
        <span>{name}</span>
      </Link>
    );
  };

  render() {
    return (
      <Layout className={cls(styles['main-box'])}>
        <Header className={cls('menu-header')}>应用路由列表</Header>
        <Content className={cls('menu-box')}>
          <ScrollBar>
            <Menu key="Menu" mode="inline" theme="light">
              {this.getNavMenuItems(menuData)}
            </Menu>
          </ScrollBar>
        </Content>
      </Layout>
    );
  }
}
