import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

const WebSocketContext = createContext(undefined);

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Connection states
export const CONNECTION_STATES = {
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
    RECONNECTING: 'RECONNECTING',
    ERROR: 'ERROR',
    SERVER_READY: 'SERVER_READY'
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
};

export const WebSocketProvider = ({ children }) => {
    const [connectionState, setConnectionState] = useState(CONNECTION_STATES.CONNECTING);
    const [notification, setNotification] = useState(null);
    const [socket, setSocket] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [serverHealth, setServerHealth] = useState({
        status: 'unknown',
        timestamp: null,
        latency: null
    });

    const reconnectTimeoutRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);
    const pingTimeRef = useRef(null);
    const maxReconnectAttempts = 5;
    const reconnectDelay = 1000; // Start with 1 second

    // Calculate exponential backoff delay
    const getReconnectDelay = useCallback((attempts) => {
        return Math.min(reconnectDelay * Math.pow(2, attempts), 30000); // Max 30 seconds
    }, []);

    // Send ping and measure latency
    const sendPing = useCallback(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            pingTimeRef.current = Date.now();
            socket.send(JSON.stringify({
                type: "PING",
                timestamp: pingTimeRef.current
            }));
        }
    }, [socket]);

    // Check server health via HTTP endpoint
    const checkServerHealth = useCallback(async () => {
        try {
            const startTime = Date.now();
            const response = await fetch(`${BASE_URL.replace('ws://', 'http://').replace('wss://', 'https://')}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const endTime = Date.now();

            if (response.ok) {
                const healthData = await response.json();
                setServerHealth({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    latency: endTime - startTime
                });
                return true;
            }
        } catch (error) {
            console.error('Health check failed:', error);
            setServerHealth(prev => ({
                ...prev,
                status: 'unhealthy',
                timestamp: new Date().toISOString()
            }));
        }
        return false;
    }, []);

    // Establish WebSocket connection
    const connectWebSocket = useCallback(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            return; // Already connected
        }

        console.log(`Attempting WebSocket connection (attempt ${reconnectAttempts + 1})`);
        setConnectionState(reconnectAttempts > 0 ? CONNECTION_STATES.RECONNECTING : CONNECTION_STATES.CONNECTING);

        try {
            const wsUrl = `${BASE_URL}/ws`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("WebSocket connected successfully");
                setConnectionState(CONNECTION_STATES.CONNECTED);
                setNotification("CONNECTED");
                setReconnectAttempts(0);

                // Send initial handshake
                ws.send(JSON.stringify({
                    type: "CLIENT_CONNECT",
                    clientId: `client_${Date.now()}`,
                    timestamp: Date.now()
                }));

                // Start heartbeat
                heartbeatIntervalRef.current = setInterval(() => {
                    sendPing();
                }, 30000); // Ping every 30 seconds
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log("WebSocket message received:", message);

                    switch (message.type) {
                        case "PONG":
                            if (pingTimeRef.current) {
                                const latency = Date.now() - pingTimeRef.current;
                                setServerHealth(prev => ({
                                    ...prev,
                                    latency,
                                    timestamp: new Date().toISOString()
                                }));
                            }
                            break;

                        case "SERVER_STATUS":
                            if (message.status === "READY") {
                                setConnectionState(CONNECTION_STATES.SERVER_READY);
                                setNotification("SERVER_READY");
                            }
                            setServerHealth(prev => ({
                                ...prev,
                                status: message.status?.toLowerCase() || 'unknown'
                            }));
                            break;

                        case "NOTIFICATION":
                            setNotification(message.message || message.data);
                            break;

                        default:
                            // Handle legacy message format
                            setNotification(message.message || "NEW_MESSAGE");
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                    setNotification(event.data); // Fallback to raw data
                }
            };

            ws.onclose = (event) => {
                console.log(`WebSocket closed: Code ${event.code}, Reason: ${event.reason}`);
                setConnectionState(CONNECTION_STATES.DISCONNECTED);
                setNotification("DISCONNECTED");

                // Clear heartbeat
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                    heartbeatIntervalRef.current = null;
                }

                // Attempt reconnection if not intentionally closed
                if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
                    const delay = getReconnectDelay(reconnectAttempts);
                    console.log(`Reconnecting in ${delay}ms...`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        setReconnectAttempts(prev => prev + 1);
                        connectWebSocket();
                    }, delay);
                } else if (reconnectAttempts >= maxReconnectAttempts) {
                    console.error("Max reconnection attempts reached");
                    setConnectionState(CONNECTION_STATES.ERROR);
                    setNotification("CONNECTION_FAILED");
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                setConnectionState(CONNECTION_STATES.ERROR);
                setNotification("CONNECTION_ERROR");
            };

            setSocket(ws);
        } catch (error) {
            console.error("Failed to create WebSocket connection:", error);
            setConnectionState(CONNECTION_STATES.ERROR);
            setNotification("CONNECTION_FAILED");
        }
    }, [reconnectAttempts, getReconnectDelay, sendPing]);

    // Manual reconnection function
    const reconnect = useCallback(() => {
        if (socket) {
            socket.close();
        }
        setReconnectAttempts(0);
        connectWebSocket();
    }, [socket, connectWebSocket]);

    // Disconnect function
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }
        if (socket) {
            socket.close(1000, "Intentional disconnect");
        }
        setConnectionState(CONNECTION_STATES.DISCONNECTED);
    }, [socket]);

    // Send message function
    const sendMessage = useCallback((message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
            return true;
        }
        console.warn("Cannot send message: WebSocket not connected");
        return false;
    }, [socket]);

    // Initialize connection and health checks
    useEffect(() => {
        connectWebSocket();

        // Initial health check
        checkServerHealth();

        // Periodic health checks
        const healthCheckInterval = setInterval(checkServerHealth, 60000); // Every minute

        return () => {
            clearInterval(healthCheckInterval);
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
            if (socket) {
                socket.close(1000, "Component unmounting");
            }
        };
    }, []);

    const contextValue = {
        connectionState,
        notification,
        serverHealth,
        reconnectAttempts,
        isConnected: connectionState === CONNECTION_STATES.CONNECTED || connectionState === CONNECTION_STATES.SERVER_READY,
        isReconnecting: connectionState === CONNECTION_STATES.RECONNECTING,
        hasError: connectionState === CONNECTION_STATES.ERROR,
        sendMessage,
        reconnect,
        disconnect
    };

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};