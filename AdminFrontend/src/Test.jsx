import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const NotificationTestPage = () => {
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState("");
  const [log, setLog] = useState([]);

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Listen for notifications from server
    newSocket.on("new-notification", (data) => {
      setLog((prev) => [...prev, `Received: ${JSON.stringify(data)}`]);
    });

    return () => newSocket.disconnect();
  }, []);

  const sendNotification = (id) => {
    if (!socket) return;

    const payload = {
      userId: id || "test-user",
      message: `New user created: ${id || "test-user"}`,
      bookingId: null,
      type: "user",
    };
    socket.emit("new-notification", payload);
    setLog((prev) => [...prev, `Sent: ${JSON.stringify(payload)}`]);
  };

  const sendMultipleNotifications = (count = 5) => {
    for (let i = 1; i <= count; i++) {
      const id = `${userId || "test-user"}-${i}`;
      sendNotification(id);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Socket.IO Notification Test</h1>

      <div>
        <label>User ID: </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
          style={{ padding: "5px", marginRight: "10px" }}
        />
      </div>

      <div style={{ marginTop: "10px" }}>
        <button onClick={() => sendNotification(userId)} style={{ marginRight: "10px", padding: "5px 10px" }}>
          Send Notification
        </button>
        <button onClick={() => sendMultipleNotifications(5)} style={{ padding: "5px 10px" }}>
          Send 5 Notifications
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
          backgroundColor: "#f9f9f9",
        }}
      >
        {log.map((entry, idx) => (
          <div key={idx}>{entry}</div>
        ))}
      </div>
    </div>
  );
};

export default NotificationTestPage;
