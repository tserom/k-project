/**
 * Hash 路由（pathname 不含 #）：
 * 第一段路径由接口下发的 apps[].key 决定，例如 /hello、/user，父应用不写死默认子应用。
 *
 *   /{appKey}              → routePrefix = appKey，子路径 /
 *   /{appKey}/about        → 子路径 /about
 *   /                      → routePrefix 为 null（由布局按接口首项重定向）
 */

/**
 * @returns {{ routePrefix: string | null, subPath: string }}
 */
export function parseMicroPath(pathname) {
  const clean = pathname && pathname !== '/' ? pathname : '/';
  const parts = clean.split('/').filter(Boolean);
  if (parts.length === 0) {
    return { routePrefix: null, subPath: '/' };
  }
  const routePrefix = parts[0];
  const rest = parts.slice(1);
  return {
    routePrefix,
    subPath: rest.length ? `/${rest.join('/')}` : '/',
  };
}

/**
 * @param {string} routePrefix 与 apps[].key 一致
 * @param {string} subPath 子应用内路径
 * @returns {string | null} routePrefix 为空时返回 null
 */
export function buildMicroPath(routePrefix, subPath) {
  if (!routePrefix) return null;
  if (!subPath || subPath === '/') {
    return `/${routePrefix}`;
  }
  const p = subPath.startsWith('/') ? subPath : `/${subPath}`;
  return `/${routePrefix}${p}`;
}
