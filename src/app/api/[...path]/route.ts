/**
 * Next.js 15 App Router API Route
 * 디바이스 타입 확인 및 YouTube 리다이렉트 처리
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

const YOUTUBE_WEB = "https://www.youtube.com/";

/**
 * User-Agent와 헤더에서 디바이스 타입 확인
 */
const getDeviceType = (userAgent: string, headersList: Headers): string => {
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
const isInAppBrowser = (userAgent: string): boolean => {
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
 * URL 정리 및 리다이렉트 URL 생성
 */
const createRedirectUrl = (rawUrl: string, deviceType: string, userAgent: string): string => {
    // 앞쪽 슬래시 제거
    let cleanedLink = rawUrl.replace(/^\//, "");

    // 유효하지 않은 URL 체크
    if (!cleanedLink || cleanedLink === ".env") {
        return YOUTUBE_WEB;
    }

    // URL 정규화 - 프로토콜 제거
    cleanedLink = cleanedLink.replace(/^https?:\/\//, "");

    // youtube.com이나 youtu.be가 이미 포함되어 있는지 확인
    const hasYoutubeDomain =
        cleanedLink.includes("youtube.com") || cleanedLink.includes("youtu.be");

    // 최종 웹 URL 생성
    const webUrl = hasYoutubeDomain ? `https://${cleanedLink}` : `${YOUTUBE_WEB}${cleanedLink}`;

    // 디바이스 타입별 URL 생성
    switch (deviceType) {
        case "ios":
            // iOS의 경우 youtube:// 스키마 사용
            return `youtube://${cleanedLink}`;

        case "android":
            // Android 인앱브라우저에서 YouTube 앱 열기
            const isInApp = isInAppBrowser(userAgent);

            if (isInApp) {
                // 인앱브라우저인 경우 HTML 응답이 필요함을 표시
                return "ANDROID_INAPP_HTML_NEEDED";
            } else {
                // 일반 브라우저인 경우 간단한 intent 사용
                return `intent://${cleanedLink}#Intent;scheme=youtube;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(
                    webUrl
                )};end`;
            }

        default:
            // 데스크탑의 경우 항상 웹 버전으로 (더 정확한 URL 처리)
            // 쿼리 파라미터 보존
            const [path, query] = cleanedLink.split("?");
            const queryString = query ? `?${query}` : "";

            // YouTube 단축 URL (youtu.be) 처리
            if (path.startsWith("youtu.be/")) {
                return `https://${path}${queryString}`;
            }

            // 일반 YouTube URL 처리
            if (hasYoutubeDomain) {
                return `https://${path}${queryString}`;
            }

            // YouTube 도메인이 없는 경우 youtube.com에 추가
            return `${YOUTUBE_WEB}${path}${queryString}`;
    }
};

/**
 * Android 인앱브라우저용 HTML 응답 생성
 */
const generateAndroidInAppHtml = (webUrl: string, cleanedLink: string): string => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube로 이동중...</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center; 
            padding: 50px 20px; 
            background: #f8f9fa;
            margin: 0;
        }
        .container { 
            max-width: 400px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .loading { 
            margin: 20px 0; 
            font-size: 18px; 
            color: #333;
        }
        .fallback-btn { 
            display: inline-block; 
            background: #ff0000; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin-top: 20px;
            font-weight: 500;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #ff0000;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <div class="loading">YouTube 앱으로 이동중...</div>
        <a href="${webUrl}" class="fallback-btn" id="fallbackBtn" style="display: none;">
            브라우저에서 열기
        </a>
    </div>
    
    <script>
        function openYouTube() {
            try {
                // YouTube 앱 열기 시도 - 다양한 방법 사용
                const youtubeUrl = 'youtube://${cleanedLink}';
                const intentUrl = 'intent://${cleanedLink}#Intent;scheme=youtube;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(
        webUrl
    )};end';
                
                let appOpened = false;
                
                // 첫 번째 시도: youtube:// 스키마
                setTimeout(() => {
                    if (!appOpened) {
                        try {
                            window.location.href = youtubeUrl;
                        } catch (e) {
                            console.log('YouTube URL 스키마 실패:', e);
                        }
                    }
                }, 100);
                
                // 두 번째 시도: intent URL
                setTimeout(() => {
                    if (!appOpened) {
                        try {
                            window.location.href = intentUrl;
                        } catch (e) {
                            console.log('Intent URL 실패:', e);
                        }
                    }
                }, 1500);
                
                // 세 번째 시도: 외부 브라우저에서 열기
                setTimeout(() => {
                    if (!appOpened) {
                        try {
                            window.open('${webUrl}', '_blank');
                        } catch (e) {
                            console.log('외부 브라우저 열기 실패:', e);
                        }
                    }
                }, 2500);
                
                // 최종 fallback: 현재 창에서 웹 버전 열기
                setTimeout(() => {
                    if (!appOpened) {
                        document.getElementById('fallbackBtn').style.display = 'inline-block';
                        window.location.href = '${webUrl}';
                    }
                }, 3500);
                
                // 페이지 visibility 변경 감지 (앱이 열렸는지 확인)
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        appOpened = true;
                    }
                });
                
                // 포커스 잃음 감지 (앱이 열렸는지 확인)
                window.addEventListener('blur', () => {
                    appOpened = true;
                });
                
            } catch (error) {
                console.error('YouTube 앱 열기 실패:', error);
                window.location.href = '${webUrl}';
            }
        }
        
        // 페이지 로드 시 즉시 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', openYouTube);
        } else {
            openYouTube();
        }
        
        // 뒤로 가기 방지
        history.pushState(null, null, location.href);
        window.addEventListener('popstate', () => {
            history.pushState(null, null, location.href);
        });
    </script>
</body>
</html>`;
};

/**
 * GET 요청 핸들러
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || "";

        // URL 경로 재구성
        const rawPath = `/${path?.join("/") || ""}`;
        const searchParams = request.nextUrl.searchParams;
        const rawQueryString = searchParams.toString();

        console.log("Raw Path:", rawPath);
        console.log("Query String:", rawQueryString);
        console.log("User Agent:", userAgent);

        // 루트 경로 처리
        if (!rawPath || rawPath === "/") {
            return NextResponse.redirect(YOUTUBE_WEB, 302);
        }

        // URL 처리 및 리다이렉트
        const originalLink = `${rawPath}${rawQueryString ? `?${rawQueryString}` : ""}`;
        const deviceType = getDeviceType(userAgent, headersList);
        const redirectLocation = createRedirectUrl(originalLink, deviceType, userAgent);

        console.log("Device Type:", deviceType);
        console.log("Redirect Location:", redirectLocation);

        // Android 인앱브라우저의 경우 HTML 응답 반환
        if (redirectLocation === "ANDROID_INAPP_HTML_NEEDED") {
            const cleanedLink = originalLink.replace(/^\//, "").replace(/^https?:\/\//, "");
            const hasYoutubeDomain =
                cleanedLink.includes("youtube.com") || cleanedLink.includes("youtu.be");
            const webUrl = hasYoutubeDomain
                ? `https://${cleanedLink}`
                : `${YOUTUBE_WEB}${cleanedLink}`;

            const htmlContent = generateAndroidInAppHtml(webUrl, cleanedLink);

            return new NextResponse(htmlContent, {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                },
            });
        }

        // 일반적인 리다이렉트 응답
        return NextResponse.redirect(redirectLocation, 302);
    } catch (error) {
        console.error("Error in redirect handler:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * 다른 HTTP 메서드들도 동일하게 처리
 */
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;
export const HEAD = GET;
export const OPTIONS = GET;
