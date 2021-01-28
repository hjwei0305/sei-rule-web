import React, { PureComponent } from 'react';
import { get } from 'lodash';
import { Form, Input } from 'antd';
import { ExtModal, BannerTitle } from 'suid';
import styles from './index.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
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
    return (
      <ExtModal
        destroyOnClose
        onCancel={closeFormModal}
        visible={showModal}
        centered
        wrapClassName={styles['form-modal-box']}
        bodyStyle={{ padding: 0 }}
        confirmLoading={saving}
        title={<BannerTitle title={title} subTitle="比较器" />}
        onOk={this.handlerFormSubmit}
      >
        <Form {...formItemLayout} layout="horizontal" style={{ margin: 24 }}>
          <FormItem label="方法名">
            {getFieldDecorator('method', {
              initialValue: get(rowData, 'method'),
              rules: [
                {
                  required: true,
                  message: '方法名不能为空',
                },
              ],
            })(<Input autoComplete="off" placeholder="API调用服务的方法名" />)}
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
          <FormItem label="API相对路径">
            {getFieldDecorator('path', {
              initialValue: get(rowData, 'path'),
              rules: [
                {
                  required: true,
                  message: 'API相对路径不能为空',
                },
              ],
            })(<Input autoComplete="off" placeholder="API调用服务的路径" />)}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
