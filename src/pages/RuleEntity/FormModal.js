import React, { PureComponent } from 'react';
import { get } from 'lodash';
import { Form, Input } from 'antd';
import { ExtModal, BannerTitle } from 'suid';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};

@Form.create()
class FormModal extends PureComponent {
  handlerFormSubmit = () => {
    const { form, save, currentRuleEntityType } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {};
      Object.assign(params, currentRuleEntityType || {});
      Object.assign(params, formData);
      save(params);
    });
  };

  render() {
    const {
      form,
      currentRuleEntityType,
      closeRuleEntityTypeFormModal,
      saving,
      showRuleEntityTypeFormModal,
    } = this.props;
    const { getFieldDecorator } = form;
    const title = currentRuleEntityType ? '修改' : '新建';
    return (
      <ExtModal
        destroyOnClose
        onCancel={closeRuleEntityTypeFormModal}
        visible={showRuleEntityTypeFormModal}
        centered
        bodyStyle={{ paddingBottom: 0 }}
        confirmLoading={saving}
        onOk={this.handlerFormSubmit}
        title={<BannerTitle title={title} subTitle="规则业务实体" />}
      >
        <Form {...formItemLayout} layout="horizontal">
          <FormItem label="代码">
            {getFieldDecorator('code', {
              initialValue: get(currentRuleEntityType, 'code'),
              rules: [
                {
                  required: true,
                  message: '代码不能为空',
                },
              ],
            })(<Input autoComplete="off" maxLength={50} />)}
          </FormItem>
          <FormItem label="名称">
            {getFieldDecorator('name', {
              initialValue: get(currentRuleEntityType, 'name'),
              rules: [
                {
                  required: true,
                  message: '名称不能为空',
                },
              ],
            })(<Input autoComplete="off" maxLength={50} />)}
          </FormItem>
          <FormItem label="服务名">
            {getFieldDecorator('serviceName', {
              initialValue: get(currentRuleEntityType, 'serviceName'),
              rules: [
                {
                  required: true,
                  message: '名称不能为空',
                },
              ],
            })(
              <Input
                autoComplete="off"
                maxLength={50}
                placeholder="一般为SEI平台FeignClient的服务名"
              />,
            )}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
