import React, { Component } from 'react';
import { debounce, isEqual, get, cloneDeep } from 'lodash';
import { connect } from 'dva';
import G6 from '@antv/g6';
import cls from 'classnames';
import insertCss from 'insert-css';
import { Modal, Divider, Empty, Button } from 'antd';
import { utils, ExtIcon, BannerTitle, PageLoader } from 'suid';
import empty_data from '@/assets/empty_data_02.svg';
import registerNode from './shape/mindNode';
import NodeFormDrawer from './components/NodeFormDrawer';
import styles from './index.less';

insertCss(`
  .g6-component-tooltip {
    background-color: rgba(0,0,0, 0.65);
    padding: 10px;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
    width: fit-content;
    color: #fff;
    border-radius = 4px;
  }
  .g6-minimap-container {
    border: 1px solid #e2e2e2;
  }
  .g6-minimap-viewport {
    border: 2px solid rgb(25, 128, 255);
  }
`);
const { getUUID } = utils;
const DELTA = 0.05;

@connect(({ ruleLegend, loading }) => ({
  ruleLegend,
  loading,
}))
class RuleLegend extends Component {
  static containerId;

  static minimapId;

  static container;

  static graph;

  static onResizeStrategy;

  constructor(props) {
    super(props);
    this.minimapId = getUUID();
    this.containerId = getUUID();
    this.onResizeStrategy = debounce(this.onResize, 150);
  }

  componentDidMount() {
    registerNode(G6);
    this.onResizeStrategy();
    window.addEventListener('resize', this.onResizeStrategy);
    this.getRuleTypeNodes();
  }

  componentDidUpdate(preProps) {
    const {
      ruleLegend: { ruleTypeNodes },
    } = this.props;
    if (!isEqual(preProps.ruleLegend.ruleTypeNodes, ruleTypeNodes)) {
      const ruleNodeData = cloneDeep(ruleTypeNodes);
      if (this.graph) {
        this.graph.read(ruleNodeData);
        const zoom = this.graph.getZoom();
        this.graph.zoom(zoom);
        this.graph.moveTo(24, 24);
      } else {
        this.initTreeGraph(ruleNodeData);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResizeStrategy);
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleLegend/updateState',
      payload: {
        ruleType: null,
        ruleTypeNodes: {},
        nodeData: null,
        onlyView: false,
        needReload: false,
        showNodeFormDrawer: false,
      },
    });
  }

  getRuleTypeNodes = () => {
    const { ruleType, ruleRoot, dispatch } = this.props;
    dispatch({
      type: 'ruleLegend/getRuleTypeNodes',
      payload: {
        ruleType,
        ruleRoot,
      },
    });
  };

  onResize = () => {
    if (!this.container) {
      return false;
    }
    const {
      width,
      height,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
    } = getComputedStyle(this.container);

    const size = {
      width: parseInt(width, 10) - parseInt(paddingLeft, 10) - parseInt(paddingRight, 10),
      height: parseInt(height, 10) - parseInt(paddingTop, 10) - parseInt(paddingBottom, 10),
    };
    if (!this.graph || this.graph.get('destroyed')) return;
    if (!this.container || !this.container.scrollWidth || !this.container.scrollHeight) return;
    this.graph.changeSize(size.width, size.height);
  };

  clearAllStates = () => {
    this.graph.setAutoPaint(false);
    this.graph.getNodes().forEach(node => {
      this.graph.clearItemStates(node);
    });
    this.graph.getEdges().forEach(edge => {
      this.graph.clearItemStates(edge);
    });
    this.graph.paint();
    this.graph.setAutoPaint(true);
  };

  getCurrentNodeSourceEdges = (nodeId, edges) => {
    let edgeData = null;
    edges.forEach(edge => {
      const edgeItem = edge.getModel();
      if (edgeItem.target === nodeId) {
        edgeData = edge;
      }
    });
    return edgeData;
  };

  getCurrentNodeAllParentIds = (treeData, id) => {
    const temp = [];
    const forFn = (arr, tempId) => {
      for (let i = 0; i < arr.length; i += 1) {
        const item = arr[i];
        if (item.id === tempId) {
          temp.push(item.id);
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

  showNodePath = (item, type) => {
    const {
      ruleLegend: { ruleTypeNodes },
    } = this.props;
    const model = item.getModel();
    const nodes = this.graph.getNodes();
    const edges = this.graph.getEdges();
    const parentNodeIds = this.getCurrentNodeAllParentIds([ruleTypeNodes], model.id);
    const currentSourceEdges = [];
    nodes.forEach(node => {
      const m = node.getModel();
      if (parentNodeIds.includes(m.id)) {
        // this.graph.setItemState(node, type, true);
        const targetEdge = this.getCurrentNodeSourceEdges(m.id, edges);
        if (targetEdge) {
          currentSourceEdges.push(targetEdge);
        }
      }
    });
    currentSourceEdges.forEach(edge => {
      this.graph.setItemState(edge, type, true);
    });
  };

  hideNodePath = type => {
    const edges = this.graph.getEdges();
    edges.forEach(edge => {
      this.graph.setItemState(edge, type, false);
    });
    const nodes = this.graph.getNodes();
    nodes.forEach(node => {
      this.graph.setItemState(node, type, false);
    });
  };

  initTreeGraph = data => {
    if (!data) {
      return;
    }
    const grid = new G6.Grid();
    const tooltip = new G6.Tooltip({
      offsetX: 20,
      offsetY: 30,
      itemTypes: ['node'],
      getContent: e => {
        const outDiv = document.createElement('div');
        const nodeName = e.item.getModel().name;
        let formatedNodeName = '';
        for (let i = 0; i < nodeName.length; i += 1) {
          formatedNodeName = `${formatedNodeName}${nodeName[i]}`;
          if (i !== 0 && i % 20 === 0) formatedNodeName = `${formatedNodeName}<br/>`;
        }
        outDiv.innerHTML = `${formatedNodeName}`;
        return outDiv;
      },
      shouldBegin: e => {
        if (e.target.get('name') === 'name-shape') return true;
        return false;
      },
    });
    const minimap = new G6.Minimap({
      container: this.minimapId,
      type: 'delegate',
      size: [150, 100],
      delegateStyle: {
        fill: '#91d5ff',
        stroke: '#91d5ff',
        opacity: 0.6,
      },
    });
    const menu = new G6.Menu({
      offsetX: 6,
      offsetY: 10,
      className: 'node-context-menu',
      itemTypes: ['node'],
      getContent: e => {
        console.log(e);
        return `<ul class="ant-menu ant-menu-light ant-menu-root ant-menu-vertical">
                  <li title='1' class="ant-menu-item">测试02</li>
                  <li title='2' class="ant-menu-item">测试02</li>
                  <li class="ant-menu-item">测试02</li>
                  <li class="ant-menu-item">测试02</li>
                  <li class="ant-menu-item">测试02</li>
                </ul>`;
      },
      handleMenuClick(target, item) {
        console.log(target, item);
      },
    });
    const graph = new G6.TreeGraph({
      container: this.containerId,
      padding: [24, 50],
      defaultLevel: 30,
      width: this.container.scrollWidth,
      height: this.container.scrollHeight,
      modes: {
        default: ['drag-canvas', 'click-select', 'zoom-canvas'],
      },
      fitCenter: true,
      fitView: false,
      animate: true,
      defaultNode: {
        type: 'mind-node',
      },
      defaultEdge: {
        type: 'cubic-horizontal',
        style: {
          stroke: '#CED4D9',
        },
      },
      edgeStateStyles: {
        active: {
          stroke: '#91d5ff',
          lineWidth: 2,
          shadowBlur: 10,
          shadowColor: 'rgb(95, 149, 255)',
        },
        selected: {
          stroke: '#1890ff',
        },
      },
      layout: {
        type: 'indented',
        direction: 'LR',
        dropCap: false,
        indent: 300,
        getHeight: () => {
          return 60;
        },
      },
      plugins: [tooltip, minimap, grid, menu],
    });
    graph.data(data);
    graph.render();
    graph.zoom(1);
    graph.moveTo(24, 24);
    const handleCollapse = e => {
      const { target, originalEvent } = e;
      originalEvent.stopPropagation();
      const id = target.get('modelId');
      const item = graph.findById(id);
      const nodeModel = item.getModel();
      nodeModel.collapsed = !nodeModel.collapsed;
      graph.layout();
      graph.setItemState(item, 'collapse', nodeModel.collapsed);
    };
    graph.on('collapse-text:click', e => {
      handleCollapse(e);
    });
    graph.on('collapse-back:click', e => {
      handleCollapse(e);
    });
    graph.on('node:mouseenter', e => {
      const { item } = e;
      graph.setItemState(item, 'active', true);
      this.showNodePath(item, 'active');
    });

    graph.on('node:mouseleave', e => {
      graph.setItemState(e.item, 'active', false);
      this.hideNodePath('active');
    });
    graph.on('nodeselectchange', e => {
      const {
        selectedItems: { nodes },
        select,
      } = e;
      this.hideNodePath('selected');
      if (select) {
        const item = nodes[0];
        graph.setItemState(item, 'selected', true);
        this.showNodePath(item, 'selected');
      }
    });
    this.graph = graph;
  };

  zoomIn = () => {
    if (this.graph) {
      const ratio = 1 + DELTA;
      const zoom = this.graph.getZoom() * ratio;
      const maxZoom = this.graph.get('maxZoom');
      if (zoom > maxZoom) {
        return;
      }
      this.graph.zoom(ratio);
    }
  };

  zoomOut = () => {
    if (this.graph) {
      const ratio = 1 - DELTA;
      const zoom = this.graph.getZoom() * ratio;
      const minZoom = this.graph.get('minZoom');
      if (zoom < minZoom) {
        return;
      }
      this.graph.zoom(ratio);
    }
  };

  fitView = () => {
    if (this.graph) {
      this.graph.fitView(24);
      this.graph.moveTo(24, 24);
    }
  };

  downloadNode = () => {
    if (this.graph) {
      const { ruleType, ruleRoot } = this.props;
      const title = `${get(ruleType, 'name')} - ${get(ruleRoot, 'name')}`;
      this.graph.downloadFullImage(title, 'image/jpeg', {
        backgroundColor: '#f0f2f5',
        padding: 24,
      });
    }
  };

  handlerAddNode = nodeData => {
    const { dispatch } = this.props;
    const newChildNode = {
      parentId: get(nodeData, 'id') || null,
    };
    dispatch({
      type: 'ruleLegend/updateState',
      payload: {
        showNodeFormDrawer: true,
        nodeData: newChildNode,
      },
    });
  };

  closeNodeForm = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleLegend/updateState',
      payload: {
        showNodeFormDrawer: false,
        nodeData: null,
      },
    });
  };

  handlerNodeSave = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleLegend/saveRuleNode',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          this.closeNodeForm();
          this.getRuleTypeNodes();
        }
      },
    });
  };

  handlerNodeDelete = nodeData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleLegend/saveRuleNode',
      payload: {
        nodeData,
      },
      callback: res => {
        if (res.success) {
          this.closeNodeForm();
          this.getRuleTypeNodes();
        }
      },
    });
  };

  closeRuleModal = () => {
    const {
      ruleLegend: { needReload },
      closeRuleModal,
    } = this.props;
    if (closeRuleModal && closeRuleModal instanceof Function) {
      closeRuleModal(needReload);
    }
  };

  renderTitle = () => {
    const { ruleType, ruleRoot } = this.props;
    const title = `${get(ruleType, 'name')} - ${ruleRoot ? get(ruleRoot, 'name') : '新建规则'}`;
    return (
      <>
        <ExtIcon onClick={this.closeRuleModal} type="left" className="trigger-back" antd />
        <BannerTitle title={title} subTitle="规则树" />
      </>
    );
  };

  render() {
    const { ruleRoot, loading, ruleLegend } = this.props;
    const { showNodeFormDrawer, nodeData, onlyView, ruleType } = ruleLegend;
    const nodeLoading = loading.effects['ruleLegend/getRuleTypeNodes'];
    const nodeFormDrawerProps = {
      showNodeFormDrawer,
      nodeData,
      ruleType,
      closeNodeForm: this.closeNodeForm,
      onlyView,
      save: this.handlerNodeSave,
      saving: loading.effects['ruleLegend/saveRuleNode'],
    };
    return (
      <Modal
        destroyOnClose
        onCancel={this.closeRuleModal}
        visible
        centered
        footer={null}
        wrapClassName={styles['container-box']}
        title={this.renderTitle()}
      >
        <div className="toolbar">
          <ExtIcon
            type="reload"
            spin={nodeLoading}
            onClick={this.getRuleTypeNodes}
            tooltip={{ title: '刷新', placement: 'bottom' }}
            antd
            className={cls('command', { 'command-disabled': !ruleRoot })}
          />
          <Divider type="vertical" />
          <ExtIcon
            type="zoom-in"
            onClick={this.zoomIn}
            tooltip={{ title: '放大', placement: 'bottom' }}
            antd
            className={cls('command', { 'command-disabled': !ruleRoot })}
          />
          <ExtIcon
            type="zoom-out"
            onClick={this.zoomOut}
            tooltip={{ title: '缩小', placement: 'bottom' }}
            antd
            className={cls('command', { 'command-disabled': !ruleRoot })}
          />
          <ExtIcon
            type="border-outer"
            onClick={this.fitView}
            tooltip={{ title: '适应屏幕', placement: 'bottom' }}
            antd
            className={cls('command', { 'command-disabled': !ruleRoot })}
          />
          <ExtIcon
            type="download"
            onClick={this.downloadNode}
            tooltip={{ title: '导出规则', placement: 'bottom' }}
            antd
            className={cls('command', { 'command-disabled': !ruleRoot })}
          />
        </div>
        <div className="editor-box">
          {nodeLoading ? (
            <div className="load-mask">
              <PageLoader />
            </div>
          ) : null}
          {ruleRoot ? (
            <>
              <div
                className="mind-box"
                ref={node => (this.container = node)}
                id={this.containerId}
              />
              <div className="minimap" id={this.minimapId} />
            </>
          ) : (
            <Empty image={empty_data} imageStyle={{ height: 220 }} description="暂无规则">
              <Button type="primary" onClick={this.handlerAddNode}>
                新建规则
              </Button>
            </Empty>
          )}
        </div>
        <NodeFormDrawer {...nodeFormDrawerProps} />
      </Modal>
    );
  }
}

export default RuleLegend;
