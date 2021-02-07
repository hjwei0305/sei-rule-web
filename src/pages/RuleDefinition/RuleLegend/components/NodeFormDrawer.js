import React, { Component } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Button, Drawer } from 'antd';
import { ScrollBar } from 'suid';
import NodeForm from './NodeForm';
import styles from './NodeFormDrawer.less';

class NodeFormDrawer extends Component {
  static formRef;

  static scrollBarRef;

  static propTypes = {
    showNodeForm: PropTypes.bool,
    ruleType: PropTypes.object,
    nodeData: PropTypes.object,
    closeNodeForm: PropTypes.func,
    onlyView: PropTypes.bool,
    save: PropTypes.func,
    saving: PropTypes.bool,
  };

  handlerFormRef = ref => {
    this.formRef = ref;
  };

  handlerClose = () => {
    const { closeNodeForm } = this.props;
    if (closeNodeForm) {
      closeNodeForm();
    }
  };

  updateScroll = () => {
    if (this.scrollBarRef) {
      this.scrollBarRef.updateScroll();
    }
  };

  renderFooterBtn = () => {
    const { saving, closeNodeForm, onlyView } = this.props;
    if (!onlyView) {
      return (
        <>
          <Button disabled={saving} onClick={closeNodeForm}>
            取消
          </Button>
          <Button type="primary" loading={saving} onClick={() => this.formRef.handlerFormSubmit()}>
            保存
          </Button>
        </>
      );
    }
    return null;
  };

  render() {
    const { showNodeFormDrawer, onlyView, nodeData, save, ruleType } = this.props;
    const title = get(nodeData, 'id') ? '修改规则' : '新建规则';
    const nodeFormProps = {
      ruleType,
      nodeData,
      save,
      onlyView,
      updateScroll: this.updateScroll,
      onFormRef: this.handlerFormRef,
    };
    return (
      <Drawer
        width={460}
        destroyOnClose
        getContainer={false}
        placement="right"
        visible={showNodeFormDrawer}
        title={title}
        className={cls(styles['node-form-drawer-box'])}
        onClose={this.handlerClose}
        style={{ position: 'absolute' }}
      >
        <div className={cls('box', { 'only-view': onlyView })}>
          <div className="box-body">
            <ScrollBar className="node-form-scroll-bar" ref={ref => (this.scrollBarRef = ref)}>
              <NodeForm {...nodeFormProps} />
            </ScrollBar>
          </div>
          <div className="box-foot">{this.renderFooterBtn()}</div>
        </div>
      </Drawer>
    );
  }
}

export default NodeFormDrawer;
