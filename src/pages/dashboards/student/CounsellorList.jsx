import CounselorCard from './CounselorCard.jsx';
import styles from './CounsellorList.module.css';



const CounsellorList = ({counsellors,onBookSession}) => {


    return (
        <div className={styles.counselorListContainer}>
            <div className={styles.counselorsGrid}>
                {counsellors.map((counsellor) => (
                    <CounselorCard
                        key={counsellor._id}
                        id={counsellor._id}
                        name={counsellor.name}
                        email={counsellor.email}
                        picture={counsellor.picture}
                        onBookSession={onBookSession}
                    />
                ))}
            </div>
        </div>
    );
};

export default CounsellorList;