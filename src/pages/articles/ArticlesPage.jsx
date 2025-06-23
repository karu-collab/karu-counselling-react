import styles from './ArticlesPage.module.css';
import { useParams} from "react-router-dom";
import {useAuth} from "../../hooks/AuthenticationContext.jsx";
import {useCallback, useEffect, useState} from "react";
import Article from "./Article.jsx";
import SampleArticles from './SampleArticles.jsx'

export default function ArticlesPage() {
    const { filter } = useParams();
    const {baseUrl} = useAuth()
    const [articles, setArticles] = useState(SampleArticles);
    const [nextPageUrl, setNextPageUrl] = useState(`${baseUrl}/api/v1/articles/get-all?filter=${filter}&page=0&size=10`);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showArticle, setShowArticle] = useState(false);

    // Function to close article modal
    const closeArticleModal = () => {
        setShowArticle(false);
        setSelectedArticle(null);
        // Restore body scrolling
        document.body.style.overflow = 'unset';
    };

    // Function to select article for preview (without modal)
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

    // Fetch Articles Function
    const fetchArticles = useCallback(async () => {
        if (!nextPageUrl || isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch(nextPageUrl);
            const data = await response.json();

            console.log("data: ", data);

            setArticles((prevArticles) => [...prevArticles, ...data._embedded.articleList]);
            setNextPageUrl(data._links.next?.href || null);
            setHasMore(!!data._links.next);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setIsLoading(false);
        }
    }, [nextPageUrl, isLoading]);

    useEffect(() => {
        setNextPageUrl(`${baseUrl}/api/v1/articles/get-all?filter=${filter}&page=0&size=10`);
        fetchArticles(); // Initial fetch
    }, [filter]);

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
                        />
                    </div>

                    <div className={styles.filterButtons}>
                        <button className={`${styles.filterButton} ${styles.active}`}>
                            All
                        </button>
                        <button className={styles.filterButton}>Recent</button>
                        <button className={styles.filterButton}>Popular</button>
                        <button className={styles.filterButton}>Featured</button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={styles.mainContent}>
                {/* Left Column - Articles List */}
                <div className={styles.articlesColumn}>
                    <div className={styles.articlesHeader}>
                        <h2 className={styles.columnTitle}>Articles ({articles.length})</h2>
                        <div className={styles.sortDropdown}>
                            <select className={styles.sortSelect}>
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="popular">Most Popular</option>
                                <option value="title">Title A-Z</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.articlesList}>
                        {articles.map((article, index) => (
                            <div
                                key={article.articleId}
                                className={`${styles.articleItem} ${
                                    selectedArticle?.articleId === article.articleId ? styles.selected : ''
                                }`}
                                onClick={() => selectArticleForPreview(article)}
                            >
                                <div className={styles.articleItemContent}>
                                    {article.category && (
                                        <span className={styles.categoryTag}>
                                            {article.category}
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
                                                {article.author?.firstName?.charAt(0) || 'A'}
                                            </div>
                                            <div className={styles.authorDetails}>
                                                <span className={styles.authorName}>
                                                    {article.author?.firstName} {article.author?.lastName}
                                                </span>
                                                <span className={styles.articleDate}>
                                                    {formatDate(article.createdAt || new Date())}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.articleStats}>
                                            <span className={styles.readingTime}>
                                                {getReadingTime(article.content)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.selectionIndicator}></div>
                            </div>
                        ))}

                    </div>
                </div>

                {/* Right Column - Full Article  */}
                <div className={styles.previewColumn}>
                    {selectedArticle ? (
                        <div className={styles.articlePreview}>
                            <div className={styles.previewHeader}>
                                {selectedArticle.category && (
                                    <span className={styles.previewCategory}>
                                        {selectedArticle.category}
                                    </span>
                                )}

                                <h1 className={styles.previewTitle}>
                                    {selectedArticle.title}
                                </h1>

                                <div className={styles.previewMeta}>
                                    <div className={styles.authorInfoLarge}>
                                        <div className={styles.authorAvatarLarge}>
                                            {selectedArticle.author.charAt(0) || 'A'}
                                        </div>
                                        <div className={styles.authorDetailsLarge}>
                                            <span className={styles.authorNameLarge}>
                                                {selectedArticle.author}
                                            </span>
                                            <div className={styles.articleMetaInfo}>
                                                <span className={styles.articleDateLarge}>
                                                    {formatDate(selectedArticle.createdAt || new Date())}
                                                </span>
                                                <span className={styles.separator}>•</span>
                                                <span className={styles.readingTimeLarge}>
                                                    {getReadingTime(selectedArticle.content)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.previewContent}>
                                <div className={styles.previewContent}>
                                    <Article
                                        theArticle={selectedArticle}
                                        isModal={true}
                                        onClose={closeArticleModal}
                                    />
                                </div>

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
                                        <span className={styles.insightLabel}>Published</span>
                                        <span className={styles.insightValue}>
                                            {formatDate(selectedArticle.createdAt || new Date())}
                                        </span>
                                    </div>
                                    <div className={styles.insightItem}>
                                        <span className={styles.insightLabel}>Category</span>
                                        <span className={styles.insightValue}>
                                            {selectedArticle.category || 'General'}
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