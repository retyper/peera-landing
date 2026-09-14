# 리디자인 회귀 검사

디자인을 바꿔도 **기능이 그대로인지** 진짜 브라우저로 눌러서 확인한다.
CSS를 갈아엎으면 id가 사라지거나 이름이 바뀌기 쉬운데, 그 id들은 스타일 고리가 아니라
**동작의 손잡이**다(저장·집계·앱 넘기기). 하나 없어지면 화면은 멀쩡한데 낱말이 저장되지 않거나
앱으로 가는 링크가 조용히 죽는다.

## 쓰는 법

```bash
# 디자인 손대기 전에(= main에서) 한 번 — 지금 값을 기준으로 떠 둔다
node tests/redesign/run.mjs --record

# 바꾼 뒤에 — 기준과 대조한다
node tests/redesign/run.mjs
```

- 기준값: `golden.json` (★**main에서 뜬 것**. 리디자인 브랜치에서 다시 `--record` 하면
  기준이 바뀐 값으로 덮어써져 검사가 무의미해진다. 하지 말 것.)
- 스크린샷: `shots/before/` (record 때) · `shots/after/` (대조 때) — 눈으로 비교용.
- playwright는 형제 폴더 `dearmydiary` 레포에 설치된 것을 쓴다. 없으면 안내가 뜬다.

## 무엇을 재나

| 대상 | 재는 것 |
|---|---|
| 공통 | 로드 오류 0 · 필수 id 존재 · id가 하나도 사라지지 않았는지 · 폰(390)/데스크톱(1280) |
| check | 낱말 누르기→`check800_v1` 저장 · "다 봤어요"→`check800_done_v1` · 이어하기 배너 · PDF(window.print)·이미지 저장(다운로드)·복사 · 복습으로 가는 문 · **앱 넘기기 URL 바이트 동일** |
| review | 기록 없을 때 빈 상태 · 시작→카드→기록 누적 · 분량 알약 · **앱 넘기기 URL(st·t 포함) 바이트 동일** |
| words·prompts | 다운로드 링크 href·download 동일 · 인쇄 CSS 숨김 요소 동일 |
| 전 페이지 | GA 이벤트 이름 · localStorage 키 이름 |

## 만들면서 배운 것 (같은 함정을 또 밟지 않게)

- **gtag를 가로채면 안 잡힌다.** 페이지가 나중에 자기 `gtag`를 정의하며 덮는다
  (`check.html:1305`). `dataLayer.push`를 봐야 한다.
- **`window.location`은 재정의가 막혀 있다.** 이동 주소는 playwright `route`에서 받아 적는다.
- **`letter_toggle`은 낱말 칩이 아니라 글자 머리글(h3)**을 눌러야 난다. 그리고 머리글을 누르면
  화면이 바뀌어 뒷 단계가 다 깨지므로 **따로 연 탭에서** 재야 한다.
- **`bGo`는 첫 로드 DOM에 없다** — 이어하기 배너가 뜬 뒤 만들어진다(`LATE_IDS`).
- **`review.html`의 done 키는 대문자 첫 글자**다(`doneL[w.charAt(0).toUpperCase()]`).
  소문자로 시드하면 복습 풀이 비어 "시작 버튼이 안 보인다"가 된다.
- 숨은 요소는 playwright force 클릭으로도 핸들러가 안 돌 수 있다 → `el.click()`을 DOM에서 직접.

## 이 검사가 정말 빨간불을 내는가

확인함(2026-09-14). 일부러 ①`id="bApp"`→`btn-app` ②`check800_v1`→`check800_v2`
③`track('export_pdf')`→`pdf_export` ④`id="bStart"`→`startBtn` 로 바꾸고 돌렸더니
로드 오류·사라진 id·저장 실패·계측 이름까지 **전부 잡았다**. 그 뒤 원본을 되돌렸다.
