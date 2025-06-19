
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "light",
    toggleTheme: () => {},
    setTheme: () => {},
});

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

export default function ThemeContextProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // First try to get the theme from localStorage
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme === "light" || savedTheme === "dark") {
                return savedTheme;
            }

            // Otherwise, respect system preferences
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return "dark";
            }
        }

        // Default to light theme
        return "dark";
    });

    useEffect(() => {
        // Apply the current theme to the body element
        document.body.className = theme;
        localStorage.setItem("theme", theme); // Persist the theme
    }, [theme]);

    // Listen for system preference changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            // Only change if user hasn't manually set a preference
            if (!localStorage.getItem("theme")) {
                setTheme(e.matches ? "dark" : "light");
            }
        };

        // Add event listener
        mediaQuery.addEventListener('change', handleChange);

        // Clean up
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    // Create a properly typed setTheme function for the context
    const setThemeContext = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeContext }}>
            {children}
        </ThemeContext.Provider>
    );
}