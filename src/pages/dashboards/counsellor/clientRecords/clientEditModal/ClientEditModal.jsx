import React, { useState } from 'react';
import styles from './ClientEditModal.module.css';

// Client Edit Modal Component
export default function ClientEditModal({ client, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({
        firstName: client?.firstName || '',
        lastName: client?.lastName || '',
        email: client?.email || '',
        phoneNumber: client?.phoneNumber || '',
        mobileNumber: client?.mobileNumber || '',
        age: client?.age || '',
        gender: client?.gender || '',
        maritalStatus: client?.maritalStatus || '',
        residency: client?.residency || '',
        yearOfStudy: client?.yearOfStudy || '',
        registrationNumber: client?.registrationNumber || '',
        disability: client?.disability || '',
        livingWithSomeone: client?.livingWithSomeone || '',
        nextOfKin: client?.nextOfKin || '',
        kinTelNumber: client?.kinTelNumber || '',
        relationshipToKin: client?.relationshipToKin || '',
        religionDenomination: client?.religionDenomination || '',
        referralSource: client?.referralSource || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Edit Client Details</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.editForm}>
                    <div className={styles.formGrid}>
                        {/* Personal Information */}
                        <div className={styles.formSection}>
                            <h4>Personal Information</h4>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Marital Status</label>
                                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                                        <option value="">Select Status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Widowed">Widowed</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Religion/Denomination</label>
                                    <input
                                        type="text"
                                        name="religionDenomination"
                                        value={formData.religionDenomination}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className={styles.formSection}>
                            <h4>Contact Information</h4>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Mobile Number</label>
                                    <input
                                        type="tel"
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Residency</label>
                                    <input
                                        type="text"
                                        name="residency"
                                        value={formData.residency}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Living with Someone</label>
                                <select name="livingWithSomeone" value={formData.livingWithSomeone} onChange={handleChange}>
                                    <option value="">Select Option</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div className={styles.formSection}>
                            <h4>Academic Information</h4>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Registration Number</label>
                                    <input
                                        type="text"
                                        name="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Year of Study</label>
                                    <input
                                        type="text"
                                        name="yearOfStudy"
                                        value={formData.yearOfStudy}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className={styles.formSection}>
                            <h4>Emergency Contact</h4>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Next of Kin</label>
                                    <input
                                        type="text"
                                        name="nextOfKin"
                                        value={formData.nextOfKin}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Kin Telephone</label>
                                    <input
                                        type="tel"
                                        name="kinTelNumber"
                                        value={formData.kinTelNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Relationship to Kin</label>
                                <input
                                    type="text"
                                    name="relationshipToKin"
                                    value={formData.relationshipToKin}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className={styles.formSection}>
                            <h4>Additional Information</h4>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Disability</label>
                                    <input
                                        type="text"
                                        name="disability"
                                        value={formData.disability}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Referral Source</label>
                                    <input
                                        type="text"
                                        name="referralSource"
                                        value={formData.referralSource}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveButton}>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}