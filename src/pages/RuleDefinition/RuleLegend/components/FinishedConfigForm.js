import React, { Component } from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Form, Input, Switch } from 'antd';
import { ComboList } from 'suid';
import { constants } from '../../../../utils';

const FormItem = Form.Item;
const { SERVER_PATH } = constants;
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
class FinishedConfigForm extends Component {
  static propTypes = {
    ruleType: PropTypes.object,
    nodeData: PropTypes.object,
    onlyView: PropTypes.bool,
    onFinishedConfigFormRef: PropTypes.func,
  };

  componentDidMount() {
    const { onFinishedConfigFormRef } = this.props;
    onFinishedConfigFormRef(this);
  }

  /** 获取表单数据 */
  getFormData = () => {
    const { form, nodeData } = this.props;
    let formData = null;
    form.validateFields((err, values) => {
      if (!err) {
        formData = values;
      }
    });
    if (formData) {
      const data = {
        ruleServiceMethodId: get(nodeData, 'ruleServiceMethodId'),
        ruleServiceMethodName: get(nodeData, 'ruleAttributeTypeRemark'),
        asyncExecute: get(nodeData, 'asyncExecute') || false,
        returnConstant: get(nodeData, 'returnConstant'),
      };
      Object.assign(data, formData);
      return data;
    }
    return formData;
  };

  render() {
    const { form, nodeData, ruleType, onlyView } = this.props;
    const { getFieldDecorator } = form;
    const ruleServiceProps = {
      form,
      allowClear: true,
      name: 'ruleServiceMethodName',
      store: {
        url: `${SERVER_PATH}/sei-rule/ruleServiceMethod/findByRuleEntityTypeId`,
        params: {
          ruleEntityTypeId: get(ruleType, 'ruleEntityTypeId'),
        },
      },
      field: ['ruleServiceMethodId'],
      reader: {
        name: 'name',
        description: 'path',
        field: ['id'],
      },
    };
    getFieldDecorator('ruleServiceMethodId', {
      initialValue: get(nodeData, 'ruleServiceMethodId'),
    });
    return (
      <Form {...formItemLayout} layout="vertical">
        <FormItem label="返回常量值">
          {getFieldDecorator('returnConstant', {
            initialValue: get(nodeData, 'returnConstant'),
          })(<Input autoComplete="off" disabled={onlyView} />)}
          <p className="desc">表示规则返回结果（通常返回一个常量）</p>
        </FormItem>
        <div className="title-group">服务调用</div>
        <FormItem label="服务方法">
          {getFieldDecorator('ruleAttributeTypeRemark', {
            initialValue: get(nodeData, 'ruleAttributeTypeRemark'),
          })(<ComboList {...ruleServiceProps} disabled={onlyView} />)}
          <p className="desc">规则结束时的服务调用</p>
        </FormItem>
        <FormItem label="异步执行" {...formItemInlineLayout} style={{ marginBottom: 0 }}>
          {getFieldDecorator('asyncExecute', {
            initialValue: get(nodeData, 'asyncExecute') || false,
            valuePropName: 'checked',
          })(<Switch size="small" disabled={onlyView} />)}
        </FormItem>
        <p className="item-desc">表示此服务方法的执行方式,默认为同步方式执行</p>
      </Form>
    );
  }
}

export default FinishedConfigForm;
