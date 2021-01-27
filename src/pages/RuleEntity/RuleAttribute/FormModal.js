import React, { PureComponent } from 'react';
import { get } from 'lodash';
import { Form, Input } from 'antd';
import { ExtModal, BannerTitle, ComboList } from 'suid';
import { constants } from '../../../utils';
import styles from './index.less';

const { SERVER_PATH } = constants;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

@Form.create()
class FormModal extends PureComponent {
  handlerFormSubmit = () => {
    const { form, save, rowData } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {};
      Object.assign(params, rowData || {});
      Object.assign(params, formData);
      save(params);
    });
  };

  render() {
    const { form, rowData, closeFormModal, saving, showModal } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('ruleAttributeType', { initialValue: get(rowData, 'ruleAttributeType') });
    const title = rowData ? '修改' : '新建';
    const dataTypeProps = {
      form,
      name: 'ruleAttributeTypeRemark',
      store: {
        url: `${SERVER_PATH}/sei-rule/ruleAttribute/getRuleAttributeTypeEnum`,
      },
      field: ['ruleAttributeType'],
      reader: {
        name: 'remark',
        description: 'name',
        field: ['name'],
      },
    };
    return (
      <ExtModal
        destroyOnClose
        onCancel={closeFormModal}
        visible={showModal}
        centered
        wrapClassName={styles['form-modal-box']}
        bodyStyle={{ padding: 0 }}
        confirmLoading={saving}
        title={<BannerTitle title={title} subTitle="属性" />}
        onOk={this.handlerFormSubmit}
      >
        <Form {...formItemLayout} layout="horizontal" style={{ margin: 24 }}>
          <FormItem label="属性名">
            {getFieldDecorator('attribute', {
              initialValue: get(rowData, 'attribute'),
              rules: [
                {
                  required: true,
                  message: '属性名不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="属性描述">
            {getFieldDecorator('name', {
              initialValue: get(rowData, 'name'),
              rules: [
                {
                  required: true,
                  message: '属性描述不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="数据类型">
            {getFieldDecorator('ruleAttributeTypeRemark', {
              initialValue: get(rowData, 'ruleAttributeTypeRemark'),
              rules: [
                {
                  required: true,
                  message: '数据类型不能为空',
                },
              ],
            })(<ComboList {...dataTypeProps} />)}
          </FormItem>
          <FormItem label="UI组件">
            {getFieldDecorator('uiComponent', {
              initialValue: get(rowData, 'uiComponent'),
            })(<Input placeholder="默认是文本框" />)}
          </FormItem>
          <FormItem label="值源字段名">
            {getFieldDecorator('matchField', {
              initialValue: get(rowData, 'matchField'),
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="数据源接口地址">
            {getFieldDecorator('findDataUrl', {
              initialValue: get(rowData, 'findDataUrl'),
            })(<Input autoComplete="off" />)}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
