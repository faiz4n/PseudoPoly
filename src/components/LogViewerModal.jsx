import React, { useState, useEffect, useRef } from "react";
import { logger, formatLogsAsText, copyToClipboard } from "../utils/logger";

export default function LogViewerModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState(() => logger.getLogs());
  const [filter, setFilter] = useState("ALL"); // 'ALL' | 'ERROR' | 'WARN'
  const [copyFeedback, setCopyFeedback] = useState(null); // 'all' | 'errors' | null
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef(null);

  // Subscribe to live log updates
  useEffect(() => {
    if (!isOpen) return;

    // Refresh initially
    setLogs(logger.getLogs());

    const unsubscribe = logger.subscribe((_, updatedLogs) => {
      setLogs([...updatedLogs]);
    });

    return () => unsubscribe();
  }, [isOpen]);

  // Handle auto-scrolling to newest logs
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, filter, autoScroll]);

  if (!isOpen) return null;

  const totalErrors = logs.filter((l) => l.level === "ERROR").length;
  const totalWarns = logs.filter((l) => l.level === "WARN").length;

  const filteredLogs = logs.filter((l) => {
    if (filter === "ERROR") return l.level === "ERROR";
    if (filter === "WARN") return l.level === "WARN" || l.level === "ERROR";
    return true;
  });

  const handleCopy = async (type = "ALL") => {
    const text = formatLogsAsText(type);
    const success = await copyToClipboard(text);
    if (success) {
      setCopyFeedback(type);
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all recorded logs?")) {
      logger.clearLogs();
      setLogs([]);
    }
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case "ERROR":
        return { color: "#ff5252", fontWeight: "bold" };
      case "WARN":
        return { color: "#ffa726", fontWeight: "bold" };
      case "INFO":
        return { color: "#4fc3f7" };
      default:
        return { color: "#cfd8dc" };
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 1000005,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#121824",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "14px",
          width: "95%",
          maxWidth: "680px",
          height: "92%",
          maxHeight: "560px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.8)",
          fontFamily: "Nunito, sans-serif",
          color: "#fff",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(to bottom, #263238 0%, #1a232a 100%)",
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>📋</span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "900",
                letterSpacing: "0.5px",
                color: "#eceff1",
              }}
            >
              GAME LOGS & DIAGNOSTICS
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#fff",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div
          style={{
            padding: "8px 14px",
            background: "#182030",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              style={{
                padding: "3px 10px",
                borderRadius: "12px",
                border: "none",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer",
                background: filter === "ALL" ? "#2196F3" : "rgba(255,255,255,0.08)",
                color: "#fff",
              }}
            >
              All ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("ERROR")}
              style={{
                padding: "3px 10px",
                borderRadius: "12px",
                border: "none",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer",
                background:
                  filter === "ERROR"
                    ? "#e53935"
                    : totalErrors > 0
                    ? "rgba(229, 57, 53, 0.25)"
                    : "rgba(255,255,255,0.08)",
                color: totalErrors > 0 ? "#ff8a80" : "#9e9e9e",
              }}
            >
              Errors ({totalErrors})
            </button>
            <button
              type="button"
              onClick={() => setFilter("WARN")}
              style={{
                padding: "3px 10px",
                borderRadius: "12px",
                border: "none",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer",
                background:
                  filter === "WARN" ? "#f57c00" : "rgba(255,255,255,0.08)",
                color: totalWarns > 0 ? "#ffb74d" : "#9e9e9e",
              }}
            >
              Warnings ({totalWarns})
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => handleCopy("ALL")}
              style={{
                padding: "4px 12px",
                borderRadius: "6px",
                border: "none",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer",
                background:
                  copyFeedback === "ALL"
                    ? "#2e7d32"
                    : "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {copyFeedback === "ALL" ? "✓ Copied!" : "📋 Copy All"}
            </button>

            {totalErrors > 0 && (
              <button
                type="button"
                onClick={() => handleCopy("ERROR")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "11px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  background:
                    copyFeedback === "ERROR"
                      ? "#2e7d32"
                      : "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
                  color: "#fff",
                }}
              >
                {copyFeedback === "ERROR" ? "✓ Copied!" : "⚠️ Copy Errors"}
              </button>
            )}

            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "11px",
                cursor: "pointer",
                background: "transparent",
                color: "#b0bec5",
              }}
              title="Clear stored logs"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Log Viewer Monospace Box */}
        <div
          ref={logContainerRef}
          style={{
            flex: 1,
            background: "#080c14",
            padding: "8px 12px",
            overflowY: "auto",
            fontFamily: "Consolas, Monaco, 'Courier New', monospace",
            fontSize: "11px",
            lineHeight: 1.45,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {filteredLogs.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "#607d8b",
                fontFamily: "Nunito, sans-serif",
                fontSize: "13px",
              }}
            >
              No logs recorded for filter: <strong>{filter}</strong>
            </div>
          ) : (
            filteredLogs.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "3px 0",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                  display: "flex",
                  gap: "6px",
                  alignItems: "flex-start",
                  wordBreak: "break-word",
                  ...getLevelStyle(item.level),
                }}
              >
                <span
                  style={{
                    color: "#546e7a",
                    flexShrink: 0,
                    userSelect: "none",
                    fontSize: "10px",
                  }}
                >
                  [{item.displayTime}]
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    padding: "0 4px",
                    borderRadius: "3px",
                    fontSize: "9px",
                    fontWeight: "bold",
                    background:
                      item.level === "ERROR"
                        ? "rgba(244, 67, 54, 0.25)"
                        : item.level === "WARN"
                        ? "rgba(255, 167, 38, 0.2)"
                        : "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  {item.level}
                </span>
                <span style={{ flex: 1, whiteSpace: "pre-wrap" }}>
                  {item.message}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "8px 16px",
            background: "#121824",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "10.5px",
              color: "#78909c",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>💾 Auto-saved in storage</span>
            <label
              style={{
                marginLeft: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <span>Auto-scroll</span>
            </label>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px 18px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              background: "linear-gradient(135deg, #2196F3 0%, #1565C0 100%)",
              color: "#fff",
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
