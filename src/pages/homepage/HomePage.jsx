import React, { useState, useEffect } from 'react';
import { ArrowRight,
    Play,
    CheckCircle,
    Heart,
    Smile,
    Brain,
    BookOpen,
    Users,
    MessageCircle,
    ShieldCheck,} from 'lucide-react';
import styles from './HomePage.module.css'


const StripeInspiredHomepage = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [currentFeature, setCurrentFeature] = useState(0);

    const features = [
        "Professional counseling services",
        "Mental health support for students",
        "Guidance for academic and personal growth",
        "Confidential and empathetic care"
    ];

    const services = [
        { name: "Mental Health Support", icon: <Heart /> },
        { name: "Stress Management Workshops", icon: <Smile /> },
        { name: "Academic Counseling", icon: <BookOpen /> },
        { name: "Peer Support Groups", icon: <Users /> },
        { name: "Confidential Chat Services", icon: <MessageCircle /> },
        { name: "Trauma Support and Recovery", icon: <ShieldCheck /> },
        { name: "Cognitive Behavioral Therapy (CBT)", icon: <Brain /> },
    ];

    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>


            <div className={styles.homepage}>
                <section className={styles.hero}>
                    {/* Background Elements */}
                    <div className={styles.backgroundElements}>
                        <div className={`${styles.gradientOrb} ${styles.orbTopRight}`}></div>
                        <div className={`${styles.gradientOrb} ${styles.orbBottomLeft}`}></div>
                        <div className={`${styles.gradientOrb} ${styles.orbCenter}`}></div>
                    </div>

                    <div className={styles.heroContent}>
                        <div className={styles.heroInner}>
                            {/* Sessions Badge */}
                            <div className={`${styles.sessionsBadge} ${isVisible ? styles.visible : ''}`}>
                                <Play size={14} />
                                <span>Sessions 2025</span>
                                <span>•</span>
                                <span>Watch on demand</span>
                                <ArrowRight size={12} />
                            </div>

                            {/* Main Heading */}
                            <h1 className={`${styles.heroTitle} ${isVisible ? styles.visible : ''}`}>
                                <span className={styles.titleLine}>Karatina</span>
                                <span className={styles.titleLine}>University</span>
                                <span className={styles.titleGradient}>Counselling</span>
                                <span className={styles.titleGradient}>Department</span>
                            </h1>

                            {/* Subtitle */}
                            <p className={`${styles.heroSubtitle} ${isVisible ? styles.visible : ''}`}>
                                Providing confidential, professional counseling services to support the mental health and well-being of Karatina University students.
                            </p>

                            {/* Rotating Features */}
                            <div className={`${styles.rotatingServices} ${isVisible ? styles.visible : ''}`}>
                                <CheckCircle size={16} />
                                <span>{features[currentFeature]}</span>
                            </div>

                            {/* CTA Section */}
                            <div className={`${styles.ctaSection} ${isVisible ? styles.visible : ''}`}>

                                <button className={styles.primaryCta}>
                                    <span>Read An Article</span>
                                    <ArrowRight size={16} />
                                </button>
                                <button className={styles.primaryCta}>
                                    <span>Book A Session</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>

                            {/* Trust Indicators */}
                            <div className={`${styles.trustSection} ${isVisible ? styles.visible : ''}`}>
                                <div className={styles.trustLogos}>
                                    {services.map((company, index) => (
                                        <div key={index} className={styles.trustLogo}>
                                            <span style={{ fontSize: '1.5rem' }}>{company.logo}</span>
                                            <span>{company.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating UI Elements */}
                        <div className={styles.floatingElements}>
                            {/* Mini Article */}
                            <div className={`${styles.floatingCard} ${styles.articleCard}`}>
                                <div className={styles.cardTitle}>The Importance of Counseling in University</div>
                                <div className={styles.cardSubtitle}>Building a supportive community for student well-being</div>
                                <p className={styles.articleContent}>
                                    Universities are not just institutions of academic excellence—they are also places where students face various challenges, from academic pressure to personal issues.
                                    Counseling departments play a crucial role in providing a safe space for students to talk about their concerns and receive professional guidance.
                                </p>
                                <p className={styles.articleContent}>
                                    At Karatina University's Counseling Department, students can access resources for mental health support, stress management, and personal growth.
                                    Whether it's overcoming exam anxiety or dealing with life transitions, we are here to help you every step of the way.
                                </p>
                                <button className={styles.readMoreButton}>
                                    <span>Read More</span>
                                </button>
                            </div>


                            {/* Floating UI Elements */}
                            <div className={styles.floatingElements}>
                                {/* Steps to Getting Counseled */}
                                <div className={`${styles.floatingCard} `}>
                                    <div className={styles.cardTitle}>Steps to Get Counseled</div>
                                    <ul className={styles.stepsList}>
                                        <li className={styles.stepItem}>
                                            <span className={styles.stepNumber}>1.</span> Login to your account
                                        </li>
                                        <li className={styles.stepItem}>
                                            <span className={styles.stepNumber}>2.</span> Go to the Dashboard
                                        </li>
                                        <li className={styles.stepItem}>
                                            <span className={styles.stepNumber}>3.</span> Select a preferred counselor
                                        </li>
                                        <li className={styles.stepItem}>
                                            <span className={styles.stepNumber}>4.</span> Book a session
                                        </li>
                                        <li className={styles.stepItem}>
                                            <span className={styles.stepNumber}>5.</span> Wait for a confirmation message
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default StripeInspiredHomepage;