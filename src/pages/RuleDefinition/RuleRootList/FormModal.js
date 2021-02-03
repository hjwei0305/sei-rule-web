import React, { PureComponent } from 'react';
import { get } from 'lodash';
import { Form, Input, Switch } from 'antd';
import { ExtModal, BannerTitle, MoneyInput } from 'suid';
import styles from './index.less';

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
    const { form, save, currentRuleRoot } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {};
      Object.assign(params, currentRuleRoot || {});
      Object.assign(params, formData);
      save(params);
    });
  };

  render() {
    const { form, currentRuleRoot, closeFormModal, saving, showModal } = this.props;
    const { getFieldDecorator } = form;
    return (
      <ExtModal
        destroyOnClose
        onCancel={closeFormModal}
        visible={showModal}
        centered
        wrapClassName={styles['form-modal-box']}
        bodyStyle={{ padding: 0 }}
        confirmLoading={saving}
        title={<BannerTitle title={get(currentRuleRoot, 'name')} subTitle="设置" />}
        onOk={this.handlerFormSubmit}
      >
        <Form {...formItemLayout} layout="horizontal" style={{ margin: 24 }}>
          <FormItem label="规则名称">
            {getFieldDecorator('name', {
              initialValue: get(currentRuleRoot, 'name'),
              rules: [
                {
                  required: true,
                  message: '规则名称不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="优先级">
            {getFieldDecorator('rank', {
              initialValue: get(currentRuleRoot, 'rank'),
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
          <FormItem label="启用">
            {getFieldDecorator('enabled', {
              initialValue: get(currentRuleRoot, 'enabled') || false,
              valuePropName: 'checked',
            })(<Switch size="small" />)}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
