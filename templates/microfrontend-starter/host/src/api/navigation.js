import { NAV_STATIC } from '../config/nav.static';
import { normalizeEntryUrl } from '../config/wujie';

/**
 * starter 版导航加载：直接返回本地静态配置（src/config/nav.static.js），不请求后端。
 *
 * 返回形状与正式版保持一致：{ apps, navSource, navWarning? }。
 * 以后要接后端导航：参考 k-project 的 apps/host/src/api/navigation.js
 * （fetch /api/v1/navigation + 超时 + 失败降级），布局与页签代码无需任何修改。
 */
export async function loadNavigation() {
  const apps = (NAV_STATIC.apps ?? []).map((app) => ({
    ...app,
    entryUrl: normalizeEntryUrl(app.entryUrl),
    routes: app.routes?.length ? app.routes : [{ key: 'home', path: '/', label: '首页' }],
  }));
  return { apps, navSource: 'static' };
}
