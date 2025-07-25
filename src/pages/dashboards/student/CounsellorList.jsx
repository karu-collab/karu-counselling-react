import CounselorCard from './CounselorCard.jsx';
import styles from './CounsellorList.module.css';



const CounsellorList = ({counsellors, onBookAppointment}) => {


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
                        onBookAppointment={onBookAppointment}
                    />
                ))}
            </div>
        </div>
    );
};

export default CounsellorList;