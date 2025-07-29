import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../hooks/AuthenticationContext.jsx';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import styles from './ArticleManager.module.css';
import axiosInstance from "../../../../utils/axiosInstance.jsx";

export default function ArticleManager() {
    // State management
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalArticles, setTotalArticles] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);
    const [perPage] = useState(10); // Articles per page

    // Modal and form state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentArticle, setCurrentArticle] = useState({
        title: '',
        content: '',
        author: '',
        tags: [],
        published: false
    });
    const [selectedArticleId, setSelectedArticleId] = useState(null);

    const { user } = useAuth();

    useEffect(() => {
        console.log('articles: ',articles);
    }, [articles]);

    // Fetch articles with pagination and search
    const fetchArticles = useCallback(async (page = 1, search = '') => {
        try {
            setLoading(true);
            setError('');

            const params = {
                page,
                per_page: perPage,
                ...(search && { search })
            };

            const response = await axiosInstance.get('/articles/', { params });
            const data = response.data;

            console.log('articles response: ',response )

            setArticles(data.articles);
            setCurrentPage(data.page);
            setTotalPages(data.total_pages);
            setTotalArticles(data.total);
            setHasNext(data.has_next);
            setHasPrev(data.has_prev);

        } catch (err) {
            setError('Failed to fetch articles');
            console.error('Error fetching articles:', err);
        } finally {
            setLoading(false);
        }
    }, [perPage]);

    // Initial load and search effect
    useEffect(() => {
        fetchArticles(currentPage, searchTerm);
    }, [fetchArticles, currentPage]);

    // Debounced search effect
    useEffect(() => {
        const searchTimeout = setTimeout(() => {
            if (currentPage === 1) {
                fetchArticles(1, searchTerm);
            } else {
                setCurrentPage(1); // This will trigger fetchArticles via the dependency
            }
        }, 500);

        return () => clearTimeout(searchTimeout);
    }, [searchTerm, fetchArticles]);

    // Handle search input
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Create new article
    const handleCreateArticle = () => {
        setCurrentArticle({
            title: '',
            content: '',
            author: user?.name || '',
            tags: [],
            published: false
        });
        setIsEditing(false);
        setSelectedArticleId(null);
        setShowModal(true);
    };

    // Edit existing article
    const handleEditArticle = async (article) => {
        try {
            // Fetch full article details
            const response = await axiosInstance.get(`/articles/${article._id}`);
            const fullArticle = response.data;

            setCurrentArticle({
                title: fullArticle.title,
                content: fullArticle.content,
                author: fullArticle.author,
                tags: fullArticle.tags || [],
                published: fullArticle.published
            });
            setSelectedArticleId(article._id);
            setIsEditing(true);
            setShowModal(true);
        } catch (err) {
            setError('Failed to load article for editing');
            console.error('Error loading article:', err);
        }
    };

    // Delete article
    const handleDeleteArticle = async (articleId) => {
        if (!window.confirm('Are you sure you want to delete this article?')) {
            return;
        }

        try {
            await axiosInstance.delete(`/articles/${articleId}`);

            // Refresh the articles list
            await fetchArticles(currentPage, searchTerm);

            // If current page is empty after deletion and not the first page, go to previous page
            if (articles.length === 1 && currentPage > 1) {
                handlePageChange(currentPage - 1);
            }

        } catch (err) {
            setError('Failed to delete article');
            console.error('Error deleting article:', err);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'tags') {
            // Handle tags as comma-separated values
            const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
            setCurrentArticle(prev => ({
                ...prev,
                tags: tagsArray
            }));
        } else {
            setCurrentArticle(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    // Submit article (create or update)
    const handleSubmitArticle = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');

            if (isEditing && selectedArticleId) {
                // Update existing article
                await axiosInstance.put(`/articles/${selectedArticleId}`, currentArticle);
            } else {
                // Create new article
                await axiosInstance.post('/articles/', currentArticle);
            }

            setShowModal(false);
            // Refresh articles list
            await fetchArticles(currentPage, searchTerm);

        } catch (err) {
            setError(isEditing ? 'Failed to update article' : 'Failed to create article');
            console.error('Error submitting article:', err);
        } finally {
            setLoading(false);
        }
    };

    // Close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentArticle({
            title: '',
            content: '',
            author: '',
            tags: [],
            published: false
        });
        setSelectedArticleId(null);
        setIsEditing(false);
    };

    return (
        <div className={styles.articleManager}>
            <div className={styles.header}>
                <h1>Article Manager</h1>
                <div className={styles.controls}>
                    <div className={styles.searchBox}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <button className={styles.addButton} onClick={handleCreateArticle}>
                        <FaPlus />
                        <span>New Article</span>
                    </button>
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {loading ? (
                <div className={styles.loading}>Loading articles...</div>
            ) : articles.length > 0 ? (
                <>
                    <div className={styles.articlesGrid}>
                        {articles.map(article => (
                            <div key={article.id} className={styles.articleCard}>
                                <h3>{article.title}</h3>
                                <div className={styles.authorInfo}>
                                    <span>By: {article.author}</span>
                                    <span className={`${styles.statusBadge} ${article.published ? styles.published : styles.draft}`}>
                                        {article.published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                {article.tags && article.tags.length > 0 && (
                                    <div className={styles.tags}>
                                        {article.tags.map((tag, index) => (
                                            <span key={index} className={styles.tag}>{tag}</span>
                                        ))}
                                    </div>
                                )}
                                <p className={styles.contentPreview}>
                                    {article.content.length > 150
                                        ? `${article.content.substring(0, 150)}...`
                                        : article.content}
                                </p>
                                <div className={styles.timestamps}>
                                    <small>Created: {new Date(article.created_at).toLocaleDateString()}</small>
                                    <small>Updated: {new Date(article.updated_at).toLocaleDateString()}</small>
                                </div>
                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.editButton}
                                        onClick={() => handleEditArticle(article)}
                                    >
                                        <FaEdit />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => handleDeleteArticle(article._id)}
                                    >
                                        <FaTrash />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            <span>
                                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalArticles)} of {totalArticles} articles
                            </span>
                        </div>
                        <div className={styles.paginationControls}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!hasPrev}
                                className={styles.pageButton}
                            >
                                Previous
                            </button>

                            <span className={styles.pageInfo}>
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!hasNext}
                                className={styles.pageButton}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className={styles.noArticles}>
                    <p>
                        {searchTerm
                            ? `No articles found matching "${searchTerm}"`
                            : "No articles found. Click 'New Article' to create one."
                        }
                    </p>
                </div>
            )}

            {showModal && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>{isEditing ? 'Edit Article' : 'Create New Article'}</h2>
                        <form onSubmit={handleSubmitArticle}>

                            <div className={styles.formGroup}>
                                <label htmlFor="title">Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={currentArticle.title}
                                    onChange={handleInputChange}
                                    maxLength={200}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="author">Author *</label>
                                <input
                                    type="text"
                                    id="author"
                                    name="author"
                                    value={currentArticle.author}
                                    onChange={handleInputChange}
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="tags">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    value={currentArticle.tags.join(', ')}
                                    onChange={handleInputChange}
                                    placeholder="e.g. self-esteem, stress management, communication skills..."
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="content">Content *</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={currentArticle.content}
                                    onChange={handleInputChange}
                                    rows="10"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        name="published"
                                        checked={currentArticle.published}
                                        onChange={handleInputChange}
                                    />
                                    Publish article
                                </label>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}