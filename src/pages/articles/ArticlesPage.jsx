import styles from './ArticlesPage.module.css';
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Article from "./Article.jsx";

const BaseUrl = import.meta.env.VITE_BACKEND_URL


export default function ArticlesPage() {
    const { filter } = useParams();

    // State management
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showArticle, setShowArticle] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalArticles, setTotalArticles] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Filter and search state
    const [searchQuery, setSearchQuery] = useState('');
    const [publishedOnly, setPublishedOnly] = useState(false);
    const [sortBy, setSortBy] = useState('newest');

    const perPage = 10;

    // Function to close article modal
    const closeArticleModal = () => {
        setShowArticle(false);
        setSelectedArticle(null);
        document.body.style.overflow = 'unset';
    };

    // Function to select article for preview
    const selectArticleForPreview = (article) => {
        setSelectedArticle(article);
    };

    // Close modal on Escape key press
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && showArticle) {
                closeArticleModal();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showArticle]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Set first article as selected by default
    useEffect(() => {
        if (articles.length > 0 && !selectedArticle) {
            setSelectedArticle(articles[0]);
        }
    }, [articles, selectedArticle]);

    // Build API URL with query parameters
    const buildApiUrl = useCallback((page, loadMore = false) => {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });

        if (publishedOnly) {
            params.append('published_only', 'true');
        }

        if (searchQuery.trim()) {
            params.append('search', searchQuery.trim());
        }

        return `${BaseUrl}/articles/published/?${params.toString()}`;
    }, [BaseUrl, publishedOnly, searchQuery]);

    // Fetch Articles Function
    const fetchArticles = useCallback(async (page = 1, loadMore = false) => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const url = buildApiUrl(page, loadMore);
            console.log('Fetching from:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response:", data);

            if (loadMore) {
                // Append new articles to existing ones
                setArticles(prevArticles => [...prevArticles, ...data.articles]);
            } else {
                // Replace articles (new search/filter)
                setArticles(data.articles);
                // Reset selected article when loading new data
                setSelectedArticle(null);
            }

            // Update pagination state
            setCurrentPage(data.page);
            setTotalPages(data.total_pages);
            setTotalArticles(data.total);
            setHasMore(data.has_next);

        } catch (error) {
            console.error('Error fetching articles:', error);
            // You might want to show an error message to the user here
        } finally {
            setIsLoading(false);
        }
    }, [buildApiUrl, isLoading]);

    // Load more articles (pagination)
    const loadMoreArticles = useCallback(() => {
        if (hasMore && !isLoading && currentPage < totalPages) {
            fetchArticles(currentPage + 1, true);
        }
    }, [hasMore, isLoading, currentPage, totalPages, fetchArticles]);

    // Handle search
    const handleSearch = useCallback(() => {
        setCurrentPage(1);
        fetchArticles(1, false);
    }, [fetchArticles]);

    // Handle search input change with debounce
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery !== '') {
                handleSearch();
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    // Handle filter changes
    useEffect(() => {
        setCurrentPage(1);
        fetchArticles(1, false);
    }, [filter, publishedOnly]);

    // Initial fetch
    useEffect(() => {
        fetchArticles(1, false);
    }, []);

    // Format date helper
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get reading time estimate
    const getReadingTime = (content) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(' ').length;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);
        return `${readingTime} min read`;
    };

    // Truncate content for preview
    const truncateContent = (content, maxLength = 300) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength).trim() + '...';
    };

    // Handle sort change
    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        // You can implement sorting logic here or pass it to the API
    };

    return (
        <div className={styles.articlesPage}>
            {/* Header Section */}
            <div className={styles.pageHeader}>
                <div className={styles.headerContent}>
                    <h1 className={styles.pageTitle}>Karu Knowledge Hub</h1>
                    <p className={styles.pageSubtitle}>
                        Discover insights, stories, and expertise from our community
                    </p>
                </div>

                {/* Search and Filters */}
                <div className={styles.headerControls}>
                    <div className={styles.searchBox}>
                        <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21L16.65 16.65"></path>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterButtons}>
                        <button
                            className={`${styles.filterButton} ${!publishedOnly ? styles.active : ''}`}
                            onClick={() => setPublishedOnly(false)}
                        >
                            All
                        </button>
                        <button
                            className={`${styles.filterButton} ${publishedOnly ? styles.active : ''}`}
                            onClick={() => setPublishedOnly(true)}
                        >
                            Published
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={styles.mainContent}>
                {/* Left Column - Articles List */}
                <div className={styles.articlesColumn}>
                    <div className={styles.articlesHeader}>
                        <h2 className={styles.columnTitle}>
                            Articles ({totalArticles}) - Page {currentPage} of {totalPages}
                        </h2>
                        <div className={styles.sortDropdown}>
                            <select
                                className={styles.sortSelect}
                                value={sortBy}
                                onChange={handleSortChange}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="title">Title A-Z</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.articlesList}>
                        {articles.map((article) => (
                            <div
                                key={article.id}
                                className={`${styles.articleItem} ${
                                    selectedArticle?.id === article.id ? styles.selected : ''
                                }`}
                                onClick={() => selectArticleForPreview(article)}
                            >
                                <div className={styles.articleItemContent}>
                                    {article.tags && article.tags.length > 0 && (
                                        <span className={styles.categoryTag}>
                                            {article.tags[0]}
                                        </span>
                                    )}

                                    <h3 className={styles.articleItemTitle}>
                                        {article.title}
                                    </h3>

                                    <p className={styles.articleItemPreview}>
                                        {truncateContent(article.content, 120)}
                                    </p>

                                    <div className={styles.articleItemMeta}>
                                        <div className={styles.authorInfo}>
                                            <div className={styles.authorAvatar}>
                                                {article.author?.charAt(0) || 'A'}
                                            </div>
                                            <div className={styles.authorDetails}>
                                                <span className={styles.authorName}>
                                                    {article.author}
                                                </span>
                                                <span className={styles.articleDate}>
                                                    {formatDate(article.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.articleStats}>
                                            <span className={styles.readingTime}>
                                                {getReadingTime(article.content)}
                                            </span>
                                            {article.published && (
                                                <span className={styles.publishedBadge}>
                                                    Published
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.selectionIndicator}></div>
                            </div>
                        ))}

                        {/* Load More Button */}
                        {hasMore && (
                            <div className={styles.loadMoreContainer}>
                                <button
                                    className={styles.loadMoreButton}
                                    onClick={loadMoreArticles}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Loading...' : 'Load More Articles'}
                                </button>
                            </div>
                        )}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className={styles.loadingIndicator}>
                                <p>Loading articles...</p>
                            </div>
                        )}

                        {/* No articles message */}
                        {!isLoading && articles.length === 0 && (
                            <div className={styles.noArticles}>
                                <p>No articles found. Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Full Article Preview */}
                <div className={styles.previewColumn}>
                    {selectedArticle ? (
                        <div className={styles.articlePreview}>
                            <div className={styles.previewHeader}>
                                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                                    <span className={styles.previewCategory}>
                                        {selectedArticle.tags[0]}
                                    </span>
                                )}

                                <h1 className={styles.previewTitle}>
                                    {selectedArticle.title}
                                </h1>

                                <div className={styles.previewMeta}>
                                    <div className={styles.authorInfoLarge}>
                                        <div className={styles.authorAvatarLarge}>
                                            {selectedArticle.author?.charAt(0) || 'A'}
                                        </div>
                                        <div className={styles.authorDetailsLarge}>
                                            <span className={styles.authorNameLarge}>
                                                {selectedArticle.author}
                                            </span>
                                            <div className={styles.articleMetaInfo}>
                                                <span className={styles.articleDateLarge}>
                                                    {formatDate(selectedArticle.created_at)}
                                                </span>
                                                <span className={styles.separator}>•</span>
                                                <span className={styles.readingTimeLarge}>
                                                    {getReadingTime(selectedArticle.content)}
                                                </span>
                                                {selectedArticle.published && (
                                                    <>
                                                        <span className={styles.separator}>•</span>
                                                        <span className={styles.publishedStatus}>
                                                            Published
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.previewContent}>
                                <Article
                                    theArticle={selectedArticle}
                                    isModal={true}
                                    onClose={closeArticleModal}
                                />
                            </div>

                            {/* Article Stats */}
                            <div className={styles.articleInsights}>
                                <h3 className={styles.insightsTitle}>Article Insights</h3>
                                <div className={styles.insightsGrid}>
                                    <div className={styles.insightItem}>
                                        <span className={styles.insightLabel}>Word Count</span>
                                        <span className={styles.insightValue}>
                                            {selectedArticle.content.split(' ').length}
                                        </span>
                                    </div>
                                    <div className={styles.insightItem}>
                                        <span className={styles.insightLabel}>Reading Time</span>
                                        <span className={styles.insightValue}>
                                            {getReadingTime(selectedArticle.content)}
                                        </span>
                                    </div>
                                    <div className={styles.insightItem}>
                                        <span className={styles.insightLabel}>Created</span>
                                        <span className={styles.insightValue}>
                                            {formatDate(selectedArticle.created_at)}
                                        </span>
                                    </div>
                                    <div className={styles.insightItem}>
                                        <span className={styles.insightLabel}>Updated</span>
                                        <span className={styles.insightValue}>
                                            {formatDate(selectedArticle.updated_at)}
                                        </span>
                                    </div>
                                    <div className={styles.insightItem}>
                                        <span className={styles.insightLabel}>Tags</span>
                                        <span className={styles.insightValue}>
                                            {selectedArticle.tags?.length || 0}
                                        </span>
                                    </div>
                                    <div className={styles.insightItem}>
                                        <span className={styles.insightLabel}>Status</span>
                                        <span className={styles.insightValue}>
                                            {selectedArticle.published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noSelection}>
                            <div className={styles.noSelectionContent}>
                                <div className={styles.noSelectionIcon}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14,2 14,8 20,8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10,9 9,9 8,9"></polyline>
                                    </svg>
                                </div>
                                <h3>Select an Article</h3>
                                <p>Choose an article from the list to preview its content here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}