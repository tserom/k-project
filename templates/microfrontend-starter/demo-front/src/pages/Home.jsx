export default function Home() {
  return (
    <main className="demo-page">
      <h1>示例子应用 · 首页</h1>
      <p>这个页面来自 demo-front（独立 Vite 工程），正通过无界 iframe 挂载在父应用的页签里。</p>
      <ul>
        <li>点上方「关于」：子应用内部路由跳转，父应用地址栏会同步变化</li>
        <li>点父应用侧栏菜单：父应用通过 bus 通知本应用跳转</li>
        <li>单独打开 <code>http://localhost:6101</code>：本应用也能独立运行</li>
      </ul>
    </main>
  );
}
