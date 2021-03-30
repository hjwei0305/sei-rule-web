import React, { Component } from 'react';
import { get, isNumber, isEqual } from 'lodash';
import moment from 'moment';
import { Card, Form, Popconfirm, Icon, Avatar, Input, DatePicker, Switch } from 'antd';
import { ComboList, MoneyInput } from 'suid';
import { constants } from '../../../../utils';
import AttributeLabel from './AttributeLabel';
import styles from './ExpressionForm.less';

const FormItem = Form.Item;
const { SERVER_PATH, ATTRIBUTE_UI_COMPONENT, ATTRIBUTE_ACTION } = constants;
const formItemStyle = { margin: '0 auto', padding: 0 };
const Ymd = 'YYYY-MM-DD';
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

class ExpressionForm extends Component {
  constructor(props) {
    super(props);
    const { itemData } = props;
    const actionKey = get(itemData, 'comparisonValueType') || ATTRIBUTE_ACTION.NORMAL.key;
    this.state = {
      itemData,
      actionKey,
    };
  }

  componentDidMount() {
    const { itemData, onExpressItemFormRefs } = this.props;
    onExpressItemFormRefs(itemData.id || itemData.tmpId, this);
  }

  componentDidUpdate(preProps) {
    const { itemData } = this.props;
    if (!isEqual(preProps.itemData, itemData)) {
      const actionKey = get(itemData, 'comparisonValueType') || ATTRIBUTE_ACTION.NORMAL.key;
      this.setState({ itemData, actionKey });
    }
  }

  /** 获取表单数据 */
  getFormData = () => {
    const { form } = this.props;
    const { itemData, actionKey } = this.state;
    let formData = null;
    form.validateFields((err, values) => {
      if (!err) {
        formData = {};
        const data = itemData ? { ...itemData } : {};
        Object.assign(formData, data);
        Object.assign(formData, values);
        Object.assign(formData, { comparisonValueType: actionKey });
        const uiComponent = get(formData, 'ruleAttributeUiComponent');
        if (uiComponent === ATTRIBUTE_UI_COMPONENT.DATEPICKER.code) {
          Object.assign(formData, {
            comparisonValue: moment(formData.comparisonValue).format(Ymd),
          });
        }
      }
    });
    return { formData };
  };

  handlerAttributeLabelChange = e => {
    const { form } = this.props;
    const { itemData: originItemData } = this.state;
    const formData = { ...originItemData };
    Object.assign(formData, {
      displayValue: '',
      comparisonValue: '',
    });
    form.resetFields(['displayValue', 'comparisonValue']);
    this.setState({ actionKey: e.key, itemData: formData });
  };

  renderComparisonValue = () => {
    const { itemData, actionKey } = this.state;
    const { form, ruleType, onlyView } = this.props;
    const { getFieldDecorator } = form;
    const comparisonOperator = get(itemData, 'comparisonOperator');
    const uiComponent = get(itemData, 'ruleAttributeUiComponent');
    const rules = [
      {
        required: true,
        message: '属性值不能为空',
      },
    ];
    let listProps = {};
    const attributeLabelProps = {
      onAction: this.handlerAttributeLabelChange,
      actionKey,
    };
    /**
     * 其它属性选择优先级最高
     * 其次是比较器
     * 最后才是属性值
     */
    if (actionKey === ATTRIBUTE_ACTION.OTHER.key) {
      listProps = {
        form,
        name: 'displayValue',
        store: {
          url: `${SERVER_PATH}/sei-rule/ruleAttribute/findByRuleAttributeId`,
        },
        cascadeParams: {
          ruleAttributeId: form.getFieldValue('ruleAttributeId'),
        },
        afterSelect: item => {
          getFieldDecorator('comparisonValue');
          form.setFieldsValue({ comparisonValue: get(item, 'id') });
        },
        reader: {
          name: 'name',
        },
      };
      return (
        <FormItem
          label={<AttributeLabel {...attributeLabelProps} />}
          {...formItemLayout}
          style={formItemStyle}
        >
          {getFieldDecorator('displayValue', {
            initialValue: get(itemData, 'displayValue') || '',
            rules,
          })(<ComboList {...listProps} />)}
        </FormItem>
      );
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
        afterSelect: item => {
          getFieldDecorator('comparisonValue');
          form.setFieldsValue({ comparisonValue: get(item, 'id') });
        },
        reader: {
          name: 'name',
          description: 'path',
        },
      };
      return (
        <FormItem label="属性值" {...formItemLayout} style={formItemStyle}>
          {getFieldDecorator('displayValue', {
            initialValue: get(itemData, 'displayValue') || '',
            rules,
          })(<ComboList {...listProps} />)}
        </FormItem>
      );
    }
    if (comparisonOperator === 'FUNCTION') {
      listProps = {
        form,
        name: 'displayValue',
        store: {
          url: `${SERVER_PATH}/sei-rule/ruleAttribute/getCanUseFunctions`,
        },
        cascadeParams: {
          ruleAttributeId: get(itemData, 'ruleAttributeId'),
        },
        afterSelect: item => {
          getFieldDecorator('comparisonValue');
          form.setFieldsValue({ comparisonValue: get(item, 'code') });
        },
        reader: {
          name: 'name',
          description: 'code',
        },
      };
      return (
        <FormItem label="属性值" {...formItemLayout} style={formItemStyle}>
          {getFieldDecorator('displayValue', {
            initialValue: get(itemData, 'displayValue') || '',
            rules,
          })(<ComboList {...listProps} />)}
        </FormItem>
      );
    }
    if (uiComponent) {
      const findDataUrl = get(itemData, 'ruleAttributeFindDataUrl');
      const displayField = get(itemData, 'ruleAttributeDisplayField');
      const valueField = get(itemData, 'ruleAttributeValueField');
      const v = get(itemData, 'comparisonValue');
      switch (uiComponent) {
        case ATTRIBUTE_UI_COMPONENT.DATEPICKER.code:
          return (
            <FormItem
              label={<AttributeLabel {...attributeLabelProps} />}
              {...formItemLayout}
              style={formItemStyle}
            >
              {getFieldDecorator('comparisonValue', {
                initialValue: v && moment(v).isValid() ? moment(v) : null,
                rules,
              })(<DatePicker style={{ width: '100%' }} allowClear={false} disabled={onlyView} />)}
            </FormItem>
          );
        case ATTRIBUTE_UI_COMPONENT.MONEYINPUT.code:
          return (
            <FormItem
              label={<AttributeLabel {...attributeLabelProps} />}
              {...formItemLayout}
              style={formItemStyle}
            >
              {getFieldDecorator('comparisonValue', {
                initialValue: isNumber(Number(v)) ? v : 0,
                rules,
              })(<MoneyInput textAlign="left" disabled={onlyView} />)}
            </FormItem>
          );
        case ATTRIBUTE_UI_COMPONENT.SWITCH.code:
          return (
            <FormItem
              label={<AttributeLabel {...attributeLabelProps} />}
              {...formItemLayout}
              style={formItemStyle}
            >
              {getFieldDecorator('comparisonValue', {
                valuePropName: 'checked',
                initialValue: v || false,
              })(<Switch size="small" disabled={onlyView} />)}
            </FormItem>
          );
        case ATTRIBUTE_UI_COMPONENT.COMBOLIST_LOCAL.code:
        case ATTRIBUTE_UI_COMPONENT.COMBOLIST_REMOTE.code:
          listProps = {
            form,
            name: 'displayValue',
            store: {
              url: `${SERVER_PATH}/${findDataUrl}`,
            },
            afterSelect: item => {
              getFieldDecorator('comparisonValue');
              form.setFieldsValue({ comparisonValue: get(item, valueField) });
            },
            reader: {
              name: displayField,
            },
          };
          if (uiComponent === ATTRIBUTE_UI_COMPONENT.COMBOLIST_REMOTE.code) {
            listProps.store.type = 'POST';
          }
          return (
            <FormItem
              label={<AttributeLabel {...attributeLabelProps} />}
              {...formItemLayout}
              style={formItemStyle}
            >
              {getFieldDecorator('displayValue', {
                initialValue: get(itemData, 'displayValue') || '',
                rules,
              })(<ComboList {...listProps} disabled={onlyView} />)}
            </FormItem>
          );
        default:
      }
    }
    return (
      <FormItem
        label={<AttributeLabel {...attributeLabelProps} />}
        {...formItemLayout}
        style={formItemStyle}
      >
        {getFieldDecorator('comparisonValue', {
          initialValue: get(itemData, 'comparisonValue') || '',
          rules,
        })(<Input autoComplete="off" disabled={onlyView} />)}
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
    const { itemData } = this.state;
    const { form, onlyView, ruleType } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('ruleAttributeId', { initialValue: get(itemData, 'ruleAttributeId') });
    getFieldDecorator('comparisonOperator', { initialValue: get(itemData, 'comparisonOperator') });
    const checkData = form.getFieldsValue();
    if (!checkData.hasOwnProperty('comparisonValue')) {
      getFieldDecorator('comparisonValue', { initialValue: get(itemData, 'comparisonValue') });
    }
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
        const { itemData: originItemData } = this.state;
        const formData = { ...originItemData };
        const ruleAttributeId = get(originItemData, 'ruleAttributeId');
        if (ruleAttributeId !== item.id) {
          Object.assign(formData, {
            ruleAttributeId: get(item, 'id'),
            ruleAttributeName: get(item, 'name'),
            ruleAttributeFindDataUrl: get(item, 'findDataUrl'),
            ruleAttributeRuleAttributeType: get(item, 'ruleAttributeType'),
            ruleAttributeUiComponent: get(item, 'uiComponent'),
            ruleAttributeDisplayField: get(item, 'displayField'),
            ruleAttributeValueField: get(item, 'valueField'),
            comparisonOperatorRemark: '',
            comparisonOperator: '',
            displayValue: '',
            comparisonValue: '',
          });
          form.resetFields([
            'comparisonOperatorRemark',
            'comparisonOperator',
            'displayValue',
            'comparisonValue',
          ]);
          this.setState({ itemData: formData });
        }
      },
      reader: {
        name: 'name',
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
        const { itemData: originItemData, actionKey: originAtionKey } = this.state;
        const formData = { ...originItemData };
        const comparisonOperator = get(item, 'comparisonOperator');
        Object.assign(formData, {
          comparisonOperatorRemark: get(item, 'comparisonOperatorRemark'),
          comparisonOperator,
          displayValue: '',
          comparisonValue: '',
        });
        form.resetFields(['displayValue', 'comparisonValue']);
        let actionKey = originAtionKey;
        if (comparisonOperator === 'COMPARER' || comparisonOperator === 'FUNCTION') {
          actionKey = ATTRIBUTE_ACTION.NORMAL.key;
        }
        this.setState({ itemData: formData, actionKey });
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
            <Form layout="horizontal" labelAlign="left">
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
