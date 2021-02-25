import React, { PureComponent } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Form, Input } from 'antd';
import { BannerTitle } from 'suid';
import styles from './Form.less';

const { TextArea } = Input;
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
class RoleGroupForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handlerFormSubmit = () => {
    const { form, save, parentNodeData, nodeData, handlerPopoverHide } = this.props;
    const { validateFields, getFieldsValue } = form;
    validateFields(errors => {
      if (errors) {
        return;
      }
      const data = Object.assign(nodeData || {}, getFieldsValue());
      Object.assign(data, {
        ruleEntityTypeId: get(parentNodeData, 'id'),
      });
      save(data, handlerPopoverHide);
    });
  };

  getInitValueByFields = (field, value) => {
    const { nodeData } = this.props;
    let tempData = value;
    if (!tempData) {
      tempData = get(nodeData, field);
    }
    return tempData;
  };

  render() {
    const { form, nodeData, saving } = this.props;
    const { getFieldDecorator } = form;
    const title = nodeData ? '编辑' : '新建';
    return (
      <div key="form-box" className={cls(styles['form-box'])}>
        <div className="base-view-body">
          <div className="header">
            <BannerTitle title={title} subTitle="规则类型" />
          </div>
          <Form {...formItemLayout}>
            <FormItem label="代码">
              {getFieldDecorator('code', {
                initialValue: this.getInitValueByFields('code'),
              })(<Input autoComplete="off" placeholder="实体类型代码-名称简称" />)}
            </FormItem>
            <FormItem label="名称">
              {getFieldDecorator('name', {
                initialValue: this.getInitValueByFields('name'),
                rules: [
                  {
                    required: true,
                    message: '名称不能为空',
                  },
                ],
              })(<Input autoComplete="off" />)}
            </FormItem>
            <FormItem label="业务描述">
              {getFieldDecorator('remark', {
                initialValue: this.getInitValueByFields('remark'),
              })(
                <TextArea
                  style={{ resize: 'none' }}
                  maxLength={200}
                  rows={6}
                  placeholder="规则的使用场景"
                />,
              )}
            </FormItem>
            <FormItem wrapperCol={{ span: 4, offset: 4 }} className="btn-submit">
              <Button type="primary" loading={saving} onClick={this.handlerFormSubmit}>
                <FormattedMessage id="global.save" defaultMessage="保存" />
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
    );
  }
}

export default RoleGroupForm;
