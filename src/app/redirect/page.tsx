'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function RedirectPage() {
    const searchParams = useSearchParams();
    const [showFallback, setShowFallback] = useState(false);
    
    const webUrl = searchParams.get('url') || '';
    const cleanedLink = searchParams.get('link') || '';
    const platform = searchParams.get('platform') || 'android';
    
    useEffect(() => {
        if (!webUrl || !cleanedLink) {
            window.location.href = '/';
            return;
        }

        if (platform === 'android') {
            openYouTubeAndroid();
        } else if (platform === 'ios') {
            openYouTubeiOS();
        } else {
            // 기본값: 웹에서 열기
            window.location.href = webUrl;
        }
    }, [webUrl, cleanedLink, platform]);

    const openYouTubeAndroid = () => {
        try {
            const youtubeUrl = `youtube://${cleanedLink}`;
            const intentUrl = `intent://${cleanedLink}#Intent;scheme=youtube;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
            
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
                        window.open(webUrl, '_blank');
                    } catch (e) {
                        console.log('외부 브라우저 열기 실패:', e);
                    }
                }
            }, 2500);
            
            // 최종 fallback: fallback 버튼 표시 및 웹 버전으로 이동
            setTimeout(() => {
                if (!appOpened) {
                    setShowFallback(true);
                    window.location.href = webUrl;
                }
            }, 3500);
            
            // 페이지 visibility 변경 감지 (앱이 열렸는지 확인)
            const handleVisibilityChange = () => {
                if (document.hidden) {
                    appOpened = true;
                }
            };
            
            // 포커스 잃음 감지 (앱이 열렸는지 확인)
            const handleBlur = () => {
                appOpened = true;
            };
            
            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('blur', handleBlur);
            
            // 클린업
            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('blur', handleBlur);
            };
            
        } catch (error) {
            console.error('YouTube 앱 열기 실패:', error);
            window.location.href = webUrl;
        }
    };

    const openYouTubeiOS = () => {
        try {
            const youtubeUrl = `youtube://${cleanedLink}`;
            
            let appOpened = false;
            
            // iOS YouTube 앱 열기 시도
            setTimeout(() => {
                if (!appOpened) {
                    try {
                        window.location.href = youtubeUrl;
                    } catch (e) {
                        console.log('YouTube URL 스키마 실패:', e);
                    }
                }
            }, 100);
            
            // 앱이 열리지 않으면 웹 버전으로 이동
            setTimeout(() => {
                if (!appOpened) {
                    window.location.href = webUrl;
                }
            }, 2000);
            
            // 페이지 visibility 변경 감지
            const handleVisibilityChange = () => {
                if (document.hidden) {
                    appOpened = true;
                }
            };
            
            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
            
        } catch (error) {
            console.error('YouTube 앱 열기 실패:', error);
            window.location.href = webUrl;
        }
    };

    // 뒤로 가기 방지
    useEffect(() => {
        const preventGoBack = () => {
            history.pushState(null, null, location.href);
        };
        
        preventGoBack();
        window.addEventListener('popstate', preventGoBack);
        
        return () => {
            window.removeEventListener('popstate', preventGoBack);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
            <div className="bg-white max-w-md w-full p-8 rounded-xl shadow-lg text-center">
                <div className="mb-6">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <h1 className="text-xl font-semibold text-gray-800 mb-2">
                        {platform === 'ios' ? 'YouTube 앱으로 이동중...' : 'YouTube 앱으로 이동중...'}
                    </h1>
                    <p className="text-gray-600 text-sm">
                        잠시만 기다려주세요
                    </p>
                </div>
                
                {showFallback && (
                    <div className="mt-6">
                        <a 
                            href={webUrl}
                            className="inline-block bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            브라우저에서 열기
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
