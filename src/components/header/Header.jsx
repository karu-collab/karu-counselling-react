    import {Sun, Moon, MessageCircle, BellPlus, Menu, X, LogOut, User, Sparkles} from 'lucide-react';
    import styles from './Header.module.css';
    import { useTheme } from '../../hooks/themeProvider';
    import { Link, useLocation } from 'react-router-dom';
    import { useState, useEffect } from 'react';
    import logo from '../../assets/logo.jpg';
    import {motion} from "framer-motion";
    import {useAuth} from "../../hooks/AuthenticationContext.jsx";

    export default function Header() {
        const { theme, toggleTheme } = useTheme();
        const {user, isAuthenticated, logout } = useAuth();
        const location = useLocation();
        const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

        const handleLogout = () => {
            logout()
            setIsMobileMenuOpen(false)
        }
        // Close mobile menu when route changes
        useEffect(() => {
            setIsMobileMenuOpen(false);
        }, [location.pathname]);

        // Close mobile menu when clicking outside or pressing escape
        useEffect(() => {
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    setIsMobileMenuOpen(false);
                }
            };

            const handleClickOutside = (e) => {
                if (isMobileMenuOpen && !e.target.closest(`.${styles.header}`) && !e.target.closest(`.${styles.mobileNav}`)) {
                    setIsMobileMenuOpen(false);
                }
            };

            if (isMobileMenuOpen) {
                document.addEventListener('keydown', handleEscape);
                document.addEventListener('click', handleClickOutside);
                // Prevent body scroll when menu is open
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'unset';
            }

            return () => {
                document.removeEventListener('keydown', handleEscape);
                document.removeEventListener('click', handleClickOutside);
                document.body.style.overflow = 'unset';
            };
        }, [isMobileMenuOpen]);

        const toggleMobileMenu = () => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
        };

        const isActiveRoute = (path) => {
            if (path === '/') {
                return location.pathname === '/';
            }
            return location.pathname.startsWith(path);
        };

        const navItems = [
            { path: '/', label: 'Home', exact: true },
            { path: '/articles', label: 'Articles' },
            { path: '/Dashboard', label: 'Dashboard' },
        ];

        return (
            <>
                <header className={styles.header}>
                    <div className={`container ${styles.headerContainer}`}>
                        <div className={styles.logo}>
                            <Link to="/" className={styles.logoLink}>
                                <img src={logo} className={styles.logoImg} />
                                <span className={styles.logoText}>Karu</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className={styles.nav}>
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    className={`${styles.navLink} ${
                                        isActiveRoute(item.path) ? styles.navLinkActive : ''
                                    }`}
                                    to={item.path}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* User Section */}
                        <div className={styles.userSection}>
                            {isAuthenticated ? (
                                /* Authenticated User */
                                <div className={styles.authenticatedUser}>
                                    {/* User Info */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={styles.userInfo}
                                    >
                                        <div className={styles.userDetails}>
                                            <p className={styles.userName}>{user?.full_name}</p>
                                            <p className={styles.userEmail}>{user?.email}</p>
                                        </div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className={styles.userAvatarContainer}
                                        >
                                            <img
                                                src={user?.picture}
                                                alt={user?.full_name}
                                                className={styles.userAvatar}
                                            />
                                            <div className={styles.onlineIndicator}></div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Logout Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleLogout}
                                        className={styles.logoutButton}
                                        title="Sign out"
                                    >
                                        <LogOut className={styles.logoutIcon} />
                                        <span>Sign Out</span>
                                    </motion.button>
                                </div>
                            ) : (
                                /* Unauthenticated User */
                                <div className={styles.unauthenticatedUser}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Link
                                            to="/login"
                                            className={styles.signInButton}
                                        >
                                            <User className={styles.signInIcon} />
                                            <span>Sign In</span>
                                        </Link>
                                    </motion.div>


                                </div>
                            )}

                        </div>


                            {/* Actions */}
                        <div className={styles.actions}>
                            <button
                                onClick={toggleTheme}
                                className={styles.iconButton}
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button className={styles.iconButton} aria-label="Messages">
                                <MessageCircle size={20} />
                            </button>
                            <button className={styles.iconButton} aria-label="Notifications">
                                <BellPlus size={20} />
                            </button>

                            {/* Mobile Menu Toggle */}
                            <button
                                className={`${styles.iconButton} ${styles.mobileMenuButton}`}
                                onClick={toggleMobileMenu}
                                aria-label="Toggle menu"
                                aria-expanded={isMobileMenuOpen}
                            >
                                &#9776;
                            </button>
                        </div>
                    </div>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className={styles.mobileMenuOverlay}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}


                {/* Mobile Navigation Menu */}
                <nav className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}>
                    {/* Mobile Menu Toggle */}
                    <button
                        className={`${styles.iconButton} ${styles.mobileMenuButton}`}
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        x
                    </button>

                    {/* Mobile User Section */}
                    {isAuthenticated && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className={styles.mobileUserSection}
                        >
                            <img
                                src={user?.picture}
                                alt={user?.full_name}
                                className={styles.mobileUserAvatar}
                            />
                            <div>
                                <p className={styles.mobileUserName}>{user?.full_name}</p>
                                <p className={styles.mobileUserEmail}>{user?.email}</p>
                            </div>
                        </motion.div>
                    )}

                    <div className={styles.mobileNavContent}>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                className={`${styles.mobileNavLink} ${
                                    isActiveRoute(item.path) ? styles.mobileNavLinkActive : ''
                                }`}
                                to={item.path}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* Mobile Auth Section */}
                        {isAuthenticated ? (
                            <motion.button
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: navigation.length * 0.1 }}
                                onClick={handleLogout}
                                className={styles.mobileLogoutButton}
                            >
                                <LogOut className={styles.mobileLogoutIcon} />
                                <span>Sign Out</span>
                            </motion.button>
                        ) : (
                            <div className={styles.mobileAuthSection}>
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: navigation.length * 0.1 }}
                                >
                                    <Link
                                        to="/login"
                                        onClick={() => isMobileMenuOpen(false)}
                                        className={styles.mobileSignInButton}
                                    >
                                        <User className={styles.mobileSignInIcon} />
                                        <span>Sign In</span>
                                    </Link>
                                </motion.div>

                            </div>
                        )}
                    </div>
                </nav>
            </>
        );
    }