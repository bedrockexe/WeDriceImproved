import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// defined outside component to prevent recreation on render
const API_URL = "http://localhost:5000/api/users/test";

const NotificationTestPage = () => {
  const [log, setLog] = useState([]);
  const [sending, setSending] = useState(false);
  
  // Ref for the bottom of the log container
  const logEndRef = useRef(null);

  // Auto-scroll to bottom whenever 'log' changes
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  // Helper to extract readable error messages
  const getErrorMessage = (error) => {
    if (error.response && error.response.data) {
      // If server returns an object with a message, use it
      return typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data);
    }
    return error.message;
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const sendNotification = async () => {
    try {
      setSending(true);
      await axios.post(API_URL, {}, {withCredentials: true});
      addLog("Success: Sent single notification");
    } catch (error) {
      addLog(`Error: ${getErrorMessage(error)}`);
    } finally {
      setSending(false);
    }
  };

  const sendMultipleNotifications = async (count = 5) => {
    setSending(true);
    addLog(`--- Starting batch of ${count} ---`);
    
    for (let i = 0; i < count; i++) {
      try {
        await axios.post(API_URL);
        addLog(`Success: Notification #${i + 1}`);
      } catch (error) {
        addLog(`Fail on #${i + 1}: ${getErrorMessage(error)}`);
      }
    }
    
    addLog(`--- Batch finished ---`);
    setSending(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Test Backend Notification Route</h1>

      <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={sendNotification}
          disabled={sending}
          style={buttonStyle}
        >
          {sending ? "Sending..." : "Send Single Notification"}
        </button>

        <button
          onClick={() => sendMultipleNotifications(5)}
          disabled={sending}
          style={buttonStyle}
        >
          Send 5 (Sequential)
        </button>

        <button
          onClick={() => setLog([])}
          disabled={sending}
          style={{ ...buttonStyle, backgroundColor: "#dc3545", color: "white", borderColor: "#dc3545" }}
        >
          Clear Log
        </button>
      </div>

      <div style={logContainerStyle}>
        {log.length === 0 && <div style={{ color: "#999", fontStyle: "italic" }}>Logs will appear here...</div>}
        
        {log.map((entry, idx) => (
          <div key={idx} style={{ padding: "2px 0", borderBottom: "1px solid #eee" }}>
            {entry}
          </div>
        ))}
        {/* Invisible div to anchor the scroll */}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

// Simple styles objects to keep JSX clean
const buttonStyle = {
  padding: "8px 12px",
  cursor: "pointer",
  backgroundColor: "#f0f0f0",
  border: "1px solid #ccc",
  borderRadius: "4px"
};

const logContainerStyle = {
  marginTop: "20px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "10px",
  height: "300px",
  overflowY: "auto", // Changed from 'scroll' to 'auto' for cleaner look
  backgroundColor: "#f9f9f9",
  fontFamily: "monospace",
  fontSize: "14px"
};

export default NotificationTestPage;