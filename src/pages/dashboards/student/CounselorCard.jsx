import { Calendar } from 'lucide-react';
import { useState } from 'react';
import styles from './CounselorCard.module.css';
import defaultImage from '../../../assets/logo.jpg';

const CounselorCard = ({ id, name, email, picture, onBookAppointment }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleBookSession = () => {
        onBookAppointment(id);
    };

    const handleImageError = () => {
        console.log(`Failed to load image for ${name}:`, picture);
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        console.log(`Successfully loaded image for ${name}`);
        setImageLoading(false);
    };

    // Create a more reliable image URL for Google profile pictures
    const getImageUrl = (originalUrl) => {
        if (!originalUrl) return getGeneratedAvatar();

        // For Google profile images, try to use a more reliable format
        if (originalUrl.includes('googleusercontent.com')) {
            // Remove size parameter and add a larger size
            const baseUrl = originalUrl.split('=')[0];
            return `${baseUrl}=s200-c`;
        }

        return originalUrl;
    };

    const getGeneratedAvatar = () => {
        // Use initials and Stripe-inspired colors
        const initials = name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=635bff&color=ffffff&size=160&font-size=0.4&rounded=true`;
    };

    const imageUrl = imageError ? getGeneratedAvatar() : getImageUrl(picture);

    return (
        <div className={styles.counselorCard}>
            <div className={styles.imageContainer}>
                {imageLoading && !imageError && (
                    <div className={styles.imagePlaceholder}>
                        Loading...
                    </div>
                )}
                <img
                    src={imageUrl}
                    alt={name}
                    className={styles.counselorImage}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    style={{ display: imageLoading && !imageError ? 'none' : 'block' }}
                />
            </div>
            <div className={styles.counselorInfo}>
                <h3 className={styles.counselorName}>{name}</h3>
                <p className={styles.counselorEmail}>{email}</p>
                <div className={styles.counselorActions}>
                    <button
                        className={styles.bookButton}
                        onClick={handleBookSession}
                    >
                        <Calendar className={styles.buttonIcon} />
                        Book Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CounselorCard;