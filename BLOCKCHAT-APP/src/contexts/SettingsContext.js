import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';

const defaultSettings = {
    theme: 'light',
    font: "'Poppins', sans-serif",
    primaryColor: '#008080',
    accentColor: '#32CD32',
    backgroundTransparencyEnabled: false,
    backgroundTransparencyLevel: 0.15, // Default to 15% transparent
};

export const SettingsContext = createContext({
    settings: defaultSettings,
    saveSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

const hexToRgb = (hex) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem('blockchat-settings');
            if (storedSettings) {
                // Merge stored settings with defaults to ensure new settings are added
                setSettings(prev => ({...prev, ...JSON.parse(storedSettings)}));
            }
        } catch (error) {
            console.error("Failed to parse settings from localStorage", error);
        }
    }, []);

    useEffect(() => {
        if (settings) {
            const { theme, font, primaryColor, accentColor, backgroundTransparencyEnabled, backgroundTransparencyLevel } = settings;
            
            // Apply base settings
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.style.setProperty('--font-family', font);
            document.documentElement.style.setProperty('--primary-color', primaryColor);
            document.documentElement.style.setProperty('--accent-color', accentColor);

            // Handle transparency
            const lightThemeBg = '#F5F5F5';
            const lightThemeSurface = '#FFFFFF';
            const darkThemeBg = '#121212';
            const darkThemeSurface = '#1E1E1E';

            if (backgroundTransparencyEnabled) {
                const alpha = 1 - (backgroundTransparencyLevel || 0.15); // 0 to 1, where 1 is opaque
                const bgHex = theme === 'dark' ? darkThemeBg : lightThemeBg;
                const surfaceHex = theme === 'dark' ? darkThemeSurface : lightThemeSurface;
                
                const bgRgb = hexToRgb(bgHex);
                const surfaceRgb = hexToRgb(surfaceHex);

                if (bgRgb) {
                    document.documentElement.style.setProperty('--background-color', `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${alpha})`);
                }
                if (surfaceRgb) {
                    document.documentElement.style.setProperty('--surface-color', `rgba(${surfaceRgb.r}, ${surfaceRgb.g}, ${surfaceRgb.b}, ${alpha})`);
                }
            } else {
                // Remove the inline style property, so it falls back to the stylesheet definition
                document.documentElement.style.removeProperty('--background-color');
                document.documentElement.style.removeProperty('--surface-color');
            }

            localStorage.setItem('blockchat-settings', JSON.stringify(settings));
        }
    }, [settings]);

    const saveSettings = (newSettings) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            ...newSettings,
        }));
    };

    const value = useMemo(() => ({ settings, saveSettings }), [settings]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};