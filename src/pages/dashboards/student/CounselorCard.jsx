import { Calendar } from 'lucide-react';
import styles from './CounselorCard.module.css';
import defaultImage from '../../../assets/logo.jpg'


const CounselorCard = ({id,name,image,onBookSession}) => {

    const handleBookSession = () => {
        onBookSession(id);
    };

    return (
        <div className={styles.counselorCard}>
            <img
                src={image || defaultImage}
                alt={name}
                className={styles.counselorImage}
            />
            <div className={styles.counselorInfo}>
                <h3 className={styles.counselorName}>{name}</h3>
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