# UI upgrade plan: pop-ups, reminders, logistics forms

Mockups: https://claude.ai/code/artifact/57e49449-499d-468e-b6ce-33f571c554f8

## Status (7 Sep 2026)

Built: pricing actions and bulk delete, shared pieces (phase 1 minus the
pricing-form refactor), pop-ups (phase 2, without delete undo), reminders
(phase 3), shipment dialog and route form (phase 4). The route form keeps
plain white panels; no new colours were added anywhere in logistics.

Deferred on purpose: the schedule form (will be redone later), the
`PricingFormPage` primitives refactor, and delete undo. Undo was dropped
because deleting a customer, supplier or item cascades to pricing rows, so a
re-create would only bring back part of the data.

Scope rule: keep the MUI theme, the `DataTable`, the app bar, the panel/pill
look of the pricing and route forms, and every route and API call as they are.
Everything below is additive UI on top of the existing hooks and helpers.

## What is there today

| Area | Current state | Gap |
| --- | --- | --- |
| Dialogs (`PartyFormDialog`, `ItemFormDialog`, `UserFormDialog`, `ConfirmDialog`) | Plain `DialogTitle` + flat 2-column grid + Cancel/Save | No identity in the header, no grouping, no dirty state, no saving state, Delete is a bare text button, confirm text is generic |
| Feedback | `ErrorAlert` inside the dialog body, nothing on success | Success is silent, errors sit under the fold, no undo after delete |
| Reminders (`ExpiryNotificationsMenu`, bell in `AppLayout`) | Flat `Menu` list, one "Mark all as read" | No severity grouping, no actions besides open, nothing on the Routes page itself, bell looks the same for 1 expired and 7 upcoming |
| Shipment dialog (`ShipmentFormDialog`) | Scrolling tab strip, 2-column fields, Route/Status in the header | No sense of progress across 4 sections, schedule side effects are invisible, no unsaved-changes guard on a 40-field form |
| Route form (`RouteFormPage`) | Four incoterm panels, currency dropdown per panel, total buried in a panel | Derived vs. entered values look alike, total cost is not visible while editing prices, validity has no countdown |
| Schedule form (`ScheduleFormPage`) | One panel of 10 fields | TT is typed by hand, deadlines have no relation to ETD, no view of which shipments depend on the schedule |
| Form primitives | `FormField` / `FormSelect` / `FormPanel` in logistics, a duplicate `Fld` / `Sel` / `Panel` set inside `PricingFormPage` | Two copies of the same primitives and the same colour map |

## Phase 1: shared pieces (no screen changes yet)

New files under `client/src/components/`:

- `appDialog/AppDialog.tsx`: the shell every form dialog uses. Props: `title`,
  `subtitle`, `avatar` (initials or icon), `onClose`, `footerStart` (Delete),
  `dirty`, `saving`, `submitLabel`. Renders the header, `dividers` body, and the
  footer with the "N fields changed" indicator, Cancel, and a Save button that
  shows a spinner while `saving` and is disabled until `dirty`.
- `appDialog/useUnsavedChangesGuard.ts`: given `dirty`, intercepts Esc,
  backdrop click and Cancel, and opens the "Discard changes?" confirm.
- `formSection/FormSection.tsx`: small-caps label with a rule, used to group
  fields inside a dialog.
- `segmentedControl/SegmentedControl.tsx`: the ILS / USD / EUR picker. Same
  height as the input it sits next to (31px compact, 40px in dialogs).
- `toast/ToastProvider.tsx` + `useToast()`: bottom-left stack, max 3, 5s
  auto-dismiss, pause on hover. Variants success / error / info, optional
  action ("View", "Retry", "Undo").
- `sectionNav/SectionNav.tsx`: vertical list of sections with filled/total
  count and a progress bar. Replaces `Tabs` in the shipment and format dialogs.
- Move `FormField`, `FormSelect`, `FormPanel`, `styles.ts` from
  `pages/logistics/components/form/` to `components/form/`. Add `auto` and
  `required` props to `FormField` (lock tag on the label, red asterisk).
  Add `hint` (helper line under the input).
- Move the colour map `C` out of `RouteFormPage` and `PricingFormPage` into
  `components/form/consts.ts` as `PANEL_TINTS`.
- `theme.ts`: add `MuiDialog` default transition (fade + 8px rise, 180ms) and
  respect `prefers-reduced-motion`.

Done when: `PricingFormPage` uses the shared primitives instead of its local
`Fld` / `Sel` / `Panel`, and `tsc -b` + lint are green. Visually nothing moves.

## Phase 2: pop-ups

- `PartyFormDialog`: onto `AppDialog`. Avatar shows initials of the name,
  subtitle shows `ID · name · created`. Sections: Identity (ID locked with a
  lock icon after creation, Full Name, Short Name), Contact & Terms (Phone with
  digits-only validation, Incoterms, Currency as `SegmentedControl` for
  customers), Address (Address full width, City, ZIP, Country select with
  type-to-search via MUI `Autocomplete`).
- `ItemFormDialog`, `UserFormDialog`: same shell; keep their validation.
  User dialog groups Account / Role / Module permissions.
- `ConfirmDialog`: add an icon circle by severity and a `target` prop rendered
  bold in the message. Callers pass the entity name and ID.
- Delete flow: after confirm, show an info toast "Customer X deleted · Undo"
  for 5s. Undo re-creates from the row we still hold in state (customers,
  suppliers, items, routes, schedules, shipments all have a create call).
- Success toasts on every create / update from a dialog. The `ErrorAlert`
  stays inside the dialog for server errors, so the user does not lose the
  form.
- `FormatPickerDialog`: highlight the last used format (stored in
  `localStorage`, key `kfg_last_shipment_format`) and show "N fields · used
  M times" (count from the loaded shipments).

Files: `components/partyFormDialog/`, `pages/items/components/itemFormDialog/`,
`pages/users/components/UserFormDialog.tsx`, `components/confirmDialog/`,
`pages/logistics/weeklyShipments/components/FormatPickerDialog.tsx`, the page
hooks that own delete mutations.

## Phase 3: reminders

- `ExpiryNotificationsMenu`: group rows by `expirySeverity` (Expired, Due
  tomorrow, This week) with a coloured dot and a count. Each row: reference
  bold, lane + line + container type, severity chip, mark-read icon. On hover
  an "Extend validity" button opens the route form with the validity field
  focused (`/logistics/routes/:id?focus=validity`). Footer shows when the last
  email digest went out (new field on `GET /api/routes/expiry-status`, reading
  `route_expiry_notifications`) and a "Show in Routes" link that opens the
  Routes page with the expiring filter on.
- Bell: colour by worst severity (grey quiet, yellow this-week, red urgent).
  One 600ms pulse ring when a new key appears in `alerts` since the session
  started; store seen keys in `sessionStorage`.
- `RoutesPage`: banner above the table when `alerts.length > 0` with the
  counts and an "Expiring only" toggle chip that filters rows to
  `isWithinExpiryWindow`. Dismissable per session. Validity chip gets a
  tooltip with the full date and the last email stage sent.
- `RouteFormPage` header: countdown chip next to the validity date using
  `daysUntil` + `EXPIRY_CHIP_STYLES`, green when more than 7 days out.

Files: `layout/components/ExpiryNotificationsMenu.tsx`,
`layout/hooks/useExpiryNotifications.tsx`, `layout/AppLayout.tsx`,
`pages/logistics/routes/RoutesPage.tsx`, `pages/logistics/routes/utils/`,
server `routes/routes.ts` for the small status endpoint.

## Phase 4: logistics forms

### Shipment dialog

- Header: eyebrow "WEEK n · ETD date" derived from `etd`, title, format chip,
  status chip coloured by status. Route and Status selects stay in the header.
- Summary strip under the header: Customer, Suppliers, Lane (PUP → POD),
  Vessel + voyage, ETD → ETA. Read from the live form, so it updates as you
  type.
- Left `SectionNav` replaces the tab strip. Count = fields with a non-empty
  value / fields visible for the chosen format. A section with a validation
  error shows "1 error" in red.
- Schedule block: keep the select full width, show Vessel and Voyage next to
  it as `auto` fields, `Booked` becomes a `Switch`.
- Footer via `AppDialog`: "Unsaved changes" dot, "Last saved by X · time"
  from `updated_by` / `updated_at`, Cancel, Save with spinner.
- Unsaved-changes guard on close.
- `FormatFormDialog` gets the same `SectionNav` for free.

### Route form

- Two columns: form on the left, a 300px sticky summary card on the right
  with total cost (large), the two other currencies underneath, a stacked
  bar and a per-incoterm list. Currency of the total is a `SegmentedControl`
  bound to `total_currency`.
- Incoterm panels: `SegmentedControl` for `*_currency`; the entered field is
  bright with a 2px primary border, the other two collapse to "auto" rows.
  `deriveRoute` is unchanged.
- Rates panel: show a reference rate line if we later add a rates endpoint;
  until then omit the line (the mockup shows the target state).
- "Used by" card: count of shipments with `route = id` and pricing rows with
  `route = id`, from the already-loaded queries.

### Schedule form

- Panels: Voyage, Timeline, Deadlines.
- Timeline: ETD and ETA dates, TT becomes derived (`daysBetween(etd, eta)`),
  and a two-dot line with the port names and day-of-week under the fields.
- Deadlines: `ddl_con`, `ddl_docs`, `ddl_port` become date inputs with a hint
  "n days before ETD · in m days". Migration `migration_NNN_schedule_ddl_dates`
  adds `*_date DATE` columns alongside the existing text columns; the form
  writes both while the old text stays readable. Confirm before doing this
  one, it changes data shape.
- "Shipments on this schedule" card from the weekly-shipments query filtered
  by `schedule_id`, with a note that ETD/ETA changes propagate.
- Header action "Duplicate to next week": existing `?from=` duplicate flow
  with ETD and ETA shifted by 7 days.

## Order and effort

| Phase | Touches | Rough size |
| --- | --- | --- |
| 1 Shared pieces | components/, theme, PricingFormPage refactor | 1 to 2 days |
| 2 Pop-ups | 4 dialogs, confirm, toasts, undo | 1 to 2 days |
| 3 Reminders | menu, bell, routes page, tiny endpoint | 1 day |
| 4 Logistics forms | shipment dialog, route form, schedule form | 2 to 3 days |

Each phase ships on its own and leaves the app fully working. Run
`cd client && npx tsc -b && npm run lint` and `cd server && npx tsc --noEmit`
before closing each one; add Vitest cases for `daysBetween` and the field
count helper used by `SectionNav`.
