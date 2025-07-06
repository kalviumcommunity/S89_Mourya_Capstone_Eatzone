import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('❌ React Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>
            🚨 Something went wrong
          </h2>
          <p style={{ color: '#6c757d', marginBottom: '16px' }}>
            We're sorry, but there was an error loading this part of the application.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Reload Page
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#007bff' }}>
                🔍 Error Details (Development Only)
              </summary>
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                color: '#dc3545'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
