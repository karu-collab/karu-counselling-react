import CounselorCard from './CounselorCard.jsx';
import styles from './CounsellorList.module.css';



const CounsellorList = ({counsellors,onBookSession}) => {


    return (
        <div className={styles.counselorListContainer}>
            <div className={styles.counselorsGrid}>
                {counsellors.map((counsellor) => (
                    <CounselorCard
                        key={counsellor.userId}
                        id={counsellor.userId}
                        name={counsellor.lastName}
                        specialty={"Student Matters"}
                        onBookSession={onBookSession}
                    />
                ))}
            </div>
        </div>
    );
};

export default CounsellorList;