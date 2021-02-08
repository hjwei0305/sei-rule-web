import React, { Component } from 'react';
import { get, isBoolean, isNumber } from 'lodash';
import moment from 'moment';
import { Card, Form, Popconfirm, Icon, Avatar, Input, DatePicker, Switch } from 'antd';
import { ComboList, MoneyInput } from 'suid';
import { constants } from '../../../../utils';
import styles from './ExpressionForm.less';

const FormItem = Form.Item;
const { SERVER_PATH, ATTRIBUTE_UI_COMPONENT } = constants;
const formItemStyle = { margin: '0 auto', padding: 0 };
const Ymd = 'YYYY-MM-DD';
const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};

class ExpressionForm extends Component {
  constructor(props) {
    super(props);
    const { itemData } = props;
    let ruleAttribute = null;
    let comparisonOperator = '';
    if (itemData) {
      ruleAttribute = {
        id: get(itemData, 'ruleAttributeId'),
        attribute: get(itemData, 'ruleAttributeAttribute'),
        findDataUrl: get(itemData, 'ruleAttributeFindDataUrl'),
        ruleAttributeType: get(itemData, 'ruleAttributeRuleAttributeType'),
        uiComponent: get(itemData, 'ruleAttributeUiComponent'),
        displayField: get(itemData, 'ruleAttributeDisplayField'),
        valueField: get(itemData, 'ruleAttributeValueField'),
      };
      comparisonOperator = get(itemData, 'comparisonOperator');
    }
    this.state = {
      comparisonOperator,
      ruleAttribute,
    };
  }

  componentDidMount() {
    const { itemData, onExpressItemFormRefs } = this.props;
    onExpressItemFormRefs(itemData.id || itemData.tmpId, this);
  }

  /** 获取表单数据 */
  getFormData = () => {
    const { form, itemData } = this.props;
    const { ruleAttribute } = this.state;
    let formData = null;
    form.validateFields((err, values) => {
      if (!err) {
        formData = values;
      }
    });
    if (formData && ruleAttribute) {
      const data = itemData ? { ...itemData } : {};
      Object.assign(data, formData);
      if (ruleAttribute.uiComponent === ATTRIBUTE_UI_COMPONENT.DATEPICKER.code) {
        Object.assign(data, { comparisonValue: moment(data.comparisonValue).format(Ymd) });
      }
      return { formData: data };
    }
    return { formData };
  };

  renderComparisonValue = () => {
    const { form, itemData, ruleType, onlyView } = this.props;
    const { getFieldDecorator } = form;
    const { comparisonOperator, ruleAttribute } = this.state;
    let componentUI = <Input autoComplete="off" disabled={onlyView} />;
    const fieldDecoratorConfig = {
      initialValue: get(itemData, 'comparisonValue'),
      rules: [
        {
          required: true,
          message: '属性值不能为空',
        },
      ],
    };
    let listProps = {};
    if (ruleAttribute) {
      const { displayField, findDataUrl, valueField, uiComponent } = ruleAttribute;
      const v = get(itemData, 'comparisonValue');
      switch (uiComponent) {
        case ATTRIBUTE_UI_COMPONENT.DATEPICKER.code:
          componentUI = (
            <DatePicker style={{ width: '100%' }} allowClear={false} disabled={onlyView} />
          );
          Object.assign(fieldDecoratorConfig, {
            initialValue: v && moment(v).isValid() ? moment(v) : null,
          });
          break;
        case ATTRIBUTE_UI_COMPONENT.MONEYINPUT.code:
          componentUI = <MoneyInput textAlign="left" disabled={onlyView} />;
          Object.assign(fieldDecoratorConfig, { initialValue: isNumber(Number(v)) ? v : 0 });
          break;
        case ATTRIBUTE_UI_COMPONENT.SWITCH.code:
          componentUI = <Switch size="small" disabled={onlyView} />;
          Object.assign(fieldDecoratorConfig, {
            valuePropName: 'checked',
            initialValue: isBoolean(v) ? v : false,
          });
          break;
        case ATTRIBUTE_UI_COMPONENT.COMBOLIST_LOCAL.code:
        case ATTRIBUTE_UI_COMPONENT.COMBOLIST_REMOTE.code:
          Object.assign(fieldDecoratorConfig, {
            valuePropName: 'checked',
            initialValue: isBoolean(v) ? v : false,
          });
          listProps = {
            form,
            name: 'displayValue',
            store: {
              url: `${SERVER_PATH}/${findDataUrl}`,
            },
            field: ['comparisonValue'],
            reader: {
              name: displayField,
              field: [valueField],
            },
          };
          if (uiComponent === ATTRIBUTE_UI_COMPONENT.COMBOLIST_REMOTE.code) {
            listProps.store.type = 'POST';
          }
          componentUI = <ComboList {...listProps} disabled={onlyView} />;
          getFieldDecorator('comparisonValue', { initialValue: get(itemData, 'comparisonValue') });
          Object.assign(fieldDecoratorConfig, {
            initialValue: get(itemData, 'displayValue') || '',
          });
          return (
            <FormItem label="属性值" {...formItemLayout} style={formItemStyle}>
              {getFieldDecorator('displayValue', fieldDecoratorConfig)(componentUI)}
            </FormItem>
          );
        default:
      }
    }
    if (comparisonOperator === 'COMPARER') {
      listProps = {
        form,
        name: 'displayValue',
        store: {
          url: `${SERVER_PATH}/sei-rule/ruleComparator/findByRuleEntityTypeId`,
          params: {
            ruleEntityTypeId: get(ruleType, 'ruleEntityTypeId'),
          },
        },
        field: ['comparisonValue'],
        reader: {
          name: 'name',
          description: 'path',
          field: ['id'],
        },
      };
      componentUI = <ComboList {...listProps} />;
      getFieldDecorator('comparisonValue', { initialValue: get(itemData, 'comparisonValue') });
      Object.assign(fieldDecoratorConfig, { initialValue: get(itemData, 'displayValue') || '' });
      return (
        <FormItem label="属性值" {...formItemLayout} style={formItemStyle}>
          {getFieldDecorator('displayValue', fieldDecoratorConfig)(componentUI)}
        </FormItem>
      );
    }
    return (
      <FormItem label="属性值" {...formItemLayout} style={formItemStyle}>
        {getFieldDecorator('comparisonValue', fieldDecoratorConfig)(componentUI)}
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
    getFieldDecorator('ruleAttributeId', { initialValue: get(itemData, 'ruleAttributeId') });
    getFieldDecorator('comparisonOperator', { initialValue: get(itemData, 'comparisonOperator') });
    const ruleAttributeProps = {
      form,
      name: 'ruleAttributeName',
      store: {
        url: `${SERVER_PATH}/sei-rule/ruleAttribute/findByRuleEntityTypeId`,
        params: {
          ruleEntityTypeId: get(ruleType, 'ruleEntityTypeId'),
        },
      },
      field: ['ruleAttributeId'],
      afterSelect: item => {
        const { ruleAttribute } = this.state;
        if (get(ruleAttribute, 'id') !== item.id) {
          form.resetFields(['comparisonOperatorRemark', 'comparisonOperator', 'comparisonValue']);
        }
        this.setState({ ruleAttribute: item });
      },
      reader: {
        name: 'name',
        description: 'path',
        field: ['id'],
      },
    };
    const comparisonOperatorProps = {
      form,
      name: 'comparisonOperatorRemark',
      store: {
        url: `${SERVER_PATH}/sei-rule/ruleAttribute/getCanUseOperators`,
      },
      field: ['comparisonOperator'],
      cascadeParams: {
        ruleAttributeId: form.getFieldValue('ruleAttributeId'),
      },
      afterSelect: item => {
        this.setState({ comparisonOperator: item.comparisonOperator });
      },
      reader: {
        name: 'comparisonOperatorRemark',
        description: 'comparisonOperator',
        field: ['comparisonOperator'],
      },
    };
    return (
      <div className={styles['item-form-box']}>
        <Card id={itemData.id || itemData.tmpId} className="item-form" bordered={false}>
          {onlyView ? null : (
            <Popconfirm title="确定要删除表达式吗?" onConfirm={this.deleteFormItem}>
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
              <FormItem label="属性名" {...formItemLayout} style={formItemStyle}>
                {getFieldDecorator('ruleAttributeName', {
                  initialValue: get(itemData, 'ruleAttributeName'),
                  rules: [
                    {
                      required: true,
                      message: '规则属性不能为空',
                    },
                  ],
                })(<ComboList {...ruleAttributeProps} disabled={onlyView} />)}
              </FormItem>
              <FormItem label="运算符" {...formItemLayout} style={formItemStyle}>
                {getFieldDecorator('comparisonOperatorRemark', {
                  initialValue: get(itemData, 'comparisonOperatorRemark'),
                  rules: [
                    {
                      required: true,
                      message: '运算符不能为空',
                    },
                  ],
                })(<ComboList {...comparisonOperatorProps} disabled={onlyView} />)}
              </FormItem>
              {this.renderComparisonValue()}
            </Form>
          </div>
        </Card>
      </div>
    );
  }
}

export default ExpressionForm;
