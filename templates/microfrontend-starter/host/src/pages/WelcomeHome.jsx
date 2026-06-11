import React from 'react';
import { AppstoreOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { buildMicroPath } from '../utils/microHash';
import { HOST_BRAND } from '../config/brand';
import './welcome-home.less';

const PLATFORM_POINTS = [
  '统一入口聚合多个业务子应用',
  '顶栏切换应用、侧栏承载各应用内路由',
  '同源网关与导航配置驱动，便于扩展新能力',
];

const WelcomeHome = ({ nav, onOpenApp }) => {
  const apps = nav?.apps ?? [];

  return (
    <div className="welcome-home">
      <div className="welcome-home__bg" aria-hidden />
      <section className="welcome-home__hero">
        <p className="welcome-home__eyebrow">Enterprise Middle Platform</p>
        <h1 className="welcome-home__title">{HOST_BRAND}</h1>
        <p className="welcome-home__lead">
          面向业务团队的统一中台系统：在一个壳层内完成多应用切换、权限与用户中心、以及可配置的微前端导航。
        </p>
        <ul className="welcome-home__points">
          {PLATFORM_POINTS.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </section>

      <section className="welcome-home__apps">
        <h2 className="welcome-home__section-title">子应用入口</h2>
        <div className="welcome-home__grid">
          {apps.map((app) => {
            const firstRoute = app.routes?.[0];
            const disabled = !firstRoute;
            return (
              <button
                key={app.key}
                type="button"
                className="welcome-home__card"
                disabled={disabled}
                onClick={() => {
                  if (!firstRoute) return;
                  const path = buildMicroPath(app.key, firstRoute.path);
                  if (path) onOpenApp(path);
                }}
              >
                <span className="welcome-home__card-icon" aria-hidden>
                  <AppstoreOutlined />
                </span>
                <span className="welcome-home__card-body">
                  <span className="welcome-home__card-title">{app.title}</span>
                  <span className="welcome-home__card-meta">
                    {firstRoute?.label ?? '暂无路由'}
                  </span>
                </span>
                <ArrowRightOutlined className="welcome-home__card-arrow" />
              </button>
            );
          })}
        </div>
      </section>

      <footer className="welcome-home__footer">
        从右上角登录用户中心，或通过上方顶栏进入各子应用。
      </footer>
    </div>
  );
};

export default WelcomeHome;
