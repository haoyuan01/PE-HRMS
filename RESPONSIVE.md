# Data Table Patterns

> Companion to `DESIGN.md`. Read this before building or changing any data
> table. Covers column alignment and the mobile card layout.

---

## The Rule

**Data tables never scroll horizontally on mobile. They become a card list.**

Below the `md` breakpoint every table row renders as a `RecordCard`; the table
itself is hidden until `md`. A six-column table at 360px leaves almost no room
for content after cell padding, so rows wrap into unreadable blocks — and a
horizontal scroll hides half the data behind a gesture people miss.

Breakpoint is **`md` (768px)**, not `lg`. The sidebar is off-canvas until `lg`,
so from 768px up the content area is already full width and columns fit.

---

## Shared Components

`components/common/record-card.tsx` — do not re-implement the shell per module.
Where several tables share one shape, share the adapter too:
`components/modules/configuration/name-description-card.tsx` covers the
position / department / movement-type tables, which are identical.

| Export             | Purpose                                                                   |
| ------------------ | ------------------------------------------------------------------------- |
| `RecordCard`       | Card shell. Slots: `title`, `status`, `meta`, children, `action`.          |
| `RecordCardFields` | The `grid-cols-2 gap-2` grid that holds the tiles.                        |
| `RecordCardField`  | One `label` + `value` tile. `wide` makes it span both columns.             |

### Slots

| Slot       | Holds                                                              |
| ---------- | ------------------------------------------------------------------ |
| `title`    | Avatar + name block, or a single `<p className="truncate …">` line. |
| `status`   | The status pill, pinned right of the title.                        |
| `meta`     | Optional one-line secondary detail (icon + text), e.g. a location. |
| children   | A `RecordCardFields` grid of tiles.                                |
| `action`   | Footer affordance as a fragment, e.g. `<Eye />` + `View Details`.  |

`action` takes a fragment rather than a label+icon pair so each table keeps its
own affordance (leading icon, or trailing chevron) while the primary-colour
styling and right alignment stay shared.

### Two shells, picked by `onClick`

| Row's action                        | Pass `onClick`? | Shell      | `action` slot holds        |
| ----------------------------------- | --------------- | ---------- | ------------------------- |
| Navigates to a detail page/modal    | yes             | `<button>` | An affordance only        |
| Inline controls (Edit/Delete, link) | no              | `<div>`    | The real buttons or links |

A `<button>` cannot legally nest buttons or links, so any row whose action is an
Edit/Delete pair or an anchor must omit `onClick` and put those controls in
`action`. The static shell also drops the hover and focus ring, since the
container itself does nothing.

---

## Converting a Table

1. **Keep the table.** Wrap it in `hidden overflow-x-auto md:block`. Desktop
   behaviour must not change — column widths, alignment, hover, all of it. Where
   the table has no wrapper to use (inside a modal body, say), put the toggle on
   the table itself: `hidden w-full md:table` — `md:block` would break it.
2. **Add the card list** above it: `<div className="space-y-3 p-4 md:hidden">`,
   one card per row, mapped from the **same** data array the table gets. Never
   duplicate fetch, filter or pagination logic for the mobile view.
3. **Write a small per-module adapter** (`ClaimCard`, `LeaveRequestCard`) that
   maps one record onto the slots. Reuse the file's existing status and format
   helpers — the adapter should be mapping only, roughly 35 lines.
4. **Leave the loading skeleton and empty state alone.** They are already
   width-agnostic and shared by both views.

### Worked example

```tsx
function LeaveRequestCard({ request, showStaff, onView }: { … }) {
  const status = requestStatus(request);
  const { start, end } = leaveDateBounds(request);

  return (
    <RecordCard
      onClick={() => onView?.(request)}
      title={
        showStaff ? (
          <StaffCell user={request.user} align="start" />
        ) : (
          <p className="truncate font-medium text-on-surface">{leaveType}</p>
        )
      }
      status={
        <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${status.className}`}>
          {status.label}
        </span>
      }
      action={
        <>
          <Eye className="h-4 w-4" />
          View Details
        </>
      }
    >
      <RecordCardFields>
        <RecordCardField label="Start Date" value={formatDate(start)} />
        <RecordCardField label="End Date" value={formatDate(end)} />
        <RecordCardField label="Date of Resume" value={formatDate(request.resume_date)} wide />
      </RecordCardFields>
    </RecordCard>
  );
}
```

```
┌────────────────────────────────────┐  card:  surface-container-low
│ (av) Ahmad Zulkifli     [PENDING]  │
│ ┌──────────────┐ ┌───────────────┐ │  tiles: surface-container-lowest
│ │ START DATE   │ │ END DATE      │ │
│ │ 01 Oct 2026  │ │ 05 Oct 2026   │ │
│ └──────────────┘ └───────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ DATE OF RESUME                 │ │
│ │ 06 Oct 2026                    │ │
│ └────────────────────────────────┘ │
│                    👁 View Details │
└────────────────────────────────────┘
```

---

## Alignment

**Every column is centred.** Canonical implementation:
`components/modules/users/user-table.tsx`.

| Element     | Classes                                                                       |
| ----------- | ----------------------------------------------------------------------------- |
| `<th>`      | `px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant` |
| `<td>`      | `px-4 py-3 text-center text-sm`                                               |
| Action cell | `<div className="flex items-center justify-center gap-2">`                    |

- **Uniform `px-4`.** Do not give the first or last column extra edge padding
  (`pl-6` / `pr-6`): it drifts the column away from where the same column sits in
  every other table.
- **Never `text-right` on the action column.** Right-aligning *and* padding it
  sat the icons against the table edge, visibly further out than anywhere else.
- **The name column is the one that still reads left**, and it needs no special
  class. Its content is a flex container (avatar + name) that fills the cell, so
  it renders left-aligned inside a centred `<td>`. That is what keeps avatars on
  a shared left edge instead of ragged — do not add `justify-center` to it, and
  where the avatar component takes an `align` prop, the table wants the centring
  default while the mobile card wants `"start"`.
- Dates, counts and status pills are centred with no special casing.

Migrated so far: `users/user-table.tsx`, `requests/claim-table.tsx`,
`certificate/certificate-users-table.tsx`. The remaining tables still
left-align; bring one in line when you next touch it rather than sweeping them
all at once.

## Pagination

`components/common/table-pagination.tsx` — `TablePagination` is the footer under
every paginated list. Do not hand-roll one.

Props: `shown`, `total`, `label` (plural noun), `currentPage`, `lastPage`,
`onPageChange`, plus `divider` (top border, on by default) and `showPageNumbers`.

- **Mobile puts Previous and Next at opposite edges** with the page indicator
  between them, so both sit under a thumb; from `sm` up it collapses to the usual
  summary-left / controls-right row.
- Arrow buttons are **`h-10` on mobile, `h-9` from `sm`** — a 40px target beats
  the 30px text buttons this replaced — and carry chevrons plus a border so they
  read as buttons. The label shortens to "Prev" on a phone to keep the row inside
  320px.
- **`showPageNumbers` renders numbered pages from `sm` up only**, windowed to
  first / last / current ± 1 with `…` for elided runs. A phone always gets
  "Page N of M": a long page list wraps into several rows there, and the
  indicator says the same thing in one line.
- Every list shows "Page N of M" now, including the ones that previously showed
  only Previous / Next — on a phone you cannot see where you are otherwise.

## Calendars

`components/modules/leave/attendance-calendar.tsx` is the month grid, shared by
the Leave page and (via `movement/movement-calendar.tsx`) Staff Movement — one
change covers both.

A month grid stays seven columns at every width, so below `md` the cells are
about 45px wide and a text chip truncates to roughly two characters. Below `md`
the chips are therefore replaced by **solid tone dots** (`TONE_DOTS`), up to
`MAX_DOTS` with the remainder collapsed into a `+N` count; cells shrink to
`min-h-[56px]`. From `md` up the labelled chips return unchanged.

This only works because tapping a day with events opens a day modal on both
calendars — the dots say *something is here*, the modal says what. Do not adopt
the dots on a calendar that has no `onDayClick` tap-through.

## Design Rules

- **Surfaces, not lines.** The card is `surface-container-low` on the white
  panel; the tiles are `surface-container-lowest` on the card. Boundaries come
  from the surface hierarchy — no divider lines inside a card (`DESIGN.md`, the
  No-Divider Rule). Cards separate by 12px of space.
- **Tiles are what make fields readable.** Label and value on the bare card tone
  blend together; on a white tile they read as data.
- **`wide` the odd field.** A lone or trailing half-width tile with dead space
  beside it looks like a bug. Span it. Where the fields are dynamic, compute it:
  `wide={isOdd && i === list.length - 1}`.
- **Dynamic columns become dynamic tiles.** A table whose columns are data (a
  tile per leave policy, say) maps straight onto the tile grid. Prefer the full
  label over the table's abbreviated header — a `title` tooltip that explains a
  code is unreachable on a touch screen.
- **The whole card is the tap target** when the row navigates somewhere — a 14px
  link is a poor hit area on a phone. Keep the label plus an icon as the
  affordance, but the `<button>` wraps everything. When the row's action is
  inline controls instead, use the static shell (omit `onClick`); never nest a
  button or link inside the button shell.
- **Content that wraps does not belong in a tile.** Tile values are a single
  truncating line. A chip wrap (departments, offices) goes after the tile grid
  as its own `flex flex-wrap gap-1` row — pass it as an extra child.
- **A category label can use the `status` slot.** Movement type sits there as a
  neutral `surface-container-high` chip; it is the at-a-glance label even though
  it is not strictly a status. A row count works there too ("3 certs").
- **An expand/disclosure row keeps its toggle in children, not `action`.** The
  toggle has to sit above the content it reveals, and `action` renders last.
- **Nested records inside a card** (an expand-row inner table) become white
  `surface-container-lowest` blocks in the card body — the same tone as a tile.
  Their own values stay plain label/value pairs: a tile inside one of these
  blocks would be white on white. Give the expansion an empty-state line so the
  toggle never appears to do nothing.
- **Avatar/staff cells take `align?: "center" | "start"`.** Table cells centre
  their content; cards align to the start and let the name truncate against the
  status pill. Add the prop rather than forking the component.
- **`truncate` needs a block element.** Inside `RecordCard`'s title wrapper a
  plain `<span>` is inline and will not truncate — use `<p>`.
- **Stay at parity with the desktop columns.** Show the same fields the table
  shows, no more, unless asked. Where a table drops a column conditionally, the
  card drops it the same way.

---

## Status

Converted:

- [x] `components/modules/requests/claim-table.tsx` — expense claims
- [x] `components/modules/requests/leave-request-table.tsx` — leave requests
- [x] `components/modules/movement/movement-list.tsx` — staff movement
- [x] `components/modules/events/upcoming-event-list.tsx` — upcoming events
- [x] `components/modules/account/certificate-tab.tsx` — account certificates
- [x] `components/modules/certificate/certificate-users-table.tsx` — staff
      certificates, including the expand-row inner table
- [x] `components/modules/requests/overtime-table.tsx` — overtime requests
- [x] `components/modules/announcements/announcement-list.tsx` — announcements
- [x] `components/modules/dashboard/announcement-overview.tsx` — dashboard
      announcement preview (tappable shell; no action row, to stay compact)
- [x] `components/modules/payslip/payroll-my-list.tsx` — my payslips
- [x] `components/modules/payslip/payroll-staff-list.tsx` — staff payslips,
      including the expand-row inner table
- [x] `components/modules/dashboard/staff-movement-overview.tsx` — dashboard
      staff movement preview
- [x] `components/modules/users/user-table.tsx` — user management
- [x] `components/modules/leave/leave-entitlement-table.tsx` — leave
      entitlements (dynamic one-tile-per-policy columns)
- [x] `components/modules/configuration/position-table.tsx`
- [x] `components/modules/configuration/department-table.tsx`
- [x] `components/modules/configuration/movement-type-table.tsx`
      — the three above share `configuration/name-description-card.tsx`
- [x] `components/modules/configuration/role-table.tsx`
- [x] `components/modules/configuration/branch-table.tsx`
- [x] `components/modules/configuration/leave-policy-table.tsx`
- [x] `components/modules/configuration/audit-log-table.tsx`
- [x] `components/modules/movement/movement-day-modal.tsx` — the calendar's
      day modal (toggles `display` on the table itself; it has no wrapper div)

Remaining — 2 files, both deliberate, verified 2026-09-30 by sweeping every `<table>` for a
`md:hidden` card list. Column counts drive the order; `*` marks the 2 that are
hand-written table markup rather than TanStack Table.


Medium (5–6 columns):


Narrow (3–4 columns):


Deliberately left as tables — trialled as cards on 2026-10-01 and reverted. Both
are three-column mini previews (lead column, one value, a status pill) that stay
readable at phone width, and carding them made an already-long dashboard much
taller. Do not convert these without asking:

- [ ] `components/modules/dashboard/leave-request-overview.tsx` *
- [ ] `components/modules/dashboard/claim-request-overview.tsx` *

