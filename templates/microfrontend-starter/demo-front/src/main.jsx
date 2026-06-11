import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './app.css';

function mountApp() {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root'),
  );
}

function unmountApp() {
  const container = document.getElementById('root');
  if (container) ReactDOM.unmountComponentAtNode(container);
}

/** 无界子应用生命周期：被父应用加载时由 wujie 调用；独立打开时直接挂载 */
if (window.__POWERED_BY_WUJIE__) {
  window.__WUJIE_MOUNT = mountApp;
  window.__WUJIE_UNMOUNT = unmountApp;
} else {
  mountApp();
}
