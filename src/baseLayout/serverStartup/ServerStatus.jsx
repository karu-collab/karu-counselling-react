import { useWebSocket, CONNECTION_STATES } from "../../hooks/WebSocketContext.jsx";
import styles from './ServerStatus.module.css';
import { useState, useEffect } from "react";

export default function ServerStatus() {
    const {
        connectionState,
        notification,
        serverHealth,
        isConnected,
        hasError,
        reconnect
    } = useWebSocket();

    const [countdown, setCountdown] = useState(35);
    const [serverStatus, setServerStatus] = useState('connecting');
    const [showComponent, setShowComponent] = useState(true);

    // Reset countdown when connection changes to connecting/reconnecting
    useEffect(() => {
        if (connectionState === CONNECTION_STATES.CONNECTING ||
            connectionState === CONNECTION_STATES.RECONNECTING) {
            setCountdown(35);
        }
    }, [connectionState]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0 && (serverStatus === 'connecting' || serverStatus === 'reconnecting')) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && (serverStatus === 'connecting' || serverStatus === 'reconnecting')) {
            setServerStatus('error');
        }
    }, [countdown, serverStatus]);

    // Server status based on WebSocket connection and notifications
    useEffect(() => {
        switch (connectionState) {
            case CONNECTION_STATES.CONNECTED:
            case CONNECTION_STATES.SERVER_READY:
                setServerStatus('ready');
                // Auto-hide component after 2 seconds when ready
                setTimeout(() => setShowComponent(false), 2000);
                break;

            case CONNECTION_STATES.ERROR:
                setServerStatus('error');
                setShowComponent(true); // Show component on error
                break;

            case CONNECTION_STATES.RECONNECTING:
                setServerStatus('reconnecting');
                setShowComponent(true); // Show component when reconnecting
                if (countdown === 0) {
                    setCountdown(35); // Reset countdown for reconnection
                }
                break;

            case CONNECTION_STATES.DISCONNECTED:
                setServerStatus('error');
                setShowComponent(true); // Show component when disconnected
                break;

            case CONNECTION_STATES.CONNECTING:
                setServerStatus('connecting');
                setShowComponent(true); // Show component when connecting
                break;

            default:
                // CONNECTING or DISCONNECTED
                if (countdown === 0) {
                    setServerStatus('error');
                }
                setShowComponent(true);
                break;
        }
    }, [connectionState, countdown]);

    // Handle specific server notifications
    useEffect(() => {
        if (notification === "SERVER_READY") {
            setServerStatus('ready');
            setTimeout(() => setShowComponent(false), 2000);
        } else if (notification === "DISCONNECTED" ||
            notification === "CONNECTION_ERROR" ||
            notification === "CONNECTION_FAILED") {
            setShowComponent(true); // Show component on connection issues
        }
    }, [notification]);

    const LoadingSpinnerWithCounter = () => (
        <div className={styles.spinnerContainer}>
            <div className={styles.spinner}>
                <div className={styles.spinnerCounter}>
                    { `${Math.floor(((35 - countdown) / 35) * 100)}%` }
                </div>
            </div>
        </div>
    );

    const getStatusMessage = () => {
        switch (connectionState) {
            case CONNECTION_STATES.CONNECTING:
                return "Connecting to server...";
            case CONNECTION_STATES.CONNECTED:
                return "Connected, waiting for server ready...";
            case CONNECTION_STATES.SERVER_READY:
                return "Server is ready!";
            case CONNECTION_STATES.RECONNECTING:
                return "Reconnecting to server...";
            case CONNECTION_STATES.ERROR:
                return "Connection failed";
            case CONNECTION_STATES.DISCONNECTED:
                return "Disconnected from server";
            default:
                return notification || "Initializing...";
        }
    };

    const getServerHealthStatus = () => {
        if (serverHealth.status === 'healthy') {
            return `Server healthy ${serverHealth.latency ? `(${serverHealth.latency}ms)` : ''}`;
        } else if (serverHealth.status === 'unhealthy') {
            return "Server health check failed";
        }
        return "Checking server health...";
    };

    const handleRetry = () => {
        setServerStatus('connecting');
        setCountdown(35);
        setShowComponent(true);
        reconnect();
    };

    const handleContinue = () => {
        setShowComponent(false);
    };

    // Don't render if component should be hidden
    if (!showComponent) {
        return null;
    }

    // Success state
    if (serverStatus === 'ready') {
        return (
            <div className={styles.overlay}>
                <div className={`${styles.card} ${styles.success}`}>
                    <div className={styles.successIcon}>✓</div>
                    <h1 className={styles.successTitle}>Server is Ready!</h1>
                    <p className={styles.description}>
                        Connection established successfully
                    </p>
                    {serverHealth.latency && (
                        <div className={styles.healthInfo}>
                            Latency: {serverHealth.latency}ms
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Error state
    if (serverStatus === 'error') {
        const isDisconnected = connectionState === CONNECTION_STATES.DISCONNECTED;
        const errorTitle = isDisconnected ? "Connection Lost" : "Server Error";
        const errorDescription = isDisconnected
            ? "Lost connection to server"
            : "Server is down or unreachable";

        return (
            <div className={styles.overlay}>
                <div className={`${styles.card} ${styles.error}`}>
                    <div className={styles.errorIcon}>⚠</div>
                    <h1 className={styles.errorTitle}>{errorTitle}</h1>
                    <p className={styles.errorDescription}>
                        {errorDescription}
                    </p>
                    <div className={styles.errorDetails}>
                        Connection State: {connectionState}<br/>
                        Health Status: {serverHealth.status}
                        {notification && <><br/>Last Message: {notification}</>}
                    </div>
                    <div className={styles.actionButtons}>
                        <button className={styles.retryButton} onClick={handleRetry}>
                            {isDisconnected ? "Reconnect" : "Retry Connection"}
                        </button>
                        <button className={styles.continueButton} onClick={handleContinue}>
                            Continue Anyway
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading/Connecting/Reconnecting state
    return (
        <div className={styles.overlay}>
            <div className={styles.card}>
                <LoadingSpinnerWithCounter />

                <h1 className={styles.title}>
                    {serverStatus === 'reconnecting' ? 'Reconnecting to server...' : 'Starting up the server...'}
                </h1>
                <p className={styles.description}>
                    {serverStatus === 'reconnecting'
                        ? 'Attempting to restore connection...'
                        : 'Please wait while we initialize the connection'
                    }
                </p>

                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${((35 - countdown) / 35) * 100}%` }}
                    ></div>
                </div>

                <div className={styles.statusInfo}>
                    <div className={styles.status}>
                        Connection: {getStatusMessage()}
                    </div>
                    <div className={styles.healthStatus}>
                        Health: {getServerHealthStatus()}
                    </div>
                    {serverStatus === 'reconnecting' && (
                        <div className={styles.reconnectInfo}>
                            <small>Connection will be restored automatically</small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}