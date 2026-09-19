import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Uncaught UI render error:", error, errorInfo);
    this.setState({ errorInfo });
  }

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
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={this.handleResume}
                style={{
                  padding: "8px 18px",
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
                  padding: "8px 18px",
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
