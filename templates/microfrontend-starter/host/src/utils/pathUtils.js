/** 便于与导航配置里的 path 比较（忽略末尾 / 差异） */
export function normalizeRoutePath(p) {
  if (p == null || p === '') return '/';
  const s = p.startsWith('/') ? p : `/${p}`;
  if (s.length > 1 && s.endsWith('/')) {
    return s.slice(0, -1) || '/';
  }
  return s;
}
