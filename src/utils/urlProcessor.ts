/**
 * URL 처리 및 리다이렉트 URL 생성 유틸리티
 */

import { NextRequest } from "next/server";
import { YOUTUBE_WEB } from "./constants";

/**
 * 안드로이드용 Intent URL 생성 (향상된 호환성)
 */
const generateAndroidIntentUrl = (
    cleanedLink: string,
    webUrl: string,
    hasYoutubeDomain: boolean
): string => {
    try {
        if (hasYoutubeDomain) {
            // YouTube URL인 경우 타입별 처리
            if (cleanedLink.includes("youtube.com/watch")) {
                // 일반 동영상 링크
                const queryStart = cleanedLink.indexOf("?");
                const queryString = queryStart !== -1 ? cleanedLink.substring(queryStart) : "";
                return `intent://www.youtube.com/watch${queryString}#Intent;scheme=https;package=com.google.android.youtube;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
                    webUrl
                )};end`;
            } else if (cleanedLink.includes("youtube.com/playlist")) {
                // 플레이리스트 링크
                const queryStart = cleanedLink.indexOf("?");
                const queryString = queryStart !== -1 ? cleanedLink.substring(queryStart) : "";
                return `intent://www.youtube.com/playlist${queryString}#Intent;scheme=https;package=com.google.android.youtube;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
                    webUrl
                )};end`;
            } else if (cleanedLink.includes("youtu.be/")) {
                // youtu.be 단축 링크 처리 (향상된 파싱)
                const parts = cleanedLink.split("youtu.be/")[1];
                if (parts) {
                    const [videoId, ...queryParts] = parts.split("?");
                    const additionalParams =
                        queryParts.length > 0 ? `&${queryParts.join("&")}` : "";
                    return `intent://www.youtube.com/watch?v=${videoId}${additionalParams}#Intent;scheme=https;package=com.google.android.youtube;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
                        webUrl
                    )};end`;
                }
            } else if (
                cleanedLink.includes("youtube.com/channel/") ||
                cleanedLink.includes("youtube.com/c/") ||
                cleanedLink.includes("youtube.com/@")
            ) {
                // 채널 링크
                return `intent://www.youtube.com/${cleanedLink}#Intent;scheme=https;package=com.google.android.youtube;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
                    webUrl
                )};end`;
            }
        }

        // 기본 YouTube 앱 연결 (개선된 형태)
        const finalLink = cleanedLink.startsWith("youtube.com/")
            ? cleanedLink
            : `youtube.com/${cleanedLink}`;
        return `intent://www.${finalLink}#Intent;scheme=https;package=com.google.android.youtube;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
            webUrl
        )};end`;
    } catch (error) {
        console.error("Intent URL 생성 중 오류:", error);
        // 오류 발생 시 기본 웹 URL 반환
        return webUrl;
    }
};

/**
 * URL 정리 및 리다이렉트 URL 생성
 */
export const createRedirectUrl = (rawUrl: string, deviceType: string): string => {
    // 앞쪽 슬래시 제거
    let cleanedLink = rawUrl.replace(/^\//, "");

    // 유효하지 않은 URL 체크
    if (!cleanedLink || cleanedLink === ".env") {
        return YOUTUBE_WEB;
    }

    // URL 정규화 - 프로토콜 제거 (더 안전한 처리)
    // https:/ 또는 http:/ (슬래시 하나 빠진 경우도 처리)
    cleanedLink = cleanedLink.replace(/^https?:\/?\/?/, "");

    // 이중 슬래시 제거
    cleanedLink = cleanedLink.replace(/\/+/g, "/");

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
            // Android에서는 인앱브라우저든 일반 브라우저든 바로 Intent URL로 시도
            console.log("Android 감지 - Intent URL로 직접 리다이렉트 시도");
            return generateAndroidIntentUrl(cleanedLink, webUrl, hasYoutubeDomain);

        default:
            // 데스크탑의 경우 항상 웹 버전으로 (원본 URL 그대로 사용)
            if (hasYoutubeDomain) {
                // YouTube 도메인이 있는 경우 https:// 추가하여 완전한 URL 반환
                return `https://${cleanedLink}`;
            }

            // YouTube 도메인이 없는 경우 youtube.com에 추가
            return `${YOUTUBE_WEB}${cleanedLink}`;
    }
};

/**
 * 리다이렉트 페이지 URL 생성
 */
export const createRedirectPageUrl = (
    webUrl: string,
    cleanedLink: string,
    platform: string,
    request: NextRequest
): string => {
    // 동적으로 baseUrl 생성 (Vercel 환경에서는 요청 헤더로부터)
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

    const params = new URLSearchParams({
        url: webUrl,
        link: cleanedLink,
        platform: platform,
    });
    return `${baseUrl}/redirect?${params.toString()}`;
};
