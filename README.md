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

## 이메일 수집 연결 (Google 시트, 무료 — 예전 Formspree에서 교체됨)

`index.html`/`en.html`의 폼은 Google Apps Script 웹앱을 거쳐 스프레드시트에 한 행씩
쌓인다(백엔드 없이). Formspree(월 50건 무료 한도)를 걷어내고 이걸 쓰는 이유는 한도가
사실상 없고, 신청자가 raw 데이터까지 그대로 시트에 남기 때문.

**현재 연결 상태**: `roqkfeke12@gmail.com` 드라이브의 `피어라/1.출시예약랜딩페이지`
시트에 바인딩된 Apps Script 웹앱으로 연결돼 있다(2026-07-20 배포, 실 제출 테스트 통과).
`index.html`/`en.html`의 두 폼 `action`이 그 `/exec` URL을 가리킨다.

시트를 새로 만들거나 재배포할 때의 설치 절차:

1. [sheets.google.com](https://sheets.google.com)에서 새 스프레드시트 생성
   (예: "피어라 사전예약").
2. **1행에 헤더**를 정확히 이 이름으로 입력(순서 무관):
   `타임스탬프` `email` `신청위치` `유입경로` `개인정보동의` `raw`
3. 메뉴 **확장 프로그램 → Apps Script**를 연다.
4. `tools/google-apps-script/Code.gs`의 내용을 그대로 붙여넣고 저장.
5. 우측 상단 **배포 → 새 배포**:
   - 유형: **웹 앱**
   - 실행 계정: **나**
   - 액세스 권한이 있는 사용자: **모든 사용자**
   - 배포 후 처음엔 권한 승인 팝업이 뜬다 — 본인 Google 계정으로 승인.
     (Google 미인증 경고 화면에서 **고급 → (프로젝트명)으로 이동 → 허용**. 본인 스크립트라 안전.)
6. 배포 완료 후 나오는 URL(`https://script.google.com/macros/s/xxx/exec`)을 복사.
7. `index.html`의 두 폼(`히어로`/`마무리 CTA`) `action="..."` 안 URL을 그 값으로 교체.
8. `node tools/make-en.mjs index.html en.html`로 `en.html`에도 반영.

메일 알림(신청 올 때마다 retyper92@gmail.com으로 요약 메일)도 `Code.gs`에 포함돼 있다 —
Formspree가 하던 걸 그대로 대신한다. 필요 없으면 스크립트의 `MailApp.sendEmail` 블록만
지우면 된다.

> 연결 전(플레이스홀더 URL 그대로)엔 폼 제출 시 "전송이 잘 안 됐어요" 오류가 뜬다.
> `raw` 열에는 그 요청의 모든 필드가 JSON으로 그대로 들어가서, 나중에 폼에 필드를
> 추가해도(위 헤더에 없어도) 유실 없이 남는다.

## 구성

- `index.html` — 랜딩페이지 **한국어판(원본)**. HTML·CSS·JS 인라인, 폰트만 CDN.
  히어로의 "라이티 통화 → 손글씨 일기" 데모, 라이티 도감, 정서 안전 약속, 근거 섹션 포함.
- `en.html` — **영어판(자동 생성물, 직접 수정 금지)**. 아래 "한국어 / 영어 두 벌" 참고.
- `privacy.html` / `privacy-en.html` — 사전예약 페이지용 개인정보 안내(한/영).
  앱 방침과는 **범위가 다르다** — 앱 것은 `hephaestosian.github.io/legal/`에 따로 있다.
- `tools/` — 빌드 스크립트. `make-en.mjs`(영어판 생성) · `shoot.mjs`(OG 촬영) ·
  `og-card*.html`(OG 카드 원본).
- **라이티는 본품(dearmydiary)의 실제 에셋을 그대로 쓴다** (그린 그림 아님):
  - `writy.riv` + `rive.js` + `rive.wasm` — 본품 VoiceTalk의 라이티 Rive를 **라이브 구동**
    (아트보드 `Artboard`, 스테이트머신 `squirrel_state`, 데모가 isTalking/isListening 입력을 조작).
  - `writy-still.png` — Rive 로드 전/실패 시 폴백 포스터(정지 프레임, 폰 화면 비율).
  - `writy-avatar.png` — 공식 아바타(256px 축소판). 파비콘 + 원형 연락처 사진 스타일로 사용.
    (본품에는 `laity-avatar.png` 라는 옛 이름으로 있다 — 다시 복사할 땐 이름을 바꿔 넣을 것.)
  - `plant-bud1/flower2/flower1.png` — 본품의 새싹→꽃 아트(알파 크롭판). 세 걸음 아이콘.
    본품 `bud1~bud3`는 셋 다 사실상 같은 떡잎 싹이라 2단계가 1단계와 구분되지 않는다.
    그래서 2단계는 오므린 튤립(`flower2`)을 봉오리 대용으로 쓴다 — 싹 → 봉오리 → 활짝.
  - `stamp-good.png` — 본품의 "참 잘했어요" 도장. 일기 카드 연출.
- `peera-og.png` — 카톡·문자 공유 미리보기(OG) 1200×630.
  > ⚠️ **카피가 이미지 안에 글자로 구워져 있다.** 대상 연령·헤드라인을 바꾸면
  > 이 이미지도 같이 바꿔야 한다 — grep에 걸리지 않아 그냥 지나친 적이 있다
  > (본문은 7~11세인데 공유 미리보기만 4~8세로 나가고 있었다).
  >
  > 재생성: `tools/og-card.html`을 고친 뒤 아래를 돌린다. 본품 공식 아트
  > (`writy-still.png`, `writy-avatar.png`)를 넣고 조판만 한다 — 라이티는 다시 그리지 않는다.
  > ```
  > node tools/shoot.mjs tools/og-card.html    peera-og.png
  > node tools/shoot.mjs tools/og-card-en.html peera-og-en.png
  > ```
- `peera-og-en.png` — 영어판(`en.html`)용 OG. 위와 같은 주의사항이 그대로 적용된다.
- `peera-sprout.png` — 예전 새싹 브랜드 이미지(감정카드 앱과의 연결 고리, 보관용).

> 본품 에셋을 갱신하면: dearmydiary의 `public/writy.riv`·`laity-avatar.png`(→ `writy-avatar.png`로
> 이름 바꿔 저장) 등을 다시 복사하면 된다.
> Rive 런타임은 dearmydiary `node_modules/@rive-app/canvas`의 `rive.js`/`rive.wasm`.

## 한국어 / 영어 두 벌 — ★수정 순서를 반드시 지킬 것

`en.html`은 **손으로 고치지 않는다.** `index.html`에서 스크립트로 생성한다
(문구 매핑 135건). 영어판을 직접 고치면 다음 생성 때 그대로 덮어써진다.

```
1. index.html 을 고친다            ← 한국어판이 언제나 원본
2. node tools/make-en.mjs index.html en.html
3. 문구를 새로 추가했다면 MISS 가 뜬다 → tools/make-en.mjs 의 매핑 표에 추가하고 2번 재실행
```

`make-en.mjs`는 **치환 실패가 하나라도 있으면 종료코드 1**로 끝난다. 한국어가 섞인 채
배포되는 걸 막기 위한 것이니, 실패를 무시하고 넘어가지 말 것. 마지막에 "남은 한국어"도
같이 찍는다 — 브랜드명 `피어라`와 손글씨 일기 샘플은 **의도적으로 한국어로 남긴다**
(한글 쓰기 자체가 셀링 포인트라 외국인에게도 그대로 보여준다).

**라이티의 영어 이름은 `Writy`다.** 에셋 이름(`writy.riv`)과 같은 철자를 쓴다.
한때 `Laity`로 나가 있었는데 영어에서 "평신도"라는 뜻의 실재 단어라 완전히 다른 이름이었다.
영어 카피·OG 카드·CSS 변수까지 전부 `Writy`로 통일돼 있으니 새 문구를 넣을 때도 맞출 것.

**폼 필드의 `name`은 한국어를 유지한다.** JS가 `[name="신청위치"]`로 찾고, 알림 메일을
받는 쪽도 한국어라 양쪽 페이지가 같은 형식으로 와야 한다. 값만 `(EN)`으로 구분한다.
(이걸 영어로 바꿨다가 JS가 null을 만나 스크립트 전체가 죽은 적이 있다.)

### 언어 라우팅
기기 언어가 한국어면 `index.html`, 그 외 전부 `en.html`. 단:
- **사용자 선택이 자동 감지를 이긴다** — 상단/하단 토글이 `localStorage.peeraLang`에 고정한다
- `?lang=ko|en` 으로도 지정된다(공유 링크·QA용)
- `replace()`라 뒤로가기가 막히지 않고, 목적지는 언어가 일치하므로 루프가 없다
- 페이지를 추가하면 `hreflang` 3줄(ko/en/x-default)도 같이 넣을 것

### 쿠키 동의
GA4는 **배너에서 "동의"를 누르기 전까지 아예 로드되지 않는다**(GDPR). 거부하면 영구히 꺼지고
`track()`도 조용히 무시된다. 계측 코드를 만질 때 이 게이트를 우회하지 말 것.

> ⚠️ 동의 도입 이후 GA4 수치는 **동의한 방문자만** 잡힌다. 도입 이전 기간과 직접 비교하지 말 것.

## 디자인 시스템

색·타이포·라이티 캐릭터·3D 버튼·말풍선·일기 카드를 claude.ai/design의
**"피어라 (Peera) 디자인 시스템"** 프로젝트에 카드로 올려두었다(재사용·확장용).
토큰 요약: 종이 `#FFFDF8` · 잉크 `#3D2B1F` · 라이티 주황 `#E1751F` · 보라 `#7C3AED` ·
새싹 `#43A047` · 통화 화면 `#10202B→#1D3A34`. 표제 Jua · 본문 Pretendard · 손글씨 Gaegu.

---

## 열린 작업 (2026-07-20 기준)

랜딩·법무문서 정리는 끝났고, 아래가 남아 있다.

**본품(dearmydiary) — 맥에서 작업 예정**
- [ ] 대상 연령 `4~8세 → 7~11세` 반영. 랜딩·법무문서는 이미 7~11세인데 본품만 옛 값이다.
      범위: 런타임 LLM 프롬프트(`src/app/lib/diary*.ts`, `parentReport.ts`,
      `WritingJournal3·4.tsx`, `voiceTalkLocale.ts`), `CLAUDE.md`, `docs/*`, 설계 근거 주석.
      ⚠️ **`claude-opus-4-8`(모델 ID)와 `~4~8s`(지연시간)는 "4-8"을 포함하지만 건드리면 안 된다.**
      반드시 `4~8세`·`age 4-8` 같은 좁은 패턴으로만 치환할 것.
      (UI 문구의 '빨간펜' 제거는 커밋 `8c5c9b0`으로 이미 반영됨)

**본품 영어화 — 랜딩보다 먼저 끝나야 한다**
- [ ] 앱 UI에 i18n이 없다. 화면 문자열이 **한국어로 약 1,056개 하드코딩**돼 있고
      `lang === "en"` 분기는 10개 파일(AI 프롬프트·OCR·TTS)뿐이다.
      즉 지금은 라이티가 영어로 말하고 영어 일기를 첨삭할 뿐, **버튼·메뉴·설정·부모 리포트는
      전부 한국어**다(`voiceTalkLocale.ts` 주석이 "화면 뼈대는 한국 아동 대상"이라고 명시).
      영어 랜딩은 출시 시점 제품을 기준으로 쓴 것이므로, **출시 전까지 이 작업이 끝나야
      약속이 지켜진다.** 감정카드 170개국 유입이 여기로 온다.

**랜딩**
- [ ] 인터뷰 최대 페인인 "외동이라 다른 사람 생각을 들어볼 기회가 없다"는 아직 로드맵
      (`#friends`, 준비 중)으로만 답해뒀다. 글쓰기 공유·친구 연결이 실제로 나오면
      이게 핵심 차별점이 된다. 단 아동 대상 또래 공유는 안전·개인정보 설계가 선행돼야 한다.
- [ ] `docs/테스터-모집-계획.md`(본품)의 해시태그가 아직 `#유아교육 #예비초등`이다.
      7~11세와 안 맞지만 채널 도달률 판단이 필요해 남겨뒀다.

**법무문서** (`Hephaestosian/hephaestosian.github.io`, 별도 clone 필요)
- [ ] 피어라 문서는 `팀 Peer`로 통일 완료. 다른 앱 4종(bodysignal·emotioncards·
      whoislying·zenbell)은 `Hephaestosian` 유지 — 개발자 닉네임이라 의도된 것이다.
