import React from 'react';
import { Menu, Dropdown } from 'antd';
import { ExtIcon } from 'suid';
import { constants } from '../../../../../utils';
import styles from './index.less';

const { ATTRIBUTE_ACTION } = constants;
const { Item } = Menu;
const AttributeLabel = ({ onAction, actionKey }) => {
  const getTitle = () => {
    let title = ATTRIBUTE_ACTION.NORMAL.name;
    if (actionKey && ATTRIBUTE_ACTION[actionKey]) {
      title = ATTRIBUTE_ACTION[actionKey].name;
    }
    return title;
  };

  const renderMenuAction = () => {
    return (
      <Menu onClick={e => onAction(e)} selectedKeys={[actionKey]}>
        <Item key={ATTRIBUTE_ACTION.NORMAL.key}>
          <span className="menu-title">{ATTRIBUTE_ACTION.NORMAL.name}</span>
        </Item>
        <Item key={ATTRIBUTE_ACTION.OTHER.key}>
          <span className="menu-title">{ATTRIBUTE_ACTION.OTHER.name}</span>
        </Item>
      </Menu>
    );
  };

  return (
    <Dropdown overlay={renderMenuAction()} trigger={['click']}>
      <span className={styles['attr-box']}>
        <span className="label">{getTitle()}</span>
        <ExtIcon type="down" style={{ marginLeft: 2 }} antd tooltip={{ title: '切换数据' }} />
      </span>
    </Dropdown>
  );
};

export default AttributeLabel;
