# Allegra

Move tracker app built with React + Vite.

## Local development

```bash
npm install
npm run dev
```

## End-to-end tests (Playwright)

### 1) Install Playwright browser binaries

```bash
npx playwright install
```

### 2) Optional env vars for authenticated flows

Authenticated tests are skipped unless these are provided:

```bash
export E2E_EMAIL="your-test-user@example.com"
export E2E_PASSWORD="your-test-password"
```

Optional signup test (off by default):

```bash
export E2E_ALLOW_SIGNUP="true"
```

### 3) Run tests

```bash
npm run test:e2e
```

Other modes:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
```

### What is covered

- Auth validations (`tests/e2e/auth.spec.js`)
- Sign in flow with existing test user (`tests/e2e/auth.spec.js`)
- Library search (`tests/e2e/app-flows.spec.js`)
- Log modal flow (add move + log session) (`tests/e2e/app-flows.spec.js`)
- Combo modal flow (create + delete combo) (`tests/e2e/app-flows.spec.js`)
