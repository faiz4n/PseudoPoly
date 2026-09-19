import React from "react";
import { formatLogsAsText, copyToClipboard } from "../utils/logger.js";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, copied: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Uncaught UI render error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleCopyError = async () => {
    const errorDetails = [
      `=== PSEUDOPOLY ERROR REPORT ===`,
      `Time: ${new Date().toISOString()}`,
      `Error: ${this.state.error?.message || this.state.error}`,
      `Component Stack: ${this.state.errorInfo?.componentStack || 'None'}`,
      `\n`,
      formatLogsAsText('ALL')
    ].join('\n');

    const success = await copyToClipboard(errorDetails);
    if (success) {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    }
  };

  handleReload = () => {
    try {
      window.location.reload();
    } catch {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  handleResume = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const errorMsg =
        this.state.error?.message ||
        (typeof this.state.error === "string"
          ? this.state.error
          : "An unexpected visual error occurred.");

      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "linear-gradient(135deg, #0a1628 0%, #0d1b2a 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: "Nunito, sans-serif",
            padding: "20px",
            zIndex: 999999,
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              padding: "24px 30px",
              maxWidth: "420px",
              width: "90%",
              backdropFilter: "blur(16px)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div style={{ fontSize: "38px", marginBottom: "8px" }}>🎲⚠️</div>
            <h2
              style={{
                fontSize: "18px",
                margin: "0 0 8px 0",
                color: "#f5a623",
                fontWeight: "bold",
              }}
            >
              Game Render Paused
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "#cbd5e1",
                margin: "0 0 16px 0",
                lineHeight: "1.4",
              }}
            >
              The display encountered an unexpected glitch. Your game session is
              still active.
            </p>
            <div
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                background: "rgba(0, 0, 0, 0.3)",
                padding: "8px",
                borderRadius: "6px",
                marginBottom: "16px",
                wordBreak: "break-all",
                maxHeight: "60px",
                overflowY: "auto",
                textAlign: "left",
                fontFamily: "monospace",
              }}
            >
              {errorMsg}
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={this.handleCopyError}
                style={{
                  padding: "8px 14px",
                  background: this.state.copied
                    ? "#2e7d32"
                    : "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {this.state.copied ? "✓ Copied!" : "📋 Copy Error"}
              </button>
              <button
                onClick={this.handleResume}
                style={{
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Resume Game
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: "8px 14px",
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Reload
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
