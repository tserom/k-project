import { useEffect, useState } from 'react';
import { loadNavigation } from '../api/navigation';

/**
 * 导航配置加载（布局无关，所有布局共用）。
 * 挂载时拉取一次 GET /api/v1/navigation；失败时 loadNavigation 内部已降级到本地 Mock，
 * 并通过 navWarning 暴露降级原因。
 */
export function useNavigation() {
  const [nav, setNav] = useState(null);
  const [navWarning, setNavWarning] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadNavigation().then((data) => {
      if (cancelled) return;
      const { navWarning: warning, ...payload } = data;
      setNav(payload);
      setNavWarning(warning ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { nav, navWarning };
}
