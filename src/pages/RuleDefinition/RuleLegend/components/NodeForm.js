import React, { Component } from 'react';
import { get } from 'lodash';
import { Form, Input, Switch } from 'antd';
import { MoneyInput } from 'suid';
import styles from './NodeForm.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

@Form.create()
class NodeForm extends Component {
  constructor(props) {
    super(props);
    const { nodeData } = props;
    this.state = {
      isTrueNode: get(nodeData, 'trueNode') || false,
    };
  }

  componentDidMount() {
    const { onFormRef } = this.props;
    if (onFormRef) {
      onFormRef(this);
    }
  }

  handlerFormSubmit = () => {
    const { form, save, nodeData, ruleType } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {
        ruleTypeId: get(ruleType, 'id'),
      };
      Object.assign(params, nodeData || {});
      Object.assign(params, formData);
      save(params);
    });
  };

  handlerTrueNodeChange = isTrueNode => {
    this.setState({ isTrueNode });
  };

  render() {
    const { isTrueNode } = this.state;
    const { form, nodeData } = this.props;
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
            })(<Input />)}
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
            })(
              <MoneyInput
                textAlign="left"
                precision={0}
                thousand={false}
                placeholder="值越小越优先"
              />,
            )}
          </FormItem>
          <FormItem label="真节点">
            {getFieldDecorator('trueNode', {
              initialValue: get(nodeData, 'trueNode') || false,
              valuePropName: 'checked',
            })(<Switch size="small" onChange={this.handlerTrueNodeChange} />)}
            <p className="desc">此规则的返回结果始终为真</p>
          </FormItem>
          {isRootNode ? (
            <FormItem label="启用">
              {getFieldDecorator('enabled', {
                initialValue: get(nodeData, 'enabled') || true,
                valuePropName: 'checked',
              })(<Switch size="small" />)}
            </FormItem>
          ) : null}
          {isTrueNode ? null : <div className="title-group">逻辑表达式</div>}
          <div className="title-group">返回结果</div>
        </Form>
      </div>
    );
  }
}

export default NodeForm;
