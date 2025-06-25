'use client';

import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
    structuredData?: object;
}

const SEO = ({
    title = "NFC Business Card - Digital Networking Made Simple",
    description = "Share your business card digitally with NFC and QR codes. Create professional digital business cards, manage connections, and network efficiently with our modern PWA.",
    keywords = "nfc business card, digital business card, qr code, networking, digital networking, business card app, contact sharing, professional networking, mobile business card, smart business card",
    canonicalUrl = "https://nfc-business-card.vercel.app",
    ogImage = "https://nfc-business-card.vercel.app/icon-512x512.png",
    ogType = "website",
    twitterCard = "summary_large_image",
    structuredData
}: SEOProps) => {
    const fullTitle = title.includes("NFC Business Card") ? title : `${title} | NFC Business Card`;

    const defaultStructuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "NFC Business Card",
        "description": description,
        "url": canonicalUrl,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser, Android, iOS",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "creator": {
            "@type": "Organization",
            "name": "NFC Business Card",
            "url": canonicalUrl
        },
        "featureList": [
            "NFC Card Sharing",
            "QR Code Generation",
            "Digital Business Cards",
            "Contact Management",
            "Offline Support",
            "Progressive Web App"
        ],
        "screenshot": "https://nfc-business-card.vercel.app/icon-512x512.png",
        "downloadUrl": canonicalUrl,
        "installUrl": canonicalUrl,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "150"
        }
    };

    const finalStructuredData = structuredData || defaultStructuredData;

    useEffect(() => {
        // Update document title
        document.title = fullTitle;

        // Update meta description
        const updateOrCreateMeta = (name: string, content: string, property?: string) => {
            const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
            let meta = document.querySelector(selector) as HTMLMetaElement;

            if (!meta) {
                meta = document.createElement('meta');
                if (property) {
                    meta.setAttribute('property', name);
                } else {
                    meta.setAttribute('name', name);
                }
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        // Basic meta tags
        updateOrCreateMeta('description', description);
        updateOrCreateMeta('keywords', keywords);
        updateOrCreateMeta('author', 'NFC Business Card');
        updateOrCreateMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        updateOrCreateMeta('theme-color', '#6366f1');
        updateOrCreateMeta('msapplication-TileColor', '#6366f1');
        updateOrCreateMeta('application-name', 'NFC Business Card');
        updateOrCreateMeta('apple-mobile-web-app-title', 'NFC Business Card');
        updateOrCreateMeta('apple-mobile-web-app-capable', 'yes');
        updateOrCreateMeta('apple-mobile-web-app-status-bar-style', 'default');
        updateOrCreateMeta('format-detection', 'telephone=no');
        updateOrCreateMeta('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');

        // Open Graph tags (Facebook, LinkedIn, etc.)
        updateOrCreateMeta('og:type', ogType, true);
        updateOrCreateMeta('og:url', canonicalUrl, true);
        updateOrCreateMeta('og:title', fullTitle, true);
        updateOrCreateMeta('og:description', description, true);
        updateOrCreateMeta('og:image', ogImage, true);
        updateOrCreateMeta('og:image:alt', 'NFC Business Card - Digital Networking App', true);
        updateOrCreateMeta('og:image:width', '512', true);
        updateOrCreateMeta('og:image:height', '512', true);
        updateOrCreateMeta('og:image:type', 'image/png', true);
        updateOrCreateMeta('og:site_name', 'NFC Business Card', true);
        updateOrCreateMeta('og:locale', 'en_US', true);
        updateOrCreateMeta('og:updated_time', new Date().toISOString(), true);

        // Twitter Card tags
        updateOrCreateMeta('twitter:card', twitterCard, true);
        updateOrCreateMeta('twitter:url', canonicalUrl, true);
        updateOrCreateMeta('twitter:title', fullTitle, true);
        updateOrCreateMeta('twitter:description', description, true);
        updateOrCreateMeta('twitter:image', ogImage, true);
        updateOrCreateMeta('twitter:image:alt', 'NFC Business Card - Digital Networking App', true);
        updateOrCreateMeta('twitter:site', '@nfcbusinesscard', true);
        updateOrCreateMeta('twitter:creator', '@nfcbusinesscard', true);
        updateOrCreateMeta('twitter:domain', 'nfc-business-card.vercel.app', true);

        // Additional social media optimizations
        updateOrCreateMeta('fb:app_id', '1234567890123456', true); // Replace with your Facebook App ID
        updateOrCreateMeta('article:author', 'NFC Business Card', true);
        updateOrCreateMeta('article:publisher', 'https://www.facebook.com/nfcbusinesscard', true);

        // LinkedIn specific
        updateOrCreateMeta('linkedin:owner', 'nfc-business-card', true);

        // Pinterest
        updateOrCreateMeta('pinterest:title', fullTitle, true);
        updateOrCreateMeta('pinterest:description', description, true);
        updateOrCreateMeta('pinterest:image', ogImage, true);

        // WhatsApp sharing
        updateOrCreateMeta('whatsapp:title', fullTitle, true);
        updateOrCreateMeta('whatsapp:description', description, true);
        updateOrCreateMeta('whatsapp:image', ogImage, true);

        // Update canonical link
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', canonicalUrl);

        // Update structured data
        let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
        if (!structuredDataScript) {
            structuredDataScript = document.createElement('script');
            structuredDataScript.setAttribute('type', 'application/ld+json');
            document.head.appendChild(structuredDataScript);
        }
        structuredDataScript.textContent = JSON.stringify(finalStructuredData);

    }, [fullTitle, description, keywords, canonicalUrl, ogImage, ogType, twitterCard, finalStructuredData]);

    return null; // This component doesn't render anything visible
};

export default SEO; 