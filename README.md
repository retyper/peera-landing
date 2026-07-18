# peera-landing

피어라(Peera) 출시 전 **이메일 사전예약 랜딩페이지**. 정적 페이지 하나(`index.html`).
감정카드 앱의 피어라 CTA가 이 페이지로 연결된다.

## 도메인 & 배포

앱은 **커스텀 도메인 `https://peera.app/`** 에 하드코딩돼 있다(`PeeoraFunnel.destinationUrl`).
도메인을 고정해 두면 호스트를 나중에 바꿔도 앱 재빌드가 필요 없다 — DNS만 옮기면 된다.

**공통**: `peera.app` 도메인을 등록한다. 랜딩이 **도메인 루트(`peera.app/`)** 로 열려야 앱 링크와 맞는다.

### 옵션 A — GitHub Pages
1. GitHub에 공개 레포(예: `peera-landing`)를 만들고 이 폴더를 push.
2. **Settings → Pages → Source: `main` / `/root`**.
3. **Settings → Pages → Custom domain**에 `peera.app` 입력(레포에 `CNAME` 파일 생성) +
   등록업체 DNS에 GitHub Pages A 레코드(또는 `<user>.github.io` CNAME) 설정. HTTPS 적용까지 대기.

### 옵션 B — Vercel (프리뷰 배포·분석 등 편의)
1. Vercel에서 이 레포를 Import(정적 사이트 자동 인식).
2. **Project → Settings → Domains**에 `peera.app` 추가 → 안내대로 DNS 설정.

## 이메일 수집 연결 (Formspree, 무료)

`index.html`의 폼은 [Formspree](https://formspree.io)로 이메일을 보낸다. 설치:

1. formspree.io 가입 → 새 form 생성(수신 이메일: retyper@naver.com 등).
2. 받은 엔드포인트(예: `https://formspree.io/f/abcdwxyz`)를 복사.
3. `index.html`에서 `action="https://formspree.io/f/YOUR_FORM_ID"` 의
   `YOUR_FORM_ID`를 그 주소로 교체.

> 연결 전에는 폼 제출 시 "아직 폼이 연결되지 않았어요" 안내가 뜬다.
> Google Forms 링크로 대체하고 싶으면 폼 대신 버튼 하나로 바꿔도 된다.

## 구성

- `index.html` — 랜딩페이지(HTML·CSS·JS 인라인, 폰트만 CDN).
- `peera-sprout.png` — 브랜드 이미지(감정카드 앱의 피어라 새싹에서 가져옴).
