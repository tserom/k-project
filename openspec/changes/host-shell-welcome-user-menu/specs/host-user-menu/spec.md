## ADDED Requirements

### Requirement: Header user menu placement

The Host top header SHALL include a user menu control in the top-right area.

#### Scenario: Header layout

- **WHEN** the Host shell header is visible
- **THEN** a user menu component is rendered on the right side of the header
- **AND** it does not overlap or hide the brand or app switcher

### Requirement: Unauthenticated login entry

When no valid access token is present, the user menu SHALL offer login that navigates to the user sub-application login route.

#### Scenario: Not logged in

- **WHEN** `localStorage` does not contain a valid `user-front:access-token`
- **THEN** the user menu shows a login action with a clear icon/label
- **AND** activating login navigates to the configured user app login path (e.g. `/user/login`)

### Requirement: Authenticated user actions

When a valid access token is present, the user menu SHALL show account actions including personal center and logout.

#### Scenario: Logged in menu

- **WHEN** a valid access token exists
- **THEN** the menu displays user identity information (email or display name from `/me` when available)
- **AND** provides a personal center action that navigates to the configured profile route
- **AND** provides a logout action

#### Scenario: Logout

- **WHEN** the user selects logout
- **THEN** the access token is removed from `localStorage`
- **AND** the menu returns to the unauthenticated state
- **AND** the user is not left on a protected sub-route without a token (Host navigates to `/` or login as appropriate)

### Requirement: User menu visual quality

The user menu SHALL use professional iconography and styling appropriate for a SaaS admin product.

#### Scenario: Menu appearance

- **WHEN** the user menu is rendered in either auth state
- **THEN** icons and typography match the dark header theme
- **AND** the control is visually distinct from plain text links (e.g. avatar, dropdown, or icon button)
