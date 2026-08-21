import { useEffect, useState } from 'react'
import './App.css'
import {
  getApiStatus,
  runBlockedReleaseDemo,
  type ApiStatusResponse,
  type DemoWorkflowResult,
} from './api/releaseSentinelApi'
import { API_BASE_URL, GITHUB_API_REPO_URL, SWAGGER_URL } from './config'

type SignalStatus = 'ready' | 'risk' | 'blocked'
type ApiConnectionState = 'loading' | 'online' | 'offline'
type DemoState = 'idle' | 'running' | 'complete' | 'error'
type ViewKey = 'readiness' | 'demo' | 'workflow' | 'api'

type Signal = {
  label: string
  value: string
  status: SignalStatus
  detail: string
}

type WorkflowStep = {
  label: string
  value: string
}

type View = {
  key: ViewKey
  label: string
  kicker: string
  title: string
}

const views: View[] = [
  {
    key: 'readiness',
    label: 'Readiness',
    kicker: 'Portfolio demo',
    title: 'Release readiness command center',
  },
  {
    key: 'demo',
    label: 'Run demo',
    kicker: 'Live workflow',
    title: 'Generate release quality data',
  },
  {
    key: 'workflow',
    label: 'Workflow',
    kicker: 'Release review',
    title: 'API-backed release timeline',
  },
  {
    key: 'api',
    label: 'API status',
    kicker: 'Connected service',
    title: 'Release Sentinel API health',
  },
]

const defaultSignals: Signal[] = [
  {
    label: 'Quality gate',
    value: 'BLOCKED',
    status: 'blocked',
    detail: 'One open critical defect is linked to the release.',
  },
  {
    label: 'Automated tests',
    value: '92% pass',
    status: 'risk',
    detail: '23 of 25 test cases passed in the latest regression run.',
  },
  {
    label: 'Defects',
    value: '1 critical',
    status: 'blocked',
    detail: 'Checkout authorization failure blocks release approval.',
  },
  {
    label: 'Coverage',
    value: '4 envs',
    status: 'ready',
    detail: 'QA, staging, production-like, and smoke environments tracked.',
  },
]

const defaultWorkflow: WorkflowStep[] = [
  { label: 'Project', value: 'Payments Platform' },
  { label: 'Release', value: '2026.08.19-rc.1' },
  { label: 'Test run', value: 'Regression API Suite' },
  { label: 'Recommendation', value: 'Do not ship' },
]

const testLayers = [
  'JUnit service tests',
  'Spring MVC controller tests',
  'Rest Assured API regression',
  'PostgreSQL Testcontainers',
  'Postman/Newman workflow',
  'GitHub Actions CI',
]

const demoSteps = [
  'Create project',
  'Create environment',
  'Create release',
  'Create test case',
  'Create test run',
  'Record failed execution',
  'Create critical defect',
  'Fetch quality summary',
]

const statusClass = {
  ready: 'status-ready',
  risk: 'status-risk',
  blocked: 'status-blocked',
} satisfies Record<SignalStatus, string>

const connectionLabel = {
  loading: 'Checking',
  online: 'Online',
  offline: 'Offline',
} satisfies Record<ApiConnectionState, string>

function App() {
  const [activeView, setActiveView] = useState<ViewKey>('readiness')
  const [apiStatus, setApiStatus] = useState<ApiStatusResponse | null>(null)
  const [connectionState, setConnectionState] = useState<ApiConnectionState>('loading')
  const [demoState, setDemoState] = useState<DemoState>('idle')
  const [demoResult, setDemoResult] = useState<DemoWorkflowResult | null>(null)
  const [demoError, setDemoError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    getApiStatus()
      .then((status) => {
        if (!isActive) {
          return
        }

        setApiStatus(status)
        setConnectionState('online')
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        setConnectionState('offline')
      })

    return () => {
      isActive = false
    }
  }, [])

  const qualitySummary = demoResult?.summary
  const signals = qualitySummary ? getSignalsFromSummary(qualitySummary) : defaultSignals
  const workflow = qualitySummary
    ? [
        { label: 'Project', value: shortId(demoResult.projectId) },
        { label: 'Release', value: qualitySummary.releaseVersion },
        { label: 'Test run', value: shortId(demoResult.testRunId) },
        { label: 'Recommendation', value: qualitySummary.recommendation },
      ]
    : defaultWorkflow
  const currentView = views.find((view) => view.key === activeView) ?? views[0]

  async function handleRunDemo() {
    setDemoState('running')
    setDemoResult(null)
    setDemoError(null)

    try {
      const result = await runBlockedReleaseDemo()
      setDemoResult(result)
      setDemoState('complete')
    } catch (error) {
      setDemoError(error instanceof Error ? error.message : 'Demo workflow failed')
      setDemoState('error')
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Release Sentinel navigation">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            RS
          </div>
          <div>
            <p className="eyebrow">Release Sentinel</p>
            <h1>Quality dashboard</h1>
          </div>
        </div>

        <nav className="nav-list" aria-label="Dashboard views">
          {views.map((view) => (
            <button
              aria-current={activeView === view.key ? 'page' : undefined}
              className="nav-button"
              key={view.key}
              onClick={() => setActiveView(view.key)}
              type="button"
            >
              {view.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-panel">
          <span className="panel-label">Live backend</span>
          <a href={API_BASE_URL} target="_blank" rel="noreferrer">
            Render API
          </a>
        </div>
      </aside>

      <section className="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">{currentView.kicker}</p>
            <h2>{currentView.title}</h2>
          </div>
          <div className="topbar-actions">
            <a className="button button-secondary" href={GITHUB_API_REPO_URL} target="_blank" rel="noreferrer">
              API repo
            </a>
            <a className="button button-primary" href={SWAGGER_URL} target="_blank" rel="noreferrer">
              Swagger
            </a>
          </div>
        </header>

        <section className="view-frame" aria-live="polite">
          {activeView === 'readiness' ? (
            <ReadinessView qualitySummary={qualitySummary} signals={signals} />
          ) : null}

          {activeView === 'demo' ? (
            <DemoView
              demoError={demoError}
              demoResult={demoResult}
              demoState={demoState}
              onRunDemo={handleRunDemo}
            />
          ) : null}

          {activeView === 'workflow' ? (
            <WorkflowView qualitySummary={qualitySummary} workflow={workflow} />
          ) : null}

          {activeView === 'api' ? (
            <ApiView
              apiStatus={apiStatus}
              connectionState={connectionState}
            />
          ) : null}
        </section>
      </section>
    </main>
  )
}

function ReadinessView({
  qualitySummary,
  signals,
}: {
  qualitySummary: DemoWorkflowResult['summary'] | undefined
  signals: Signal[]
}) {
  return (
    <div className="view-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Current release</p>
          <h3>{qualitySummary ? getHeroTitle(qualitySummary.status) : 'Checkout API release is blocked by a critical defect.'}</h3>
          <p className="hero-copy">
            {qualitySummary
              ? qualitySummary.recommendation
              : 'This view summarizes the same release quality signals exposed by the Spring Boot API: test execution health, defect severity, and quality gate recommendation.'}
          </p>
        </div>
        <div className={`readiness-card readiness-${qualitySummary?.status.toLowerCase() ?? 'blocked'}`} aria-label="Release readiness score">
          <span className="score-label">Readiness</span>
          <strong>{qualitySummary?.status ?? 'BLOCKED'}</strong>
          <span className="score-detail">
            {qualitySummary ? `${qualitySummary.failed} failed test, ${qualitySummary.openCriticalDefects} critical defect` : 'Critical release risk detected'}
          </span>
        </div>
      </section>

      <section className="signal-grid" aria-label="Quality signals">
        {signals.map((signal) => (
          <article className="signal-card" key={signal.label}>
            <div className="signal-header">
              <span>{signal.label}</span>
              <span className={`status-dot ${statusClass[signal.status]}`} aria-hidden="true" />
            </div>
            <strong>{signal.value}</strong>
            <p>{signal.detail}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

function DemoView({
  demoError,
  demoResult,
  demoState,
  onRunDemo,
}: {
  demoError: string | null
  demoResult: DemoWorkflowResult | null
  demoState: DemoState
  onRunDemo: () => void
}) {
  return (
    <section className="demo-panel">
      <div>
        <p className="eyebrow">Live workflow</p>
        <h3>Generate a blocked release scenario</h3>
        <p>
          This action calls the deployed API, writes a project, environment, release,
          test case, failed execution, critical defect, and then reads the real quality
          summary from PostgreSQL.
        </p>
      </div>
      <button className="button button-primary demo-button" type="button" onClick={onRunDemo} disabled={demoState === 'running'}>
        {demoState === 'running' ? 'Running workflow...' : 'Run demo scenario'}
      </button>
      <ol className="demo-steps" aria-label="Demo workflow steps">
        {demoSteps.map((step, index) => (
          <li key={step} className={getDemoStepClass(demoState, index)}>
            <span>{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      {demoState === 'complete' && demoResult ? (
        <div className="demo-result" role="status">
          <strong>Quality summary returned {demoResult.summary.status}</strong>
          <span>Release {demoResult.summary.releaseVersion} now has {demoResult.summary.riskReasons.length} risk reason(s).</span>
        </div>
      ) : null}
      {demoState === 'error' && demoError ? (
        <div className="demo-error" role="alert">
          {demoError}
        </div>
      ) : null}
    </section>
  )
}

function WorkflowView({
  qualitySummary,
  workflow,
}: {
  qualitySummary: DemoWorkflowResult['summary'] | undefined
  workflow: WorkflowStep[]
}) {
  return (
    <section className="content-grid">
      <article className="panel">
        <div className="section-heading">
          <p className="eyebrow">Workflow</p>
          <h3>{qualitySummary ? 'Latest API-created release' : 'API-backed release review'}</h3>
        </div>
        <div className="timeline">
          {workflow.map((step, index) => (
            <div className="timeline-row" key={step.label}>
              <span className="timeline-index">{index + 1}</span>
              <div>
                <span>{step.label}</span>
                <strong>{step.value}</strong>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="section-heading">
          <p className="eyebrow">SDET focus</p>
          <h3>Validation layers</h3>
        </div>
        <ul className="test-list">
          {testLayers.map((layer) => (
            <li key={layer}>
              <span aria-hidden="true" />
              {layer}
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}

function ApiView({
  apiStatus,
  connectionState,
}: {
  apiStatus: ApiStatusResponse | null
  connectionState: ApiConnectionState
}) {
  return (
    <section className="api-panel">
      <div>
        <p className="eyebrow">Connected service</p>
        <h3>Release Sentinel API</h3>
        <p>
          The dashboard reads the deployed Spring Boot status endpoint and can run a
          full release-readiness workflow through the live API.
        </p>
      </div>
      <div className={`live-status live-status-${connectionState}`} aria-live="polite">
        <span className="live-label">API status</span>
        <strong>{apiStatus?.status ?? connectionLabel[connectionState]}</strong>
        <span>{apiStatus?.service ?? API_BASE_URL}</span>
      </div>
      <div className="api-links">
        <a href={`${API_BASE_URL}/api/status`} target="_blank" rel="noreferrer">
          Status endpoint
        </a>
        <a href={`${API_BASE_URL}/actuator/health`} target="_blank" rel="noreferrer">
          Health endpoint
        </a>
        <a href={SWAGGER_URL} target="_blank" rel="noreferrer">
          Swagger docs
        </a>
      </div>
    </section>
  )
}

function getSignalsFromSummary(summary: DemoWorkflowResult['summary']): Signal[] {
  return [
    {
      label: 'Quality gate',
      value: summary.status,
      status: getSignalStatus(summary.status),
      detail: summary.recommendation,
    },
    {
      label: 'Automated tests',
      value: `${summary.passRate.toFixed(0)}% pass`,
      status: summary.failed > 0 ? 'risk' : 'ready',
      detail: `${summary.passed} passed, ${summary.failed} failed, ${summary.totalTests} total.`,
    },
    {
      label: 'Defects',
      value: `${summary.openCriticalDefects} critical`,
      status: summary.openCriticalDefects > 0 ? 'blocked' : 'ready',
      detail: `${summary.openDefects} open defect(s), ${summary.blockingDefects} blocking release.`,
    },
    {
      label: 'Risk reasons',
      value: summary.riskReasons.length.toString(),
      status: summary.riskReasons.length > 0 ? 'blocked' : 'ready',
      detail: summary.riskReasons[0] ?? 'No release risks detected.',
    },
  ]
}

function getSignalStatus(status: DemoWorkflowResult['summary']['status']): SignalStatus {
  if (status === 'READY') {
    return 'ready'
  }

  if (status === 'AT_RISK') {
    return 'risk'
  }

  return 'blocked'
}

function getHeroTitle(status: DemoWorkflowResult['summary']['status']) {
  if (status === 'READY') {
    return 'The generated release is ready to ship.'
  }

  if (status === 'AT_RISK') {
    return 'The generated release needs review before shipping.'
  }

  return 'The generated release is blocked by live API quality signals.'
}

function getDemoStepClass(state: DemoState, index: number) {
  if (state === 'complete') {
    return 'demo-step-complete'
  }

  if (state === 'running') {
    return index < demoSteps.length - 1 ? 'demo-step-active' : 'demo-step-pending'
  }

  if (state === 'error') {
    return 'demo-step-error'
  }

  return 'demo-step-pending'
}

function shortId(id: string) {
  return id.slice(0, 8)
}

export default App
