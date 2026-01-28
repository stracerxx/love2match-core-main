import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking';
  database: boolean;
  auth: boolean;
  timestamp: string;
  version: string;
  latency?: number;
  error?: string;
}

/**
 * Health Check Page
 * 
 * This page provides a simple health check endpoint for monitoring services.
 * Access at /health to verify the application and database connectivity.
 * 
 * Returns JSON-like status that can be parsed by monitoring tools.
 */
const Health = () => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'checking',
    database: false,
    auth: false,
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  });

  useEffect(() => {
    const checkHealth = async () => {
      const startTime = Date.now();
      let dbOk = false;
      let authOk = false;
      let errorMsg: string | undefined;

      try {
        // Check database connectivity using a simple RPC or raw query
        // Using from() with type assertion to bypass strict typing
        const { data, error } = await (supabase as any)
          .from('users')
          .select('id')
          .limit(1);

        if (!error) {
          dbOk = true;
        } else if (error) {
          errorMsg = `Database: ${error.message}`;
        }
      } catch (e) {
        errorMsg = `Database connection failed: ${e}`;
      }

      try {
        // Check auth service
        const { data: { session }, error } = await supabase.auth.getSession();
        // Auth is "ok" if the service responds, even without a session
        if (!error) {
          authOk = true;
        } else {
          errorMsg = errorMsg ? `${errorMsg}; Auth: ${error.message}` : `Auth: ${error.message}`;
        }
      } catch (e) {
        errorMsg = errorMsg ? `${errorMsg}; Auth failed: ${e}` : `Auth failed: ${e}`;
      }

      const latency = Date.now() - startTime;
      const isHealthy = dbOk && authOk;

      setHealth({
        status: isHealthy ? 'healthy' : 'unhealthy',
        database: dbOk,
        auth: authOk,
        timestamp: new Date().toISOString(),
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        latency,
        error: errorMsg,
      });
    };

    checkHealth();
    
    // Re-check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Return minimal HTML that's easy to parse
  return (
    <div 
      style={{ 
        fontFamily: 'monospace', 
        padding: '20px',
        backgroundColor: health.status === 'healthy' ? '#d4edda' : health.status === 'checking' ? '#fff3cd' : '#f8d7da',
        minHeight: '100vh'
      }}
    >
      <h1>Love2Match Health Check</h1>
      <pre id="health-status">
        {JSON.stringify(health, null, 2)}
      </pre>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Status Indicators</h2>
        <ul>
          <li>
            <strong>Overall:</strong>{' '}
            <span style={{ color: health.status === 'healthy' ? 'green' : health.status === 'checking' ? 'orange' : 'red' }}>
              {health.status.toUpperCase()}
            </span>
          </li>
          <li>
            <strong>Database:</strong>{' '}
            <span style={{ color: health.database ? 'green' : 'red' }}>
              {health.database ? '✓ Connected' : '✗ Disconnected'}
            </span>
          </li>
          <li>
            <strong>Auth Service:</strong>{' '}
            <span style={{ color: health.auth ? 'green' : 'red' }}>
              {health.auth ? '✓ Available' : '✗ Unavailable'}
            </span>
          </li>
          <li>
            <strong>Latency:</strong> {health.latency ? `${health.latency}ms` : 'Measuring...'}
          </li>
          <li>
            <strong>Version:</strong> {health.version}
          </li>
        </ul>
      </div>

      {health.error && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
          <strong>Error Details:</strong>
          <pre>{health.error}</pre>
        </div>
      )}
    </div>
  );
};

export default Health;
