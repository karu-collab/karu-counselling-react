import { useEffect, useState } from "react";
import { useAuthentication } from "../../../hooks/AuthenticationContext.jsx";
import styles from "./ClientList.module.css";
import { FaUser, FaEnvelope, FaPhone, FaCalendar } from "react-icons/fa";
import ClientRecords from "../clientRecords/ClientRecords.jsx";

export default function ClientList() {
    const { accessToken, baseUrl, userInfo } = useAuthentication();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clientRecordSelected, setClientRecordSelected] = useState(null); // Modal state
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
    });

    useEffect(() => {
        fetchClients();
    }, [userInfo.userId, accessToken, baseUrl]);

    const fetchClients = async (page = 0, size = 10) => {
        if (!userInfo?.userId || !accessToken) return;

        try {
            setLoading(true);
            const response = await fetch(
                `${baseUrl}/api/v1/clients/counsellor/${userInfo.userId}?page=${page}&size=${size}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();

            // Extract client data and pagination info
            setClients(data._embedded?.clientDtoList || []); // Update based on the structure
            setPagination({
                page: data.page.number || 0,
                size: data.page.size || 10,
                totalElements: data.page.totalElements || 0,
                totalPages: data.page.totalPages || 0,
            });

            setError(null);
        } catch (err) {
            setError("Failed to fetch clients. Please try again later.");
            console.error("Error fetching clients:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleViewIntakeForms = (client) => {
        setClientRecordSelected({ client, counsellorId: userInfo.userId });
    };

    const closeModal = () => setClientRecordSelected(null);

    return (
        <div className={styles.clientList}>
            <div className={styles.header}>
                <h2>My Clients</h2>
                <button
                    className={styles.refreshButton}
                    onClick={() => fetchClients(pagination.page, pagination.size)}
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {loading ? (
                <div className={styles.loading}>Loading clients...</div>
            ) : clients.length === 0 ? (
                <div className={styles.noClients}>
                    <p>You don't have any clients yet.</p>
                    <p>
                        When you accept session requests, students will be added to your
                        client list.
                    </p>
                </div>
            ) : (
                <>
                    <div className={styles.clientGrid}>
                        {clients.map((client) => (
                            <div key={client.id} className={styles.clientCard}>
                                <div className={styles.clientAvatar}>
                                    <FaUser size={40} />
                                </div>
                                <div className={styles.clientInfo}>
                                    <h3>
                                        {client.firstName} {client.lastName}
                                    </h3>

                                    <div className={styles.clientDetail}>
                                        <FaEnvelope className={styles.icon} />
                                        <span>{client.email}</span>
                                    </div>

                                    {client.phoneNumber && (
                                        <div className={styles.clientDetail}>
                                            <FaPhone className={styles.icon} />
                                            <span>{client.phoneNumber}</span>
                                        </div>
                                    )}

                                    <div className={styles.clientDetail}>
                                        <FaCalendar className={styles.icon} />
                                        <span>
                                          Client since:{" "}
                                                                {client.createdAt
                                                                    ? new Date(client.createdAt).toLocaleDateString()
                                                                    : "N/A"}
                                        </span>
                                    </div>

                                    {client.totalSessions > 0 && (
                                        <div className={styles.clientDetail}>
                                            <span>Total Sessions: {client.totalSessions}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.clientActions}>
                                    <button
                                        className={styles.viewHistoryButton}
                                        onClick={() =>
                                            handleViewIntakeForms(client)
                                        }
                                    >
                                        View Intake Forms
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => fetchClients(pagination.page - 1)}
                                disabled={pagination.page === 0 || loading}
                                className={styles.paginationButton}
                            >
                                Previous
                            </button>

                            <span className={styles.paginationInfo}>
                                Page {pagination.page + 1} of {pagination.totalPages} (
                                                {pagination.totalElements} total clients)
                              </span>

                            <button
                                onClick={() => fetchClients(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages - 1 || loading}
                                className={styles.paginationButton}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {clientRecordSelected && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeButton} onClick={closeModal}>
                            ✖
                        </button>
                        <ClientRecords {...clientRecordSelected} />
                    </div>
                </div>
            )}
        </div>
    );
}
