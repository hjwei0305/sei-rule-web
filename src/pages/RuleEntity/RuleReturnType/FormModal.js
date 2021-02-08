import React, { PureComponent } from 'react';
import { get } from 'lodash';
import { Form, Input } from 'antd';
import { ExtModal, BannerTitle, ComboList } from 'suid';
import { constants } from '../../../utils';
import styles from './index.less';

const FormItem = Form.Item;
const { RETURN_RESULT_UI_COMPONENT } = constants;
const RETURN_RESULT_UI_COMPONENT_DATA = Object.keys(RETURN_RESULT_UI_COMPONENT).map(
  key => RETURN_RESULT_UI_COMPONENT[key],
);
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
    const title = rowData ? '修改' : '新建';
    const uiComponentProps = {
      form,
      name: 'uiComponent',
      dataSource: RETURN_RESULT_UI_COMPONENT_DATA,
      reader: {
        name: 'code',
        description: 'name',
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
        title={<BannerTitle title={title} subTitle="返回结果" />}
        onOk={this.handlerFormSubmit}
      >
        <Form {...formItemLayout} layout="horizontal" style={{ margin: 24 }}>
          <FormItem label="代码">
            {getFieldDecorator('code', {
              initialValue: get(rowData, 'code'),
              rules: [
                {
                  required: true,
                  message: '代码不能为空',
                },
              ],
            })(<Input autoComplete="off" placeholder="全类名" />)}
          </FormItem>
          <FormItem label="名称">
            {getFieldDecorator('name', {
              initialValue: get(rowData, 'name'),
              rules: [
                {
                  required: true,
                  message: '名称不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="UI组件">
            {getFieldDecorator('uiComponent', {
              initialValue: get(rowData, 'uiComponent'),
              rules: [
                {
                  required: true,
                  message: 'UI组件不能为空',
                },
              ],
            })(<ComboList {...uiComponentProps} placeholder="返回结果为接口对象的Id和Name" />)}
          </FormItem>
          <FormItem label="数据源接口地址">
            {getFieldDecorator('findDataUrl', {
              initialValue: get(rowData, 'findDataUrl'),
              rules: [
                {
                  required: true,
                  message: '数据源接口地址不能为空',
                },
              ],
            })(<Input autoComplete="off" placeholder="网关路径之后的相对路径" />)}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
