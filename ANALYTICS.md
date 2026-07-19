# 데이터 수집 셋업 — 감정카드 프로덕션 배포 전 체크리스트

랜딩 코드 쪽 작업은 끝났다. 아래는 **계정에서 사람이 해야 하는 일**만 남긴 것.
순서대로 하면 된다. ①②는 배포 전 필수, ③④는 여유 될 때.

---

## ① GA4 측정 ID — ✅ 완료

측정 ID `G-VK77HTLEQH` (속성 `Peera Landing`)를 `index.html`에 넣었다.

**Google 태그 매니저(GTM)는 쓰지 않는다.** gtag.js를 페이지에 직접 심었고
측정 ID 자체가 태그 역할을 한다. GA4 화면의 "태그를 설치하세요" 안내는
데이터가 들어오기 시작하면 사라진다.

계측을 끄고 싶으면 `window.GA_ID`를 비우면 된다 — gtag.js를 내려받지도 않는다.

### GA4에서 해둘 설정

| 위치 | 설정 | 이유 |
|------|------|------|
| ~~데이터 보관 14개월~~ | ✅ 완료 | — |
| 관리 → 이벤트 → `generate_lead` | **주요 이벤트로 표시** | 사전예약 완료 = 이 페이지의 유일한 전환 |
| 관리 → 데이터 스트림 → 태그 설정 → 내부 트래픽 정의 | 본인 IP 등록 후 필터 **사용** | 본인 방문이 지표를 오염시킨다 |
| 관리 → 맞춤 정의 → 맞춤 측정기준 | `cta_location`, `traffic_source` (범위: 이벤트) | **등록해야 보고서에 뜬다.** 안 하면 수집돼도 안 보임 |

> 맞춤 측정기준은 등록한 **시점 이후** 데이터부터 보인다. 배포 전에 미리 만들어 둘 것.

---

## ② 감정카드 앱 CTA에 UTM 붙이기 (1분, **프로덕션 배포 전에**)

**파일**: `emotion_cards/lib/services/peeora_funnel.dart:24`

```dart
// 현재
static const String? destinationUrl = 'https://retyper.github.io/peera-landing/';

// 이렇게
static const String? destinationUrl =
    'https://retyper.github.io/peera-landing/'
    '?utm_source=emotioncards&utm_medium=app&utm_campaign=peera_cta';
```

**왜 배포 전이어야 하나**: 이걸 안 붙이면 감정카드에서 넘어온 사람이 GA에서 전부
`direct`로 뭉개진다. 감정카드가 획득 채널로 작동하는지 아닌지를 **영영 측정할 수 없다.**
앱은 스토어 심사를 거치므로 나중에 고치려면 재빌드 + 재심사다. 지금이 제일 싸다.

붙이고 나면 랜딩이 UTM을 읽어서:
- GA4 → 트래픽 획득 보고서에 `emotioncards / app`으로 분리 집계
- Formspree 신청 메일 → `유입경로: emotioncards / app / peera_cta` 로 표시
  (**GA를 안 켜도** 신청 메일만 보면 감정카드발 신청인지 알 수 있다)

> 이왕 여는 김에 파일 안의 `Peeora` → `Peera` 표기도 정리하면 좋다(클래스명 포함 17곳).
> 다만 이건 별건이니 UTM만 먼저 처리해도 무방.

---

## ③ 도메인 (peera.co) — 급하지 않다

**지금 당장 살 필요 없다.** github.io 주소로 이미 잘 돌아가고, 랜딩·앱·OG 태그가 전부
그 주소로 정합하게 맞춰져 있다. 사전예약 받는 데 아무 지장 없다.
**돈을 쓸 시점은 정식 출시 즈음**이고, 그전까진 이메일이 얼마나 모이는지 보는 게 먼저다.

살 때 참고 (⚠️ 가격은 수시로 바뀌니 직접 확인할 것):

| 선택지 | 특징 |
|--------|------|
| **Cloudflare Registrar** | 원가 판매 — 마진을 안 붙인다. **갱신가가 가장 정직**하다. 다만 신규 등록은 다른 곳에서 사서 이전해야 하는 경우가 있음 |
| Porkbun / Namecheap | 첫해 할인이 크다. **갱신가를 꼭 확인** — 첫해 싸고 2년차에 3~4배 뛰는 게 흔한 함정 |
| 가비아 / 후이즈 | `.kr`·`.co.kr` 국내 등록. 한국어 지원·국내 결제가 편함 |

**TLD 선택**: `.co`는 원래 좀 비싼 편이다. 한국 부모가 타깃이니 `.kr`이 더 싸고 친숙할 수 있고,
`peera.app`도 후보다(`.app`은 HTTPS 강제인데 GitHub Pages는 어차피 HTTPS라 문제없음).
**구매 전 `peera.co`가 아직 비어 있는지부터 확인**할 것 — 안 비어 있을 수 있다.

### 도메인을 연결할 때 바꿔야 할 곳 (딱 4군데)

1. 레포 루트에 `CNAME` 파일 생성, 내용은 `peera.co` 한 줄
2. GitHub → Settings → Pages → Custom domain 입력 + **Enforce HTTPS** 체크
3. `index.html` 상단 3줄: `canonical`, `og:url`, `og:image` + JSON-LD의 `url`
   → 전부 `https://peera.co/` 로 (주석에 표시해 둠)
4. `peeora_funnel.dart`의 `destinationUrl` (UTM 파라미터는 유지) → **앱 재빌드 필요**

GA4는 그대로 둬도 된다(측정 ID는 도메인과 무관). 스트림 URL만 바꿔주면 깔끔하다.

---

## ④ 앱 개인정보처리방침 — ⚠️ 프로덕션 전 확인 필요

`dearmydiary/src/app/pages/Privacy.tsx`가 **아직 템플릿 초안**이다.
미기입 대괄호가 15종 남아 있다:

```
[사업자명 / 대표자]   [사업장 주소]   [이름](보호책임자)
[contact@example.com]  [시행일: YYYY-MM-DD]   [기간]
[리전 확인]   [미국 등 — 확인]   [구체적 조치를 기재]
[처리 후 즉시 파기 / 제공사 정책에 따름 — 확인]  ...
```

이 상태로 스토어에 올리면 심사에서 반려될 수 있고, 무엇보다
**만 14세 미만 아동 대상 + 국외 이전(Claude API·Supabase)** 조합이라 실제 법적 리스크가 있다.
표기도 옛 `Peeora`로 남아 있다.

랜딩 쪽은 이 문서와 무관하게 독립적으로 처리해 뒀다 →
`privacy.html` (사전예약 이메일·GA 쿠키만 정확히 명시). 앱 방침 초안과 섞이지 않는다.

---

## 배포 후 확인 (한 번만)

1. **카톡 공유 미리보기** — 카카오 [디버거](https://developers.kakao.com/tool/debugger/sharing)에
   랜딩 URL 넣고 캐시 초기화 → 라이티 이미지가 뜨는지.
   (기존 코드는 죽은 `peera.co`를 가리켜 **미리보기가 안 떴다.** 이번에 고침)
2. **GA4 실시간 보고서** — 랜딩 열고 30초 내 방문자 1명 잡히는지.
3. **전환 흐름** — 이메일 칸 클릭 → 동의 체크 → 제출.
   실시간에 `form_start` → `generate_lead` 순서로 뜨면 정상.
4. **UTM 확인** — `...peera-landing/?utm_source=emotioncards&utm_medium=app` 으로 직접 열어
   신청해 보고, 도착한 메일에 `유입경로: emotioncards / app` 이 찍혔는지.

---

## 지금 측정되는 것

| 이벤트 | 시점 | 파라미터 |
|--------|------|----------|
| `page_view` | 방문 (GA 자동) | — |
| `demo_view` | 라이티 통화 데모가 화면에 절반 이상 들어옴 | — |
| `scroll_depth` | 25 / 50 / 75 / 100% 도달 | `percent` |
| `form_start` | 이메일 칸에 처음 포커스 | `cta_location` |
| `generate_lead` | **사전예약 완료** ★전환 | `cta_location`, `traffic_source` |
| `form_error` | 전송 실패 | `cta_location`, `reason` |

이걸로 답할 수 있는 질문:
- 감정카드 앱이 실제로 부모를 데려오는가 (`traffic_source`)
- 히어로 CTA와 마무리 CTA 중 뭐가 먹히는가 (`cta_location`)
- 데모를 본 사람과 못 본 사람의 전환 차이 (`demo_view` → `generate_lead`)
- 사람들이 어디서 읽기를 멈추는가 (`scroll_depth`)
- 입력하다 이탈하는가, 시작조차 안 하는가 (`form_start` vs `generate_lead`)
