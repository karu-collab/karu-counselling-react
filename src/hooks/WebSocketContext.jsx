import { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(undefined);

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
};

export const WebSocketProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);
    const [socket, setSocket] = useState(null);

    // Establish a WebSocket connection
    const connectWebSocket = () => {
            const ws = new WebSocket(`${BASE_URL}/ws`); // Update with your server's WebSocket URL

        ws.onopen = () => {
            console.log("WebSocket connected");
            setNotification("CONNECTED");
            ws.send(JSON.stringify({ status: "ONLINE" })); // Initial message to the server
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data); // Attempt to parse JSON
                console.log("Parsed JSON : ", message);
                setNotification(message.message || "NEW MESSAGE");
            } catch (error) {
                console.log('Error parsing JSON message', error);
                console.error("Invalid JSON received: ", event.data);
                setNotification(event.data); // Use raw data if parsing fails
            }
        };

        ws.onclose = (event) => {
            console.error("WebSocket closed: ", event);
            setNotification("DISCONNECTED");
            // Reconnect after delay
            setTimeout(() => connectWebSocket(), 5000);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error: ", error);
            ws.close();
        };

        setSocket(ws);
    };

    // Periodic heartbeat
    const sendHeartbeat = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ status: "PING" }));
        }
    };

    useEffect(() => {
        connectWebSocket();

        const heartbeatInterval = setInterval(() => {
            sendHeartbeat();
        }, 3000); // Ping every 30 seconds

        return () => {
            clearInterval(heartbeatInterval);
            if (socket) {
                socket.close();
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ notification }}>
            {children}
        </WebSocketContext.Provider>
    );
};
