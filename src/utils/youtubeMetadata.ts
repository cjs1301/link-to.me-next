/**
 * YouTube 메타데이터 처리 유틸리티
 */

/**
 * YouTube URL에서 비디오 ID 추출
 */
export const extractVideoId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
        /(?:youtu\.be\/)([^&\n?#]+)/,
        /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

/**
 * YouTube 메타데이터 가져오기 (간단한 방법 - oEmbed API 사용)
 */
export const getYouTubeMetadata = async (webUrl: string) => {
    try {
        const videoId = extractVideoId(webUrl);
        if (!videoId) {
            return {
                title: "YouTube",
                description: "YouTube에서 동영상을 시청하세요",
                thumbnail: "https://www.youtube.com/img/desktop/yt_1200.png",
                url: webUrl,
            };
        }

        // YouTube oEmbed API 사용
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
            webUrl
        )}&format=json`;
        const response = await fetch(oembedUrl);

        if (response.ok) {
            const data = await response.json();
            return {
                title: data.title || "YouTube",
                description: `${data.author_name}의 동영상`,
                thumbnail:
                    data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                url: webUrl,
            };
        }
    } catch (error) {
        console.error("YouTube 메타데이터 가져오기 실패:", error);
    }

    // 기본값 반환
    return {
        title: "YouTube",
        description: "YouTube에서 동영상을 시청하세요",
        thumbnail: "https://www.youtube.com/img/desktop/yt_1200.png",
        url: webUrl,
    };
};
