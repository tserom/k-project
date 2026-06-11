import { parseMicroPath } from '../utils/microHash';
import { normalizeRoutePath } from '../utils/pathUtils';

/** 主路由路径比较（与导航、页签里存的 fullPath 对齐） */
export function pathsEqual(a, b) {
  return normalizeRoutePath(a) === normalizeRoutePath(b);
}

export function makePageTabId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function findAppByRoutePrefix(nav, routePrefix) {
  if (!routePrefix || !nav?.apps?.length) return null;
  return nav.apps.find((a) => a.key === routePrefix) ?? null;
}

export function findAppByMicroKey(nav, microAppKey) {
  return nav?.apps?.find((a) => a.microAppKey === microAppKey);
}

export function labelForSubPath(nav, microAppKey, subPath) {
  const app = findAppByMicroKey(nav, microAppKey);
  const sp = normalizeRoutePath(subPath);
  const route = app?.routes?.find((r) => normalizeRoutePath(r.path) === sp);
  return route?.label ?? null;
}

/**
 * 一页签 = 一条 Hash 路径 + 接口 app 信息；未知 appKey 或缺少 entryUrl 时标记 invalid。
 */
export function buildPageTab(nav, pathname) {
  const { routePrefix, subPath } = parseMicroPath(pathname);
  if (!routePrefix) {
    return null;
  }
  const app = findAppByRoutePrefix(nav, routePrefix);
  if (!app) {
    return {
      id: makePageTabId(),
      fullPath: pathname,
      routePrefix,
      subPath,
      microAppKey: '',
      entryUrl: null,
      label: '页面不存在',
      invalid: true,
    };
  }
  const routeLabel = labelForSubPath(nav, app.microAppKey, subPath);
  const titlePart = app.title ?? '';
  const label = routeLabel ? `${titlePart} · ${routeLabel}` : titlePart;
  return {
    id: makePageTabId(),
    fullPath: pathname,
    routePrefix,
    subPath,
    microAppKey: app.microAppKey,
    entryUrl: app.entryUrl ?? null,
    subAppBusName: app.subAppBusName,
    label: label || '页面',
    invalid: !app.entryUrl,
  };
}

/**
 * 子应用 bus.$emit('sub-route-change', subAppBusName, payload)
 * 监听器收到：(subAppBusName, payload)
 */
export function parseSubRoutePayload(subAppName, second, nav) {
  const app = nav?.apps?.find((a) => a.subAppBusName === subAppName);
  if (!app) return null;
  if (typeof second === 'string') {
    return {
      path: second,
      instanceId: null,
      routePrefix: app.key,
      microAppKey: app.microAppKey,
    };
  }
  if (second && typeof second === 'object' && typeof second.path === 'string') {
    return {
      path: second.path,
      instanceId: second.instanceId ?? null,
      routePrefix: app.key,
      microAppKey: app.microAppKey,
    };
  }
  return null;
}

/** Antd 侧栏 key：避免不同 app 下 route.key 重复导致选中错乱 */
export function sideMenuItemKey(appKey, routeKey) {
  return `${appKey}::${routeKey}`;
}

export function parseSideMenuKey(composite) {
  const i = String(composite).indexOf('::');
  if (i === -1) return { appKey: null, routeKey: composite };
  return { appKey: composite.slice(0, i), routeKey: composite.slice(i + 2) };
}
