/**
 * 静态导航配置（starter 不依赖后端）。
 *
 * 数据形状与正式导航接口 GET /api/v1/navigation 完全一致：
 *   apps[].key           — Hash 第一段 /{key}，须全局唯一
 *   apps[].title         — 顶栏与页签里显示的应用名
 *   apps[].microAppKey   — 无界实例名前缀（新项目务必改掉，避免与其它项目冲突）
 *   apps[].entryUrl      — 子应用入口 URL（这里从 env 读）
 *   apps[].subAppBusName — 可选；配置后子应用内路由会同步回父应用地址栏
 *   apps[].routes        — 侧栏菜单：子应用内 path + label
 *
 * 以后要接后端导航：把 src/api/navigation.js 换成请求实现即可，本文件可删。
 */

const demoUrl = import.meta.env.VITE_DEMO_FRONT_URL;

export const NAV_STATIC = {
  apps: [
    {
      key: 'demo',
      title: '示例应用',
      microAppKey: 'demo',
      entryUrl: demoUrl,
      subAppBusName: 'demo-front',
      routes: [
        { key: 'home', path: '/', label: '首页' },
        { key: 'about', path: '/about', label: '关于' },
      ],
    },
  ],
};
