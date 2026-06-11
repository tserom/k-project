/**
 * 单个子应用挂载点：一个 WujieReact = 一个 iframe。
 * entryUrl、是否同步子路由（subAppBusName）均由接口 apps[] 下发，父应用不写死。
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import WujieReact from 'wujie-react';
import {
  normalizeEntryUrl,
  wujieInstanceName,
  WUJIE_PARENT_PAGE_EVENT,
  USER_FRONT_ROUTE_EVENT,
} from '../config/wujie';
import MicroNotFound from './MicroNotFound';

function normalizeSubPath(p) {
  if (!p || p === '/') return '/';
  return p.startsWith('/') ? p : `/${p}`;
}

function SubAppView({
  microAppKey,
  entryUrl: entryUrlRaw,
  subPath = '/',
  instanceId = 'default',
  active = true,
  invalid = false,
  subAppBusName,
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  const url = useMemo(() => normalizeEntryUrl(entryUrlRaw), [entryUrlRaw]);
  const name = wujieInstanceName(microAppKey || 'unknown', instanceId);
  const path = normalizeSubPath(subPath);
  const syncRouteToParent = Boolean(subAppBusName);

  const notifySubApp = useCallback(() => {
    if (!active) return;
    WujieReact.bus.$emit(WUJIE_PARENT_PAGE_EVENT, {
      pageKey: microAppKey,
      instanceId,
    });
    if (syncRouteToParent) {
      WujieReact.bus.$emit(USER_FRONT_ROUTE_EVENT, { path, instanceId });
    }
  }, [microAppKey, path, active, instanceId, syncRouteToParent]);

  useEffect(() => {
    notifySubApp();
  }, [notifySubApp]);

  useEffect(() => {
    setLoadFailed(false);
  }, [url]);

  if (invalid || !url) {
    return (
      <MicroNotFound
        title="无法打开子应用"
        subTitle="导航配置中缺少有效的 entryUrl，或访问路径未匹配任何子应用。"
      />
    );
  }

  if (loadFailed) {
    return (
      <MicroNotFound
        title="子应用加载失败"
        subTitle="请确认子应用已启动且地址可访问。"
      />
    );
  }

  return (
    <div className="micro-workspace__wujie-host">
      <WujieReact
        width="100%"
        height="100%"
        name={name}
        url={url}
        exec
        alive={false}
        sync={false}
        props={{
          instanceId,
          initialPath: syncRouteToParent ? path : undefined,
        }}
        afterMount={() => {
          notifySubApp();
          if (syncRouteToParent && active) {
            const payload = { path, instanceId };
            setTimeout(() => WujieReact.bus.$emit(USER_FRONT_ROUTE_EVENT, payload), 0);
            setTimeout(() => WujieReact.bus.$emit(USER_FRONT_ROUTE_EVENT, payload), 80);
          }
        }}
        loadError={(src, err) => {
          window.console.error('[wujie] loadError', src, err);
          setLoadFailed(true);
        }}
      />
    </div>
  );
}

export default SubAppView;
