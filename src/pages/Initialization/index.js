import React, {Component} from 'react';
import {connect} from 'dva';
import cls from 'classnames';
import {Button, Card, Tag, PageHeader} from 'antd';
import {ExtIcon, PageLoader, ScrollBar} from 'suid';
import styles from './index.less';


@connect(({initialization, loading}) => ({initialization, loading,}))
class Initialization extends Component {

  static doTaskIndex;

  constructor(props) {
    super(props);
    this.doTaskIndex = 0;
    this.state = {
      performTaskLoading: false
    };
  }

  doTask = (id, taskIds) => {
    const {dispatch} = this.props;
    if (id) {
      dispatch({
        type: 'initialization/performTask',
        payload: id,
        callback: res => {
          if (res.success) {
            if (this.doTaskIndex < taskIds.length - 1) {
              this.doTaskIndex += 1;
              this.doTask(taskIds[this.doTaskIndex], taskIds);
            } else {
              this.setState({performTaskLoading: false});
            }
          } else {
            this.setState({performTaskLoading: false});
          }
        },
      });
    }
  };

  performTaskList = () => {
    const {initialization} = this.props;
    const {taskIds} = initialization;
    this.setState({performTaskLoading: true});
    this.doTask(taskIds[0], taskIds);
  };

  renderTaskCard = (task) => {
    const {id, name, result} = task;
    const {success, message} = result || {};
    const description = result ? (
      <div className='card-item-description'>
        {
          success ?
            <ExtIcon type='check-circle' theme="filled" style={{color: '#52c41a'}} antd/> :
            <ExtIcon type='exclamation-circle' theme="filled" style={{color: '#f5222d'}} antd/>
        }
        <span style={{marginLeft: '8px'}}>{message}</span>
      </div>
    ) : null;

    return (
      <Card bordered={false} key={id}>
        <Card.Meta
          avatar={<Tag>{id}</Tag>}
          title={name}
          description={description}
        />
      </Card>
    );
  };

  render() {
    const {performTaskLoading} = this.state;
    const {loading, initialization} = this.props;
    const {taskData} = initialization;
    return (
      <div className={cls(styles['container-box'])}>
        {loading.effects['initialization/getInitializeTasks'] ? <PageLoader/> : (
          <div className='tasks-wrapper'>
            <PageHeader
              title="初始化任务清单"
              extra={[
                <Button key="1"
                        loading={performTaskLoading}
                        type='primary'
                        disabled={performTaskLoading}
                        onClick={this.performTaskList}>
                  执行初始化
                </Button>
              ]}
            >
              <ScrollBar>
                {(taskData || []).map((t) => this.renderTaskCard(t))}
              </ScrollBar>
            </PageHeader>
          </div>
        )}
      </div>
    );
  }
}

export default Initialization;
