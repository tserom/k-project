/**
 * 无界：事件名、实例名规则；子应用入口 URL 由 nav.static.js（或将来的接口）提供，不在此写死。
 *
 * 事件约定（demo-front 的 bridge 与这里保持一致）：
 *   host-active-page  主应用 → 子应用：当前激活页签 { pageKey, instanceId }
 *   sub-app-route     主应用 → 子应用：下发子路由 { path, instanceId }
 *   sub-route-change  子应用 → 主应用：子应用内路由变化（useMicroPageTabs 监听）
 */

/** 主应用广播「当前激活的微应用」；多页签 payload：{ pageKey, instanceId } */
export const WUJIE_PARENT_PAGE_EVENT = 'host-active-page';

/** 主应用向子应用下发子路由（需子应用自行订阅）；payload：{ path, instanceId } */
export const USER_FRONT_ROUTE_EVENT = 'sub-app-route';

const NAME_SAFE = /[^a-zA-Z0-9_-]/g;

/**
 * 无界 iframe 实例名须全局唯一：一页签一个实例。
 * 注意：复制本模板开新项目时，建议把 nav.static.js 里的 microAppKey 一起改掉，
 * 避免与其它同机运行的项目实例名冲突。
 * @param {string} microAppKey 来自导航 apps[].microAppKey
 */
export function wujieInstanceName(microAppKey, instanceId = 'default') {
  const safe = String(instanceId).replace(NAME_SAFE, '-');
  return `sub-${microAppKey}-${safe}`.slice(0, 90);
}

/** 导航下发的 entryUrl 规范化；无效则返回 null（由界面走 404） */
export function normalizeEntryUrl(raw) {
  if (raw == null || typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t) return null;
  return t.endsWith('/') ? t : `${t}/`;
}
