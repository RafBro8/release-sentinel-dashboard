import { expect, type Page, test } from '@playwright/test'

const apiBaseUrl = 'https://release-sentinel-api.onrender.com'

test.beforeEach(async ({ page }) => {
  await mockReleaseSentinelApi(page)
})

test('loads the readiness dashboard with mocked API status', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Release readiness command center' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Checkout API release is blocked by a critical defect.' })).toBeVisible()
  await expect(page.getByText('BLOCKED').first()).toBeVisible()
})

test('switches sidebar views without navigating away or relying on anchor scroll', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Run demo' }).click()
  await expect(page.getByRole('heading', { name: 'Generate release quality data' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Run demo scenario' })).toBeVisible()
  await expect(page).toHaveURL('http://127.0.0.1:5173/')
  await expect(page.locator('body')).toHaveJSProperty('scrollTop', 0)

  await page.getByRole('button', { name: 'Workflow' }).click()
  await expect(page.getByRole('heading', { name: 'API-backed release timeline' })).toBeVisible()
  await expect(page.getByText('Rest Assured API regression')).toBeVisible()

  await page.getByRole('button', { name: 'API status' }).click()
  await expect(page.getByRole('heading', { name: 'Release Sentinel API health' })).toBeVisible()
  await expect(page.getByText('UP')).toBeVisible()
  await expect(page.getByRole('button', { name: 'API status' })).toHaveAttribute('aria-current', 'page')
})

test('runs the guided demo workflow and renders the returned quality summary', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Run demo' }).click()
  await page.getByRole('button', { name: 'Run demo scenario' }).click()

  await expect(page.getByRole('status')).toContainText('Quality summary returned BLOCKED')
  await expect(page.getByText('Release 2026.08.19-e2e now has 2 risk reason(s).')).toBeVisible()

  await page.getByRole('button', { name: 'Readiness' }).click()
  await expect(page.getByRole('heading', { name: 'The generated release is blocked by live API quality signals.' })).toBeVisible()
  await expect(page.getByText('70% pass')).toBeVisible()
  await expect(page.getByText('1 critical', { exact: true })).toBeVisible()
})

test('exposes backend resource links in the API status view', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'API status' }).click()

  await expect(page.getByRole('link', { name: 'Status endpoint' })).toHaveAttribute('href', `${apiBaseUrl}/api/status`)
  await expect(page.getByRole('link', { name: 'Health endpoint' })).toHaveAttribute('href', `${apiBaseUrl}/actuator/health`)
  await expect(page.getByRole('link', { name: 'Swagger docs' })).toHaveAttribute('href', `${apiBaseUrl}/swagger-ui/index.html`)
})

async function mockReleaseSentinelApi(page: Page) {
  await page.route(`${apiBaseUrl}/api/status`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: {
        service: 'Release Sentinel API',
        status: 'UP',
      },
    })
  })

  await page.route(`${apiBaseUrl}/api/projects`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 201,
      json: { id: 'project-e2e-12345678' },
    })
  })

  await page.route(`${apiBaseUrl}/api/projects/project-e2e-12345678/environments`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 201,
      json: { id: 'environment-e2e-12345678' },
    })
  })

  await page.route(`${apiBaseUrl}/api/projects/project-e2e-12345678/releases`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 201,
      json: { id: 'release-e2e-12345678' },
    })
  })

  await page.route(`${apiBaseUrl}/api/projects/project-e2e-12345678/test-cases`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 201,
      json: { id: 'test-case-e2e-12345678' },
    })
  })

  await page.route(`${apiBaseUrl}/api/releases/release-e2e-12345678/test-runs`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 201,
      json: { id: 'test-run-e2e-12345678' },
    })
  })

  await page.route(`${apiBaseUrl}/api/test-runs/test-run-e2e-12345678/executions`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 201,
      json: { id: 'execution-e2e-12345678' },
    })
  })

  await page.route(`${apiBaseUrl}/api/releases/release-e2e-12345678/defects`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 201,
      json: { id: 'defect-e2e-12345678' },
    })
  })

  await page.route(`${apiBaseUrl}/api/releases/release-e2e-12345678/quality-summary`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: {
        releaseId: 'release-e2e-12345678',
        projectId: 'project-e2e-12345678',
        releaseVersion: '2026.08.19-e2e',
        status: 'BLOCKED',
        totalTests: 10,
        passed: 7,
        failed: 3,
        skipped: 0,
        blocked: 0,
        passRate: 70,
        openDefects: 2,
        openCriticalDefects: 1,
        openHighDefects: 1,
        blockingDefects: 1,
        recommendation: 'Do not ship until critical checkout defects are resolved.',
        riskReasons: [
          'Release has failed automated tests.',
          'Release has open critical defects.',
        ],
      },
    })
  })
}
