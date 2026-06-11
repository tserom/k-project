import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, ConfigProvider, Button, Tooltip, Spin } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { useNavigation } from '../../hooks/useNavigation';
import { parseMicroPath, buildMicroPath } from '../../utils/microHash';
import { normalizeRoutePath } from '../../utils/pathUtils';
import { sideMenuItemKey, parseSideMenuKey, findAppByRoutePrefix } from '../../micro/pageTabModel';
import MicroWorkspace from '../../components/MicroWorkspace';
import HostUserMenu from '../../components/HostUserMenu';
import { HOST_BRAND } from '../../config/brand';
import './tokens.less';
import './modern.less';

const { Header, Sider, Content } = Layout;

const MODERN_THEME = {
  primaryColor: '#4f46e5',
  linkColor: '#4f46e5',
  borderRadiusBase: 8,
  fontFamily:
    '"Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
};

/**
 * modern 布局（默认）：白色顶栏 + 可收起浅色侧栏 + 卡片化内容区，靛蓝主色。
 * 视觉全部走 tokens.less 的 --host-m-* 变量；想定制复制本目录改 JSX/Less 即可。
 */
const ModernLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { nav, navWarning } = useNavigation();
  const workspaceRef = useRef(null);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  const { routePrefix, subPath } = useMemo(
    () => parseMicroPath(location.pathname),
    [location.pathname],
  );

  const activeApp = useMemo(() => {
    if (!routePrefix || !nav?.apps?.length) return null;
    return findAppByRoutePrefix(nav, routePrefix);
  }, [nav, routePrefix]);

  const topKey = activeApp?.key;

  const selectedSideMenuKey = useMemo(() => {
    if (!activeApp) return null;
    const sp = normalizeRoutePath(subPath);
    const match = activeApp.routes.find(
      (r) => normalizeRoutePath(r.path) === sp,
    );
    const route = match ?? activeApp.routes[0];
    return route ? sideMenuItemKey(activeApp.key, route.key) : null;
  }, [activeApp, subPath]);

  const navigateApp = useCallback(
    (app, route) => {
      if (!app || !route) return;
      const path = buildMicroPath(app.key, route.path);
      if (path) navigate(path);
    },
    [navigate],
  );

  function onTopClick({ key }) {
    const app = nav?.apps?.find((a) => a.key === key);
    if (!app?.routes?.length) return;
    navigateApp(app, app.routes[0]);
  }

  function onSideClick({ key }) {
    const { appKey, routeKey } = parseSideMenuKey(key);
    const app = nav?.apps?.find((a) => a.key === appKey);
    if (!app) return;
    const route = app.routes.find((r) => r.key === routeKey);
    if (!route) return;
    navigateApp(app, route);
  }

  function handleLogout() {
    workspaceRef.current?.clearAllTabs();
  }

  const topMenuItems = (nav?.apps ?? []).map((app) => ({
    key: app.key,
    label: (
      <span className="modern-layout__top-item">
        <AppstoreOutlined />
        <span>{app.title}</span>
      </span>
    ),
  }));

  const sideMenuItems = activeApp
    ? activeApp.routes.map((r) => ({
        key: sideMenuItemKey(activeApp.key, r.key),
        label: r.label,
      }))
    : [];

  const showSider = Boolean(activeApp);
  const showSideMenu = sideMenuItems.length > 0;

  if (!nav) {
    return (
      <div className="micro-workspace__nav-loading">
        <Spin size="large" tip="加载导航配置…" />
      </div>
    );
  }

  return (
    <ConfigProvider locale={zhCN} theme={MODERN_THEME}>
      <Layout className="modern-layout">
        <Header className="modern-layout__header">
          <div className="modern-layout__brand">
            <span className="modern-layout__brand-mark" aria-hidden>
              {(HOST_BRAND[0] || 'K').toUpperCase()}
            </span>
            <span className="modern-layout__brand-text">{HOST_BRAND}</span>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={topKey ? [topKey] : []}
            items={topMenuItems}
            onClick={onTopClick}
            className="modern-layout__top-menu"
          />
          <div className="modern-layout__header-end">
            <HostUserMenu nav={nav} navigate={navigate} onLogout={handleLogout} />
          </div>
        </Header>
        <Layout className="modern-layout__body">
          {showSider ? (
            <Sider
              width={240}
              collapsedWidth={68}
              collapsible
              collapsed={siderCollapsed}
              onCollapse={setSiderCollapsed}
              className="modern-layout__sider"
              theme="light"
              trigger={null}
            >
              <div className="modern-layout__sider-head">
                {!siderCollapsed && activeApp ? (
                  <span className="modern-layout__sider-app">{activeApp.title}</span>
                ) : null}
              </div>
              {showSideMenu ? (
                <Menu
                  mode="inline"
                  selectedKeys={selectedSideMenuKey ? [selectedSideMenuKey] : []}
                  items={sideMenuItems}
                  onClick={onSideClick}
                  className="modern-layout__side-menu"
                />
              ) : (
                <div className="modern-layout__sider-empty">
                  <CompassOutlined className="modern-layout__sider-empty-icon" aria-hidden />
                  {!siderCollapsed ? (
                    <p className="modern-layout__sider-empty-text">该应用暂无菜单项</p>
                  ) : null}
                </div>
              )}
              <div className="modern-layout__sider-footer">
                <Tooltip title={siderCollapsed ? '展开侧栏' : '收起侧栏'} placement="right">
                  <Button
                    type="text"
                    block
                    className="modern-layout__sider-trigger"
                    icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setSiderCollapsed((c) => !c)}
                  />
                </Tooltip>
              </div>
            </Sider>
          ) : null}
          <Layout className="modern-layout__inner">
            <Content className="modern-layout__content">
              <MicroWorkspace ref={workspaceRef} nav={nav} navWarning={navWarning} />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default ModernLayout;
