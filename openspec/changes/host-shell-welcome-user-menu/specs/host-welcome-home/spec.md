## ADDED Requirements

### Requirement: Welcome home introduces the middle-platform

The Host SHALL provide a built-in welcome home page that presents the system as an enterprise middle-platform (中台), with polished visual design suitable for a SaaS product.

#### Scenario: Display welcome on empty shell

- **WHEN** the user is on `/` with no open micro-frontend tabs
- **THEN** a welcome home page is rendered in the main content area
- **AND** the page includes clear copy describing the platform as a middle-platform system

### Requirement: Welcome page lists sub-applications

The welcome home SHALL surface configured sub-applications from navigation data as entry points.

#### Scenario: Navigation loaded

- **WHEN** navigation has been fetched successfully
- **THEN** the welcome page shows each configured app (title and short description or label)
- **AND** each entry navigates the user into that sub-application (default first route or app root)

#### Scenario: Navigation still loading

- **WHEN** navigation is not yet available
- **THEN** the welcome area shows an appropriate loading state consistent with the rest of the Host shell

### Requirement: Welcome page visual quality

The welcome home SHALL use cohesive styling aligned with the Host theme (primary color, typography) and MUST avoid looking like an unstyled developer placeholder.

#### Scenario: Visual presentation

- **WHEN** the welcome home is displayed
- **THEN** the layout includes a distinct hero or headline section and structured content blocks (e.g. capability cards)
- **AND** spacing, typography, and color are consistent with a production SaaS admin console
