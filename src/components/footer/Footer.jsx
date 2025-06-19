import { Link } from 'react-router-dom'
import {
    Heart,
    BookOpen,
    Shield,
    MapPin,
    Phone,
    Mail,
    Github,
    Twitter,
    Linkedin,
    ArrowRight,
    Sparkles,
    Award,
    CheckCircle,
    GraduationCap
} from 'lucide-react'
import styles from './Footer.module.css'
import logo from '../../assets/logo.jpg'
import {useState} from "react";
import axiosInstance from "../../utils/axiosInstance.jsx";

const Footer = () => {
    const currentYear = new Date().getFullYear()
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset status
        setStatus('');
        setIsSuccess(false);

        // Validate email
        if (!email.trim()) {
            setStatus('Please enter your email address.');
            return;
        }

        if (!validateEmail(email)) {
            setStatus('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axiosInstance.post('/subscribers/add', {
                email: email
            });

            if (response.status === 200) {
                setStatus('🎉 Thank you for subscribing! Welcome to our community.');
                setIsSuccess(true);
                setEmail('');
            } else {
                setStatus('Failed to subscribe. Please try again.');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            if (error.response?.status === 400) {
                setStatus('This email is already subscribed or invalid.');
            } else {
                setStatus('An error occurred. Please try again.');

            }
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                setStatus('')

            },4000)
        }
    };

    const footerLinks = {
        product: [
            { name: 'Features', href: '/#features' },
            { name: 'How it Works', href: '/#how-it-works' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'Study Tools', href: '/tools' },
        ],
        company: [
            { name: 'About Us', href: '/about' },
            { name: 'Careers', href: '/careers' },
            { name: 'Press', href: '/press' },
            { name: 'Blog', href: '/blog' },
        ],
        support: [
            { name: 'Help Center', href: '/help' },
            { name: 'Contact Support', href: '/support' },
            { name: 'API Documentation', href: '/docs' },
            { name: 'Status', href: '/status' },
        ],
        legal: [
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Data Protection', href: '/data-protection' },
            { name: 'Cookie Policy', href: '/cookies' },
        ],
    }

    const socialLinks = [
        { name: 'Twitter', href: '#', icon: Twitter },
        { name: 'LinkedIn', href: '#', icon: Linkedin },
        { name: 'GitHub', href: '#', icon: Github },
    ]

    const certifications = [
        { name: 'Privacy Compliant', icon: Shield },
        { name: 'SOC 2 Certified', icon: Award },
        { name: 'ISO 27001', icon: CheckCircle },
    ]

    return (
        <footer className={styles.footer}>
            {/* Background Pattern */}
            <div className={styles.backgroundPattern}></div>

            {/* Floating Elements */}
            <div className={styles.floatingElements}>
                <div className={styles.floatingElement1} />
                <div className={styles.floatingElement2} />
            </div>

            <div className={styles.container}>
                {/* Main Footer Content */}
                <div className={styles.mainContent}>
                    <div className={styles.grid}>
                        {/* Brand Section */}
                        <div className={styles.brandSection}>
                            {/* Enhanced Logo */}
                            <div className={styles.logoContainer}>
                                <div className={styles.logoWrapper}>
                                    <div className={styles.logoGlow}></div>
                                    <div className={styles.logo}>
                                        <img src={logo} className={styles.contactIcon} />
                                    </div>
                                </div>
                                <div className={styles.logoText}>
                                    <h3>Karatina University</h3>
                                    <span>Counseling Department</span>
                                </div>
                            </div>

                            <p className={styles.description}>
                                Supporting students' mental health and well-being through professional, confidential, and empathetic counseling services.
                            </p>

                            {/* Contact Info */}
                            <div className={styles.contactInfo}>
                                <div className={styles.contactItem}>
                                    <MapPin className={styles.contactIcon} />
                                    <span>Nyeri, Kenya</span>
                                </div>
                                <div className={styles.contactItem}>
                                    <Phone className={styles.contactIcon} />
                                    <span>(+254) 20 2176 713</span>
                                </div>
                                <div className={styles.contactItem}>
                                    <Mail className={styles.contactIcon} />
                                    <span>info@karu.ac.ke</span>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className={styles.socialLinks}>
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        className={styles.socialLink}
                                        title={social.name}
                                    >
                                        <social.icon className={styles.socialIcon} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links Grid */}
                        <div className={styles.linksGrid}>
                            {/* Product Links */}
                            <div className={styles.linkSection}>
                                <h4 className={styles.linkSectionTitle}>
                                    <Sparkles className={styles.titleIcon} />
                                    Product
                                </h4>
                                <ul className={styles.linkList}>
                                    {footerLinks.product.map((link) => (
                                        <li key={link.name} className={styles.linkItem}>
                                            <Link to={link.href} className={styles.link}>
                                                <span>{link.name}</span>
                                                <ArrowRight className={styles.linkArrow} />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Company Links */}
                            <div className={styles.linkSection}>
                                <h4 className={styles.linkSectionTitle}>Company</h4>
                                <ul className={styles.linkList}>
                                    {footerLinks.company.map((link) => (
                                        <li key={link.name} className={styles.linkItem}>
                                            <Link to={link.href} className={styles.link}>
                                                <span>{link.name}</span>
                                                <ArrowRight className={styles.linkArrow} />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Support Links */}
                            <div className={styles.linkSection}>
                                <h4 className={styles.linkSectionTitle}>Support</h4>
                                <ul className={styles.linkList}>
                                    {footerLinks.support.map((link) => (
                                        <li key={link.name} className={styles.linkItem}>
                                            <Link to={link.href} className={styles.link}>
                                                <span>{link.name}</span>
                                                <ArrowRight className={styles.linkArrow} />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Legal Links */}
                            <div className={styles.linkSection}>
                                <h4 className={styles.linkSectionTitle}>Legal</h4>
                                <ul className={styles.linkList}>
                                    {footerLinks.legal.map((link) => (
                                        <li key={link.name} className={styles.linkItem}>
                                            <Link to={link.href} className={styles.link}>
                                                <span>{link.name}</span>
                                                <ArrowRight className={styles.linkArrow} />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className={styles.newsletter}>
                    <div className={styles.newsletterGrid}>
                        <div>
                            <h4 className={styles.newsletterTitle}>
                                Stay Connected with Counseling Updates
                            </h4>
                            <p className={styles.newsletterDescription}>
                                Receive insights on mental health, well-being, and departmental updates directly to your inbox.
                            </p>
                        </div>
                        <div className={styles.newsletterForm}>
                            <div className={styles.newsletterInputWrapper}>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className={styles.newsletterInput}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    aria-label="Email address"
                                    required
                                />
                            </div>
                            <button className={styles.newsletterButton}>
                                {isLoading ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        Subscribing...
                                    </>
                                ) : (
                                    <span>Subscribe</span>
                                )}

                                <ArrowRight className={styles.buttonIcon} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Certifications */}
                <div className={styles.certifications}>
                    <div className={styles.certificationsContent}>
                        <div className={styles.certificationsList}>
                            {certifications.map((cert) => (
                                <div key={cert.name} className={styles.certificationItem}>
                                    <cert.icon className={styles.certificationIcon} />
                                    <span>{cert.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.ctaWrapper}>
                            <Link to="/articles" className={styles.ctaLink}>
                                <GraduationCap className={styles.ctaIcon} />
                                Read An Article
                                <ArrowRight className={styles.ctaIcon} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className={styles.bottomBar}>
                    <div className={styles.bottomContent}>
                        <p>© {currentYear} Karatina University Counseling Department. All rights reserved.</p>
                        <div className={styles.madeWith}>
                            <span>Made with</span>
                            <Heart className={styles.heartIcon} />
                            <span>for better living</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer