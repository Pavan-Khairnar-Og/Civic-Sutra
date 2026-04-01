import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '16px',
          background: '#fff7ed',
          border: '1px solid #fdba74',
          borderRadius: '12px',
          margin: '16px',
          fontSize: '13px',
          color: '#92400e'
        }}>
          <strong>Component error:</strong> {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}
