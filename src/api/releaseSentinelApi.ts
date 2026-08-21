import { API_BASE_URL } from '../config'

export type ApiStatusResponse = {
  service: string
  status: string
}

export type QualitySummary = {
  releaseId: string
  projectId: string
  releaseVersion: string
  status: 'READY' | 'AT_RISK' | 'BLOCKED'
  totalTests: number
  passed: number
  failed: number
  skipped: number
  blocked: number
  passRate: number
  openDefects: number
  openCriticalDefects: number
  openHighDefects: number
  blockingDefects: number
  recommendation: string
  riskReasons: string[]
}

export type DemoWorkflowResult = {
  projectId: string
  releaseId: string
  testRunId: string
  defectId: string
  summary: QualitySummary
}

type ProjectResponse = {
  id: string
}

type EnvironmentResponse = {
  id: string
}

type ReleaseResponse = {
  id: string
}

type TestCaseResponse = {
  id: string
}

type TestRunResponse = {
  id: string
}

type TestExecutionResponse = {
  id: string
}

type DefectResponse = {
  id: string
}

export async function getApiStatus(): Promise<ApiStatusResponse> {
  return request<ApiStatusResponse>('/api/status')
}

export async function runBlockedReleaseDemo(): Promise<DemoWorkflowResult> {
  const suffix = Date.now().toString().slice(-8)

  const project = await request<ProjectResponse>('/api/projects', {
    method: 'POST',
    body: {
      key: `RS${suffix}`,
      name: `Release Sentinel Demo ${suffix}`,
      description: 'Dashboard-generated release readiness scenario',
    },
  })

  const environment = await request<EnvironmentResponse>(`/api/projects/${project.id}/environments`, {
    method: 'POST',
    body: {
      name: `staging-${suffix}`,
      type: 'STAGING',
      baseUrl: 'https://staging.example.com',
    },
  })

  const release = await request<ReleaseResponse>(`/api/projects/${project.id}/releases`, {
    method: 'POST',
    body: {
      version: `2026.08.${suffix}`,
      status: 'IN_TEST',
    },
  })

  const testCase = await request<TestCaseResponse>(`/api/projects/${project.id}/test-cases`, {
    method: 'POST',
    body: {
      title: `Checkout API confirms order ${suffix}`,
      description: 'Critical checkout API regression scenario',
      priority: 'CRITICAL',
      type: 'API',
    },
  })

  const testRun = await request<TestRunResponse>(`/api/releases/${release.id}/test-runs`, {
    method: 'POST',
    body: {
      environmentId: environment.id,
      name: `Dashboard regression run ${suffix}`,
    },
  })

  const execution = await request<TestExecutionResponse>(`/api/test-runs/${testRun.id}/executions`, {
    method: 'POST',
    body: {
      testCaseId: testCase.id,
      result: 'FAILED',
      notes: 'Checkout confirmation returned 500 during dashboard demo',
    },
  })

  const defect = await request<DefectResponse>(`/api/releases/${release.id}/defects`, {
    method: 'POST',
    body: {
      title: `Checkout confirmation fails ${suffix}`,
      description: 'Critical defect linked to failed API execution',
      severity: 'CRITICAL',
      priority: 'URGENT',
      linkedTestExecutionId: execution.id,
    },
  })

  const summary = await request<QualitySummary>(`/api/releases/${release.id}/quality-summary`)

  return {
    projectId: project.id,
    releaseId: release.id,
    testRunId: testRun.id,
    defectId: defect.id,
    summary,
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const message = await getErrorMessage(response)
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message ?? `Request failed with ${response.status}`
  } catch {
    return `Request failed with ${response.status}`
  }
}
