import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('CarbonLens render error', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-50 px-6 py-10 text-gray-800">
          <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">App Error</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">CarbonLens could not finish rendering.</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              The app hit a frontend runtime error. The details below are shown so we can fix it quickly instead of leaving a blank white page.
            </p>
            <pre className="mt-4 overflow-auto rounded-xl bg-gray-900 p-4 text-xs leading-relaxed text-red-100">
              {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const rootElement = document.getElementById('root')
const root = ReactDOM.createRoot(rootElement)
let fatalErrorShown = false

function renderLoadingScreen() {
  root.render(
    <div className="min-h-screen bg-gray-50 px-6 py-10 text-gray-800">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Loading</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">CarbonLens is starting.</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          If this screen stays here for more than a few seconds, the frontend is hanging during startup and we should inspect the module that is blocking render.
        </p>
      </div>
    </div>,
  )
}

function renderBootError(error) {
  if (fatalErrorShown) return
  fatalErrorShown = true
  console.error('CarbonLens boot error', error)
  root.render(
    <div className="min-h-screen bg-gray-50 px-6 py-10 text-gray-800">
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Load Error</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">CarbonLens failed to load.</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          The frontend could not finish booting. This message replaces the blank screen so the underlying error is visible.
        </p>
        <pre className="mt-4 overflow-auto rounded-xl bg-gray-900 p-4 text-xs leading-relaxed text-red-100">
          {String(error?.stack || error?.message || error)}
        </pre>
      </div>
    </div>,
  )
}

window.addEventListener('error', (event) => {
  renderBootError(event.error || event.message || 'Unknown window error')
})

window.addEventListener('unhandledrejection', (event) => {
  renderBootError(event.reason || 'Unhandled promise rejection')
})

async function boot() {
  try {
    const { default: App } = await import('./App')
    root.render(
      <React.StrictMode>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </React.StrictMode>,
    )
  } catch (error) {
    renderBootError(error)
  }
}

renderLoadingScreen()
boot()
