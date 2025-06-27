import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/AuthenticationContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Shield,
    GraduationCap,
    Star,
    ArrowRight,
} from 'lucide-react';
import styles from './LoginPage.module.css'; // Custom CSS module

const LoginPage = ({ redirectTo = '/dashboard' }) => {
    const { googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (response) => {
        try {
            const loginResponse = await googleLogin(response);

            if (loginResponse === 'success') {
                navigate(redirectTo);
            }
            if (loginResponse === 'setup-account') {
                navigate('/setup-account');
            }
            console.log('login response: ',loginResponse)
        } catch (error) {
            console.error('Google login failed:', error);
        }
    };

    const handleGoogleError = () => {
        console.error('Google login failed');
    };

    const features = [
        {
            icon: GraduationCap,
            title: 'University-Centric',
            description: 'Connect with other Karatina University students.',
        },
        {
            icon: User,
            title: 'Personalized Experience',
            description: 'Access features tailored for your academic journey.',
        },
        {
            icon: Shield,
            title: 'Secure Access',
            description: 'Your data is protected with university-level security.',
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.branding}>
                    <div className={styles.logoWrapper}>
                        <div className={styles.logo}>
                            <GraduationCap className={styles.logoIcon} />
                        </div>
                        <div>
                            <h1 className={styles.logoTitle}>Karatina Login</h1>
                            <p className={styles.logoSubtitle}>Your Portal to University Services</p>
                        </div>
                    </div>

                    <h2 className={styles.title}>
                        Welcome to the{' '}
                        <span className={styles.titleHighlight}>Karatina University Portal</span>
                    </h2>
                    <p className={styles.description}>
                        Sign in to access resources, connect with students, and explore university opportunities.
                    </p>

                    <div className={styles.features}>
                        {features.map((feature) => (
                            <div key={feature.title} className={styles.feature}>
                                <div className={styles.featureIconWrapper}>
                                    <feature.icon className={styles.featureIcon} />
                                </div>
                                <div>
                                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                                    <p className={styles.featureDescription}>{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.formWrapper}>
                    <div className={styles.form}>
                        <div className={styles.formHeader}>
                            <div className={styles.lockIconWrapper}>
                                <Shield className={styles.lockIcon} />
                            </div>
                            <h3 className={styles.formTitle}>Sign In Securely</h3>
                            <p className={styles.formSubtitle}>
                                Access university services and resources.
                            </p>
                        </div>

                        <GoogleLoginButton
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                        />

                        <p className={styles.terms}>
                            By signing in, you agree to the{' '}
                            <a href="/terms" className={styles.link}>
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" className={styles.link}>
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GoogleLoginButton = ({ onSuccess, onError }) => {
    const login = useGoogleLogin({
        onSuccess,
        onError,
    });

    return (
        <button onClick={() => login()} className={styles.googleButton}>
            <span>Continue with Google</span>
            <ArrowRight className={styles.googleButtonIcon} />
        </button>
    );
};

export default LoginPage;
