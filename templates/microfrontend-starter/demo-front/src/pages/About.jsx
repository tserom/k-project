export default function About() {
  return (
    <main className="demo-page">
      <h1>示例子应用 · 关于</h1>
      <p>把 demo-front 当作业务子应用的最小骨架：</p>
      <ul>
        <li>
          <code>src/main.jsx</code> — wujie 生命周期（__WUJIE_MOUNT / __WUJIE_UNMOUNT）+ 独立运行兜底
        </li>
        <li>
          <code>src/bridge/</code> — 父子路由同步桥；改 <code>SUB_APP_NAME</code> 时记得同步 host 导航的
          <code> subAppBusName</code>
        </li>
        <li>
          <code>src/pages/</code> — 业务页面从这里长出来
        </li>
      </ul>
    </main>
  );
}
