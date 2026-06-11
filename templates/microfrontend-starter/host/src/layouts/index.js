import ClassicLayout from './classic/ClassicLayout';
import ModernLayout from './modern/ModernLayout';

/**
 * 布局注册表：新增布局 = 复制一个布局目录 + 在这里登记一行。
 * 激活优先级：localStorage['host:layout'] > VITE_HOST_LAYOUT > 默认 modern。
 * 切换方式见 apps/host/docs/layout-guide.md。
 */
export const LAYOUTS = {
  classic: ClassicLayout,
  modern: ModernLayout,
};

export const LAYOUT_STORAGE_KEY = 'host:layout';
const DEFAULT_LAYOUT = 'modern';

export function getActiveLayoutName() {
  let stored = null;
  try {
    stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
  } catch {
    stored = null;
  }
  const candidate = stored || import.meta.env.VITE_HOST_LAYOUT || DEFAULT_LAYOUT;
  if (!LAYOUTS[candidate]) {
    window.console.warn(
      `[host] 未注册的布局 "${candidate}"，回退到 "${DEFAULT_LAYOUT}"。可用布局：${Object.keys(LAYOUTS).join(', ')}`,
    );
    return DEFAULT_LAYOUT;
  }
  return candidate;
}

export function getActiveLayout() {
  return LAYOUTS[getActiveLayoutName()];
}
