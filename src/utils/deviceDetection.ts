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
 * User-Agent에서 인앱브라우저 감지 (개선된 로직)
 */
export const isInAppBrowser = (userAgent: string): boolean => {
    const ua = userAgent.toLowerCase();

    // 명확한 인앱브라우저 패턴들
    const inAppPatterns = [
        "fban", // Facebook
        "fbav", // Facebook
        "instagram", // Instagram
        "kakaotalk", // KakaoTalk
        "line/", // Line
        "naver", // Naver
        "whale", // Naver Whale
        "discord", // Discord
        "telegram", // Telegram
        "whatsapp", // WhatsApp
        "twitterandroid", // Twitter Android
        "linkedinapp", // LinkedIn
    ];

    // WebView 패턴 (더 정교한 감지)
    const webViewPatterns = [
        "; wv\\)", // Android WebView 표준 패턴 (괄호 이스케이프)
        "version/.* mobile.* safari.*wv", // iOS WebView
    ];

    // 명확한 인앱브라우저 확인
    const isDefiniteInApp = inAppPatterns.some((pattern) => ua.includes(pattern));

    // WebView 패턴 확인
    const isWebView = webViewPatterns.some((pattern) => new RegExp(pattern, "i").test(ua));

    // 일반 브라우저 제외 (false positive 방지)
    const isStandardBrowser =
        (ua.includes("chrome/") && !ua.includes("; wv)")) ||
        ua.includes("firefox/") ||
        (ua.includes("safari/") && !ua.includes("version/")) ||
        ua.includes("edge/");

    console.log("인앱브라우저 감지:", {
        userAgent: userAgent,
        isDefiniteInApp,
        isWebView,
        isStandardBrowser,
        result: isDefiniteInApp || (isWebView && !isStandardBrowser),
    });

    return isDefiniteInApp || (isWebView && !isStandardBrowser);
};

/**
 * 소셜 미디어 크롤러 감지 (인앱브라우저와 구분)
 */
export const isSocialCrawler = (userAgent: string): boolean => {
    const ua = userAgent.toLowerCase();

    // 실제 크롤러/봇 패턴들 (사용자 브라우저가 아닌)
    const crawlerPatterns = [
        "facebookexternalhit", // Facebook 크롤러
        "twitterbot", // Twitter 봇
        "linkedinbot", // LinkedIn 봇
        "telegrambot", // Telegram 봇
        "slackbot", // Slack 봇
        "discordbot", // Discord 봇
        "applebot", // Apple 봇
        "googlebot", // Google 봇
        "bingbot", // Bing 봇
        "yandexbot", // Yandex 봇
        "baiduspider", // Baidu 봇
    ];

    // 인앱브라우저 패턴은 제외 (실제 사용자이므로)
    const isInAppBrowser =
        (ua.includes("kakaotalk") && ua.includes("inapp")) ||
        (ua.includes("line/") && ua.includes("mobile")) ||
        (ua.includes("whatsapp") && ua.includes("mobile"));

    const isCrawler = crawlerPatterns.some((pattern) => ua.includes(pattern));

    console.log("소셜 크롤러 감지:", {
        userAgent: userAgent,
        isCrawler,
        isInAppBrowser,
        result: isCrawler && !isInAppBrowser,
    });

    // 크롤러이면서 인앱브라우저가 아닌 경우에만 true
    return isCrawler && !isInAppBrowser;
};
