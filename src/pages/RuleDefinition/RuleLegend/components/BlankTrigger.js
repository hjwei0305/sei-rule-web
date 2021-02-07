import React from 'react';
import { Empty, Icon } from 'antd';
import styles from './BlankTrigger.less';

const BlankTrigger = ({ items, addItem, title }) => {
  return (
    <div className={styles['blank-trigger-box']}>
      {items.length === 0 ? (
        <>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
          <div className="horizontal big-add-btn" onClick={e => addItem(e)}>
            <Icon type="plus" style={{ fontSize: '16px', marginTop: 2 }} />
            <span className="btn-text">{title}</span>
          </div>
        </>
      ) : (
        <div className="horizontal big-add-btn" onClick={e => addItem(e)}>
          <Icon type="plus" style={{ fontSize: '16px' }} />
          <span className="btn-text">{title}</span>
        </div>
      )}
    </div>
  );
};

export default BlankTrigger;
