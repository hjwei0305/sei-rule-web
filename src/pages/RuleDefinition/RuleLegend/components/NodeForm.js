import React, { Component } from 'react';
import { get, cloneDeep, isEqual } from 'lodash';
import { Form, Input, Switch } from 'antd';
import { MoneyInput, utils, ExtIcon } from 'suid';
import BlankTrigger from './BlankTrigger';
import ExpressionForm from './ExpressionForm';
import ReturnResultForm from './ReturnResultForm';
import FinishedConfigForm from './FinishedConfigForm';
import styles from './NodeForm.less';

const { getUUID, scrollToElement } = utils;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

const formItemInlineLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};

@Form.create()
class NodeForm extends Component {
  static finishedConfigFormRef;

  static expressItemFormRefs;

  static returnResultItemFormRefs;

  constructor(props) {
    super(props);
    const { nodeData } = props;
    this.expressItemFormRefs = null;
    this.returnResultItemFormRefs = null;
    const expressionsData = get(nodeData, 'logicalExpressions', []) || [];
    const returnResultData = get(nodeData, 'nodeReturnResults', []) || [];
    this.state = {
      isTrueNode: get(nodeData, 'trueNode') || false,
      isFinished: get(nodeData, 'finished') || false,
      expressionsData,
      returnResultData,
      collapsedExpression: false,
      collapsedReturnResult: false,
    };
  }

  componentDidMount() {
    const { onFormRef } = this.props;
    if (onFormRef) {
      onFormRef(this);
    }
  }

  componentDidUpdate(preProps) {
    const { nodeData } = this.props;
    if (!isEqual(preProps.nodeData, nodeData)) {
      const expressionsData = get(nodeData, 'logicalExpressions', []) || [];
      const returnResultData = get(nodeData, 'nodeReturnResults', []) || [];
      this.setState({
        isTrueNode: get(nodeData, 'trueNode') || false,
        isFinished: get(nodeData, 'finished') || false,
        expressionsData,
        returnResultData,
      });
    }
  }

  /** 获取表达式清单 */
  getExpressItemsData = () => {
    const formItems = [];
    let formCount = 0;
    Object.keys(this.expressItemFormRefs || {}).forEach(formCmpKey => {
      const formCmp = this.expressItemFormRefs[formCmpKey];
      formCount += 1;
      const { formData } = formCmp.getFormData();
      if (formData) {
        formItems.push(formData);
      }
    });
    if (formCount > 0) {
      if (formItems.length === formCount) {
        return { formItems, isValid: true };
      }
      return { formItems: [], isValid: false };
    }
    return { formItems: [], isValid: true };
  };

  /** 获取返回结果清单 */
  getReturnResultItemsData = () => {
    const formItems = [];
    let formCount = 0;
    Object.keys(this.returnResultItemFormRefs || {}).forEach(formCmpKey => {
      const formCmp = this.returnResultItemFormRefs[formCmpKey];
      formCount += 1;
      const { formData } = formCmp.getFormData();
      if (formData) {
        formItems.push(formData);
      }
    });
    if (formCount > 0) {
      if (formItems.length === formCount) {
        return { formItems, isValid: true };
      }
      return { formItems: [], isValid: false };
    }
    return { formItems: [], isValid: true };
  };

  handlerFormSubmit = () => {
    const { form, save, nodeData, ruleType } = this.props;
    let finishedConfigData = {};
    if (this.finishedConfigFormRef) {
      finishedConfigData = this.finishedConfigFormRef.getFormData() || {};
    }
    const { formItems: logicalExpressions, isValid: expressIsValid } = this.getExpressItemsData();
    const {
      formItems: nodeReturnResults,
      isValid: returnResultIsValid,
    } = this.getReturnResultItemsData();
    if (!expressIsValid || !returnResultIsValid) {
      return;
    }
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const { isTrueNode, isFinished } = this.state;
      const params = {
        ruleTypeId: get(ruleType, 'id'),
      };
      Object.assign(params, nodeData || {});
      Object.assign(params, finishedConfigData);
      Object.assign(params, {
        logicalExpressions,
        nodeReturnResults,
        trueNode: isTrueNode,
        finished: isFinished,
      });
      Object.assign(params, formData);
      save(params);
    });
  };

  handlerTrueNodeChange = isTrueNode => {
    const { updateScroll } = this.props;
    this.setState({ isTrueNode, expressionsData: [] }, updateScroll);
  };

  handlerFinishedNodeChange = isFinished => {
    const { updateScroll } = this.props;
    this.setState({ isFinished }, updateScroll);
  };

  handlerScroll = (scrollBoxClassName, targetId) => {
    const scrollPorps = { scrollBoxClassName, targetId };
    scrollToElement(scrollPorps);
  };

  /** 对行项目序号重新编号，保证序号是连续的 */
  rebuildIndex = its => {
    return its
      .sort((obj1, obj2) => obj1.itemNumber - obj2.itemNumber)
      .map((it, idx) => {
        Object.assign(it, { itemNumber: idx });
        return it;
      });
  };

  handlerFinishedConfigFormRef = ref => {
    this.finishedConfigFormRef = ref;
  };

  /** 收集逻辑表达式组件实例，以方便数据收集 */
  onExpressItemFormRefs = (id, form) => {
    if (!this.expressItemFormRefs) {
      this.expressItemFormRefs = {};
    }
    this.expressItemFormRefs[id] = form;
  };

  /** 逻辑表达式行项目删除 */
  onDeleteExpressItem = id => {
    const { expressionsData } = this.state;
    const { updateScroll } = this.props;
    const tmpItems = cloneDeep(expressionsData);
    let its = tmpItems.filter(item => {
      return item.id !== id && item.tmpId !== id;
    });
    its = this.rebuildIndex(its);
    this.setState(
      {
        expressionsData: its,
      },
      () => {
        delete this.expressItemFormRefs[id];
        updateScroll();
      },
    );
  };

  handlerAddExpress = () => {
    const { ruleRoot } = this.props;
    const { expressionsData: originExpressionsData } = this.state;
    let its = [...originExpressionsData];
    its = this.rebuildIndex(its);
    const itemId = getUUID();
    its.push({
      itemNumber: its.length,
      id: null,
      tmpId: itemId,
      ruleTreeRootNodeId: get(ruleRoot, 'id', null) || null,
    });
    this.setState({ expressionsData: its }, () => {
      this.handlerScroll('.node-form-scroll-bar', itemId);
    });
  };

  /** 收集逻辑表达式组件实例，以方便数据收集 */
  onReturnResultItemFormRefs = (id, form) => {
    if (!this.returnResultItemFormRefs) {
      this.returnResultItemFormRefs = {};
    }
    this.returnResultItemFormRefs[id] = form;
  };

  /** 逻辑表达式行项目删除 */
  onDeleteReturnResultItem = id => {
    const { updateScroll } = this.props;
    const { returnResultData } = this.state;
    const tmpItems = cloneDeep(returnResultData);
    let its = tmpItems.filter(item => {
      return item.id !== id && item.tmpId !== id;
    });
    its = this.rebuildIndex(its);
    this.setState(
      {
        returnResultData: its,
      },
      () => {
        delete this.returnResultItemFormRefs[id];
        updateScroll();
      },
    );
  };

  handlerAddReturnResult = () => {
    const { ruleRoot } = this.props;
    const { returnResultData: originReturnResultData } = this.state;
    let its = [...originReturnResultData];
    its = this.rebuildIndex(its);
    const itemId = getUUID();
    its.push({
      itemNumber: its.length,
      id: null,
      tmpId: itemId,
      ruleTreeRootNodeId: get(ruleRoot, 'id', null) || null,
    });
    this.setState({ returnResultData: its }, () => {
      this.handlerScroll('.node-form-scroll-bar', itemId);
    });
  };

  handlerCollapsedExpression = () => {
    const { updateScroll } = this.props;
    const { collapsedExpression } = this.state;
    this.setState({ collapsedExpression: !collapsedExpression }, updateScroll);
  };

  handlerCollapsedReturnResult = () => {
    const { updateScroll } = this.props;
    const { collapsedReturnResult } = this.state;
    this.setState({ collapsedReturnResult: !collapsedReturnResult }, updateScroll);
  };

  render() {
    const {
      isTrueNode,
      isFinished,
      expressionsData,
      returnResultData,
      collapsedExpression,
      collapsedReturnResult,
    } = this.state;
    const { form, ruleType, nodeData, onlyView } = this.props;
    const { getFieldDecorator } = form;
    const isRootNode = get(nodeData, 'parentId', null) === null;
    return (
      <div className={styles['node-form-box']}>
        <Form {...formItemLayout} layout="vertical">
          <div className="title-group">基本信息</div>
          <FormItem label="规则名称">
            {getFieldDecorator('name', {
              initialValue: get(nodeData, 'name'),
              rules: [
                {
                  required: true,
                  message: '规则名称不能为空',
                },
              ],
            })(<Input autoComplete="off" disabled={onlyView} />)}
          </FormItem>
          <FormItem label="优先级">
            {getFieldDecorator('rank', {
              initialValue: get(nodeData, 'rank'),
              rules: [
                {
                  required: true,
                  message: '优先级不能为空',
                },
              ],
            })(<MoneyInput textAlign="left" precision={0} thousand={false} disabled={onlyView} />)}
            <p className="desc">值越小越优先</p>
          </FormItem>
          {isRootNode ? (
            <FormItem label="启用">
              {getFieldDecorator('enabled', {
                initialValue: get(nodeData, 'enabled') || true,
                valuePropName: 'checked',
              })(<Switch size="small" disabled={onlyView} />)}
            </FormItem>
          ) : null}
        </Form>
        <FormItem label="是真节点" {...formItemInlineLayout} style={{ marginBottom: 0 }}>
          <Switch
            size="small"
            disabled={onlyView}
            checked={isTrueNode}
            onChange={this.handlerTrueNodeChange}
          />
        </FormItem>
        <p className="item-desc">表示此规则的返回结果始终为真</p>
        {isTrueNode ? null : (
          <>
            <div className="title-group">
              {`逻辑表达式(${expressionsData.length})`}
              <ExtIcon
                className="btn-collapsed"
                type={collapsedExpression ? 'down' : 'up'}
                antd
                onClick={this.handlerCollapsedExpression}
              />
            </div>
            <div
              className="node-form-item"
              style={{ display: collapsedExpression ? 'none' : 'block' }}
            >
              {expressionsData.map((expItem, index) => {
                const itemData = { ...expItem };
                const itemKey = itemData.id || itemData.tmpId || index;
                Object.assign(itemData, { itemNumber: index });
                const expressionFormProps = {
                  itemData,
                  ruleType,
                  onlyView,
                  deleteItem: this.onDeleteExpressItem,
                  onExpressItemFormRefs: this.onExpressItemFormRefs,
                };
                /** 使用表单独立作用域 */
                const WrappedForm = Form.create({ name: itemKey })(props => (
                  <ExpressionForm {...props} {...expressionFormProps} />
                ));
                return <WrappedForm key={itemKey} />;
              })}
              <BlankTrigger
                title="新增表达式"
                onlyView={onlyView}
                items={expressionsData}
                addItem={this.handlerAddExpress}
              />
            </div>
          </>
        )}
        <FormItem label="规则结束" {...formItemInlineLayout} style={{ marginBottom: 0 }}>
          <Switch
            size="small"
            disabled={onlyView}
            checked={isFinished}
            onChange={this.handlerFinishedNodeChange}
          />
        </FormItem>
        <p className="item-desc">表示此规则执行结束，没有后续规则</p>
        {isFinished ? (
          <>
            <FinishedConfigForm
              ruleType={ruleType}
              nodeData={nodeData}
              onlyView={onlyView}
              onFinishedConfigFormRef={this.handlerFinishedConfigFormRef}
            />
            <div className="title-group">
              {`返回结果(${returnResultData.length})`}
              <ExtIcon
                className="btn-collapsed"
                type={collapsedReturnResult ? 'down' : 'up'}
                antd
                onClick={this.handlerCollapsedReturnResult}
              />
            </div>
            <div
              className="node-form-item"
              style={{ display: collapsedReturnResult ? 'none' : 'block' }}
            >
              {returnResultData.map((retItem, index) => {
                const itemData = { ...retItem };
                const itemKey = itemData.id || itemData.tmpId || index;
                Object.assign(itemData, { itemNumber: index });
                const returnResultFormProps = {
                  itemData,
                  ruleType,
                  onlyView,
                  deleteItem: this.onDeleteReturnResultItem,
                  onReturnResultItemFormRefs: this.onReturnResultItemFormRefs,
                };
                /** 使用表单独立作用域 */
                const WrappedForm = Form.create({ name: itemKey })(props => (
                  <ReturnResultForm {...props} {...returnResultFormProps} />
                ));
                return <WrappedForm key={itemKey} />;
              })}
              <BlankTrigger
                title="新增返回结果"
                items={returnResultData}
                onlyView={onlyView}
                addItem={this.handlerAddReturnResult}
              />
            </div>
          </>
        ) : null}
      </div>
    );
  }
}

export default NodeForm;
