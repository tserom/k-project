import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import WujieRouteBridge from './bridge/WujieRouteBridge';
import { HOST_ACTIVE_PAGE_EVENT, getWujieBus, getWujieProps, IS_WUJIE } from './bridge/wujie';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  const [hostPageKey, setHostPageKey] = useState(null);

  useEffect(() => {
    const bus = getWujieBus();
    if (!bus) return undefined;
    const onPage = (payload) => {
      const pageKey = payload && typeof payload === 'object' ? payload.pageKey : payload;
      const instanceId = payload && typeof payload === 'object' ? payload.instanceId : null;
      if (instanceId != null && instanceId !== getWujieProps().instanceId) return;
      setHostPageKey(pageKey ?? null);
    };
    bus.$on(HOST_ACTIVE_PAGE_EVENT, onPage);
    return () => bus.$off(HOST_ACTIVE_PAGE_EVENT, onPage);
  }, []);

  return (
    <BrowserRouter>
      <WujieRouteBridge />
      <div className="demo-app">
        <nav className="demo-app__nav">
          <NavLink to="/" end>
            首页
          </NavLink>
          <NavLink to="/about">关于</NavLink>
          <span className="demo-app__mode">
            {IS_WUJIE ? `微前端模式${hostPageKey ? ` · 父应用页签：${hostPageKey}` : ''}` : '独立运行模式'}
          </span>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
