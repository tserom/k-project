/**
 * wujie 父子通信约定（与 starter host 的 src/config/wujie.js 保持一致）：
 *   1. 父应用通过 window.$wujie.props 注入 initialPath / instanceId
 *   2. 父应用通过 bus 事件 `sub-app-route` 通知子应用跳转
 *   3. 子应用通过 bus 事件 `sub-route-change` 把当前路由同步回父应用
 *   4. 父应用通过 bus 事件 `host-active-page` 广播当前激活页签
 */

/** 是否运行在 wujie 容器内 */
export const IS_WUJIE = typeof window !== 'undefined' && !!window.__POWERED_BY_WUJIE__;

/** 父应用 → 子应用 的路由事件名 */
export const HOST_ROUTE_EVENT = 'sub-app-route';

/** 子应用 → 父应用 的路由事件名 */
export const SUB_ROUTE_CHANGE_EVENT = 'sub-route-change';

/** 父应用 → 子应用 的激活页签事件名 */
export const HOST_ACTIVE_PAGE_EVENT = 'host-active-page';

/** 子应用唯一标识：与 host 导航里 apps[].subAppBusName 保持一致（改名时两边一起改） */
export const SUB_APP_NAME = 'demo-front';

/** 读取 wujie 注入的 props，未注入时返回空对象 */
export const getWujieProps = () =>
  (typeof window !== 'undefined' && window.$wujie?.props) || {};

/** 读取 wujie 通信总线，未就绪时返回 null */
export const getWujieBus = () =>
  typeof window !== 'undefined' ? (window.$wujie?.bus ?? null) : null;

/** 解析父应用传入的路由 payload，兼容字符串和 { path, instanceId } 两种格式 */
export function parseRoutePayload(raw) {
  if (typeof raw === 'string') return { path: raw, instanceId: null };
  if (raw && typeof raw === 'object') {
    return {
      path: typeof raw.path === 'string' ? raw.path : null,
      instanceId: raw.instanceId == null ? null : String(raw.instanceId),
    };
  }
  return { path: null, instanceId: null };
}

/** 把任意 path 规范成以 / 开头的形式 */
export const normalizePath = (path) => (path?.startsWith('/') ? path : `/${path ?? ''}`);

/**
 * bus 在子应用启动早期可能尚未注入，做有限次重试直到拿到 bus。
 * @returns {() => void} 取消重试
 */
export function whenWujieBusReady(onReady, { interval = 15, maxAttempts = 200 } = {}) {
  let cancelled = false;
  let attempts = 0;

  const tick = () => {
    if (cancelled) return;
    const bus = getWujieBus();
    if (bus) {
      onReady(bus);
      return;
    }
    if (attempts++ < maxAttempts) {
      setTimeout(tick, interval);
    }
  };
  tick();

  return () => {
    cancelled = true;
  };
}
