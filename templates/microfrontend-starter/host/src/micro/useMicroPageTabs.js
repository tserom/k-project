import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { buildMicroPath } from '../utils/microHash';
import { normalizeRoutePath } from '../utils/pathUtils';
import {
  pathsEqual,
  buildPageTab,
  findAppByMicroKey,
  labelForSubPath,
  parseSubRoutePayload,
} from './pageTabModel';

/**
 * 微前端主应用：Hash ↔ 多页签 ↔ 多无界实例（实例 id = 页签 id）。
 * 子应用内路由同步：仅当接口为该 app 配置了 subAppBusName 时，监听 sub-route-change。
 */
export function useMicroPageTabs(nav, pathname, navigate, bus) {
  const [pageTabs, setPageTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const activeTabIdRef = useRef(null);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useLayoutEffect(() => {
    if (!nav) return;
    setPageTabs((prev) => {
      const built = buildPageTab(nav, pathname);
      if (!built) {
        return prev;
      }
      if (prev.length === 0) {
        return [built];
      }
      const hit = prev.find((t) => pathsEqual(t.fullPath, pathname));
      if (hit) return prev;
      return [...prev, built];
    });
  }, [pathname, nav]);

  useEffect(() => {
    if (!nav || pageTabs.length === 0) return;
    const hit = pageTabs.find((t) => pathsEqual(t.fullPath, pathname));
    if (hit && hit.id !== activeTabId) {
      setActiveTabId(hit.id);
    }
  }, [pathname, pageTabs, nav, activeTabId]);

  useEffect(() => {
    if (!nav) return;
    const onSubRoute = (subAppName, second) => {
      const parsed = parseSubRoutePayload(subAppName, second, nav);
      if (!parsed) return;
      const { path: pathStr, instanceId, routePrefix, microAppKey } = parsed;
      const subPathNorm = normalizeRoutePath(pathStr);
      const nextFull = buildMicroPath(routePrefix, subPathNorm);
      if (!nextFull) return;

      setPageTabs((prev) => {
        const idx = instanceId
          ? prev.findIndex((t) => t.id === instanceId)
          : prev.findIndex((t) => t.id === activeTabIdRef.current);
        const routeLabel = labelForSubPath(nav, microAppKey, subPathNorm);
        const app = findAppByMicroKey(nav, microAppKey);
        const titlePart = app?.title ?? '';
        const label = routeLabel ? `${titlePart} · ${routeLabel}` : titlePart;
        const nextLabel = label || '页面';

        if (idx >= 0) {
          const copy = [...prev];
          const app = findAppByMicroKey(nav, microAppKey);
          copy[idx] = {
            ...copy[idx],
            fullPath: nextFull,
            subPath: subPathNorm,
            microAppKey,
            routePrefix,
            label: nextLabel,
            entryUrl: app?.entryUrl ?? copy[idx].entryUrl,
            subAppBusName: app?.subAppBusName ?? copy[idx].subAppBusName,
            invalid: !app?.entryUrl,
          };
          return copy;
        }
        const built = buildPageTab(nav, nextFull);
        return built ? [...prev, built] : prev;
      });

      if (!pathsEqual(pathnameRef.current, nextFull)) {
        navigate(nextFull, { replace: true });
      }
    };
    bus.$on('sub-route-change', onSubRoute);
    return () => {
      bus.$off('sub-route-change', onSubRoute);
    };
  }, [navigate, nav, bus]);

  const activeTab = useMemo(
    () => pageTabs.find((t) => t.id === activeTabId) ?? pageTabs[0],
    [pageTabs, activeTabId],
  );

  const onTabChange = useCallback(
    (key) => {
      setActiveTabId(key);
      const tab = pageTabs.find((t) => t.id === key);
      if (tab && !pathsEqual(pathname, tab.fullPath)) {
        navigate(tab.fullPath);
      }
    },
    [pageTabs, pathname, navigate],
  );

  const onTabEdit = useCallback(
    (targetKey, action) => {
      if (action !== 'remove') return;
      setPageTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === targetKey);
        if (idx === -1) return prev;
        const next = prev.filter((t) => t.id !== targetKey);
        if (next.length === 0) {
          setActiveTabId(null);
          navigate('/', { replace: true });
          return [];
        }
        if (targetKey === activeTabIdRef.current) {
          const neighbor = idx === 0 ? next[0] : next[idx - 1];
          setActiveTabId(neighbor.id);
          navigate(neighbor.fullPath, { replace: true });
        }
        return next;
      });
    },
    [navigate],
  );

  const clearAllTabs = useCallback(() => {
    setPageTabs([]);
    setActiveTabId(null);
  }, []);

  const activeKey = activeTabId ?? pageTabs[0]?.id;

  return {
    pageTabs,
    activeTab,
    activeKey,
    onTabChange,
    onTabEdit,
    clearAllTabs,
  };
}
