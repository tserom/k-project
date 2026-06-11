import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Spin, Tabs } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import WujieReact from 'wujie-react';
import { parseMicroPath } from '../utils/microHash';
import { useMicroPageTabs } from '../micro/useMicroPageTabs';
import SubAppView from './SubAppView';
import WelcomeHome from '../pages/WelcomeHome';

const { bus } = WujieReact;

/**
 * 内容区整体（布局无关）：欢迎页 / 进入中 / 多页签 + 无界子应用。
 * 页签状态与 wujie bus 接线都在这里，布局组件只负责把它放进自己的 Content。
 * 通过 ref 暴露 clearAllTabs（退出登录时由布局显式调用）。
 */
const MicroWorkspace = forwardRef(function MicroWorkspace({ nav, navWarning }, ref) {
  const location = useLocation();
  const navigate = useNavigate();

  const { routePrefix } = useMemo(
    () => parseMicroPath(location.pathname),
    [location.pathname],
  );

  const { pageTabs, activeKey, onTabChange, onTabEdit, clearAllTabs } =
    useMicroPageTabs(nav, location.pathname, navigate, bus);

  useImperativeHandle(ref, () => ({ clearAllTabs }), [clearAllTabs]);

  const showWelcome = pageTabs.length === 0 && routePrefix === null;
  const showEntering = pageTabs.length === 0 && routePrefix !== null;

  return (
    <>
      {navWarning ? (
        <Alert
          className="micro-workspace__nav-alert"
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message="导航配置未完全加载"
          description={navWarning}
          closable
        />
      ) : null}
      <div
        className={
          showWelcome
            ? 'micro-workspace__panel micro-workspace__panel--welcome'
            : 'micro-workspace__panel'
        }
      >
        {showWelcome ? (
          <WelcomeHome nav={nav} onOpenApp={(path) => navigate(path)} />
        ) : showEntering ? (
          <div className="micro-workspace__entering">
            <Spin size="large" tip="正在进入应用…" />
          </div>
        ) : (
          <Tabs
            className="micro-workspace__tabs"
            type="editable-card"
            hideAdd
            destroyInactiveTabPane={false}
            activeKey={activeKey}
            onChange={onTabChange}
            onEdit={onTabEdit}
            items={pageTabs.map((tab) => ({
              key: tab.id,
              label: tab.label,
              closable: true,
              children: (
                <div className="micro-workspace__page micro-workspace__page--wujie">
                  <SubAppView
                    microAppKey={tab.microAppKey}
                    entryUrl={tab.entryUrl}
                    subPath={tab.subPath}
                    instanceId={tab.id}
                    active={activeKey === tab.id}
                    invalid={tab.invalid}
                    subAppBusName={tab.subAppBusName}
                  />
                </div>
              ),
            }))}
          />
        )}
      </div>
    </>
  );
});

export default MicroWorkspace;
