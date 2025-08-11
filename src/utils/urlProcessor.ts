/**
 * URL 처리 및 리다이렉트 URL 생성 유틸리티
 */

import { NextRequest } from "next/server";
import { isInAppBrowser } from "./deviceDetection";
import { YOUTUBE_WEB } from "./constants";

/**
 * URL 정리 및 리다이렉트 URL 생성
 */
export const createRedirectUrl = (
    rawUrl: string,
    deviceType: string,
    userAgent: string
): string => {
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
                        const queryString =
                            queryStart !== -1 ? cleanedLink.substring(queryStart) : "";
                        return `intent://www.youtube.com/watch${queryString}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(
                            webUrl
                        )};end`;
                    } else if (cleanedLink.includes("youtube.com/playlist")) {
                        // 플레이리스트 쿼리 파라미터 보존
                        const queryStart = cleanedLink.indexOf("?");
                        const queryString =
                            queryStart !== -1 ? cleanedLink.substring(queryStart) : "";
                        return `intent://www.youtube.com/playlist${queryString}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(
                            webUrl
                        )};end`;
                    } else if (cleanedLink.includes("youtu.be/")) {
                        // youtu.be 링크를 완전한 YouTube URL로 변환
                        const parts = cleanedLink.split("youtu.be/")[1];
                        const [videoId, ...queryParts] = parts.split("?");
                        const additionalParams =
                            queryParts.length > 0 ? `&${queryParts.join("&")}` : "";
                        return `intent://www.youtube.com/watch?v=${videoId}${additionalParams}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(
                            webUrl
                        )};end`;
                    }
                }

                // 기본 YouTube 앱 연결
                return `intent://www.youtube.com/${cleanedLink}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(
                    webUrl
                )};end`;
            }

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
