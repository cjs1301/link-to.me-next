"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RedirectContent() {
    const searchParams = useSearchParams();
    const [appOpened, setAppOpened] = useState(false);

    const webUrl = searchParams.get("url") || "";
    const cleanedLink = searchParams.get("link") || "";
    const platform = searchParams.get("platform") || "android";

    useEffect(() => {
        if (!webUrl || !cleanedLink) {
            window.location.href = "/";
            return;
        }
    }, [webUrl, cleanedLink]);

    const handleOpenYouTubeApp = () => {
        setAppOpened(true);

        if (platform === "android") {
            openYouTubeAndroid();
        } else if (platform === "ios") {
            openYouTubeiOS();
        }
    };

    const openYouTubeAndroid = () => {
        try {
            const link = cleanedLink;
            let intentUrl = "";
            let youtubeSchemeUrl = "";

            console.log("안드로이드 YouTube 앱 열기 시도:", { link, webUrl });

            // URL 타입에 따른 intent URL 및 youtube:// 스키마 URL 생성
            if (link.includes("youtube.com/watch")) {
                // 일반 동영상 링크
                const queryStart = link.indexOf("?");
                const queryString = queryStart !== -1 ? link.substring(queryStart) : "";

                intentUrl = `intent://www.youtube.com/watch${queryString}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(
                    webUrl
                )};end`;
                youtubeSchemeUrl = `youtube://www.youtube.com/watch${queryString}`;
            } else if (link.includes("youtube.com/playlist")) {
                // 플레이리스트 링크
                const queryStart = link.indexOf("?");
                const queryString = queryStart !== -1 ? link.substring(queryStart) : "";

                intentUrl = `intent://www.youtube.com/playlist${queryString}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(
                    webUrl
                )};end`;
                youtubeSchemeUrl = `youtube://www.youtube.com/playlist${queryString}`;
            } else if (link.includes("youtu.be/")) {
                // youtu.be 단축 링크 처리
                const parts = link.split("youtu.be/")[1];
                if (parts) {
                    const [videoId, ...queryParts] = parts.split("?");
                    const additionalParams =
                        queryParts.length > 0 ? `&${queryParts.join("&")}` : "";

                    intentUrl = `intent://www.youtube.com/watch?v=${videoId}${additionalParams}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(
                        webUrl
                    )};end`;
                    youtubeSchemeUrl = `youtube://www.youtube.com/watch?v=${videoId}${additionalParams}`;
                } else {
                    // 잘못된 youtu.be 링크인 경우 웹으로 fallback
                    window.location.href = webUrl;
                    return;
                }
            } else if (
                link.includes("youtube.com/channel/") ||
                link.includes("youtube.com/c/") ||
                link.includes("youtube.com/@")
            ) {
                // 채널 링크
                intentUrl = `intent://www.youtube.com/${link}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(
                    webUrl
                )};end`;
                youtubeSchemeUrl = `youtube://www.youtube.com/${link}`;
            } else {
                // 기타 YouTube 링크
                const cleanLink = link.startsWith("youtube.com/") ? link : `youtube.com/${link}`;
                intentUrl = `intent://www.${cleanLink}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(
                    webUrl
                )};end`;
                youtubeSchemeUrl = `youtube://www.${cleanLink}`;
            }

            console.log("생성된 URLs:", { intentUrl, youtubeSchemeUrl });

            // 다단계 fallback 메커니즘
            const tryOpenApp = async () => {
                // 1단계: Intent URL로 시도 (가장 권장되는 방법)
                try {
                    console.log("1단계: Intent URL 시도");
                    window.location.href = intentUrl;

                    // Intent URL 시도 후 1초 대기
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    // 페이지가 여전히 보이면 2단계로
                    if (!document.hidden) {
                        throw new Error("Intent URL 실패");
                    }
                } catch (e) {
                    console.log("Intent URL 실패, 2단계 시도:", e);

                    // 2단계: youtube:// 스키마로 시도
                    try {
                        console.log("2단계: YouTube 스키마 시도");
                        window.location.href = youtubeSchemeUrl;

                        // 스키마 시도 후 1초 대기
                        await new Promise((resolve) => setTimeout(resolve, 1000));

                        // 여전히 실패하면 3단계로
                        if (!document.hidden) {
                            throw new Error("YouTube 스키마 실패");
                        }
                    } catch (e2) {
                        console.log("YouTube 스키마 실패, 3단계 시도:", e2);

                        // 3단계: Google Play Store로 유도 시도
                        try {
                            console.log("3단계: Play Store 시도");
                            const playStoreUrl = "market://details?id=com.google.android.youtube";
                            window.location.href = playStoreUrl;

                            await new Promise((resolve) => setTimeout(resolve, 1500));

                            // Play Store도 실패하면 웹으로
                            if (!document.hidden) {
                                throw new Error("Play Store 실패");
                            }
                        } catch (e3) {
                            console.log("Play Store 실패, 웹 브라우저로 이동:", e3);
                            // 최종 fallback: 웹에서 열기
                            window.location.href = webUrl;
                        }
                    }
                }
            };

            // 비동기 실행
            tryOpenApp().catch((error) => {
                console.error("모든 시도 실패:", error);
                window.location.href = webUrl;
            });
        } catch (error) {
            console.error("YouTube 앱 열기 중 오류 발생:", error);
            window.location.href = webUrl;
        }
    };

    const openYouTubeiOS = () => {
        try {
            const youtubeUrl = `youtube://${cleanedLink}`;

            // iOS는 youtube:// 스키마로 시도
            try {
                window.location.href = youtubeUrl;
            } catch (e) {
                console.log("YouTube URL 스키마 실패:", e);
                // fallback: 웹에서 열기
                window.location.href = webUrl;
            }
        } catch (error) {
            console.error("YouTube 앱 열기 실패:", error);
            window.location.href = webUrl;
        }
    };

    // 뒤로 가기 방지
    useEffect(() => {
        const preventGoBack = () => {
            history.pushState(null, "", location.href);
        };

        preventGoBack();
        window.addEventListener("popstate", preventGoBack);

        return () => {
            window.removeEventListener("popstate", preventGoBack);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
            <div className="bg-white max-w-md w-full p-8 rounded-xl shadow-lg text-center">
                <div className="mb-8">
                    {/* YouTube 로고 아이콘 */}
                    <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-10 h-10 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M23.498 6.186a2.999 2.999 0 00-2.109-2.109C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.389.531A2.999 2.999 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.999 2.999 0 002.109 2.109C4.495 20.454 12 20.454 12 20.454s7.505 0 9.389-.531a2.999 2.999 0 002.109-2.109C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">YouTube에서 열기</h1>
                    <p className="text-gray-600 text-sm mb-6">
                        {platform === "ios" ? "iOS" : "Android"} YouTube 앱에서 바로 시청하세요
                    </p>
                </div>

                {!appOpened ? (
                    <div className="space-y-4">
                        <button
                            onClick={handleOpenYouTubeApp}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a2.999 2.999 0 00-2.109-2.109C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.389.531A2.999 2.999 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.999 2.999 0 002.109 2.109C4.495 20.454 12 20.454 12 20.454s7.505 0 9.389-.531a2.999 2.999 0 002.109-2.109C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                            </svg>
                            <span>YouTube 앱으로 열기</span>
                        </button>

                        <button
                            onClick={() => (window.location.href = webUrl)}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 px-6 rounded-lg transition-colors"
                        >
                            브라우저에서 열기
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-600">YouTube 앱으로 이동중...</p>
                        <div className="text-sm text-gray-500 space-y-2">
                            <p>앱이 설치되어 있지 않거나 열리지 않는 경우:</p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() =>
                                        (window.location.href =
                                            "market://details?id=com.google.android.youtube")
                                    }
                                    className="text-blue-500 hover:text-blue-600 underline"
                                >
                                    YouTube 앱 설치하기
                                </button>
                                <button
                                    onClick={() => (window.location.href = webUrl)}
                                    className="text-red-500 hover:text-red-600 underline"
                                >
                                    브라우저에서 열기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RedirectPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
                    <div className="bg-white max-w-md w-full p-8 rounded-xl shadow-lg text-center">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">로딩중...</p>
                    </div>
                </div>
            }
        >
            <RedirectContent />
        </Suspense>
    );
}
