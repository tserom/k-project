## ADDED Requirements

### Requirement: Export inventory transactions as Excel

Authenticated operators SHALL export inventory transaction rows from `GET /api/v1/inventory-transactions/export` as an `.xlsx` file.

#### Scenario: Export selected transaction rows

- **GIVEN** the user has selected transaction rows with IDs `111`, `222`, and `333`
- **WHEN** the front calls `GET /api/v1/inventory-transactions/export?qp-id-in=111,222,333`
- **THEN** the backend returns an Excel file containing only transactions whose IDs are `111`, `222`, or `333`

#### Scenario: Export all filtered transaction rows

- **GIVEN** the transaction list has filters `type=out`, `party_name=客户A`, and a business date range
- **WHEN** the user clicks Export with no selected rows
- **THEN** the front calls the export endpoint with the current filters and without pagination parameters
- **AND** the backend returns all matching rows, not only the current page

#### Scenario: Transaction export columns

- **WHEN** the backend generates the transaction Excel file
- **THEN** the workbook contains a sheet named `出入库单`
- **AND** each row includes ID, localized type, party name, party contact, goods detail, quantity, warehouse, SKU, reference number, note, business time, created time, and updated time

#### Scenario: Invalid transaction id filter

- **WHEN** the export request contains an invalid `qp-id-in` value such as `111,abc`
- **THEN** the backend responds with HTTP 400 and an error message

### Requirement: Export sales deliveries as Excel

Authenticated operators SHALL export sales delivery rows from `GET /api/v1/sales-deliveries/export` as an `.xlsx` file.

#### Scenario: Export selected sales delivery rows

- **GIVEN** the user has selected sales delivery rows with IDs `10` and `20`
- **WHEN** the front calls `GET /api/v1/sales-deliveries/export?qp-id-in=10,20`
- **THEN** the backend returns an Excel file containing only sales delivery documents whose IDs are `10` or `20`

#### Scenario: Export all filtered sales delivery rows

- **GIVEN** the sales delivery list has filters `party_b_name=客户B` and a document date range
- **WHEN** the user clicks Export with no selected rows
- **THEN** the front calls the export endpoint with the current filters and without pagination parameters
- **AND** the backend returns all matching documents, not only the current page

#### Scenario: Sales delivery workbook sheets

- **WHEN** the backend generates the sales delivery Excel file
- **THEN** the workbook contains a sheet named `单据汇总`
- **AND** the workbook contains a sheet named `明细行`

#### Scenario: Sales delivery detail rows

- **GIVEN** a sales delivery document has multiple item rows
- **WHEN** the backend generates the `明细行` sheet
- **THEN** each item is exported as one row
- **AND** the row repeats the document ID, document number, document date, party names, and includes line number, product spec, quantity, weight, unit price, amount, and note

### Requirement: Frontend export actions

The inventory front SHALL provide export actions on `/transactions` and `/sales-deliveries`.

#### Scenario: Selected rows take precedence

- **GIVEN** a list has one or more selected rows
- **WHEN** the user clicks Export
- **THEN** the front sends only `qp-id-in` for the selected IDs
- **AND** the front does not include the current list filters in that request

#### Scenario: No selected rows uses current filters

- **GIVEN** a list has no selected rows
- **WHEN** the user clicks Export
- **THEN** the front sends the current list filters to the matching export endpoint

#### Scenario: Selection clears on query and pagination

- **GIVEN** the user has selected rows on a list
- **WHEN** the user searches, changes page, changes page size, or the list reloads successfully
- **THEN** the selected row IDs are cleared before the next export action

#### Scenario: Unauthorized export

- **WHEN** an export request returns HTTP 401
- **THEN** the front redirects the user to `/login`
