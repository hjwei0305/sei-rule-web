import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import {
  Drawer,
  Layout,
  Button,
  Result,
  Descriptions,
  Switch,
  Skeleton,
  Card,
  Tag,
  message,
  Popover,
  Collapse,
} from 'antd';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-github';
import { utils, BannerTitle, ExtIcon, ScrollBar } from 'suid';
import styles from './index.less';

const { Meta } = Card;
const { Panel } = Collapse;
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
      allChains: false,
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

  handlerAllChainsChange = allChains => {
    this.setState({ allChains });
  };

  handlerStart = () => {
    const { dispatch, ruleType } = this.props;
    const { executeMethod, allChains, ruleEntityJson } = this.state;
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
          allChains,
          ruleEntityJson: jsonData,
          ruleTypeCode: get(ruleType, 'code'),
        },
      });
    }
  };

  backAndStart = () => {
    this.handlerStart();
  };

  showRuleLegend = () => {
    const {
      ruleTestRun: { ruleTestResult },
      showRuleLegend,
    } = this.props;
    const { ruleTreeRoot, responses } = ruleTestResult;
    if (ruleTreeRoot && showRuleLegend && showRuleLegend instanceof Function) {
      const ids = responses.map(r => r.matchedNodeId);
      showRuleLegend(ruleTreeRoot, ids);
    }
  };

  handlerCopy = returnEntityMap => {
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
        theme="tomorrow"
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
      return <ExtIcon type="check-circle" antd style={{ color: '#25a77e' }} />;
    }
    return null;
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

  renderRuleTestResult = () => {
    const {
      loading,
      ruleTestRun: { ruleTestResult },
    } = this.props;
    const { ruleTreeRoot, responses } = ruleTestResult;
    const startLoading = loading.effects['ruleTestRun/ruleTestStartRun'];
    const expKeys = responses.map(r => r.matchedNodeId);
    return (
      <>
        <Card
          bordered={false}
          className="result-detail-box"
          title="命中规则"
          extra={
            <>
              <Button type="primary" loading={startLoading} onClick={this.backAndStart}>
                继续测试
              </Button>
              <Button
                onClick={this.showRuleLegend}
                disabled={responses.length === 0 || startLoading}
              >
                查看规则树
              </Button>
            </>
          }
        >
          <Skeleton loading={startLoading} avatar active>
            <Meta
              title={get(ruleTreeRoot, 'name')}
              description={
                <span>
                  优先级：<em className="count">{get(ruleTreeRoot, 'rank') || '-'}</em> ，共命中{' '}
                  <em className="count">{responses.length}</em> 条规则链
                </span>
              }
            />
          </Skeleton>
        </Card>
        {startLoading === false && responses.length > 0 ? (
          <>
            <div className="detail-header">规则链返回结果</div>
            <Collapse defaultActiveKey={expKeys} bordered={false}>
              {responses.map((res, idx) => {
                const { returnConstant, returnEntityMap, matchedNodeId, matchedNodeName } = res;
                return (
                  <Panel
                    key={matchedNodeId}
                    header={
                      <>
                        <Tag style={{ marginRight: 4 }}>{idx + 1}</Tag>
                        {matchedNodeName}
                      </>
                    }
                  >
                    <Descriptions column={1} className="result-detail">
                      <Descriptions.Item label="返回常量">
                        {returnConstant || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="返回的实体" className="message-text">
                        {returnEntityMap ? (
                          <>
                            <ExtIcon
                              type="copy"
                              className="copy-btn"
                              antd
                              tooltip={{ title: '复制内容到粘贴板' }}
                              onClick={() => this.handlerCopy(returnEntityMap)}
                            />
                            {this.renderReturnEntityMap(returnEntityMap)}
                          </>
                        ) : (
                          '无'
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </Panel>
                );
              })}
            </Collapse>
          </>
        ) : null}
      </>
    );
  };

  renderResultContent = () => {
    const {
      ruleTestRun: { ruleTestResult },
      loading,
    } = this.props;
    const startLoading = loading.effects['ruleTestRun/ruleTestStartRun'];
    const { allChains, executeMethod } = this.state;
    return (
      <>
        <Card size="small" title="测试选项" bordered={false}>
          <div className="form-box">
            <div className="check-btn">
              <span className="label">执行服务方法</span>
              <Switch
                size="small"
                checked={executeMethod}
                disabled={startLoading}
                onChange={this.handlerServiceMethodChange}
              />
            </div>
            <div className="check-btn">
              <span className="label">执行所有规则链</span>
              <Switch
                size="small"
                checked={allChains}
                disabled={startLoading}
                onChange={this.handlerAllChainsChange}
              />
            </div>
          </div>
        </Card>
        {ruleTestResult ? this.renderRuleTestResult() : null}
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
      return null;
    }
    return (
      <div className="start-btn-box">
        {startLoading ? <div className="loading" /> : null}
        <Button
          onClick={this.handlerStart}
          className={cls('start-btn', { enabled: !startLoading && !startDisabled })}
          shape="circle"
          style={{ width: 100, height: 100 }}
          disabled={startLoading || startDisabled}
        >
          开始测试
        </Button>
      </div>
    );
  };

  render() {
    const {
      showTest,
      ruleTestRun: { ruleTestResult },
    } = this.props;
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
                title={ruleTestResult ? '测试结果' : ''}
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
