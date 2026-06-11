import { buildMicroPath } from './microHash';

export function findAppByKey(nav, appKey) {
  return nav?.apps?.find((a) => a.key === appKey) ?? null;
}

export function findRoutePath(app, routeKey) {
  const route = app?.routes?.find((r) => r.key === routeKey);
  return route?.path ?? null;
}

/** @returns {{ app, loginPath, profilePath } | null} */
export function resolveUserAppRoutes(nav) {
  const app = findAppByKey(nav, 'user');
  if (!app) return null;
  const loginSub = findRoutePath(app, 'login');
  const profileSub = findRoutePath(app, 'profile');
  return {
    app,
    loginPath: loginSub ? buildMicroPath(app.key, loginSub) : null,
    profilePath: profileSub ? buildMicroPath(app.key, profileSub) : null,
  };
}
