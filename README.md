# peera-landing

피어라(Peera) 출시 전 **이메일 사전예약 랜딩페이지**. 정적 페이지 하나(`index.html`).
감정카드 앱의 피어라 CTA가 이 페이지로 연결된다.

## 도메인 & 배포

앱은 **커스텀 도메인 `https://peera.co/`** 에 하드코딩돼 있다(`PeeoraFunnel.destinationUrl`).
도메인을 고정해 두면 호스트를 나중에 바꿔도 앱 재빌드가 필요 없다 — DNS만 옮기면 된다.

**공통**: `peera.co` 도메인을 등록한다. 랜딩이 **도메인 루트(`peera.co/`)** 로 열려야 앱 링크와 맞는다.

### 옵션 A — GitHub Pages
1. GitHub에 공개 레포(예: `peera-landing`)를 만들고 이 폴더를 push.
2. **Settings → Pages → Source: `main` / `/root`**.
3. **Settings → Pages → Custom domain**에 `peera.co` 입력(레포에 `CNAME` 파일 생성) +
   등록업체 DNS에 GitHub Pages A 레코드(또는 `<user>.github.io` CNAME) 설정. HTTPS 적용까지 대기.

### 옵션 B — Vercel (프리뷰 배포·분석 등 편의)
1. Vercel에서 이 레포를 Import(정적 사이트 자동 인식).
2. **Project → Settings → Domains**에 `peera.co` 추가 → 안내대로 DNS 설정.

## 이메일 수집 연결 (Formspree, 무료)

`index.html`의 폼은 [Formspree](https://formspree.io)로 이메일을 보낸다. 설치:

1. formspree.io 가입 → 새 form 생성(수신 이메일: retyper92@gmail.com 등).
2. 받은 엔드포인트(예: `https://formspree.io/f/abcdwxyz`)를 복사.
3. `index.html`에서 `action="https://formspree.io/f/YOUR_FORM_ID"` 의
   `YOUR_FORM_ID`를 그 주소로 교체.

> 연결 전에는 폼 제출 시 "아직 폼이 연결되지 않았어요" 안내가 뜬다.
> Google Forms 링크로 대체하고 싶으면 폼 대신 버튼 하나로 바꿔도 된다.

## 구성

- `index.html` — 랜딩페이지(HTML·CSS·JS 인라인, 폰트만 CDN).
  히어로의 "라이티 통화 → 손글씨 일기" 데모, 라이티 도감, 정서 안전 약속 섹션 포함.
- **라이티는 본품(dearmydiary)의 실제 에셋을 그대로 쓴다** (그린 그림 아님):
  - `writy.riv` + `rive.js` + `rive.wasm` — 본품 VoiceTalk의 라이티 Rive를 **라이브 구동**
    (아트보드 `Artboard`, 스테이트머신 `squirrel_state`, 데모가 isTalking/isListening 입력을 조작).
  - `writy-still.png` — Rive 로드 전/실패 시 폴백 포스터(정지 프레임, 폰 화면 비율).
  - `laity-avatar.png` — 공식 아바타(256px 축소판). 파비콘 + 원형 연락처 사진 스타일로 사용.
  - `plant-bud1/bud3/flower1.png` — 본품의 새싹→꽃 아트(알파 크롭판). 세 걸음 아이콘.
  - `stamp-good.png` — 본품의 "참 잘했어요" 도장. 일기 카드 연출.
- `peera-og.png` — 카톡·문자 공유 미리보기(OG) 1200×630. 실제 라이티 통화 화면 목업 포함.
- `peera-sprout.png` — 예전 새싹 브랜드 이미지(감정카드 앱과의 연결 고리, 보관용).

> 본품 에셋을 갱신하면: dearmydiary의 `public/writy.riv`·`laity-avatar.png` 등을 다시 복사하면 된다.
> Rive 런타임은 dearmydiary `node_modules/@rive-app/canvas`의 `rive.js`/`rive.wasm`.

## 디자인 시스템

색·타이포·라이티 캐릭터·3D 버튼·말풍선·일기 카드를 claude.ai/design의
**"피어라 (Peera) 디자인 시스템"** 프로젝트에 카드로 올려두었다(재사용·확장용).
토큰 요약: 종이 `#FFFDF8` · 잉크 `#3D2B1F` · 라이티 주황 `#E1751F` · 보라 `#7C3AED` ·
새싹 `#43A047` · 통화 화면 `#10202B→#1D3A34`. 표제 Jua · 본문 Pretendard · 손글씨 Gaegu.
