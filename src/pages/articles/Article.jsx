// Updated Article.jsx
import { useState, useEffect } from "react";
import styles from './Article.module.css';

export default function Article({ theArticle, isModal = false }) {

    const [article, setArticle] = useState(theArticle || null);
    useEffect(() => {
        // If article is passed as prop (modal mode), use it directly
        if (theArticle) {
            setArticle(theArticle);
            return;
        }

    },[])

    return (
        <div className={`${styles.articlePage} ${isModal ? styles.modalArticle : ''}`}>
            <div className={styles.articleContainer}>

                {/* Article Content */}
                <main className={styles.articleContent}>
                        {article.content}
                </main>
            </div>
        </div>
    );
}