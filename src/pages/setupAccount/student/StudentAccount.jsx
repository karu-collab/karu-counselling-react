import React, { useState } from "react";
import styles from './StudentAccount.module.css'
import {useAuth} from "../../../hooks/AuthenticationContext.jsx";
import axiosInstance from "../../../utils/axiosInstance.jsx";
import {useNavigate} from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function ClientInformationForm() {
    const navigate = useNavigate();

    const {user} = useAuth()
    const [formData, setFormData] = useState({
        date: "",
        clientCode: "",
        name: "",
        registrationNumber: "",
        gender: "",
        age: "",
        mobileNumber: "",
        yearOfStudy: "",
        residency: "",
        nextOfKin: "",
        relationship: "",
        nextOfKinPhone: "",
        disability: "",
        maritalStatus: "",
        livingWithSomeone: "",
        religion: "",
        referralSource: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            console.log('form data: ', formData);
            const response = await axiosInstance.post(`${BASE_URL}/auth/student/setup-account`, {
                userId: user.id,
                formData: formData,
            });

            console.log('response: ', response)
            if (response.status === 200) {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>You are almost done {user?.first_name || user?.last_name || user?.full_name}!</h1>
                <h2>Finish setting up your account</h2>
            </div>

            <div className={styles.formCard}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Date of birth</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Client Code</label>
                        <input
                            type="text"
                            name="clientCode"
                            placeholder="Optional"
                            value={formData.clientCode}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Registration Number</label>
                        <input
                            type="text"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className={styles.input}
                            min="16"
                            max="100"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Mobile Number</label>
                        <input
                            type="tel"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="+254 xxx xxx xxx"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Year of Study</label>
                        <select
                            name="yearOfStudy"
                            value={formData.yearOfStudy}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="">Select Year</option>
                            <option value="1st year">1st Year</option>
                            <option value="2nd year">2nd Year</option>
                            <option value="3rd year">3rd Year</option>
                            <option value="4th year">4th Year</option>
                            <option value="Post Graduate">Post Graduate</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Residency</label>
                        <input
                            type="text"
                            name="residency"
                            value={formData.residency}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="e.g., On-campus, Off-campus"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Next of Kin</label>
                        <input
                            type="text"
                            name="nextOfKin"
                            value={formData.nextOfKin}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Kin Relationship</label>
                        <input
                            type="text"
                            name="relationship"
                            value={formData.relationship}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="e.g., Parent, Guardian, Sibling"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Next of Kin Phone</label>
                        <input
                            type="tel"
                            name="nextOfKinPhone"
                            value={formData.nextOfKinPhone}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="+254 xxx xxx xxx"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Disability (if any)</label>
                        <input
                            type="text"
                            name="disability"
                            value={formData.disability}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Optional - specify if applicable"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Marital Status</label>
                        <select
                            name="maritalStatus"
                            value={formData.maritalStatus}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="In a relationship">In a relationship</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Living Situation</label>
                        <input
                            type="text"
                            name="livingWithSomeone"
                            value={formData.livingWithSomeone}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="e.g., Alone, With roommates, With family"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Religion/Denomination</label>
                        <input
                            type="text"
                            name="religion"
                            value={formData.religion}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Optional"
                        />
                    </div>

                    <div className={styles.formGroupFull}>
                        <label className={styles.label}>Referral Source</label>
                        <input
                            type="text"
                            name="referralSource"
                            value={formData.referralSource}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="How did you hear about us?"
                        />
                    </div>
                </form>

                <div className={styles.buttonContainer}>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <span className={styles.loadingSpinner}></span>}
                        {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                    </button>
                </div>
            </div>
        </div>
    );
}