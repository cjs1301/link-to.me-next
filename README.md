# 🔗 Link-To-Me (Next.js 15)

YouTube 링크 리다이렉션 서비스 - 최신 기술 스택으로 구현

## 🚀 기술 스택

-   **Next.js 15.4.6** (App Router)
-   **React 19.1.0**
-   **TypeScript 5**
-   **Node.js 22**
-   **Turbopack** (개발 환경)
-   **Vercel** (배포)

## 📱 지원 기능

### 디바이스별 최적화된 리다이렉션

-   **iOS**: `youtube://` 스키마로 앱 직접 열기
-   **Android 일반 브라우저**: `intent://` URL로 앱 열기
-   **Android 인앱브라우저**: HTML 페이지로 다단계 앱 열기 시도
-   **Desktop**: YouTube 웹사이트로 리다이렉션

### 인앱브라우저 지원

-   Facebook, Instagram, KakaoTalk, Line 등 인앱브라우저 감지
-   각 환경에 최적화된 앱 열기 방식 제공
-   Fallback 메커니즘으로 안정성 보장

## 🏗️ API 라우팅

```
GET /api/[...path]
```

### 사용 예시

```
https://yourdomain.com/api/watch?v=dQw4w9WgXcQ
→ iOS: youtube://watch?v=dQw4w9WgXcQ
→ Android: intent://watch?v=dQw4w9WgXcQ#Intent;...
→ Desktop: https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## 🛠️ 개발 환경 실행

```bash
# 개발 서버 시작 (Turbopack 사용)
npm run dev

# 빌드
npm run build

# 프로덕션 서버 시작
npm run start

# 린팅
npm run lint
```

## 🌐 Vercel 배포

### 1. Vercel CLI 설치 및 로그인

```bash
npm i -g vercel
vercel login
```

### 2. 프로젝트 배포

```bash
vercel
```

### 3. 프로덕션 배포

```bash
vercel --prod
```

## ⚙️ 환경 설정

### Vercel 설정 (`vercel.json`)

-   **Node.js 22** 런타임 사용
-   API Routes 최적화
-   캐시 비활성화 (실시간 리다이렉션 보장)

### TypeScript 설정

-   최신 TypeScript 5 기능 활용
-   Next.js 15 타입 지원
-   엄격한 타입 체크

## 🔄 Lambda에서 마이그레이션

기존 AWS Lambda 함수에서 Next.js로 성공적으로 마이그레이션:

### 주요 변경사항

1. **CloudFront 헤더** → **User-Agent 기반 디바이스 감지**
2. **Lambda 핸들러** → **Next.js App Router API**
3. **AWS 런타임** → **Vercel Edge Functions**
4. **Node.js 18** → **Node.js 22**

### 기능 개선

-   더 정확한 디바이스 감지
-   향상된 인앱브라우저 지원
-   더 빠른 응답 시간 (Edge Computing)
-   간편한 배포 프로세스

## 📊 모니터링

Vercel 대시보드에서 실시간 모니터링:

-   API 응답 시간
-   에러율
-   디바이스별 사용 통계
-   지역별 접속 현황

---

**최신 기술 스택으로 구현된 YouTube 리다이렉션 서비스 🎯**
