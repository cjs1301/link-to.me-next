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
const getDeviceType = (userAgent: string): string => {
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
            // iOS의 경우 youtube:// 스키마 사용 (람다와 동일)
            return `youtube://${cleanedLink}`;

        case "android":
            // Android 인앱브라우저에서 YouTube 앱 열기
            const isInApp = isInAppBrowser(userAgent);

            if (isInApp) {
                // 인앱브라우저인 경우 HTML 응답이 필요함을 표시
                return "ANDROID_INAPP_HTML_NEEDED";
            } else {
                // 일반 브라우저에서는 바로 intent URL로 리다이렉트
                if (hasYoutubeDomain) {
                    // YouTube URL인 경우 watch?v= 형태로 변환
                    if (cleanedLink.includes("youtube.com/watch")) {
                        // 전체 쿼리 파라미터 보존
                        const queryStart = cleanedLink.indexOf("?");
                        const queryString = queryStart !== -1 ? cleanedLink.substring(queryStart) : "";
                        return `intent://www.youtube.com/watch${queryString}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
                    } else if (cleanedLink.includes("youtube.com/playlist")) {
                        // 플레이리스트 쿼리 파라미터 보존
                        const queryStart = cleanedLink.indexOf("?");
                        const queryString = queryStart !== -1 ? cleanedLink.substring(queryStart) : "";
                        return `intent://www.youtube.com/playlist${queryString}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
                    } else if (cleanedLink.includes("youtu.be/")) {
                        // youtu.be 링크를 완전한 YouTube URL로 변환
                        const parts = cleanedLink.split("youtu.be/")[1];
                        const [videoId, ...queryParts] = parts.split("?");
                        const additionalParams = queryParts.length > 0 ? `&${queryParts.join("&")}` : "";
                        return `intent://www.youtube.com/watch?v=${videoId}${additionalParams}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
                    }
                }

                // 기본 YouTube 앱 연결
                return `intent://www.youtube.com/${cleanedLink}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
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
 * 리다이렉트 페이지 URL 생성
 */
const createRedirectPageUrl = (webUrl: string, cleanedLink: string, platform: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const params = new URLSearchParams({
        url: webUrl,
        link: cleanedLink,
        platform: platform,
    });
    return `${baseUrl}/redirect?${params.toString()}`;
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
        const deviceType = getDeviceType(userAgent);
        const redirectLocation = createRedirectUrl(originalLink, deviceType, userAgent);

        console.log("Device Type:", deviceType);
        console.log("Redirect Location:", redirectLocation);

        // Android 인앱브라우저의 경우 리다이렉트 페이지로 이동
        if (redirectLocation === "ANDROID_INAPP_HTML_NEEDED") {
            const cleanedLink = originalLink.replace(/^\//, "").replace(/^https?:\/\//, "");
            const hasYoutubeDomain =
                cleanedLink.includes("youtube.com") || cleanedLink.includes("youtu.be");
            const webUrl = hasYoutubeDomain
                ? `https://${cleanedLink}`
                : `${YOUTUBE_WEB}${cleanedLink}`;

            const redirectPageUrl = createRedirectPageUrl(webUrl, cleanedLink, "android");
            return NextResponse.redirect(redirectPageUrl, 302);
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
