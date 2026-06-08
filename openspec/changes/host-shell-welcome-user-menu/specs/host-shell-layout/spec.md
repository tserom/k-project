## ADDED Requirements

### Requirement: Shell navigation defaults expanded

The Host shell SHALL initialize with the top application menu visible and the side navigation expanded. Users MAY collapse either region via existing toggle controls.

#### Scenario: First load layout state

- **WHEN** the user opens the Host application for the first time in a session
- **THEN** the top horizontal app menu is visible
- **AND** the side navigation is not collapsed

### Requirement: Page title header removed

The Host content area SHALL NOT render the duplicate page title block (`main-layout__page-head` with H1 and subtitle) above micro-frontend tabs.

#### Scenario: Viewing a micro-frontend route

- **WHEN** the user navigates to any sub-application route with an open tab
- **THEN** the content area shows only the tab bar and sub-application viewport
- **AND** no standalone H1 such as "user-front · 登录" appears above the tabs

### Requirement: All micro-frontend tabs may be closed

The Host SHALL allow closing every open micro-frontend tab, including the last remaining tab.

#### Scenario: Close last tab

- **WHEN** the user closes the only remaining tab
- **THEN** no micro-frontend tabs remain open
- **AND** the Host navigates to the welcome home route (`/`)

#### Scenario: Welcome state with zero tabs

- **WHEN** no tabs are open and the pathname is `/`
- **THEN** the Host displays the welcome home view instead of a loading spinner or automatic sub-app redirect

### Requirement: Root path does not auto-open first sub-app

The Host SHALL NOT automatically replace-navigate from `/` to the first configured sub-application.

#### Scenario: Visit root URL

- **WHEN** the user navigates to `/` (or empty hash path)
- **THEN** the welcome home view is shown
- **AND** the first sub-application is not loaded until the user explicitly chooses an app or route
