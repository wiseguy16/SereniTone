import React, { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Unknown render error",
    };
  }

  componentDidCatch(error) {
    console.error("SereniTone render failure", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-shell">
          <section className="panel">
            <p className="eyebrow">Render error</p>
            <h1>SereniTone hit a browser-side error.</h1>
            <p className="hero-copy">{this.state.message}</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
