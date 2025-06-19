import React from 'react';
import { RefreshCw, Home, ArrowLeft } from 'lucide-react';

const ErrorPage = ({
                       errorCode = "404",
                       errorTitle = "Page Not Found",
                       errorMessage = "The page you're looking for doesn't exist or has been moved.",
                       customMessage = "",
                       showRetryButton = true,
                       showHomeButton = true,
                       showBackButton = true,
                       onRetry = () => window.location.reload(),
                       onHome = () => window.location.href = '/',
                       onBack = () => window.history.back()
                   }) => {
    return (
        <div className="error-container">
            {/* Animated Globe Background */}
            <div className="globe-container">
                <div className="globe">
                    <div className="globe-inner">
                        {/* Globe grid lines */}
                        <div className="globe-line horizontal-line line-1"></div>
                        <div className="globe-line horizontal-line line-2"></div>
                        <div className="globe-line horizontal-line line-3"></div>
                        <div className="globe-line vertical-line line-4"></div>
                        <div className="globe-line vertical-line line-5"></div>
                        <div className="globe-line diagonal-line line-6"></div>
                        <div className="globe-line diagonal-line line-7"></div>

                        {/* Floating dots */}
                        <div className="floating-dot dot-1"></div>
                        <div className="floating-dot dot-2"></div>
                        <div className="floating-dot dot-3"></div>
                        <div className="floating-dot dot-4"></div>
                        <div className="floating-dot dot-5"></div>
                    </div>
                </div>
            </div>

            {/* Error Content */}
            <div className="error-content">
                <div className="error-header">
                    <div className="university-branding">
                        <h3 className="university-name">Karatina University</h3>
                        <p className="department-name">Counselling Department</p>
                    </div>
                </div>

                <div className="error-main">
                    <div className="error-code">{errorCode}</div>
                    <h1 className="error-title">{errorTitle}</h1>
                    <p className="error-description">{errorMessage}</p>

                    {customMessage && (
                        <div className="custom-message">
                            <p>{customMessage}</p>
                        </div>
                    )}

                    <div className="error-actions">
                        {showRetryButton && (
                            <button className="btn btn-primary" onClick={onRetry}>
                                <RefreshCw size={18} />
                                Try Again
                            </button>
                        )}
                        {showHomeButton && (
                            <button className="btn btn-secondary" onClick={onHome}>
                                <Home size={18} />
                                Go Home
                            </button>
                        )}
                        {showBackButton && (
                            <button className="btn btn-outline" onClick={onBack}>
                                <ArrowLeft size={18} />
                                Go Back
                            </button>
                        )}
                    </div>
                </div>

                <div className="error-footer">
                    <p>Need help? Contact our support team for assistance.</p>
                </div>
            </div>

            <style jsx>{`
        .error-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a1628 0%, #1a2332 50%, #2d3748 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .globe-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .globe {
          width: 800px;
          height: 800px;
          border-radius: 50%;
          position: relative;
          animation: rotateGlobe 30s linear infinite;
          opacity: 0.6;
        }

        .globe-inner {
          width: 100%;
          height: 100%;
          position: relative;
          border-radius: 50%;
          overflow: hidden;
        }

        .globe-line {
          position: absolute;
          background: linear-gradient(90deg, transparent, #4299e1, transparent);
          opacity: 0.4;
        }

        .horizontal-line {
          width: 100%;
          height: 1px;
          left: 0;
        }

        .line-1 {
          top: 25%;
          animation: pulseHorizontal 4s ease-in-out infinite;
        }

        .line-2 {
          top: 50%;
          animation: pulseHorizontal 4s ease-in-out infinite 1s;
        }

        .line-3 {
          top: 75%;
          animation: pulseHorizontal 4s ease-in-out infinite 2s;
        }

        .vertical-line {
          height: 100%;
          width: 1px;
          top: 0;
        }

        .line-4 {
          left: 30%;
          animation: pulseVertical 5s ease-in-out infinite;
        }

        .line-5 {
          left: 70%;
          animation: pulseVertical 5s ease-in-out infinite 1.5s;
        }

        .diagonal-line {
          width: 120%;
          height: 1px;
          top: 50%;
          left: -10%;
          transform-origin: center;
        }

        .line-6 {
          transform: rotate(45deg);
          animation: pulseDiagonal 6s ease-in-out infinite;
        }

        .line-7 {
          transform: rotate(-45deg);
          animation: pulseDiagonal 6s ease-in-out infinite 2s;
        }

        .floating-dot {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #4299e1;
          border-radius: 50%;
          box-shadow: 0 0 10px #4299e1;
        }

        .dot-1 {
          top: 20%;
          left: 40%;
          animation: floatDot 8s ease-in-out infinite;
        }

        .dot-2 {
          top: 60%;
          left: 20%;
          animation: floatDot 10s ease-in-out infinite 2s;
        }

        .dot-3 {
          top: 30%;
          left: 80%;
          animation: floatDot 7s ease-in-out infinite 1s;
        }

        .dot-4 {
          top: 80%;
          left: 60%;
          animation: floatDot 9s ease-in-out infinite 3s;
        }

        .dot-5 {
          top: 70%;
          left: 85%;
          animation: floatDot 6s ease-in-out infinite 1.5s;
        }

        .error-content {
          position: relative;
          z-index: 2;
          max-width: 600px;
          width: 90%;
          text-align: center;
          color: white;
          padding: 2rem;
        }

        .error-header {
          margin-bottom: 3rem;
        }

        .university-name {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #4299e1;
        }

        .department-name {
          font-size: 1rem;
          margin: 0;
          color: #a0aec0;
          font-weight: 400;
        }

        .error-main {
          margin-bottom: 3rem;
        }

        .error-code {
          font-size: 8rem;
          font-weight: 700;
          line-height: 1;
          color: #4299e1;
          margin-bottom: 1rem;
          text-shadow: 0 0 30px rgba(66, 153, 225, 0.3);
        }

        .error-title {
          font-size: 2.5rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: #f7fafc;
        }

        .error-description {
          font-size: 1.125rem;
          color: #cbd5e0;
          margin: 0 0 2rem 0;
          line-height: 1.6;
        }

        .custom-message {
          background: rgba(66, 153, 225, 0.1);
          border: 1px solid rgba(66, 153, 225, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin: 2rem 0;
        }

        .custom-message p {
          margin: 0;
          color: #e2e8f0;
          font-size: 1rem;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          text-decoration: none;
        }

        .btn-primary {
          background: #4299e1;
          color: white;
        }

        .btn-primary:hover {
          background: #3182ce;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
        }

        .btn-secondary {
          background: #4a5568;
          color: white;
        }

        .btn-secondary:hover {
          background: #2d3748;
          transform: translateY(-2px);
        }

        .btn-outline {
          background: transparent;
          color: #cbd5e0;
          border: 1px solid #4a5568;
        }

        .btn-outline:hover {
          background: #4a5568;
          color: white;
          transform: translateY(-2px);
        }

        .error-footer {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #4a5568;
          color: #a0aec0;
        }

        .error-footer p {
          margin: 0;
          font-size: 0.875rem;
        }

        @keyframes rotateGlobe {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulseHorizontal {
          0%, 100% {
            opacity: 0.2;
            transform: scaleX(0.8);
          }
          50% {
            opacity: 0.8;
            transform: scaleX(1.2);
          }
        }

        @keyframes pulseVertical {
          0%, 100% {
            opacity: 0.2;
            transform: scaleY(0.8);
          }
          50% {
            opacity: 0.8;
            transform: scaleY(1.2);
          }
        }

        @keyframes pulseDiagonal {
          0%, 100% {
            opacity: 0.2;
            transform: rotate(45deg) scale(0.8);
          }
          50% {
            opacity: 0.8;
            transform: rotate(45deg) scale(1.1);
          }
        }

        @keyframes floatDot {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .globe {
            width: 600px;
            height: 600px;
          }

          .error-code {
            font-size: 4rem;
          }

          .error-title {
            font-size: 1.875rem;
          }

          .error-description {
            font-size: 1rem;
          }

          .error-actions {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 200px;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .globe {
            width: 400px;
            height: 400px;
          }

          .error-content {
            padding: 1rem;
          }

          .error-code {
            font-size: 3rem;
          }

          .university-name {
            font-size: 1.25rem;
          }
        }
      `}</style>
        </div>
    );
};

export default ErrorPage;