import React, { Component } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Drawer, Tag, Timeline, Empty } from 'antd';
import { ScrollBar, ListLoader, BannerTitle } from 'suid';
import styles from './index.less';

const Expression = ({ items }) => {
  return (items || []).map((exp, idx) => {
    return (
      <>
        <p className={cls('exp-item', { first: idx === 0 })} key={get(exp, 'ruleAttributeName')}>
          <span className="attr">{get(exp, 'ruleAttributeName') || '-'}</span>
          <span className="exp">{get(exp, 'comparisonName') || '-'}</span>
          <span className="value">{get(exp, 'comparisonValue') || '-'}</span>
        </p>
        {idx < items.length - 1 ? <p className="exp-item or">或</p> : null}
      </>
    );
  });
};

class NodeExpression extends Component {
  static scrollBarRef;

  static propTypes = {
    showNodeExpression: PropTypes.bool,
    nodeData: PropTypes.object,
    nodeExpressions: PropTypes.array,
    closeNodeForm: PropTypes.func,
    loading: PropTypes.bool,
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

  renderNodeExpress = () => {
    const { nodeExpressions, nodeData } = this.props;
    if (nodeExpressions.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />;
    }
    return (
      <Timeline>
        {nodeExpressions.map((node, idx) => {
          let nodeColor = idx === 0 ? 'green' : '';
          if (nodeData.id === node.id) {
            nodeColor = 'red';
          }
          const num = get(node, 'nodeLevel');
          return (
            <>
              <Timeline.Item dot={<Tag color={nodeColor}>{num + 1}</Tag>}>
                <div className="node-item" key={node.id}>
                  <span className="node-title">规则</span>
                  <span className="node-name">{get(node, 'name') || '-'}</span>
                </div>
                <Expression items={node.expressions} />
              </Timeline.Item>
            </>
          );
        })}
      </Timeline>
    );
  };

  render() {
    const { showNodeExpression, nodeData, loading } = this.props;
    return (
      <Drawer
        width={460}
        destroyOnClose
        getContainer={false}
        placement="right"
        visible={showNodeExpression}
        title={<BannerTitle title={get(nodeData, 'name')} subTitle="规则链详情" />}
        className={cls(styles['node-form-drawer-box'])}
        onClose={this.handlerClose}
        style={{ position: 'absolute' }}
      >
        <div className={cls('box')}>
          <div className="box-body">
            <ScrollBar className="node-form-scroll-bar" ref={ref => (this.scrollBarRef = ref)}>
              {loading ? <ListLoader /> : this.renderNodeExpress()}
            </ScrollBar>
          </div>
        </div>
      </Drawer>
    );
  }
}

export default NodeExpression;
