import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Dropdown, Spin } from 'antd';
import {
  LoginOutlined,
  LogoutOutlined,
  IdcardOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { fetchCurrentUser } from '../api/me';
import { clearToken, getToken, HOST_AUTH_CHANGED } from '../utils/hostAuth';
import { resolveUserAppRoutes } from '../utils/navRoutes';

const HostUserMenu = ({ nav, navigate, onLogout }) => {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const userRoutes = useMemo(() => resolveUserAppRoutes(nav), [nav]);

  const refreshToken = useCallback(() => {
    setToken(getToken());
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === null || e.key === 'user-front:access-token') {
        refreshToken();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(HOST_AUTH_CHANGED, refreshToken);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(HOST_AUTH_CHANGED, refreshToken);
    };
  }, [refreshToken]);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setUser(null);
      return undefined;
    }

    setLoading(true);
    fetchCurrentUser()
      .then((data) => {
        if (cancelled) return;
        if (data?.unauthorized) {
          clearToken();
          setToken(null);
          setUser(null);
          return;
        }
        setUser(data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const goTo = useCallback(
    (path) => {
      if (path) navigate(path);
    },
    [navigate],
  );

  const onLogin = () => {
    if (userRoutes?.loginPath) goTo(userRoutes.loginPath);
  };

  const onProfile = () => {
    if (userRoutes?.profilePath) goTo(userRoutes.profilePath);
  };

  const handleLogout = () => {
    clearToken();
    setToken(null);
    setUser(null);
    onLogout?.();
    navigate('/');
  };

  if (!token) {
    return (
      <div className="host-user-menu host-user-menu--guest">
        <Button
          type="text"
          className="host-user-menu__login-btn"
          icon={<LoginOutlined />}
          onClick={onLogin}
          disabled={!userRoutes?.loginPath}
        >
          登录
        </Button>
      </div>
    );
  }

  const displayName = user?.email || user?.name || '已登录用户';
  const initial = (displayName[0] || 'U').toUpperCase();

  const menuItems = [
    {
      key: 'profile',
      icon: <IdcardOutlined />,
      label: '个人中心',
      disabled: !userRoutes?.profilePath,
      onClick: onProfile,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
      overlayClassName="host-user-menu__dropdown"
    >
      <button type="button" className="host-user-menu host-user-menu--auth">
        {loading ? (
          <Spin size="small" />
        ) : (
          <Avatar size={32} className="host-user-menu__avatar">
            {initial}
          </Avatar>
        )}
        <span className="host-user-menu__name">{displayName}</span>
        <DownOutlined className="host-user-menu__caret" />
      </button>
    </Dropdown>
  );
};

export default HostUserMenu;
