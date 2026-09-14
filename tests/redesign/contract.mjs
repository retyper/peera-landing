// ─────────────────────────────────────────────────────────────
// 리디자인 때 **깨지면 안 되는 것들**의 목록. 디자인은 바뀌어도 이건 그대로여야 한다.
//
// 왜 목록을 따로 두나: CSS를 갈아엎으면 id가 사라지거나 이름이 바뀌기 쉽다. 그런데 이 id들은
// 단순한 스타일 고리가 아니라 **동작의 손잡이**다(저장·집계·앱 넘기기). 하나라도 없어지면
// 화면은 멀쩡해 보이는데 낱말이 저장되지 않거나 앱으로 넘어가는 링크가 조용히 죽는다.
//
// ★여기 적힌 값은 '바라는 값'이 아니라 **2026-09-14 현재 main에서 뽑은 실제 값**이다.
//   run.mjs --record 가 현재 상태를 golden.json 으로 떠 두고, 그 뒤엔 그것과 대조한다.
// ─────────────────────────────────────────────────────────────

// 페이지마다 반드시 살아 있어야 하는 id — 전부 '동작'에 쓰인다.
export const REQUIRED_IDS = {
  "check.html": [
    "chips", "prog", "progF", "progP", "progT", "barline",  // 칩·진행 막대
    "bApp", "bReview", "bMode", "bReset",                    // 앱 넘기기·복습 이동·모드·초기화
    "bPdf", "bImg", "bCopy",                                 // 내보내기 3종
    "resume", "save", "saveH", "saveP", "toast",             // 이어하기 배너·저장 안내·토스트
    "kn", "un", "dn", "tt", "next", "bGo", "print",
  ],
  "review.html": [
    "s-intro", "s-card", "s-done", "s-none",                 // 화면 4단계
    "bStart", "bYes", "bNo", "bNext", "bMore", "bSay",       // 시작·알아요/아직·다음
    "sizeRow", "cWord", "cAsk", "cAns", "cNext", "cPos",
    "pbar", "ptext", "goal", "gknown", "grest", "gtxt",
    "aGarden", "aApply", "h1n", "eyebrow",
  ],
  "words.html": [],
  "prompts.html": [],
};

// localStorage 키 — 이름이 바뀌면 **기존 사용자의 기록이 통째로 사라진다**(앱이 아니라 웹이지만
// 체크 결과는 앱으로 넘어가는 씨앗이라 같은 무게다).
export const STORAGE_KEYS = {
  "check.html": ["check800_v1", "check800_done_v1", "check800_last_v1", "check800_mode_v1"],
  "review.html": ["check800_v1", "check800_done_v1", "review800_v1", "review800_meta_v1", "review800_size_v1"],
};

// GA 이벤트 이름 — 지금 돌고 있는 계측이다. 이름이 바뀌면 과거 데이터와 이어지지 않는다.
export const GA_EVENTS = {
  "check.html": ["letter_toggle", "letter_done", "mode_toggle", "resume_click", "go_review",
    "export_pdf", "export_image", "export_copy", "send_to_app"],
  "review.html": ["review_start", "review_done", "review_return", "to_app", "app_cta_click"],
  "words.html": ["file_download", "app_cta_click"],
  "prompts.html": ["file_download", "app_cta_click"],
};

// 앱으로 넘기는 주소 — 여기가 어긋나면 앱이 "읽지 못했어요"로 거부한다(n·v 규약).
// FUNNEL-CONTRACT.md 가 정본. 이 검사는 **바이트 단위로 같은지**만 본다.
export const HANDOFF = {
  "check.html": { host: "dearmydiary.vercel.app", path: "/vocab-boost", params: ["known", "n", "v", "utm_source", "utm_medium", "utm_campaign"] },
  "review.html": { host: "dearmydiary.vercel.app", path: "/vocab-boost", params: ["known", "n", "v", "st", "t", "utm_source", "utm_medium", "utm_campaign"] },
};

// 첫 로드 DOM 에는 없고 **나중에 만들어지는** id — 이어하기 배너 안의 버튼처럼 조건부로 그려진다
// (check.html:1158 이 innerHTML 로 만든다). 첫 로드에서 찾으면 없는 게 정상이라, 동작 검사 쪽에서 본다.
export const LATE_IDS = ["bGo"];

export const PAGES = ["check.html", "review.html", "words.html", "prompts.html"];
export const VIEWPORTS = [{ w: 390, h: 844, tag: "phone" }, { w: 1280, h: 900, tag: "desktop" }];
