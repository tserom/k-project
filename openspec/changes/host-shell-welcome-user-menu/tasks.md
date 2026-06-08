## 1. Shell layout & routing

- [x] 1.1 Remove `useLayoutEffect` auto-redirect from `/` to `nav.apps[0]` in `MainLayout.jsx`
- [x] 1.2 Update `useMicroPageTabs` `onTabEdit`: closing the last tab clears tabs and `navigate('/', { replace: true })` without reopening the first sub-app
- [x] 1.3 Remove `main-layout__page-head` block (H1 + subtitle) from `MainLayout.jsx`; adjust styles if orphaned
- [x] 1.4 Render content by mode: `pageTabs.length === 0` && root path → welcome; else existing tabs + `SubAppView`
- [x] 1.5 Confirm `topNavVisible` and `siderCollapsed` default to expanded; smoke-test toggles still work

## 2. Welcome home page

- [x] 2.1 Add `src/pages/WelcomeHome.jsx` (or `components/WelcomeHome`) with hero copy for 库存管理中台 / 中台系统定位
- [x] 2.2 Add `welcome-home.less` (or module CSS): hero, grid background, app cards using `HOST_THEME` primary `#0d9488`
- [x] 2.3 Wire app cards from `nav.apps`: click navigates via `buildMicroPath(app.key, firstRoute.path)`
- [x] 2.4 Integrate welcome into `MainLayout` for `/` with zero tabs; show loading only while `nav` is null

## 3. Header user menu

- [x] 3.1 Add `src/utils/hostAuth.js` with `USER_FRONT_TOKEN_KEY = 'user-front:access-token'` (sync comment with user-front)
- [x] 3.2 Add `src/api/me.js` (or extend existing client) for `GET /api/v1/me` with Bearer token
- [x] 3.3 Add `src/components/HostUserMenu.jsx`: Dropdown + Avatar; resolve login/profile paths from `nav` user app routes
- [x] 3.4 Unauthenticated: Login action → open user app login tab + navigate
- [x] 3.5 Authenticated: show email from `/me`; Personal center → profile route; Logout → `clearToken` + navigate `/` + refresh menu state
- [x] 3.6 Place `HostUserMenu` in header `main-layout__header-end`; style for dark header (icons: User/Login/Logout/Idcard)
- [x] 3.7 Listen `storage` / optional custom event so login in sub-app updates Host menu without full reload

## 4. Styles & polish

- [x] 4.1 Update `main-layout` styles: header flex with `header-end`, welcome full-height content, remove page-head rules
- [x] 4.2 Verify tabs: closable when `pageTabs.length > 1`; last tab closable per 1.2
- [x] 4.3 Manual test at `http://k-project.com/` (or local host dev): `/` welcome, login/logout/profile flows, close all tabs

## 5. Documentation (optional)

- [x] 5.1 Add short note to `apps/host/README.md` or `docs/MICROFRONTEND.md` about welcome home and shared token key
