# List Pagination

> Read this before building or changing any listing page or list API function.
> Covers how the backend paginates and the two correct ways to consume it.

---

## The Rule

**Every list endpoint is paginated server-side. Never read only
`response.data.data` from a list endpoint and treat it as the whole set.**

The backend returns **15 rows per page by default** plus a `pagination` block:

```json
"pagination": {
  "current_page": 1,
  "last_page": 4,
  "prev_page_url": null,
  "next_page_url": ".../payrolls?page=2",
  "per_page": 15,
  "total": 59,
  "count": 15
}
```

If the client ignores this block it silently gets page 1 only. Nothing errors;
the list just looks short.

### The bug this prevents

The payslip, certificate and leave-entitlement pages fetched `/payrolls`,
`/user-certificates` and `/leave-entitlements` without a `page` param, kept
`data`, dropped `pagination`, and then sliced the 15 rows into pages of 10 in
the browser. The footer showed **"10 of 15"** with 2 pages when there were
**59** staff across 4 server pages.

---

## Pick One Mode Per List

### A. Server-side paging (default — use this for most lists)

The server owns paging; the UI shows one server page at a time.

- The API function accepts `page` (and filters) and returns the **whole
  response**, including `pagination`.
- The hook keeps `pagination` in state and lists `params.page` in its deps.
- The footer uses the server's numbers:
  `total={pagination.total}`, `lastPage={pagination.last_page}`.
- Filters and search must be **sent to the API** (`search_words[]`, `name`,
  `user_uuid`, …) — never filter the current page client-side, or you only
  filter 15 rows.
- Reset `page` to 1 whenever a filter changes.

Reference: `hooks/useClaimHeaders.ts`, `lib/api/claim.ts`,
`app/(dashboard)/dashboard/requests/expenses/page.tsx`.

### B. Fetch-all + client-side paging

Use only when the UI must filter / search / derive options across the whole
set and the backend doesn't support those filters (e.g. payslip staff list
filtering by department, branch and published status).

- The API function **must** use `fetchAllPages` from
  `lib/api/fetch-all-pages.ts`. It loads page 1, reads `last_page`, then loads
  the remaining pages in parallel and returns the combined rows.
- The component then filters and slices with its own `PAGE_SIZE`, and the
  footer uses `rows.length`.
- Only appropriate for small sets (staff-sized, under a few hundred rows). If a
  list can grow large, ask for backend filters and switch to mode A.

```ts
// lib/api/payroll.ts
getPayrollUsers: (params?: PayrollUsersParams): Promise<PayrollUser[]> =>
  fetchAllPages<PayrollUser>("/payrolls", params),
```

Current mode-B lists: payslip staff list (`/payrolls`), certificates
(`/user-certificates`), leave entitlements (`/leave-entitlements`).

---

## Other Notes

- **`size` sets the page size.** `?size=100` is honoured (`per_page` is not).
  It's fine for short reference lists such as leave policies
  (`getLeavePolicies({ size: 100 })`), but it is not a substitute for
  `fetchAllPages`: anything past the limit is still silently dropped.
- **`/lookup/*` endpoints are not paginated.** They return the full list with
  no `pagination` block, so dropdowns built from `lib/api/lookup.ts` are fine.
- **Dashboard widgets** (`/dashboards/*`) return a short "recent" list by
  design; don't build a full listing page on them.
- Response types for list endpoints must include `pagination?: Pagination`
  (`types/user.ts`) so the field is visible to whoever writes the consumer.

---

## Checklist for a new or changed list

1. Hit the endpoint once and check for a `pagination` block.
2. Choose mode A or B above — don't mix them on one list.
3. Mode A: `page` param → API, `pagination` → hook state, footer uses
   `pagination.total` / `pagination.last_page`, filters go to the API.
4. Mode B: API function uses `fetchAllPages`; footer uses the filtered row
   count.
5. With more than 15 records in the backend, confirm the footer total matches
   the API's `pagination.total`.
