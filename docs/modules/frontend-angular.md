# Frontend — Angular Application

> Verified against source on 2026-08-09. Every claim below was read directly from the files cited in
> `D:\cargo project\code-setu-app-ui`; anything not directly confirmed from source is explicitly marked
> "inferred" or "not verified". Backend behavior is cross-referenced against
> `../../code-setu-app/docs/modules/auth-security.md` and `../../code-setu-app/docs/api-urls.md` in the
> sibling backend repo — where this document and those disagree, the backend docs were treated as the
> source of truth for backend behavior, and the mismatch itself is documented as a bug (see
> [Known Issues](#known-issues)).

## 1. Overview

**Repo:** `D:\cargo project\code-setu-app-ui` — the frontend for the CargoSetu packers & movers ERP, whose
backend lives at `D:\cargo project\code-setu-app`.

**Stack** (`package.json`):

| Package | Version | Notes |
|---|---|---|
| `@angular/core`, `common`, `forms`, `router`, `animations`, `platform-browser*`, `compiler` | `^14.2.0` | Angular 14.2 |
| `@angular/cdk` | `^13.0.0` | One major version behind `@angular/core` |
| `@angular/material` | `^13.0.0` | One major version behind `@angular/core` — CDK/Material 13 paired with Angular 14 core packages (not verified whether this causes runtime issues; it is at minimum an unusual/mismatched pairing) |
| `@angular/service-worker` | `^14.3.0` | PWA support, see `ngsw-config.json` |
| `@angular/google-maps` | `^14.2.7` | Used by `driver-location` component |
| `rxjs` | `~7.5.0` | |
| `typescript` | `~4.7.2` (devDependency) | |
| `zone.js` | `~0.11.4` | |
| `jwt-decode` | `^4.0.0` | Client-side JWT parsing (not verification) |
| `@stomp/stompjs` | `^7.3.0` | STOMP-over-WebSocket client, used by `vehicle-location.service.ts` |
| `sockjs-client` | `^1.6.1` | SockJS transport backing the STOMP client |
| `stompjs` | `^2.3.3` | A **second**, older STOMP client library also listed as a dependency — not confirmed to be imported anywhere (only `@stomp/stompjs` was found in use in `vehicle-location.service.ts`); likely leftover/redundant dependency |
| `html2pdf.js` | `^0.14.0` | Listed as a dependency; no import site found in the files read for this document (not verified as unused — not exhaustively grepped for) |
| `ngx-image-cropper` | `^6.3.0` | Used by `component/image-cropper` |
| `material-icons` | `^1.13.14` | Self-hosted Material icon font (see `angular.json` styles / `karma.conf.js`) |
| `@fontsource/roboto` | `^5.2.9` | Self-hosted Roboto font |

**Angular CLI / build tooling:** `@angular/cli` `~14.2.13`, `@angular-devkit/build-angular` `^14.2.13`. Test
stack is Karma + Jasmine (`karma.conf.js`, `@types/jasmine`, `jasmine-core`).

**Architecture — monolithic, not lazy-loaded:** This is **not** a feature-modularized Angular app. There is
one `AppRoutingModule` (`src/app/app-routing.module.ts`) that eagerly imports every routed component's
class directly and lists them as plain `component:` routes — there is no `loadChildren`, no feature
`NgModule`s, and no lazy loading anywhere in the routing config. Application-wide wiring lives in a single
`AppModule` (`src/app/app.module.ts`) that declares ~26 components directly in `declarations` and separately
imports a second set of ~11 components as **standalone components** (Angular 14 supports standalone
components; this repo mixes the classic `NgModule`-declared style with the newer standalone style in the
same `AppModule`, rather than adopting one pattern consistently — e.g. `HomeComponent`, `DashboardComponent`,
`AboutComponent`, `VehicleManagementComponent`, `LoaderComponent`, `DialogboxComponent`, `PaginationComponent`,
`DriverLocationComponent` are `standalone: true` and imported into `AppModule.imports`, while
`LoginComponent`, `CompanyComponent`, `CustomerComponent`, etc. are classic declared components). Below the
top level, many of the newer feature components (`vehicle`, `driver`, `assignment`, `role`, `about`,
`contect-us`, `planscreen`, `featurescreen`, `dashboard`) are also individually `standalone: true` with their
own `imports` arrays for the Material modules they need, rather than relying on `AppModule`'s imports.
Everything is bundled into a single build — there are no secondary Angular CLI build targets/bundles for
separate feature areas.

Every HTTP call in the app goes through one global `HTTP_INTERCEPTORS` provider
(`AuthInterceptor`, registered in `AppModule.providers`) and route protection is done via a single
`AuthGuard` reused on nearly every non-public route.

## 2. Routing

Full route table from `src/app/app-routing.module.ts` (all routes are eagerly loaded — no route in this
file uses `loadChildren`):

| Path | Component | Guard | Notes |
|---|---|---|---|
| `` (empty) | `HomeComponent` | — | `pathMatch: 'full'` |
| `login` | `LoginComponent` | — | |
| `dashboard` | `DashboardComponent` | `AuthGuard` | |
| `signup` | `SignupComponent` | — | |
| `services` | `ServicesComponent` | — | |
| `about` | `AboutComponent` | — | |
| `contactus` | `ContectUsComponent` | — | |
| `home` | `HomeComponent` | — | Duplicate of `''`, same component |
| `createrole` | `RoleComponent` | — | **Not guarded**, unlike most other admin routes |
| `updaterole` | `UpdateroleComponent` | — | **Not guarded** |
| `roles` | `RolesDetailsComponent` | — | **Not guarded** |
| `permission-list` | `PermissionComponent` | `AuthGuard` | |
| `feature` | `FeaturescreenComponent` | — | |
| `staffdetails` | `StaffDetailsComponent` | `AuthGuard` | |
| `staffuser` | `StaffuserComponent` | `AuthGuard` | |
| `department` | `DepartmentComponent` | `AuthGuard` | |
| `plan` | `PlanscreenComponent` | `AuthGuard` | |
| `createPlan` | redirect → `createplan` | — | |
| `createPLan` | redirect → `createplan` | — | Duplicate redirect, different casing — dead redundant route |
| `createplan` | `CreateplanComponent` | `AuthGuard` | |
| `customers` | `CustomerComponent` | `AuthGuard` | |
| `staffuser/:staffId` | `StaffuserComponent` | `AuthGuard` | Edit-mode variant of `staffuser` |
| `company-list` | `CompanyComponent` | `AuthGuard` | |
| `company-create` | `CompanyComponent` | `AuthGuard` | Same component as `company-list`, mode driven internally |
| `company-edit/:id` | `CompanyComponent` | `AuthGuard` | |
| `vehicle` | redirect → `vehicle-management` | — | |
| `vehicle-management` | `VehicleManagementComponent` | `AuthGuard` | |
| `vehicle-management/vehicles` | `VehicleComponent` | `AuthGuard` | |
| `vehicle-management/drivers` | `DriverComponent` | `AuthGuard` | |
| `vehicle-management/assignments` | `AssignmentComponent` | `AuthGuard` | |
| `system-configuration` | `SyetemconfigurationComponent` | `AuthGuard` | Note the class/selector typo "Syetemconfiguration" (misspelling of "System") is in the actual source file/class name |
| `quotations` | `QuotaionComponent` | `AuthGuard` | Note class/selector typo "Quotaion" (misspelling of "Quotation") is in the actual source |
| `trips` | `TripComponent` | `AuthGuard` | |
| `customer/:customerId/shifting/:shiftId` | `ShiftingWorkspaceComponent` | `AuthGuard` | The Shifting Workspace — see §5.9 |

`RouterModule.forRoot(routes, …)` is configured with `anchorScrolling: 'enabled'`,
`scrollPositionRestoration: 'enabled'`, `scrollOffset: [0, 64]`.

**Unguarded admin-looking routes**: `createrole`, `updaterole`, and `roles` have no `canActivate: [AuthGuard]`
while structurally-similar routes (`permission-list`, `staffuser`, `department`) do. This looks like an
oversight rather than an intentional design choice, but is not stated anywhere in the source as intentional
— flagged as-is.

## 3. Authentication & Session Management

### 3.1 localStorage keys

| Key | Written by | Read by |
|---|---|---|
| `token` | `LoginService.loginUser()` / `loginAndFetchUser()` (`src/app/services/login.service.ts`), `JwttokenService.loginUser()` (`src/app/services/jwttoken.service.ts`), `AuthInterceptor.handle403Error()` (`src/app/core/interceptors/auth.interceptor.ts`), `company.component.ts` (after `refereseToken()`) | `LoginService.hasToken()`/`isLoggedIn()`, `AuthGuard`, `AuthInterceptor.intercept()`, `JwttokenService.getDecodedToken()`, `AccessMenuService.readTokenPayload()` |
| `refreshToken` | **Nowhere** — no `localStorage.setItem('refreshToken', …)` call exists anywhere in `src/app` (confirmed by grep across the whole `src/app` tree) | `LoginService.refreshToken()`, `AuthInterceptor.handle403Error()` — both only ever read a key that is never written |
| `user_session` | `LoginService.loginUser()` / `loginAndFetchUser()` | `nav-bar.component.ts`, `AccessMenuService.getCurrentAccess()` |
| `staffInfo` | `LoginService.loginAndFetchUser()` | `AccessMenuService.getCurrentAccess()` |
| `user` | `LoginService.setUserData()` | `LoginService.getUserData()` / `currentUserSubject` seed, `AccessMenuService.getCurrentAccess()` |
| `cargo_setu_theme_settings` | `ThemeService.updateTheme()` | `ThemeService.getStoredSettings()` |
| `currentStaff` | not found being written in files read | `nav-bar.component.ts: loadStaffData()` (dead/unreachable — no call site for `loadStaffData()` was found) |

`AuthInterceptor.logout()` and `LoginService.logout()` both clear `token`, `user_session`, `staffInfo`,
`user` on logout; the interceptor's version additionally clears `refreshToken` (which, per the above, was
never set in the first place).

### 3.2 `AuthGuard` — `src/app/services/guard/auth.guard.ts`

Read in full; the entire class is:

```ts
canActivate(route, state) {
  if (this.loginservice.isLoggedIn()) {
    return true;
  }
  this.router.navigate(['login']);
  return false;
}
```

`isLoggedIn()` delegates to `LoginService.hasToken()`, which is simply `!!localStorage.getItem('token')`.
**The guard only checks that a `token` key is present in `localStorage` — it does not decode the JWT, does
not check expiry, and does not call any backend endpoint.** An expired-but-still-present token still passes
this guard; the resulting 401/403 (if any) is only handled later, at the HTTP layer, by `AuthInterceptor`.

### 3.3 `AuthInterceptor` — `src/app/core/interceptors/auth.interceptor.ts`

Registered as `HTTP_INTERCEPTORS` in `AppModule.providers` (`src/app/app.module.ts`).

**Token attachment** (`intercept()`): reads `localStorage.getItem('token')`. If present, and the request
URL does **not** contain `/login`, `/generate-token`, `/otp`, or `/public`, it clones the request and sets
`Authorization: Bearer <token>`. (Note: it checks the *literal substring* `/generate-token`, but no service
in this app ever calls a URL containing that substring — `LoginService.generateToken()` actually calls
`/auth/login`, which is already excluded by the `/login` check. The `/generate-token` exclusion is dead
matching logic.)

**Error handling**: on any `HttpErrorResponse` with `status === 403` where the request URL does not contain
`/auth/refresh`, it calls `handle403Error()`. Any other error (including 401) is simply re-thrown — **401
responses are not handled by the refresh logic at all**, only 403.

**`handle403Error()`** (quoted in full, since this is the core of the "broken refresh" bug):

```ts
private handle403Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  if (this.isRefreshing) {
    return throwError(() => new Error('Token refresh already in progress'));
  }
  this.isRefreshing = true;
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    this.logout();
    return throwError(() => new Error('No refresh token available'));
  }
  return this.http.post('/api/auth/refresh', { token: refreshToken }).pipe(
    switchMap((res: any) => {
      this.isRefreshing = false;
      const newToken = res.accessToken || res.token || res.data?.accessToken;
      if (newToken) {
        localStorage.setItem('token', newToken);
        const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
        return next.handle(cloned);
      }
      this.logout();
      return throwError(() => new Error('Invalid refresh response'));
    }),
    catchError((err) => { this.isRefreshing = false; this.logout(); return throwError(() => err); })
  );
}
```

Because `refreshToken` in `localStorage` is never written anywhere in the app (§3.1), **`if (!refreshToken)`
is true on every single 403 in practice, so `handle403Error()` always immediately calls `this.logout()` and
never actually reaches the `this.http.post('/api/auth/refresh', …)` call.** The POST-refresh code path is
therefore currently unreachable dead code under real usage, not just architecturally wrong.

Even if a `refreshToken` value were somehow present, the call itself does not match any real backend
endpoint. Per `../../code-setu-app/docs/modules/auth-security.md` §2/§7 the backend's only refresh endpoint
is:

```
GET /api/v2/cargosetu/refreshtoken     (BaseApiController, base path BaseURL.BASE_URL = "/api/v2/cargosetu")
Authorization: Bearer <old-or-expired-JWT>   ← the existing access token itself, in the header
(no request body; no separate "refresh token" concept — the backend has no wired code path that ever
 issues or checks a distinct refresh token; see auth-security.md §5/§6/§7 — `RefreshToken`/
 `RefreshTokenRepository`/`JwtUtils.createRefreshToken()` all exist but are never invoked)
```

The frontend instead calls:

```
POST /api/auth/refresh                 ← relative URL, no host — resolves against the Angular app's own
                                          origin (e.g. http://localhost:4200 in `ng serve`, or whatever
                                          origin serves the built SPA in production), NOT the backend's
                                          host/port (ENV.CARGO_SETU, e.g. http://localhost:31201)
Body: { token: refreshToken }          ← a JSON body carrying a "refresh token" value the backend does not
                                          issue, check, or expect
```

Both the **method** (`POST` vs. the backend's `GET`), the **path** (`/api/auth/refresh` vs. the backend's
`/api/v2/cargosetu/refreshtoken`), the **host** (relative/SPA-origin vs. `ENV.CARGO_SETU`), and the
**contract** (JSON body with a refresh-token value vs. an `Authorization` header carrying the existing JWT)
are all mismatched. This exact same wrong `POST /api/auth/refresh` call also appears in
`LoginService.refreshToken()` (`src/app/services/login.service.ts:135-138`) — it is duplicated, not shared.

### 3.4 `LoginService` — `src/app/services/login.service.ts` (read in full)

`BASE_URL = ENV.CARGO_SETU` (runtime-injected, see §7).

| Method | Calls | Purpose |
|---|---|---|
| `sendOtp(mobileNumber)` | `POST ${BASE_URL}/auth/otp/send` | Matches backend `OtpAuthController` |
| `verifyOtp(mobileNumber, otpCode)` | `POST ${BASE_URL}/auth/otp/verify` | Matches backend |
| `generateToken(credential)` | `POST ${BASE_URL}/auth/login` | Matches backend `AuthController.login` |
| `refereseToken()` (sic — typo in the actual method name, not a paraphrase) | `GET ${BASE_URL}/cargosetu/refreshtoken` | **Broken URL** — see §3.5 |
| `refreshToken()` | `POST /api/auth/refresh` | **Broken URL**, and also never actually invoked with a subscriber under normal login (see §3.5) |
| `loginUser(token)` | — | **Effectively dead code** in the currently-wired login flow — see §3.5 |
| `updateTokens(newTokens)` | — | **No-op / broken** — see §3.5 |
| `loginAndFetchUser(token)` | `StaffuserServiceService.getStaffById(decoded.sub)` | **This is the method actually used by the login UI** (see below) |
| `logout()` | — | Clears `token`, `user_session`, `staffInfo`, `user`; pushes `loggedInSubject.next(false)`; navigates to `/login` |
| `isLoggedIn()` | — | `!!localStorage.getItem('token')` |
| `setUserData(user)` / `getUserData()` | — | Wraps a `currentUserSubject` BehaviorSubject over the `user` localStorage key |

`login.service.ts` also has a stray unused import, `import { Token } from '@angular/compiler';` (line 2) —
`@angular/compiler`'s `Token` type is never referenced anywhere in the file; this is dead/leftover code.

### 3.5 The actual login flow vs. the broken/dead code (read exactly as written)

**What actually runs on login** — `src/app/component/login/login.component.ts::loginWithEmail()`:

```ts
this.loginService.generateToken(this.credential).pipe(
  switchMap((response: AuthResponse) => this.loginService.loginAndFetchUser(response.accessToken))
).subscribe({ ... });
```

`loginAndFetchUser(token)` (`login.service.ts:153-184`) stores the token, decodes it with `jwtDecode`, and
if `decoded.sub` exists, calls `StaffuserServiceService.getStaffById(decoded.sub)` and on response builds
and stores a `user_session` object (`staffId`, `uuid`, `userName`, `firstName`, `roles`,
`permissions` via `extractPermissions()`) plus the raw response under `staffInfo`. This path never touches
`refreshToken`/`updateTokens`/expiry logic at all — it is a straight-line "store token, fetch profile" flow.
It is also used by OTP login (`verifyOtp()`) and by `signup.component.ts` after registration.

**`LoginService.loginUser(token)` is never called from anywhere in the app** — confirmed by grepping for
`.loginUser(` across `src/app`; the only matches are the method's own definition in `login.service.ts` and
the unrelated, separately-defined `JwttokenService.loginUser()` (a different class entirely, at
`src/app/services/jwttoken.service.ts`, which is also not called from any component). `LoginService.loginUser()`
is therefore dead code — but it is the method that contains the project's most obviously broken logic, so it
is worth quoting and explaining precisely since it is exactly the kind of code someone could accidentally
wire back in:

```ts
loginUser(token: string): boolean {
  ...
  localStorage.setItem('token', token);
  const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    try {
      const newTokens = this.refreshToken();       // (A) returns a cold Observable — nothing subscribes to it
      this.updateTokens(newTokens);                // (B) passes that unsubscribed Observable into updateTokens
      return true;                                  // returns true unconditionally, even though no refresh happened
    } catch (error) {
      this.logout();
      return false;
    }
  }
  ...
}

updateTokens(newTokens: any) {
  this.loginAndFetchUser        // (C) references the method itself — does not call it, does not use `newTokens`
}
```

Two separate bugs, exactly as written:
- **(A)** `this.refreshToken()` returns an RxJS `Observable` (`login.service.ts:135-138`); RxJS observables
  returned from `HttpClient` are cold and do nothing until `.subscribe()` is called. `newTokens` here is
  bound to that unsubscribed `Observable` object itself, not to a resolved token value, and the HTTP POST
  never actually fires.
- **(C)** `updateTokens(newTokens: any) { this.loginAndFetchUser }` is a single expression statement that
  evaluates a reference to the `loginAndFetchUser` method (a no-op property access — it does not invoke the
  function, since there are no `()` after it) and then does nothing with it. The `newTokens` parameter is
  never read anywhere in the method body.
- Net effect: if this branch were ever reached, it would silently do nothing (no network call, no token
  update) and then `loginUser()` would still `return true`, i.e. report success despite the token being
  expired and no refresh having occurred.

**`LoginService.refereseToken()`** (§3.4) is the one refresh-shaped method that **is** actually called, from
`src/app/component/company/company.component.ts:153`, after a company is created — the intent (per the
inline comment `// Refresh JWT token after company creation`) is to pull a fresh JWT that carries the newly
created `companyId` claim. Its URL is `${BASE_URL}/cargosetu/refreshtoken`. With
`BASE_URL = ENV.CARGO_SETU = "http://localhost:31201"` (§7), this resolves to
`http://localhost:31201/cargosetu/refreshtoken` — **missing the `/api/v2` path segment** that the real
backend route requires (`/api/v2/cargosetu/refreshtoken`, confirmed against both
`../../code-setu-app/docs/api-urls.md` and `auth-security.md` §2). Every other service in this codebase that
talks to `BaseURL.BASE_URL`-rooted endpoints includes the `/api/v2/cargosetu` segment (see the Services
Catalog, §6) — this is the one call site that omits it, so in practice this request 404s and the
`error: (err) => console.error('Token refresh failed:', err)` branch in `company.component.ts` fires
instead of the token actually being refreshed.

## 4. Feature Modules / Components

### 4.1 Dashboard
- `component/dashboard/dashboard.component.ts` (standalone) — role-based landing page. Injects
  `AccessMenuService` (`src/app/services/access-menu.service.ts`) to render permission-filtered menu
  sections (`getDashboardSections()`). `AccessMenuService` itself calls no backend endpoints — it derives
  visible menu items purely from client-side inspection of `localStorage` (`user_session`, `staffInfo`,
  `user`) and the decoded JWT payload (`readTokenPayload()` manually base64-decodes the JWT's middle segment
  rather than using `jwt-decode`).

### 4.2 Company
- `component/company/company.component.ts` — list/create/edit/delete company. Calls `CompanyService`
  (`getCompany`, `getCurrentCompany`, `createCompany`, `updateCompany`, `getCompanyById`, `deleteCompany`)
  against `${ENV.CARGO_SETU}/api/v2/cargosetu/company` — matches backend `CompanyController` per
  `api-urls.md`. Also calls `LoginService.refereseToken()` post-creation (see §3.5 bug) and
  `ShowpopupService` for snack-bar feedback.

### 4.3 Staff / Role / Permission
- `component/staffuser/staffuser.component.ts` — create/edit staff; injects `StaffuserServiceService`,
  `RoleserviceService`, `DepartmentService`, `ShowpopupService`.
- `component/staff-details/staff-details.component.ts` — staff profile view; injects
  `StaffuserServiceService`.
- `component/component/role/role.component.ts` (standalone) — role create form; injects
  `RoleserviceService`.
- `component/updaterole/updaterole.component.ts` — role edit; injects `RoleserviceService`.
- `roles-details/roles-details.component.ts` (note: lives directly under `src/app/roles-details`, not under
  `src/app/component`) — role list; injects `RoleserviceService`, `ShowpopupService`.
- `component/permission/permission.component.ts` — permission list/CRUD; injects `RoleserviceService`
  (permission CRUD methods live on the same service as role CRUD, see §6).
- All of the above ultimately hit `${ENV.CARGO_SETU}/api/v2/cargosetu/role` and
  `${ENV.CARGO_SETU}/api/v2/cargosetu/permission` via `RoleserviceService`
  (`src/app/services/role/roleservice.service.ts`), and `${ENV.CARGO_SETU}/api/v2/cargosetu/staff` /
  `${ENV.CARGO_SETU}/auth/user/register` via `StaffuserServiceService`
  (`src/app/services/staffuser-service.ts`) — matching backend `RoleController`, `PermissionController`
  (inferred name), `StaffController`, and `AuthController.registerUser` per `api-urls.md`.

### 4.4 Department
- `component/component/department/department.component.ts` — CRUD UI; injects `DepartmentService`
  (`src/app/services/department.service.ts`), which calls `${ENV.CARGO_SETU}/api/v2/cargosetu/department`
  (GET/POST/PUT/DELETE) — matches backend `DepartmentController`. A second, apparently-unused service,
  `DepartmentDialogService` (`src/app/services/department-dialog.service.ts`), duplicates `getAll()`/`delete()`
  against the same resource but with a **malformed URL** (see [Known Issues](#known-issues)) and is not
  injected by any component (confirmed by grep — its only reference outside itself is its own
  `.spec.ts`).

### 4.5 Customer
- `component/customer/customer.component.ts` — customer list/create/edit; injects `CompanyService`,
  `CustomersService`, `StaffuserServiceService`, `TemplateService`. `CustomersService`
  (`src/app/services/customers.service.ts`) calls `${ENV.CARGO_SETU}/api/v2/cargosetu/customer` (paginated
  GET, POST, PUT, DELETE-with-body) and `${ENV.CARGO_SETU}/api/v2/cargosetu/shifts/shifting-types` —
  matches backend `CustomerController` / shifting-types endpoint per `api-urls.md`.

### 4.6 Vehicle Management (vehicles / drivers / assignments)
- `component/vehicle-management/vehicle-management.component.ts` (standalone) — hub/landing page for the
  three sub-areas below; injects `VehicleService`.
- `component/vehicle/vehicle.component.ts` (standalone) — vehicle CRUD; injects `VehicleService`
  (`src/app/services/vehicle.service.ts`), which calls `${ENV.CARGO_SETU}/vehicle` (**not** under
  `/api/v2/cargosetu` — matches the backend's separately-rooted `Vehicle` base path `/vehicle` per
  `api-urls.md`'s "URL Constants Reference" table, `BaseURL.VEHICLE`).
- `component/driver/driver.component.ts` (standalone) — driver CRUD; injects `DriverService`
  (`src/app/services/driver.service.ts`), calling `${ENV.CARGO_SETU}/api/v2/cargosetu/drivers` — matches
  backend `DriverController`.
- `component/assignment/assignment.component.ts` (standalone) — assignment list; injects
  `AssignmentService`, `DriverService`, `VehicleService`.
- `component/assignment/manage-assignment-dialog.component.ts` (standalone) — assignment create/manage
  dialog; injects `DriverService`, `VehicleService`, `AssignmentService`.
- `AssignmentService` (`src/app/services/assignment.service.ts`) calls
  `POST ${ENV.CARGO_SETU}/api/v2/cargosetu/assignments?driverId=&vehicleId=` and
  `PUT ${ENV.CARGO_SETU}/api/v2/cargosetu/assignments/unassign/{id}` — matches backend `AssignmentController`
  (note `api-urls.md` only lists GET/POST/PUT-unassign for this resource; no DELETE is documented or called).
- `component/driver-location/driver-location.component.ts` (standalone) — live map view using
  `@angular/google-maps`; injects `VehicleLocationService` (`src/app/services/vehicle-location.service.ts`),
  which does both REST (`GET ${ENV.CARGO_SETU}/api/v2/cargosetu/vehicle/{vehicleId}/location`) and a STOMP
  WebSocket subscription over SockJS at `${ENV.CARGO_SETU}/ws`, topic `/topic/vehicle/{vehicleId}` — this
  matches the `/ws/**`/`/topic/**` CORS/permit rules called out in `auth-security.md` §7 (`SecurityConfig`).

### 4.7 System Configuration
- `component/syetemconfiguration/syetemconfiguration.component.ts` (class name has the same typo as the
  route/selector, "Syetemconfiguration") — injects `SystemConfigurationService`
  (`src/app/services/system-configuration.service.ts`), calling
  `${ENV.CARGO_SETU}/api/v2/cargosetu/system/configuration` (GET all/by-id, POST, PUT, DELETE) — matches
  backend `SystemConfigController` (inferred name) per `api-urls.md` (note: `api-urls.md` does not document
  a DELETE for this resource, but the frontend service defines `deleteConfiguration()`; not verified whether
  the backend actually implements it — flagged as **unverified**).

### 4.8 Quotation
- `component/quotaion/quotaion.component.ts` (class/selector typo, "Quotaion") — injects `TemplateService`,
  `ShowpopupService`. `TemplateService` (`src/app/services/template.service.ts`) calls
  `${ENV.CARGO_SETU}/api/v2/cargosetu/templates` (POST create), `.../templates/quotation/{shiftingId}/pdf`,
  `.../templates/{shiftingId}/invoice`, plus two endpoints not listed in `api-urls.md`:
  `.../templates/lr-copy/{shiftingId}/pdf` and `.../templates/item-list/{shiftingId}/pdf` (**not verified**
  against backend source — `api-urls.md` only documents the `quotation/.../pdf` and `{shiftingId}/invoice`
  routes for `TemplateGenerationController`).

### 4.9 Trip
- `component/trip/trip.component.ts` — trip list/create/status-transition UI; injects `TripService`,
  `DriverService`, `VehicleService`, `CustomersService`. `TripService`
  (`src/app/services/trip.service.ts`) is the largest single service in the app, wrapping four backend
  resources under one class: `/api/v2/cargosetu/trip`, `/trip-expense`, `/trip-status-history`,
  `/trip-document` — all matching `api-urls.md`'s Trip / Trip Expense / Trip Status History / Trip Document
  sections.

### 4.10 Shifting Workspace
The most complex feature area — a single routed shell component
(`customer/:customerId/shifting/:shiftId` → `ShiftingWorkspaceComponent`,
`src/app/component/shifting-workspace/shifting-workspace.component.ts`) hosting a `MatTabGroup` of child
components, each an `@Input() shiftId`-driven standalone-ish (declared in `AppModule`, not `standalone:
true`) tab body:

| Sub-component | File | Injects | Backend calls |
|---|---|---|---|
| Overview | `overview/overview.component.ts` (`WsOverviewComponent`) | `ShiftingWorkspaceService`, `ShiftInventoryService`, `TripService`, `CustomersService` | Aggregates shift, inventory, trip, and customer data for a summary view |
| Details | `details/ws-details.component.ts` (`WsDetailsComponent`) | `ShiftingWorkspaceService` | `GET`/`PUT ${ENV.CARGO_SETU}/api/v2/cargosetu/shifts/{shiftId}` |
| Inventory | `inventory/inventory.component.ts` (`WsInventoryComponent`) | `ShiftInventoryService` | Full inventory CRUD + status patch against `/api/v2/cargosetu/shift-inventory` |
| Inventory Drawer | `inventory/inventory-drawer/inventory-drawer.component.ts` (`WsInventoryDrawerComponent`) | none (pure presentational, `@Input`/`@Output` only) | none — emits `save`/`close` events back up to `WsInventoryComponent` |
| Packing | `packing/packing.component.ts` (`WsPackingComponent`) | `ShiftInventoryService` | Reads inventory items and tracks packing-material quantities client-side |
| Loading | `loading/loading.component.ts` (`WsLoadingComponent`) | `ShiftInventoryService` | Reads inventory, supports bulk status updates (loaded/unloaded) |
| Trip | `trip/workspace-trip.component.ts` (`WsWorkspaceTripComponent`) | `TripService`, `Router` | Creates/reads trips and drives trip-status transitions via a hardcoded `TRIP_STATUS_TRANSITIONS` state machine (client-side only — not confirmed the backend enforces the same transition graph) |
| Charges | `charges/charges.component.ts` (`WsChargesComponent`) | `ShiftingWorkspaceService` | Reads/updates shift-level charge fields (`transportCharge`, `packingCharge`, `gstCharge`, etc.) via the shift PUT endpoint |
| Documents | `documents/workspace-documents.component.ts` (`WsDocumentsComponent`) | `TripService`, `TemplateService` | Resolves the trip for this shift, then lists/uploads trip documents and generates PDFs |
| Timeline | `timeline/timeline.component.ts` (`WsTimelineComponent`) | `TripService` | Builds a client-side merged event timeline from trip data (no dedicated timeline endpoint) |

All ten sub-components are declared in `AppModule.declarations` (`src/app/app.module.ts:116-125`), not
lazy-loaded, and are wired together purely via `@Input() shiftId`/`customerId` props passed down from
`ShiftingWorkspaceComponent`'s template — there is no shifting-workspace-specific routing (no nested
`Routes`/`RouterOutlet`), just Material tabs.

### 4.11 Other components (brief)
| Component | Purpose |
|---|---|
| `component/home/home.component.ts` | Public landing page (standalone), composes `PlanscreenComponent` and others |
| `component/login/login.component.ts` | Email/password login + OTP login UI (see §3.5) |
| `component/signup/signup.component.ts` | Self-registration; injects `StaffuserServiceService`, `ShowpopupService`, `LoginService`, `CompanyService` |
| `component/services/services.component.ts` | Public marketing "services" page |
| `component/about/about.component.ts` | Public "about" page (standalone) |
| `component/contect-us/contect-us.component.ts` | Public contact form (standalone); injects `InquiryService`, `ShowpopupService` — posts to the backend's public inquiry endpoint |
| `component/footer/footer.component.ts` | Site footer |
| `component/nav-bar/nav-bar.component.ts` | Top nav; subscribes to `LoginService.loggedIn$`, reads `user_session`, drives logout/profile navigation |
| `component/planscreen/planscreen.component.ts` | Public/subscription plan listing (standalone); injects `PlanserviceService` |
| `component/createplan/createplan.component.ts` | Plan CRUD (admin); injects `PlanserviceService`, `ShowpopupService` |
| `component/downloadscreen/downloadscreen.component.ts` | App-download promo screen (standalone) |
| `component/featurescreen/featurescreen.component.ts` | Feature-highlight promo screen (standalone) |
| `component/theme-customizer/theme-customizer.component.ts` | UI for live-editing `ThemeService` settings (colors/fonts), persisted to `localStorage` |
| `component/viewcomponent/viewcomponent.component.ts` | Not deeply inspected — generic viewer component (inferred from name only) |
| `component/dialogbox/dialogbox.component.ts` | Generic confirm/cancel Material dialog (standalone), used e.g. by `company.component.ts`'s "no company" prompt |
| `component/loader/loader.component.ts` | Shared loading-spinner component (standalone) |
| `component/pagination/pagination.component.ts` | Shared pagination control (standalone), selector `app-shared-pagination` |
| `component/image-cropper/image-cropper.component.ts` | Wraps `ngx-image-cropper` for profile/company image upload flows |

## 5. Services Catalog

| Service file | Purpose | Backend endpoint(s) called |
|---|---|---|
| `services/login.service.ts` (`LoginService`) | Auth/session state, login/OTP flows | `POST /auth/otp/send`, `POST /auth/otp/verify`, `POST /auth/login`, `GET {BASE_URL}/cargosetu/refreshtoken` (**broken URL**, §3.5), `POST /api/auth/refresh` (**broken/unreachable**, §3.3) |
| `services/jwttoken.service.ts` (`JwttokenService`) | Standalone JWT decode/expiry helper; not part of the wired login flow (§3.4) | none — client-side only |
| `services/guard/auth.guard.ts` (`AuthGuard`) | Route guard | none — checks `localStorage` only |
| `core/interceptors/auth.interceptor.ts` (`AuthInterceptor`) | Global HTTP interceptor: bearer-token attachment, 403 handling | `POST /api/auth/refresh` (**broken/unreachable**, §3.3) |
| `services/company.service.ts` (`CompanyService`) | Company CRUD | `GET/POST/PUT/DELETE {ENV.CARGO_SETU}/api/v2/cargosetu/company`, `GET .../company/currentCompany`, `GET .../company/{id}` |
| `services/customers.service.ts` (`CustomersService`) | Customer CRUD + shifting types | `GET/POST/PUT/DELETE {ENV.CARGO_SETU}/api/v2/cargosetu/customer`, `GET .../customer/{uuid}`, `GET .../shifts/shifting-types` |
| `services/department.service.ts` (`DepartmentService`) | Department CRUD (in active use) | `GET/POST/PUT/DELETE {ENV.CARGO_SETU}/api/v2/cargosetu/department` |
| `services/department-dialog.service.ts` (`DepartmentDialogService`) | Duplicate/unused department get-all + delete | `GET/DELETE` with a **malformed URL** (missing `/` — see Known Issues); not injected by any component |
| `services/role/roleservice.service.ts` (`RoleserviceService`) | Role CRUD + Permission CRUD (both live on this one service) | `GET/POST/PUT/DELETE {ENV.CARGO_SETU}/api/v2/cargosetu/role`, `.../permission` |
| `services/staffuser-service.ts` (`StaffuserServiceService`) | Staff CRUD, registration, profile-upload, current-staff subject | `GET {ENV.CARGO_SETU}/api/v2/cargosetu/staff/{id}`, `GET .../staff?page=&size=`, `POST {ENV.CARGO_SETU}/auth/user/register`, `POST .../document/upload?/` |
| `services/driver.service.ts` (`DriverService`) | Driver CRUD | `GET/POST/PUT/DELETE {ENV.CARGO_SETU}/api/v2/cargosetu/drivers` |
| `services/vehicle.service.ts` (`VehicleService`) | Vehicle CRUD + assignment reads | `GET/POST/PUT/DELETE {ENV.CARGO_SETU}/vehicle`, `GET {ENV.CARGO_SETU}/api/v2/cargosetu/assignments` |
| `services/vehicle-location.service.ts` (`VehicleLocationService`) | Live vehicle location — REST + STOMP/WebSocket | `GET {ENV.CARGO_SETU}/api/v2/cargosetu/vehicle/{id}/location`; STOMP over SockJS at `{ENV.CARGO_SETU}/ws`, topic `/topic/vehicle/{id}` |
| `services/assignment.service.ts` (`AssignmentService`) | Driver↔vehicle assignment | `POST {ENV.CARGO_SETU}/api/v2/cargosetu/assignments?driverId=&vehicleId=`, `PUT .../assignments/unassign/{id}` |
| `services/system-configuration.service.ts` (`SystemConfigurationService`) | System config CRUD | `GET/POST/PUT/DELETE {ENV.CARGO_SETU}/api/v2/cargosetu/system/configuration` |
| `services/template.service.ts` (`TemplateService`) | Template upload + PDF generation (quotation/invoice/LR/item-list) | `POST {ENV.CARGO_SETU}/api/v2/cargosetu/templates`, `GET .../templates/quotation/{id}/pdf`, `.../templates/{id}/invoice`, `.../templates/lr-copy/{id}/pdf` (not verified against backend), `.../templates/item-list/{id}/pdf` (not verified against backend) |
| `services/shift-inventory.service.ts` (`ShiftInventoryService`) | Shifting inventory-item CRUD + status patch | `GET/POST/PUT/PATCH/DELETE {ENV.CARGO_SETU}/api/v2/cargosetu/shift-inventory` |
| `services/shifting-workspace.service.ts` (`ShiftingWorkspaceService`) | Read/update a single shifting order | `GET/PUT {ENV.CARGO_SETU}/api/v2/cargosetu/shifts/{shiftId}` |
| `services/trip.service.ts` (`TripService`) | Trip + trip-expense + trip-status-history + trip-document CRUD | `{ENV.CARGO_SETU}/api/v2/cargosetu/trip`, `/trip-expense`, `/trip-status-history`, `/trip-document` (full CRUD on each) |
| `services/planservice.service.ts` (`PlanserviceService`) | Subscription plan CRUD | `GET/POST/PUT/DELETE {ENV.CARGO_SETU}/api/v2/cargosetu/plan`, `GET .../public/plan` |
| `services/inquiry.service.ts` (`InquiryService`) | Public contact/inquiry form | `POST {ENV.CARGO_SETU}/public/api/inquiries` |
| `services/access-menu.service.ts` (`AccessMenuService`) | Client-side, permission-filtered nav-menu definitions | none — purely derives from `localStorage`/JWT payload |
| `services/theme.service.ts` (`ThemeService`) | App theming (CSS custom properties), `APP_INITIALIZER`-bootstrapped | none — `localStorage` only |
| `services/pwa-update.service.ts` (`PwaUpdateService`) | Service-worker update prompt | none — wraps `@angular/service-worker`'s `SwUpdate` |
| `services/showpopup.service.ts` (`ShowpopupService`) | Snack-bar/toast wrapper, color-codes by HTTP-response-code convention | none |
| `services/env/env.service.ts` (`EnvService`) | **Not actually used anywhere** — reads `window.__env` (double-underscore), while the real runtime config lives on `window['env']` (single, see `src/assets/env.ts`/`env.js`) — see Known Issues | none |

## 6. Request/Response Models

TypeScript interfaces/classes found under `src/app/models/**` and inline in a couple of components:

| Model | File | Notes |
|---|---|---|
| `AuthResponse` | `models/authresponse.ts` | `{ accessToken, tokenType, expiresIn }` — matches backend `TokenResponse` shape per `auth-security.md` §4 |
| `GenericDataDTO` | `models/generic-data-dto.ts` | `{ responseMessege, responseCode, dataList, data }` (note: `responseMessege` is typed as `number` despite the name implying a message string — likely a typing bug, and the field name itself is a misspelling of "responseMessage") — this is the generic envelope most list/detail services unwrap (`res?.data`, `res?.dataList`, `res.responseCode === 200`) |
| `company` (interface, lowercase name) | `models/company.ts` | Company create/edit form shape |
| `CustomerModels` / `Shifting` | `models/customer-models.ts` | Customer create/edit shape; nested `Shifting` sub-objects |
| `Department` (class) | `models/department.ts` | `{ id?, name, code, isActive, description }` |
| `Permission` / `PERMISSIONS` | `models/permission.ts` | `PERMISSIONS` is a **hardcoded static array** (`CREATE_USER`, `EDIT_USER`, `DELETE_USER`, `VIEW_REPORTS`) — not confirmed to be used anywhere beyond this file; real permission data in the running app comes from the backend via `RoleserviceService`/JWT claims, not this constant |
| `Role` (class) | `models/role.ts` | `{ rolesId, code, roleName, description?, scope, permissions: Permission[] }` |
| `Plandto` (class) | `models/plandto.ts` | `{ planId, name, plannCategory, planValidity, price }` |
| `Staff` (class) | `models/staff.ts` | Staff create/edit form shape; `staffType: 'ADMIN' \| 'STAFF' \| 'DRIVER'` |
| `Assignments` | `models/assignments.ts` | `{ id, driverId, driverName, vehicleId, registrationNumber, assignedAt, unassignedAt, active, remarks }` |
| `Trip`, `TripPayload`, `CreateTripPayload`, `TransitionTripPayload`, `TripStatus`, `TripStatusHistory`, `TripExpense`, `ExpenseCategory`, `ExpensePaidBy`, `TripDocument`, `AddExpensePayload` | `models/trip.ts` | The most complete/well-typed model file in the app; `TripStatus` union lists 16 states matching the `TRIP_STATUS_TRANSITIONS` graph hardcoded in `workspace-trip.component.ts` |
| `DriverPayload` | `services/driver.service.ts` (inline interface, not in `models/`) | |
| `VehiclePayload` | `services/vehicle.service.ts` (inline interface, not in `models/`) | |
| `AccessMenuItem` / `AccessMenuSection` | `services/access-menu.service.ts` (inline) | Client-side nav-menu shape, not a backend DTO |
| `AppThemeSettings` / `ThemeMode` | `services/theme.service.ts` (inline) | Client-side theming shape, not a backend DTO |
| `JwtPayload` | `services/jwttoken.service.ts` (inline) | `{ sub, exp, iat, role? }` — a second, differently-shaped `JwtPayload` type is also imported from the `jwt-decode` package itself and used in `login.service.ts`; these are two distinct types with the same name in different files |
| `component/vehicle-management/vehicle-management.models.ts` | — | **File exists but is completely empty** (0 bytes) — see Known Issues |

Most list/table components (`customer`, `staffuser`, `trip`, `driver`, `vehicle`, `syetemconfiguration`,
etc.) work with the API response as loosely-typed `any`/`any[]` rather than importing a matching model —
only `trip.service.ts` and its consumers consistently use the typed `Trip`/`TripPayload` interfaces from
`models/trip.ts`.

## 7. Environment Configuration

Angular's own environment files carry **no API URL** — `src/environments/environment.ts` and
`environment.prod.ts` only set `production: false`/`true` respectively, swapped via `angular.json`'s
`fileReplacements` for the `production` build configuration. Neither file is where the backend base URL
comes from.

The actual backend base URL is injected at **runtime**, not build time, via a plain script tag:

- `src/index.html` loads `assets/env.js` (twice — once in `<head>`, once again at the end of `<body>`,
  confirmed by reading the file — the second load is redundant but harmless since it just re-executes the
  same idempotent assignment).
- `src/assets/env.js` (the actual runtime config, shipped as a static asset per `angular.json`'s `assets`
  glob for `env.js`):
  ```js
  window["env"] = window["env"] || {};
  window["env"]["CARGO_SETU"] = "http://localhost:31201";
  window["env"]["GOOGLE_MAPS_API_KEY"] = "AIzaSyBJMMItJT9bMQlbJK8RnXhHi5rLrICje0s";
  ```
- `src/assets/env.ts` re-exports this as `export const ENV = (window as any)['env'];`, which is what every
  service imports (`import { ENV } from 'src/assets/env'`).
- **Because `env.js` is a static asset copied as-is into every build (dev and prod), the backend URL is
  currently identical (`http://localhost:31201`) regardless of the Angular build configuration.** There is
  no separate `env.prod.js` and no build-time substitution wired up for it — switching environments (e.g.
  for a real production deployment) requires manually editing this file (or overwriting it post-build/at
  deploy time), not just building with `--configuration production`. The Google Maps API key is likewise a
  plaintext literal in a file that ships to every client.
- `src/app/services/env/env.service.ts` (`EnvService`) is a **separate, unused mechanism** that reads
  `window.__env` (double underscore) and exposes `apiUrl`/`enableDebug` getters — this does not read the
  same global the rest of the app uses (`window['env']`, single underscore-free key set by `env.js`) and is
  not injected by any component or service found in this codebase (confirmed by grep for `EnvService`
  outside its own file/spec).

CORS: per `auth-security.md` §7, the backend's `SecurityConfig` allow-lists
`http://localhost:4200` (the Angular dev-server default) among its CORS origins, alongside
`https://code-setu-app-ui.onrender.com` and a Cloudflare Workers domain for a deployed frontend.

## 8. Known Issues

1. **Broken/unreachable auth-refresh flow** (§3.3, §3.5) — the interceptor's and `LoginService`'s
   `refresh` calls target `POST /api/auth/refresh`, a URL/method/contract that does not exist on the
   backend (the backend's only refresh route is `GET /api/v2/cargosetu/refreshtoken` with the JWT in the
   `Authorization` header, no body, no separate refresh-token concept — confirmed against
   `../../code-setu-app/docs/modules/auth-security.md` §2/§3/§7). This is compounded by the fact that
   `localStorage`'s `refreshToken` key is **never written** anywhere in the frontend, so
   `AuthInterceptor.handle403Error()` always short-circuits into `logout()` before ever reaching the broken
   HTTP call.
2. **`LoginService.updateTokens()` is a no-op** and `LoginService.loginUser()`'s expired-token branch calls
   `this.refreshToken()` without subscribing to the returned Observable, so no HTTP request is actually
   sent (§3.5). This whole code path is dead in practice, since `loginUser()` itself is never called by any
   component — the real login flow uses `loginAndFetchUser()` instead.
3. **`LoginService.refereseToken()`'s URL is missing the `/api/v2` path segment** (`${BASE_URL}/cargosetu/refreshtoken`
   instead of `${BASE_URL}/api/v2/cargosetu/refreshtoken`), unlike every other service in the app that
   consistently includes `/api/v2/cargosetu` in its base URL. This is the one refresh-shaped call that is
   actually invoked (from `company.component.ts` after company creation) and it will 404 against the real
   backend (§3.5).
4. **Stray/misplaced `auth.interceptor.spec.ts`** — `src/app/services/guard/auth.interceptor.spec.ts` lives
   in the `services/guard/` directory (which otherwise only contains `auth.guard.ts`/`auth.guard.spec.ts`)
   but tests `AuthInterceptor`, whose actual source file lives at
   `src/app/core/interceptors/auth.interceptor.ts`. The spec's relative import
   (`'../../core/interceptors/auth.interceptor'`) does resolve correctly, so the test itself is not broken,
   but the file's location strongly suggests it is a leftover from before `AuthInterceptor` was moved into
   `core/interceptors/`, and there is no `auth.interceptor.ts` anywhere under `services/guard/` to justify
   its current location.
5. **`DepartmentDialogService` — malformed base URL and apparently dead code**
   (`src/app/services/department-dialog.service.ts`): its `BASE_URL` is `ENV.CARGO_SETU` (no trailing
   `/api/v2/...` baked in), and its two methods concatenate the path **without a separating slash**
   (`` `${this.BASE_URL}api/v2/cargosetu/department` ``), producing a malformed URL like
   `http://localhost:31201api/v2/cargosetu/department` (the port number runs directly into `api`, and the
   scheme/host separator is missing entirely) — this would fail as an invalid URL if ever called. No
   component was found injecting this service (only `department.service.ts`'s `DepartmentService`, which
   builds its URLs correctly, is actually used by `department.component.ts`) — this service and its
   `.spec.ts` appear to be dead code.
6. **`EnvService` (`src/app/services/env/env.service.ts`) reads a different global than the app's real
   runtime config** — it reads `window.__env`, while `src/assets/env.js`/`env.ts` set/read `window['env']`
   (no double underscore). `EnvService` is not injected anywhere else in the codebase (§7) — likely dead
   scaffolding from an earlier or alternative environment-config approach that was superseded by
   `src/assets/env.ts`.
7. **`component/vehicle-management/vehicle-management.models.ts` is a completely empty file** (0 bytes) —
   despite the `.models.ts` naming convention suggesting it should hold `Vehicle`/`Driver`/`Assignment`
   type definitions for this feature area, the actual payload interfaces (`VehiclePayload`, `DriverPayload`)
   live inline inside `vehicle.service.ts`/`driver.service.ts` instead.
8. **Two same-named-but-different `JwtPayload` types** — one is defined locally in
   `services/jwttoken.service.ts` (`{ sub, exp, iat, role? }`), and a different `JwtPayload` type is
   imported from the `jwt-decode` npm package in `login.service.ts`. This is not a compile error (they're
   used in different files) but is a latent source of confusion given the identical name.
9. **`JwttokenService` is largely parallel/redundant with `LoginService`'s own token handling** — it has
   its own `loginUser()`, `logout()`, and `loggedInSubject`, none of which are wired to the same
   `localStorage`/state that `LoginService`/`AuthGuard`/`AuthInterceptor` actually use for guarding routes;
   only its `getDecodedToken()` method is actually used elsewhere (`nav-bar.component.ts`,
   `access-menu.service.ts` reimplements the same decode logic manually instead of reusing it).
10. **Unguarded role-management routes** — `createrole`, `updaterole`, and `roles` have no `AuthGuard` on
    their routes in `app-routing.module.ts`, unlike the otherwise-similar `permission-list`, `staffuser`,
    and `department` routes (§2). Not confirmed whether this is intentional.
11. **Duplicate/near-duplicate route entries** — `createPlan` and `createPLan` both redirect to
    `createplan` (differing only in casing); `vehicle` redirects to `vehicle-management`; `home` and the
    empty path `''` both render `HomeComponent`. Harmless but redundant.
12. **Version skew between `@angular/core` (`^14.2.0`) and `@angular/material`/`@angular/cdk` (`^13.0.0`)**
    in `package.json` — an unusual pairing; not verified whether this causes any concrete runtime problems,
    but it means the app is not on Angular Material's officially-matched major version for Angular 14.
13. **Redundant STOMP dependencies** — both `@stomp/stompjs` (actually used, in
    `vehicle-location.service.ts`) and the older, separate `stompjs` package are listed in `package.json`
    dependencies; no import of the latter was found.

## 9. Dependencies on Backend Modules

The backend's `docs/modules/` directory was listed (not each file fully read, except `auth-security.md`
which was read in full) to confirm the following filenames actually exist:
`auth-security.md`, `common-cross-cutting.md`, `customer-shifting.md`, `document-management.md`,
`fleet-trip.md`, `inquiry-lead-capture.md`, `notification-engine.md`, `shifting-inventory.md`,
`staff-rbac.md`, `system-config-plans.md`, `template-quotation.md`, `tenant-company.md`.

| Frontend feature area | Frontend files | Backend module doc |
|---|---|---|
| Authentication & session (`LoginService`, `AuthGuard`, `AuthInterceptor`, `JwttokenService`, OTP login) | `services/login.service.ts`, `services/guard/auth.guard.ts`, `core/interceptors/auth.interceptor.ts`, `services/jwttoken.service.ts`, `component/login/**` | `../../code-setu-app/docs/modules/auth-security.md` |
| Staff / Role / Permission / Department (`staffuser`, `role`, `updaterole`, `roles-details`, `permission`, `department`) | `component/staffuser/**`, `component/component/role/**`, `component/updaterole/**`, `roles-details/**`, `component/permission/**`, `component/component/department/**`, `services/staffuser-service.ts`, `services/role/roleservice.service.ts`, `services/department.service.ts` | `../../code-setu-app/docs/modules/staff-rbac.md` |
| Company management | `component/company/**`, `services/company.service.ts` | `../../code-setu-app/docs/modules/tenant-company.md` (filename confirmed to exist; contents not read in this pass — mapping based on the name and `api-urls.md`'s Company/Branch grouping) |
| Customer & Shifting Orders (`customer`, Shifting Workspace) | `component/customer/**`, `component/shifting-workspace/**`, `services/customers.service.ts`, `services/shifting-workspace.service.ts` | `../../code-setu-app/docs/modules/customer-shifting.md` |
| Shifting Inventory (Shifting Workspace inventory/packing/loading tabs) | `component/shifting-workspace/inventory/**`, `component/shifting-workspace/packing/**`, `component/shifting-workspace/loading/**`, `services/shift-inventory.service.ts` | `../../code-setu-app/docs/modules/shifting-inventory.md` (filename confirmed to exist; contents not read in this pass) |
| Vehicle Management (vehicles, drivers, assignments, live location) and Trip Management (trip, trip-expense, trip-status-history, trip-document) | `component/vehicle-management/**`, `component/vehicle/**`, `component/driver/**`, `component/assignment/**`, `component/driver-location/**`, `component/trip/**`, `component/shifting-workspace/trip/**`, `services/vehicle.service.ts`, `services/driver.service.ts`, `services/assignment.service.ts`, `services/vehicle-location.service.ts`, `services/trip.service.ts` | `../../code-setu-app/docs/modules/fleet-trip.md` (filename confirmed to exist; contents not read in this pass — mapping based on the name and `api-urls.md`'s Driver/Vehicle/Assignment/Trip grouping) |
| System Configuration and Subscription Plans | `component/syetemconfiguration/**`, `component/planscreen/**`, `component/createplan/**`, `services/system-configuration.service.ts`, `services/planservice.service.ts` | `../../code-setu-app/docs/modules/system-config-plans.md` (filename confirmed to exist; contents not read in this pass — mapping based on the name grouping "system-config" + "plans") |
| Quotation / Templates (PDF generation), Shifting-Workspace documents/charges tabs | `component/quotaion/**`, `component/shifting-workspace/documents/**`, `component/shifting-workspace/charges/**`, `services/template.service.ts` | `../../code-setu-app/docs/modules/template-quotation.md` (filename confirmed to exist; contents not read in this pass) |
| Public Inquiry form | `component/contect-us/**`, `services/inquiry.service.ts` | `../../code-setu-app/docs/modules/inquiry-lead-capture.md` (filename confirmed to exist; contents not read in this pass) |
| (Not directly used by any frontend feature read in this pass) | — | `../../code-setu-app/docs/modules/common-cross-cutting.md`, `document-management.md`, `notification-engine.md` — these backend modules exist but no frontend service/component in this codebase was found calling their endpoints directly (document upload in `staffuser-service.ts`/`trip.service.ts` may relate to `document-management.md`, but this was not cross-checked against that file's contents) |

**Caveat:** only `auth-security.md` and `api-urls.md` were opened and read in full for this document. The
other backend module doc files listed above were confirmed to **exist** (via a directory listing of
`D:\cargo project\code-setu-app\docs\modules\`) and are mapped to frontend feature areas by name and by
cross-referencing `api-urls.md`'s endpoint groupings, but their contents were not individually read/verified
against the frontend service code in this pass.
