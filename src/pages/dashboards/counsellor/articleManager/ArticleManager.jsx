import { useState, useEffect } from 'react';
import { useAuthentication } from '../../../hooks/AuthenticationContext.jsx';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import styles from './ArticleManager.module.css';

const userId = localStorage.getItem('userId')

export default function ArticleManager() {
    const { accessToken, baseUrl } = useAuthentication();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentArticle, setCurrentArticle] = useState({ title: '', content: '', category: '',authorId: userId });
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [categories] = useState(['Mental Health', 'Self-Care', 'Anxiety', 'Depression', 'Career', 'Relationships', 'Well-being']);

    // Fetch articles on component mount and when pagination changes
    useEffect(() => {
        fetchArticles();
    }, [currentPage, pageSize, accessToken]);

    const fetchArticles = async () => {
        if (!accessToken) return;

        setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/api/v1/articles/get-all?page=${currentPage}&size=${pageSize}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch articles');
            }

            const data = await response.json();

            console.log('articles data: ',data)
            setArticles(data._embedded?.articleList || []);
            setTotalPages(data.page?.totalPages || 0);
            setError(null);
        } catch (err) {
            console.error('Error fetching articles:', err);
            setError('Failed to load articles. Please try again later.');
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateArticle = () => {
        setCurrentArticle({ title: '', content: '', category: '',authorId: userId });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEditArticle = (article) => {
        setCurrentArticle(article);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDeleteArticle = async (articleId) => {
        if (!confirm('Are you sure you want to delete this article?')) return;

        try {
            const response = await fetch(`${baseUrl}/api/v1/articles/${articleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete article');
            }

            // Refresh articles list
            fetchArticles();
        } catch (err) {
            console.error('Error deleting article:', err);
            setError('Failed to delete article. Please try again later.');
        }
    };

    const handleSubmitArticle = async (e) => {
        e.preventDefault();

        try {
            const method = isEditing ? 'PUT' : 'POST';
            const url = `${baseUrl}/api/v1/articles`;

            console.log('current article: ', currentArticle)

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(currentArticle)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isEditing ? 'update' : 'create'} article`);
            }

            // Close modal and refresh articles
            setShowModal(false);
            fetchArticles();
        } catch (err) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} article:`, err);
            setError(`Failed to ${isEditing ? 'update' : 'create'} article. Please try again later.`);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log("current article 1 : ", currentArticle)
        setCurrentArticle({ ...currentArticle, [name]: value });
        console.log("current article 2 : ", currentArticle)
    };

    useEffect(() => {
        
    },[currentArticle]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            ) : filteredArticles.length > 0 ? (
                <>
                    <div className={styles.articlesGrid}>
                        {filteredArticles.map(article => (
                            <div key={article.articleId} className={styles.articleCard}>
                                <h3>{article.title}</h3>
                                <div className={styles.categoryTag}>{article.category}</div>
                                <p className={styles.contentPreview}>
                                    {article.content.length > 150
                                        ? `${article.content.substring(0, 150)}...`
                                        : article.content}
                                </p>
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
                                        onClick={() => handleDeleteArticle(article.articleId)}
                                    >
                                        <FaTrash />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.pagination}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                        >
                            Previous
                        </button>
                        <span>
                            Page {currentPage + 1} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage >= totalPages - 1}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <div className={styles.noArticles}>
                    <p>No articles found. Click "New Article" to create one.</p>
                </div>
            )}

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>{isEditing ? 'Edit Article' : 'Create New Article'}</h2>
                        <form onSubmit={handleSubmitArticle}>
                            <div className={styles.formGroup}>
                                <label htmlFor="title">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={currentArticle.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={currentArticle.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="content">Content</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={currentArticle.content}
                                    onChange={handleInputChange}
                                    rows="10"
                                    required
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                >
                                    {isEditing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}