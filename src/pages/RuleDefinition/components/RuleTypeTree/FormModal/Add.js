import React, { Component } from 'react';
import { Popover } from 'antd';
import cls from 'classnames';
import { ExtIcon } from 'suid';
import Form from './Form';
import styles from './index.less';

class Add extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  handlerPopoverHide = () => {
    this.setState({
      visible: false,
    });
  };

  handlerShowChange = visible => {
    this.setState({ visible });
  };

  render() {
    const { visible } = this.state;
    const popoverProps = {
      handlerPopoverHide: this.handlerPopoverHide,
      ...this.props,
    };
    return (
      <Popover
        trigger="click"
        placement="leftTop"
        visible={visible}
        destroyTooltipOnHide
        onVisibleChange={v => this.handlerShowChange(v)}
        overlayClassName={cls(styles['form-popover-box'])}
        content={<Form {...popoverProps} />}
      >
        <ExtIcon
          className={cls('view-popover-box-trigger')}
          type="plus-circle"
          antd
          tooltip={{ title: '新增规则类型' }}
        />
      </Popover>
    );
  }
}

export default Add;
