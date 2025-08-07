"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function RedirectPage() {
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
            const youtubeUrl = `youtube://${cleanedLink}`;
            const intentUrl = `intent://${cleanedLink}#Intent;scheme=youtube;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(
                webUrl
            )};end`;

            // 첫 번째 시도: Intent URL (가장 안정적)
            try {
                window.location.href = intentUrl;
            } catch (e) {
                console.log("Intent URL 실패:", e);
                // fallback: youtube:// 스키마
                try {
                    window.location.href = youtubeUrl;
                } catch (e2) {
                    console.log("YouTube URL 스키마 실패:", e2);
                    // 최종 fallback: 웹에서 열기
                    window.location.href = webUrl;
                }
            }
        } catch (error) {
            console.error("YouTube 앱 열기 실패:", error);
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
                        <p className="text-gray-600">앱으로 이동중...</p>
                        <p className="text-sm text-gray-500">
                            앱이 열리지 않나요?
                            <button
                                onClick={() => (window.location.href = webUrl)}
                                className="text-red-500 hover:text-red-600 underline ml-1"
                            >
                                브라우저에서 열기
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
