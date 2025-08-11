/**
 * HTML 응답 생성 유틸리티
 */

/**
 * 소셜 미디어 크롤러용 HTML 응답 생성
 */
export const generateSocialMetaHtml = (
    metadata: {
        title: string;
        description: string;
        thumbnail: string;
        url: string;
    },
    redirectUrl: string
): string => {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- 기본 메타데이터 -->
    <title>${metadata.title}</title>
    <meta name="description" content="${metadata.description}">
    
    <!-- Open Graph (Facebook, KakaoTalk 등) -->
    <meta property="og:type" content="video.other">
    <meta property="og:title" content="${metadata.title}">
    <meta property="og:description" content="${metadata.description}">
    <meta property="og:image" content="${metadata.thumbnail}">
    <meta property="og:url" content="${metadata.url}">
    <meta property="og:site_name" content="YouTube">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="player">
    <meta name="twitter:title" content="${metadata.title}">
    <meta name="twitter:description" content="${metadata.description}">
    <meta name="twitter:image" content="${metadata.thumbnail}">
    <meta name="twitter:url" content="${metadata.url}">
    
    <!-- 즉시 리다이렉트 (크롤러가 아닌 경우) -->
    <meta http-equiv="refresh" content="0; url=${redirectUrl}">
    
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
        .btn {
            display: inline-block;
            background: #ff0000;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>YouTube로 이동중...</h1>
        <p>잠시만 기다려주세요.</p>
        <a href="${redirectUrl}" class="btn">직접 이동하기</a>
    </div>
    
    <script>
        // JavaScript로도 리다이렉트 (더 빠른 처리)
        setTimeout(() => {
            window.location.href = '${redirectUrl}';
        }, 100);
    </script>
</body>
</html>`;
};
