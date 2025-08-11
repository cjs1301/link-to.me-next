import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getDeviceType, isSocialCrawler } from "@/utils/deviceDetection";
import { getYouTubeMetadata } from "@/utils/youtubeMetadata";
import { generateSocialMetaHtml } from "@/utils/htmlGenerator";
import { createRedirectUrl, createRedirectPageUrl } from "@/utils/urlProcessor";
import { YOUTUBE_WEB } from "@/utils/constants";

// Next.js 라우트 세그먼트 설정 - 캐시 완전 비활성화
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        console.log("Is Social Crawler:", isSocialCrawler(userAgent));

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

        // 소셜 미디어 크롤러 감지 시 메타데이터 포함 HTML 응답
        if (isSocialCrawler(userAgent)) {
            console.log("Social crawler detected:", userAgent);

            const cleanedLink = originalLink.replace(/^\//, "").replace(/^https?:\/\//, "");
            const hasYoutubeDomain =
                cleanedLink.includes("youtube.com") || cleanedLink.includes("youtu.be");
            const webUrl = hasYoutubeDomain
                ? `https://${cleanedLink}`
                : `${YOUTUBE_WEB}${cleanedLink}`;

            try {
                const metadata = await getYouTubeMetadata(webUrl);
                const htmlContent = generateSocialMetaHtml(metadata, redirectLocation);

                return new NextResponse(htmlContent, {
                    status: 200,
                    headers: {
                        "Content-Type": "text/html; charset=utf-8",
                        "Cache-Control": "public, max-age=3600", // 1시간 캐시
                    },
                });
            } catch (error) {
                console.error("메타데이터 처리 실패:", error);
                // 실패 시 일반 리다이렉트로 폴백
            }
        }

        // Android 인앱브라우저의 경우 리다이렉트 페이지로 이동
        if (redirectLocation === "ANDROID_INAPP_HTML_NEEDED") {
            const cleanedLink = originalLink.replace(/^\//, "").replace(/^https?:\/\//, "");
            const hasYoutubeDomain =
                cleanedLink.includes("youtube.com") || cleanedLink.includes("youtu.be");
            const webUrl = hasYoutubeDomain
                ? `https://${cleanedLink}`
                : `${YOUTUBE_WEB}${cleanedLink}`;

            const redirectPageUrl = createRedirectPageUrl(webUrl, cleanedLink, "android", request);
            return NextResponse.redirect(redirectPageUrl, 302);
        }

        // 일반적인 리다이렉트 응답 (캐시 완전 비활성화)
        const response = NextResponse.redirect(redirectLocation, 302);
        response.headers.set(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
        );
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");
        response.headers.set("Surrogate-Control", "no-store");
        response.headers.set("X-Accel-Expires", "0");
        return response;
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
