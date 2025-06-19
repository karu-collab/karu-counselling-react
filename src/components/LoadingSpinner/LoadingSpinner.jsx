import styles from "./LoadingSpinner.module.css";

const LoadingSpinner = () => (
    <div className={styles.spinner}>
        <div className={styles.spinnerRing}></div>
    </div>
);

export default LoadingSpinner;