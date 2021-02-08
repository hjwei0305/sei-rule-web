import React, { Component } from 'react';
import { get } from 'lodash';
import { Card, Form, Popconfirm, Icon, Avatar, Input } from 'antd';
import { ComboList } from 'suid';
import { constants } from '../../../../utils';
import styles from './ReturnResultForm.less';

const FormItem = Form.Item;
const { SERVER_PATH, RETURN_RESULT_UI_COMPONENT } = constants;
const formItemStyle = { margin: '0 auto', padding: 0 };
const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};

class ReturnResultForm extends Component {
  constructor(props) {
    super(props);
    const { itemData } = props;
    let ruleReturnType = null;
    if (itemData) {
      ruleReturnType = {
        ruleReturnTypeId: get(itemData, 'ruleReturnTypeId'),
        ruleReturnTypeName: get(itemData, 'ruleReturnTypeName'),
        findDataUrl: get(itemData, 'ruleReturnTypeFindDataUrl'),
        uiComponent: get(itemData, 'ruleReturnTypeUiComponent'),
      };
    }
    this.state = {
      ruleReturnType,
    };
  }

  componentDidMount() {
    const { itemData, onReturnResultItemFormRefs } = this.props;
    onReturnResultItemFormRefs(itemData.id || itemData.tmpId, this);
  }

  /** 获取表单数据 */
  getFormData = () => {
    const { form, itemData } = this.props;
    let formData = null;
    form.validateFields((err, values) => {
      if (!err) {
        formData = values;
      }
    });
    if (formData) {
      const data = itemData ? { ...itemData } : {};
      Object.assign(data, formData);
      return { formData: data };
    }
    return { formData };
  };

  renderReturnValue = () => {
    const { form, itemData, onlyView } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('returnValueId', { initialValue: get(itemData, 'returnValueId') });
    const { ruleReturnType } = this.state;
    let componentUI = <Input autoComplete="off" disabled={onlyView} />;
    const fieldDecoratorConfig = {
      initialValue: get(itemData, 'returnValueName'),
      rules: [
        {
          required: true,
          message: '返回值不能为空',
        },
      ],
    };
    let listProps = {};
    if (ruleReturnType) {
      const { findDataUrl, uiComponent } = ruleReturnType;
      switch (uiComponent) {
        case RETURN_RESULT_UI_COMPONENT.COMBOLIST.code:
          listProps = {
            form,
            name: 'returnValueName',
            store: {
              url: `${SERVER_PATH}/${findDataUrl}`,
            },
            field: ['returnValueId'],
            reader: {
              name: 'name',
              field: ['id'],
            },
          };
          componentUI = <ComboList {...listProps} disabled={onlyView} />;
          Object.assign(fieldDecoratorConfig, {
            initialValue: get(itemData, 'returnValueName') || '',
          });
          return (
            <FormItem label="返回值" {...formItemLayout} style={formItemStyle}>
              {getFieldDecorator('returnValueName', fieldDecoratorConfig)(componentUI)}
            </FormItem>
          );
        default:
      }
    }
    return (
      <FormItem label="返回值" {...formItemLayout} style={formItemStyle}>
        {getFieldDecorator('returnValueName', fieldDecoratorConfig)(componentUI)}
      </FormItem>
    );
  };

  deleteFormItem = e => {
    e.stopPropagation();
    const { itemData, deleteItem } = this.props;
    if (deleteItem && deleteItem instanceof Function) {
      deleteItem(itemData.id || itemData.tmpId);
    }
  };

  render() {
    const { form, itemData, onlyView, ruleType } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('ruleReturnTypeId', { initialValue: get(itemData, 'ruleReturnTypeId') });
    const ruleReturnTypeProps = {
      form,
      name: 'ruleReturnTypeName',
      store: {
        url: `${SERVER_PATH}/sei-rule/ruleReturnType/findByRuleEntityTypeId`,
        params: {
          ruleEntityTypeId: get(ruleType, 'ruleEntityTypeId'),
        },
      },
      field: ['ruleReturnTypeId'],
      afterSelect: item => {
        const { ruleReturnType } = this.state;
        if (get(ruleReturnType, 'id') !== item.id) {
          form.resetFields(['returnValueName', 'returnValueId']);
        }
        this.setState({ ruleReturnType: item });
      },
      reader: {
        name: 'name',
        field: ['id'],
      },
    };
    return (
      <div className={styles['item-form-box']}>
        <Card id={itemData.id || itemData.tmpId} className="item-form" bordered={false}>
          {onlyView ? null : (
            <Popconfirm title="确定要删除规则的返回结果吗?" onConfirm={this.deleteFormItem}>
              <Icon type="close" className="btn-delete-form" />
            </Popconfirm>
          )}
          <div className="form-id">
            <Avatar shape="square" style={{ color: '#666', backgroundColor: '#f8f8f8' }}>
              {itemData.itemNumber + 1}
            </Avatar>
          </div>
          <div className="form-content">
            <Form layout="horizontal">
              <FormItem label="返回类型" {...formItemLayout} style={formItemStyle}>
                {getFieldDecorator('ruleReturnTypeName', {
                  initialValue: get(itemData, 'ruleReturnTypeName'),
                  rules: [
                    {
                      required: true,
                      message: '返回类型不能为空',
                    },
                  ],
                })(<ComboList {...ruleReturnTypeProps} disabled={onlyView} />)}
              </FormItem>
              {this.renderReturnValue()}
            </Form>
          </div>
        </Card>
      </div>
    );
  }
}

export default ReturnResultForm;
