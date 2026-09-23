// ─────────────────────────────────────────────────────────────
// 인앱 창 소리 안내 검사 — review.html · korean-review.html
//
// 왜: 스레드에서 링크를 누르면 스레드 안의 창(안드로이드 WebView)에서 열리고, 거기선
//     speechSynthesis 가 소리를 내지 않는다(2026-09-23 사장님 안드로이드 실물). speak() 가
//     오류를 조용히 삼켜서(review.html speak() 의 catch(e){}) 누른 사람은 아무 일도 없는 줄 안다.
//
// 이 검사가 빨개지는 경우:
//   [0] 인앱 UA 로 열었을 때 스크립트가 죽었다
//   [A] 안드로이드 인앱 창에서 「소리로 듣기」를 눌러도 안내·크롬 버튼이 안 뜬다
//   [B] 크롬 버튼 주소가 intent:// 모양이 아니거나, 같은 페이지로 안 가거나, 기록을 안 싣는다
//   [C] 크롬(빈 저장소)에서 그 주소를 열었을 때 기록이 안 옮겨지거나, 주소에 c= 가 남는다
//   [D] 보통 크롬에서는 안내가 뜬다(떠선 안 된다)
//   [E] 음성 기능이 아예 없는 창에서 눌러도 아무 말이 없다
//
// 쓰는 법: node tests/inapp-speak.mjs
// ─────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
const chromium = await (async () => {
  for (const spec of ["playwright", "/Users/" + (process.env.USER || "") + "/dearmydiary/node_modules/playwright/index.mjs",
                      new URL("../../dearmydiary/node_modules/playwright/index.mjs", import.meta.url).href,
                      new URL("../../emotion_cards/node_modules/playwright/index.mjs", import.meta.url).href]) {
    try { return (await import(spec)).chromium; } catch { /* 다음 후보 */ }
  }
  console.error("🟥 playwright 를 못 찾았습니다 (tests/redesign/run.mjs 머리말 참고)");
  process.exit(2);
})();

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg" };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const f = path.join(ROOT, rel);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("no"); return; }
  res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://127.0.0.1:${server.address().port}`;

let fail = 0;
const ok = (n, c, extra) => { if (c) console.log(`  ✅ ${n}`); else { fail++; console.log(`  🟥 ${n}${extra ? " — " + extra : ""}`); } };

// 스레드 안드로이드 인앱 창 UA. 「Barcelona」가 스레드 앱의 내부 이름, 「; wv)」가 WebView 표시.
const UA_THREADS = "Mozilla/5.0 (Linux; Android 14; SM-S918N Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.146 Mobile Safari/537.36 Barcelona 350.0.0.35.73 (SM-S918N; 34)";
const UA_CHROME  = "Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.146 Mobile Safari/537.36";

// 두 페이지의 기록 모양. review.html:189-190 · korean-review.html:201-202 의 키 이름을 그대로 쓴다.
const ALLCAP = {}; for (let c = 65; c <= 90; c++) ALLCAP[String.fromCharCode(c)] = 1; // review.html:214 done 키는 대문자 첫 글자
const CHO = {}; for (const c of "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ") CHO[c] = 1;      // korean-review.html:196 CHECKED = DONE[grade][초성]
const PAGES = {
  "review.html": {
    seed: { check800_v1: JSON.stringify({ apple: 1, book: 1, cat: 1 }), check800_done_v1: JSON.stringify(ALLCAP),
            review800_v1: JSON.stringify({ about: [2, 1] }), review800_size_v1: "20" },
  },
  "korean-review.html": {
    seed: { korean1_v1: JSON.stringify({ "가게": 1, "가족": 1 }), korean1_done_v1: JSON.stringify(CHO),
            korean3_done_v1: JSON.stringify(CHO), korean_review_v1: JSON.stringify({ "가건물": [1, 1] }), korean_review_size_v1: "5" },
  },
};

const browser = await chromium.launch();
async function open(url, { ua, seed = {}, noSpeech = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: ua, locale: "ko-KR" });
  ctx.setDefaultTimeout(8000);
  await ctx.addInitScript(([s, ns]) => {
    // 심는 건 처음 한 번만 — 페이지가 스스로 다시 열 때(가져오기 후 새로 열기) 덮어쓰면 안 된다
    if (!sessionStorage.getItem("__seeded")) {
      sessionStorage.setItem("__seeded", "1");
      const o = JSON.parse(s); for (const k in o) localStorage.setItem(k, o[k]);
    }
    window.__spoke = 0;
    if (ns) { try { delete window.speechSynthesis; } catch (e) {} window.speechSynthesis = undefined; window.SpeechSynthesisUtterance = undefined; }
    else if (window.speechSynthesis) { const orig = window.speechSynthesis.speak.bind(window.speechSynthesis); window.speechSynthesis.speak = (u) => { window.__spoke++; try { orig(u); } catch (e) {} }; }
  }, [JSON.stringify(seed), noSpeech]);
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(1200);
  return { ctx, p, errs };
}
const visible = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== "none" && e.offsetHeight > 0; }, sel);
async function toCard(p) { await p.locator("#bStart").click(); await p.waitForTimeout(400); }

for (const [page, cfg] of Object.entries(PAGES)) {
  console.log(`\n■ ${page}`);

  // [0][A][B] 스레드 안드로이드 창
  let intent = "";
  {
    const { ctx, p, errs } = await open(`${BASE}/${page}`, { ua: UA_THREADS, seed: cfg.seed });
    ok(`[0] 스레드 창에서 로드 오류 0`, errs.length === 0, errs.join(" | "));
    ok(`[A0] 누르기 전엔 안내가 안 보인다`, !(await visible(p, "#sayNote")));
    await toCard(p);
    await p.locator("#bSay").click(); await p.waitForTimeout(300);
    const noteOn = await visible(p, "#sayNote");
    const noteTxt = noteOn ? (await p.locator("#sayNote").innerText()).replace(/\s+/g, " ") : "";
    ok(`[A] 「소리로 듣기」를 누르면 안내가 뜬다 → "${noteTxt.slice(0, 70)}"`, noteOn);
    const btnOn = await visible(p, "#aChrome");
    intent = btnOn ? await p.locator("#aChrome").getAttribute("href") : "";
    ok(`[A] 크롬 버튼이 보인다`, btnOn);
    ok(`[B] 주소가 intent:// + 크롬 패키지 (${intent.slice(0, 60)}…)`, /^intent:\/\/127\.0\.0\.1:\d+\//.test(intent) && /;package=com\.android\.chrome;/.test(intent) && /;end$/.test(intent), intent.slice(0, 120));
    const m = intent.match(/^intent:\/\/([^#]+)#Intent;/);
    const target = m ? "http://" + m[1] : "";
    ok(`[B] 같은 페이지로 간다 (${target.split("?")[0].replace(BASE, "")})`, target.split("?")[0] === `${BASE}/${page}`);
    ok(`[B] 기록(c=)을 싣는다 · 주소 길이 ${intent.length}자`, /[?&]c=[A-Za-z0-9_-]{20,}/.test(target));
    const fb = decodeURIComponent((intent.match(/S\.browser_fallback_url=([^;]+)/) || [])[1] || "");
    ok(`[B] 크롬이 없을 때 돌아올 주소가 같은 페이지 (${fb.replace(BASE, "").slice(0, 40)})`, fb.startsWith(`${BASE}/${page}`));
    intent = target;
    await ctx.close();
  }

  // [C] 크롬(빈 저장소)에서 그 주소를 연다 — 가져오기 → 주소 정리 → 새로고침해도 유지
  if (intent) {
    const { ctx, p, errs } = await open(intent.replace("http://127.0.0.1", "http://127.0.0.1"), { ua: UA_CHROME });
    await p.waitForTimeout(800);
    ok(`[C] 로드 오류 0`, errs.length === 0, errs.join(" | "));
    const got = await p.evaluate((keys) => Object.fromEntries(keys.map((k) => [k, localStorage.getItem(k)])), Object.keys(cfg.seed));
    const same = Object.keys(cfg.seed).filter((k) => got[k] === cfg.seed[k]);
    ok(`[C] 기록이 그대로 옮겨졌다 (${same.length}/${Object.keys(cfg.seed).length}: ${same.join(",")})`, same.length === Object.keys(cfg.seed).length,
       Object.keys(cfg.seed).filter((k) => got[k] !== cfg.seed[k]).map((k) => `${k}=${String(got[k]).slice(0, 30)}`).join(" "));
    ok(`[C] 주소에서 c= 가 떨어졌다 (${p.url().replace(BASE, "")})`, !/[?&]c=/.test(p.url()));
    ok(`[C] 시작 화면이 뜬다(빈 상태가 아니다)`, await visible(p, "#s-intro"));
    // 크롬에서 기록을 새로 쌓은 뒤 새로고침 — 옛 기록으로 되덮이면 안 된다
    await p.evaluate(() => localStorage.setItem("__marker", "1"));
    await p.reload({ waitUntil: "load" }); await p.waitForTimeout(600);
    ok(`[C] 새로고침해도 다시 가져오지 않는다`, (await p.evaluate(() => localStorage.getItem("__marker"))) === "1" && !/[?&]c=/.test(p.url()));
    // 보통 크롬: 누르면 소리를 내고, 안내는 안 뜬다
    await toCard(p);
    await p.locator("#bSay").click(); await p.waitForTimeout(300);
    ok(`[D] 보통 크롬에선 안내가 안 뜬다`, !(await visible(p, "#sayNote")));
    ok(`[D] 보통 크롬에선 speak 가 불린다 (${await p.evaluate(() => window.__spoke)}회)`, (await p.evaluate(() => window.__spoke)) >= 1);
    await ctx.close();
  }

  // [E] 음성 기능이 아예 없는 창 (안드로이드 판별이 빗나간 경우의 안전망)
  {
    const { ctx, p, errs } = await open(`${BASE}/${page}`, { ua: UA_CHROME, seed: cfg.seed, noSpeech: true });
    ok(`[E] 로드 오류 0`, errs.length === 0, errs.join(" | "));
    await toCard(p);
    await p.locator("#bSay").click(); await p.waitForTimeout(300);
    const t = (await visible(p, "#sayNote")) ? (await p.locator("#sayNote").innerText()).replace(/\s+/g, " ") : "";
    ok(`[E] 음성 기능이 없으면 안내가 뜬다 → "${t.slice(0, 60)}"`, t.length > 0);
    await ctx.close();
  }
}

// [F] 주소 길이 최악치 — 800개·7,706개를 전부 눌렀을 때
{
  console.log(`\n■ 주소 길이 최악치`);
  for (const page of Object.keys(PAGES)) {
    const { ctx, p } = await open(`${BASE}/${page}`, { ua: UA_THREADS });
    const len = await p.evaluate(async (pg) => {
      const D = JSON.parse(document.getElementById("moe").textContent);
      const order = D.order, W = D.words || {};
      const all = {}; order.forEach((w) => { all[w] = 1; });
      const rec = {}; order.forEach((w, i) => { if (i % 2) rec[w] = [3, 20400]; });
      if (pg === "review.html") { localStorage.setItem("check800_v1", JSON.stringify(all)); localStorage.setItem("review800_v1", JSON.stringify(rec)); }
      else {
        for (let g = 1; g <= 6; g++) { const k = {}; order.forEach((w) => { if (((W[w] && W[w].grade) || 1) === g) k[w] = 1; }); localStorage.setItem("korean" + g + "_v1", JSON.stringify(k)); }
        localStorage.setItem("korean_review_v1", JSON.stringify(rec));
      }
      return (await window.__peeraCarryUrl()).length;
    }, page).catch((e) => "오류 " + String(e).slice(0, 80));
    ok(`[F] ${page} 전부 눌렀을 때 주소 ${len}자 (200,000자 미만)`, typeof len === "number" && len < 200000, String(len));
    await ctx.close();
  }
}

await browser.close(); server.close();
console.log(fail ? `\n🟥 ${fail}개 실패` : `\n✅ 전부 통과`);
process.exit(fail ? 1 : 0);
