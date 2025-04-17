import { useState } from 'react'
import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDataFromServer = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // When running in the browser, we need to use localhost, not the Docker service name
      const apiUrl = 'http://localhost:3000'
      const response = await fetch(`${apiUrl}/api/test`)
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      setServerMessage(data.message)
      setServerStatus(data.status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setServerMessage(null)
      setServerStatus(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Ancestry Project</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h2>Server Communication Test</h2>
          <button 
            onClick={fetchDataFromServer}
            disabled={loading}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#646cff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Loading...' : 'Test Server Connection'}
          </button>
          
          {serverMessage && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
              <p><strong>Message:</strong> {serverMessage}</p>
              <p><strong>Status:</strong> {serverStatus}</p>
            </div>
          )}
          
          {error && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
              <p><strong>Error:</strong> {error}</p>
              <p>Make sure the server is running and accessible at http://localhost:3000</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default App
