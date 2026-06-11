import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

/** 无效子应用路由、缺失 entryUrl 或子应用加载失败时的占位 */
export default function MicroNotFound({ title = '页面不存在', subTitle }) {
  const navigate = useNavigate();
  return (
    <div className="micro-workspace__not-found">
      <Result
        status="404"
        title={title}
        subTitle={subTitle ?? '请检查导航配置或访问地址是否正确。'}
        extra={
          <Button type="primary" onClick={() => navigate('/', { replace: true })}>
            返回首页
          </Button>
        }
      />
    </div>
  );
}
