import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HOST_ROUTE_EVENT,
  SUB_ROUTE_CHANGE_EVENT,
  SUB_APP_NAME,
  getWujieProps,
  getWujieBus,
  parseRoutePayload,
  normalizePath,
  whenWujieBusReady,
} from './wujie';

/**
 * 父子应用路由同步桥（不渲染 UI），挂在 BrowserRouter 内：
 *   1. 启动时按父应用注入的 initialPath 跳转一次
 *   2. 监听父应用 bus 的 sub-app-route 事件，做被动跳转
 *   3. 子应用内部路由变化时，通过 sub-route-change 反推给父应用（地址栏/页签同步）
 * 独立运行（非 wujie）时 bus / props 都拿不到，所有逻辑自动跳过。
 */
export default function WujieRouteBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  // 首次挂载时不向父应用回推，避免触发循环
  const skipSyncToParent = useRef(true);

  useEffect(() => {
    const applyFromProps = () => {
      const raw = getWujieProps().initialPath;
      if (typeof raw !== 'string' || raw === '/') return;
      const target = normalizePath(raw);
      if (window.location.pathname !== target) {
        navigate(target, { replace: true });
      }
    };

    applyFromProps();
    // wujie 注入 props 的时机不固定，分几次重试以保证生效
    const timers = [0, 50, 200].map((ms) => setTimeout(applyFromProps, ms));
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  useEffect(() => {
    let off;
    const stopWaiting = whenWujieBusReady((bus) => {
      const onRoute = (raw) => {
        const { path, instanceId } = parseRoutePayload(raw);
        if (typeof path !== 'string') return;
        // 父应用可能广播给多个实例，这里只处理与自己 instanceId 匹配的
        const myId = getWujieProps().instanceId;
        if (instanceId != null && myId !== instanceId) return;
        const target = normalizePath(path);
        if (window.location.pathname !== target) {
          navigate(target);
        }
      };

      bus.$on(HOST_ROUTE_EVENT, onRoute);
      off = () => bus.$off(HOST_ROUTE_EVENT, onRoute);

      // props 同步可能因 bus 未 ready 而漏掉，这里补一次
      const initPath = getWujieProps().initialPath;
      if (typeof initPath === 'string' && initPath !== '/') {
        onRoute({ path: initPath, instanceId: getWujieProps().instanceId });
      }
    });

    return () => {
      stopWaiting();
      off?.();
    };
  }, [navigate]);

  useEffect(() => {
    const bus = getWujieBus();
    if (!bus) return;
    if (skipSyncToParent.current) {
      skipSyncToParent.current = false;
      return;
    }
    bus.$emit(SUB_ROUTE_CHANGE_EVENT, SUB_APP_NAME, {
      path: location.pathname,
      instanceId: getWujieProps().instanceId,
    });
  }, [location.pathname]);

  return null;
}
