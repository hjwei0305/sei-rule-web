import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import { Drawer, Layout, Button, Result, Descriptions, Switch, Tag, message, Popover } from 'antd';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-github';
import { utils, BannerTitle, ExtIcon, ScrollBar } from 'suid';
import empty from '@/assets/tip.svg';
import styles from './index.less';

const { getUUID } = utils;
const { Sider, Content } = Layout;

@connect(({ ruleTestRun, loading }) => ({
  ruleTestRun,
  loading,
}))
class RuleTest extends PureComponent {
  static ace;

  static aceId;

  static propTypes = {
    ruleType: PropTypes.object,
    showTest: PropTypes.bool,
    closeTest: PropTypes.func,
    showRuleLegend: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.aceId = getUUID();
    this.state = {
      ruleEntityJson: '',
      executeMethod: false,
    };
  }

  componentDidMount() {
    this.resize();
  }

  componentWillUnmount() {
    this.ace = null;
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleTestRun/updateState',
      payload: {
        ruleTestResult: null,
      },
    });
  }

  resize = () => {
    setTimeout(() => {
      const resize = new Event('resize');
      window.dispatchEvent(resize);
    }, 300);
  };

  handlerClose = () => {
    const { closeTest } = this.props;
    if (closeTest) {
      closeTest();
    }
  };

  handlerComplete = ace => {
    this.ace = ace;
    if (ace) {
      this.resize();
    }
  };

  handlerAceChannge = ruleEntityJson => {
    this.setState({ ruleEntityJson });
  };

  handlerServiceMethodChange = executeMethod => {
    this.setState({ executeMethod });
  };

  handlerStart = () => {
    const { dispatch, ruleType } = this.props;
    const { executeMethod, ruleEntityJson } = this.state;
    let jsonData = '';
    try {
      jsonData = JSON.stringify(JSON.parse(ruleEntityJson));
    } catch {
      message.destroy();
      message.error('Json数据格式不正确!');
    }
    if (jsonData) {
      dispatch({
        type: 'ruleTestRun/ruleTestStartRun',
        payload: {
          executeMethod,
          ruleEntityJson: jsonData,
          ruleTypeCode: get(ruleType, 'code'),
        },
      });
    }
  };

  goback = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ruleTestRun/updateState',
      payload: {
        ruleTestResult: null,
      },
    });
  };

  backAndStart = () => {
    this.handlerStart();
  };

  showRuleLegend = () => {
    const {
      ruleTestRun: { ruleTestResult },
      showRuleLegend,
    } = this.props;
    const { matched, ruleTreeRoot, matchedNodeId } = ruleTestResult;
    if (matched && ruleTreeRoot && showRuleLegend && showRuleLegend instanceof Function) {
      showRuleLegend(ruleTreeRoot, matchedNodeId);
    }
  };

  handlerCopy = () => {
    const {
      ruleTestRun: { ruleTestResult },
    } = this.props;
    const { returnEntityMap } = ruleTestResult || {};
    if (returnEntityMap) {
      copy(JSON.stringify(returnEntityMap));
      message.success(`已复制到粘贴板`);
    }
  };

  paramsDemo = () => {
    const demoAce = getUUID();
    return (
      <AceEditor
        mode="json"
        theme="github"
        name={demoAce}
        fontSize={14}
        showPrintMargin={false}
        showGutter={false}
        readOnly
        highlightActiveLine={false}
        width="260px"
        height="120px"
        value={'{\n  "key1":1,\n  "key2":true,\n  "key3":"text"\n}'}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: true,
          showLineNumbers: false,
          tabSize: 2,
        }}
      />
    );
  };

  renderTitle = () => {
    const { ruleType } = this.props;
    const title = get(ruleType, 'name');
    return (
      <>
        <ExtIcon onClick={this.handlerClose} type="left" className="trigger-back" antd />
        <BannerTitle title={title} subTitle="规则测试" />
        <Popover title="Json样例参考" content={this.paramsDemo()}>
          <ExtIcon
            antd
            type="question-circle"
            style={{ marginLeft: 4, position: 'relative', color: '#666666', cursor: 'pointer' }}
          />
        </Popover>
      </>
    );
  };

  renderResultIcon = () => {
    const {
      ruleTestRun: { ruleTestResult },
    } = this.props;
    if (ruleTestResult) {
      const { matched } = ruleTestResult;
      if (matched) {
        return <ExtIcon type="check-circle" antd style={{ color: '#25a77e' }} />;
      }
      return <ExtIcon type="close-circle" antd style={{ color: '#ff4d4f' }} />;
    }
    return <img src={empty} alt="" />;
  };

  renderExecuteMethodDesc = executed => {
    const { executeMethod } = this.state;
    if (executed) {
      return <Tag color="blue">执行了服务方法成功</Tag>;
    }
    if (executeMethod) {
      return <Tag color="red">执行了服务方法失败</Tag>;
    }
    return <Tag color="blue">未执行服务方法</Tag>;
  };

  renderReturnEntityMap = data => {
    const aceId = getUUID();
    return (
      <AceEditor
        mode="json"
        theme="github"
        name={aceId}
        fontSize={14}
        showPrintMargin={false}
        showGutter={false}
        readOnly
        onLoad={this.handlerComplete}
        highlightActiveLine={false}
        width="100%"
        height="260px"
        value={JSON.stringify(data || '', null, '\t')}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: true,
          showLineNumbers: false,
          tabSize: 2,
        }}
      />
    );
  };

  renderResultContent = () => {
    const {
      ruleTestRun: { ruleTestResult },
      loading,
    } = this.props;
    if (ruleTestResult) {
      const { matched, returnConstant, ruleTreeRoot, returnEntityMap } = ruleTestResult;
      return (
        <>
          <Descriptions title="测试结果" column={1} className="result-detail">
            <Descriptions.Item label="规则匹配">
              {matched ? <Tag color="green">成功</Tag> : <Tag color="red">失败</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="执行服务方法">
              {this.renderExecuteMethodDesc()}
            </Descriptions.Item>
            <Descriptions.Item label="返回常量">{returnConstant || '-'}</Descriptions.Item>
            <Descriptions.Item label="命中的规则名称">
              {get(ruleTreeRoot, 'name') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="命中的规则优先级">
              {get(ruleTreeRoot, 'rank') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="返回的实体" className="message-text">
              <ExtIcon
                type="copy"
                className="copy-btn"
                antd
                tooltip={{ title: '复制内容到粘贴板' }}
                onClick={() => this.handlerCopy('url')}
              />
              {this.renderReturnEntityMap(returnEntityMap)}
            </Descriptions.Item>
          </Descriptions>
        </>
      );
    }
    const startLoading = loading.effects['ruleTestRun/ruleTestStartRun'];
    return (
      <>
        <div className="check-btn">
          <span className="label">执行服务方法</span>
          <Switch size="small" disabled={startLoading} onChange={this.handlerServiceMethodChange} />
        </div>
        <div>请输入JSON后开始</div>
      </>
    );
  };

  renderResultButton = () => {
    const { ruleEntityJson } = this.state;
    const startDisabled = !ruleEntityJson;
    const {
      ruleTestRun: { ruleTestResult },
      loading,
    } = this.props;
    const startLoading = loading.effects['ruleTestRun/ruleTestStartRun'];
    if (ruleTestResult) {
      const { matched } = ruleTestResult;
      return (
        <>
          <Button type="primary" loading={startLoading} onClick={this.backAndStart}>
            再次执行
          </Button>
          <Button disabled={startLoading} onClick={this.goback}>
            返回测试
          </Button>
          <Button onClick={this.showRuleLegend} disabled={!matched || startLoading}>
            查看规则树
          </Button>
        </>
      );
    }
    return (
      <div className="start-btn-box">
        {startLoading ? <div className="loading" /> : null}
        <Button
          onClick={this.handlerStart}
          className="start-btn"
          shape="circle"
          style={{ width: 100, height: 100 }}
          type="primary"
          disabled={startLoading || startDisabled}
        >
          开始测试
        </Button>
      </div>
    );
  };

  render() {
    const { showTest } = this.props;
    const { ruleEntityJson } = this.state;
    return (
      <Drawer
        width="100%"
        destroyOnClose
        getContainer={false}
        placement="right"
        visible={showTest}
        title={this.renderTitle()}
        className={cls(styles['rule-test-box'])}
        onClose={this.handlerClose}
        style={{ position: 'absolute' }}
      >
        <Layout className="auto-height">
          <Content className={cls('main-content', 'auto-height')} style={{ paddingRight: 4 }}>
            <AceEditor
              mode="json"
              theme="tomorrow"
              name={this.aceId}
              fontSize={16}
              placeholder="请输入测试Json"
              showPrintMargin={false}
              highlightActiveLine
              width="100%"
              height="100%"
              value={ruleEntityJson}
              onChange={this.handlerAceChannge}
              onLoad={this.handlerComplete}
              setOptions={{
                enableBasicAutocompletion: false,
                enableLiveAutocompletion: false,
                enableSnippets: false,
                tabSize: 2,
              }}
            />
          </Content>
          <Sider width={480} className={cls('right-content', 'auto-height')} theme="light">
            <ScrollBar>
              <Result
                icon={this.renderResultIcon()}
                subTitle={this.renderResultContent()}
                extra={this.renderResultButton()}
              />
            </ScrollBar>
          </Sider>
        </Layout>
      </Drawer>
    );
  }
}

export default RuleTest;
