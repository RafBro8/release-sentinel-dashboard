import { useEffect, useState } from 'react'
import './App.css'
import { getApiStatus, type ApiStatusResponse } from './api/releaseSentinelApi'
import { API_BASE_URL, GITHUB_API_REPO_URL, SWAGGER_URL } from './config'

type SignalStatus = 'ready' | 'risk' | 'blocked'
type ApiConnectionState = 'loading' | 'online' | 'offline'

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

const signals: Signal[] = [
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

const workflow: WorkflowStep[] = [
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
  const [apiStatus, setApiStatus] = useState<ApiStatusResponse | null>(null)
  const [connectionState, setConnectionState] = useState<ApiConnectionState>('loading')

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

        <nav className="nav-list" aria-label="Dashboard sections">
          <a href="#readiness">Readiness</a>
          <a href="#workflow">Workflow</a>
          <a href="#testing">Test strategy</a>
          <a href="#api">API status</a>
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
            <p className="eyebrow">Portfolio demo</p>
            <h2>Release readiness command center</h2>
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

        <section className="hero-panel" id="readiness">
          <div>
            <p className="eyebrow">Current release</p>
            <h3>Checkout API release is blocked by a critical defect.</h3>
            <p className="hero-copy">
              This dashboard summarizes the same release quality signals exposed by the
              Spring Boot API: test execution health, defect severity, and quality gate
              recommendation.
            </p>
          </div>
          <div className="readiness-card" aria-label="Release readiness score">
            <span className="score-label">Readiness</span>
            <strong>BLOCKED</strong>
            <span className="score-detail">Critical release risk detected</span>
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

        <section className="content-grid">
          <article className="panel" id="workflow">
            <div className="section-heading">
              <p className="eyebrow">Workflow</p>
              <h3>API-backed release review</h3>
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

          <article className="panel" id="testing">
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

        <section className="api-panel" id="api">
          <div>
            <p className="eyebrow">Connected service</p>
            <h3>Release Sentinel API</h3>
            <p>
              The dashboard now reads the deployed Spring Boot status endpoint from the browser.
              Release quality cards remain representative demo data until the next workflow API
              integration stage.
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
      </section>
    </main>
  )
}

export default App
