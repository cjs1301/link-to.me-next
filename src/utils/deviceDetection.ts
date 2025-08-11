/**
 * 디바이스 및 브라우저 감지 유틸리티
 */

/**
 * User-Agent와 헤더에서 디바이스 타입 확인
 */
export const getDeviceType = (userAgent: string): string => {
    const ua = userAgent.toLowerCase();

    // 모바일 디바이스 감지
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";

    // 데스크탑 감지 (기본값)
    return "desktop";
};

/**
 * User-Agent에서 인앱브라우저 감지
 */
export const isInAppBrowser = (userAgent: string): boolean => {
    const inAppPatterns = [
        "FBAN",
        "FBAV", // Facebook
        "Instagram", // Instagram
        "KAKAOTALK", // KakaoTalk
        "Line/", // Line
        "wv", // WebView 일반적인 패턴
        "Version/.*Mobile.*Safari", // 모바일 Safari (인앱일 가능성)
    ];

    return inAppPatterns.some((pattern) => new RegExp(pattern, "i").test(userAgent));
};

/**
 * 소셜 미디어 크롤러 감지
 */
export const isSocialCrawler = (userAgent: string): boolean => {
    const crawlerPatterns = [
        "facebookexternalhit", // Facebook
        "Twitterbot", // Twitter
        "LinkedInBot", // LinkedIn
        "WhatsApp", // WhatsApp
        "TelegramBot", // Telegram
        "Slackbot", // Slack
        "KakaoTalk", // KakaoTalk
        "discord", // Discord
        "Applebot", // Apple
        "GoogleBot", // Google
    ];

    return crawlerPatterns.some((pattern) => new RegExp(pattern, "i").test(userAgent));
};
