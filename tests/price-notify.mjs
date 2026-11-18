// ─────────────────────────────────────────────────────────────
// 체크 페이지 「가격을 보고 출시 알림 신청」 칸 검사 (2026-11-18 출시·과금 위원회 결정 4)
//
// 왜: 결제를 못 받는 동안의 가격 확인 = 19,000/159,000을 보여 준 뒤에도 알림을 신청하는 사람 수. 채널별로 센다.
//
// 이 검사가 빨개지는 경우:
//   [0] 로드 직후 페이지 오류가 있다
//   [1] 칸이 없다 / 가격 두 개(19,000·159,000)가 칸 안에 안 보인다 / 동의 칸이 없다
//       / 푸터에 「이메일도 받지 않습니다」가 남아 있다(이메일 칸이 생겼으니 거짓이 된다)
//   [2] 스레드 글 주소로 와서 신청했는데 보낸 칸이 정해진 여섯이 아니다(낱말 기록이 섞여 나가면 빨강)
//       / 신청위치가 「체크-가격알림」이 아니다 / 유입경로가 「threads_1119_1 / post / peera_check」가 아니다
//       / 완료 문구가 안 뜬다 / GA generate_lead(cta_location=체크-가격알림)가 안 남는다
//   [3] utm 없이 오면 유입경로가 「(직접 방문)」이 아니다
//   [4] 서버가 error를 주면 실패 문구 대신 완료 문구가 뜬다
//   [5] 이메일이 틀렸는데 서버로 보낸다
//
// 전제와 원본:
//   · 시트 열 = 타임스탬프|email|신청위치|유입경로|개인정보동의|raw — tools/google-apps-script/Code.gs:7, 헤더 이름으로 칸을 찾는다 :28-31
//   · 성공/실패는 HTTP가 아니라 응답 JSON의 result — Code.gs:51(success)·:54(error), index.html 제출 처리 같은 판정
//   · _gotcha가 차 있으면 시트에 안 남긴다 — Code.gs:19
//   · 유입경로 모양 「source / medium / campaign [/ content]」 — index.html:2108-2116 trafficSource
//   · 낱말 저장 키 check800_v1 — check.html 스크립트 `var KEY='check800_v1'`
//   · 진짜 Apps Script로는 절대 안 보낸다: script.google.com 요청은 전부 route로 가로챈다.
//
// 쓰는 법: node tests/price-notify.mjs
// ─────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
const chromium = await (async () => {
  for (const spec of ["playwright",
                      new URL("../../dearmydiary/node_modules/playwright/index.mjs", import.meta.url).href,
                      new URL("../../emotion_cards/node_modules/playwright/index.mjs", import.meta.url).href]) {
    try { return (await import(spec)).chromium; } catch { /* 다음 후보 */ }
  }
  console.error("🟥 playwright 를 못 찾았습니다"); process.exit(2);
})();

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".riv": "application/octet-stream", ".wasm": "application/wasm" };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const f = path.join(ROOT, rel);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("no"); return; }
  res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}/check.html`;
const Q = s => `${BASE}?utm_source=${s}&utm_medium=post&utm_campaign=peera_check`;

let fail = 0;
const ok = (c, m) => { console.log(`  ${c ? "✅" : "🟥"} ${m}`); if (!c) fail++; };

// multipart 본문 → {이름: 값}
function parseMultipart(body) {
  const out = {};
  const re = /name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n--/g;
  let m; while ((m = re.exec(body))) out[m[1]] = m[2];
  return out;
}

const browser = await chromium.launch();
async function fresh(reply = { result: "success" }) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.route(/googletagmanager|google-analytics/, r => r.abort());
  const posts = [];
  await ctx.route(/script\.google\.com/, async r => {
    posts.push(parseMultipart(r.request().postDataBuffer()?.toString("utf8") || ""));
    await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(reply) });
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(String(e)));
  return { ctx, page, errs, posts };
}
const FORM = "form#priceNotify";
async function submit(page, email) {
  await page.locator(`${FORM} input[type=email]`).scrollIntoViewIfNeeded();
  await page.fill(`${FORM} input[type=email]`, email);
  await page.click(`${FORM} button[type=submit]`);
  await page.waitForTimeout(400);
}
const statusOf = page => page.evaluate(f => { const s = document.querySelector(f + " .status"); return s ? { cls: s.className, text: s.textContent.trim() } : null; }, FORM);

// [0][1] 생김새
{
  const { ctx, page, errs } = await fresh();
  console.log("[0][1] 칸 생김새");
  await page.goto(BASE); await page.waitForTimeout(400);
  ok(errs.length === 0, `로드 직후 오류 0건 — 지금 ${JSON.stringify(errs)}`);
  const i = await page.evaluate(f => {
    const fm = document.querySelector(f);
    const box = fm && (fm.closest("section") || fm.parentElement);
    const t = box ? box.innerText.replace(/\s+/g, " ") : "";
    return { exists: !!fm, price19: t.includes("19,000"), price159: t.includes("159,000"),
      consent: !!(fm && fm.querySelector('[name="개인정보동의"][required]')), consentChecked: !!(fm && fm.querySelector('[name="개인정보동의"]')?.checked),
      privacyLink: !!(fm && fm.querySelector('a[href="privacy.html"]')),
      head: box ? (box.querySelector("h2")?.innerText || "") : "",
      footerSaysNoEmail: (document.querySelector("footer")?.innerText || "").includes("이메일도 받지 않습니다"),
      footer: (document.querySelector("footer")?.innerText || "").split("\n").pop() };
  }, FORM);
  ok(i.exists, `알림 신청 폼 있음 — 지금 ${i.exists} · 제목 「${i.head}」`);
  ok(i.price19 && i.price159, `칸 안에 19,000·159,000 — 지금 ${i.price19}·${i.price159}`);
  ok(i.consent && i.consentChecked && i.privacyLink, `동의 칸(필수·기본 체크)·개인정보처리방침 링크 — 지금 ${i.consent}·${i.consentChecked}·${i.privacyLink}`);
  ok(!i.footerSaysNoEmail, `푸터에 「이메일도 받지 않습니다」 없음 — 지금 「${i.footer}」`);
  const todo = await page.evaluate(() => document.documentElement.outerHTML.match(/TODO_[A-Z]+/g) || []);
  ok(todo.length === 0, `문구 자리표시(TODO_) 남은 것 0 — 지금 ${JSON.stringify(todo)}`);
  await ctx.close();
}

// [2] 스레드 글에서 와서, 낱말 하나 누르고, 신청
{
  const { ctx, page, errs, posts } = await fresh();
  console.log("[2] threads_1119_1 → 낱말 누르고 신청");
  await page.goto(Q("threads_1119_1")); await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('.grp .w[data-w="house"]').click());
  await submit(page, "parent@example.com");
  const p = posts[0] || {};
  const keys = Object.keys(p).sort();
  const WANT = ["_gotcha", "_subject", "email", "개인정보동의", "신청위치", "유입경로"].sort();
  ok(posts.length === 1, `서버로 한 번 보냄 — 지금 ${posts.length}번`);
  ok(JSON.stringify(keys) === JSON.stringify(WANT), `보낸 칸 = 정해진 여섯 — 지금 ${JSON.stringify(keys)}`);
  ok(!JSON.stringify(p).includes("house"), `낱말 기록이 안 섞임 — 본문에 house ${JSON.stringify(p).includes("house") ? "있음" : "없음"}`);
  ok(p["신청위치"] === "체크-가격알림", `신청위치 — 지금 「${p["신청위치"]}」`);
  ok(p["유입경로"] === "threads_1119_1 / post / peera_check", `유입경로 — 지금 「${p["유입경로"]}」`);
  ok(p.email === "parent@example.com" && p["개인정보동의"] === "동의함" && p._gotcha === "", `email·동의·_gotcha — 지금 ${p.email}·${p["개인정보동의"]}·「${p._gotcha}」`);
  const s = await statusOf(page);
  ok(s && /\bok\b/.test(s.cls) && s.text.length > 0, `완료 문구 — 지금 ${JSON.stringify(s)}`);
  const ga = await page.evaluate(() => (window.dataLayer || []).map(a => [...a]).filter(a => a[0] === "event" && a[1] === "generate_lead").map(a => a[2]));
  ok(ga.length === 1 && ga[0].cta_location === "체크-가격알림", `GA generate_lead — 지금 ${JSON.stringify(ga)}`);
  ok(errs.length === 0, `오류 0건 — 지금 ${JSON.stringify(errs)}`);
  await page.locator(FORM).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(ROOT, "tests", "price-notify-done.png") });
  await ctx.close();
}

// [3] utm 없이
{
  const { ctx, page, posts } = await fresh();
  console.log("[3] utm 없이 신청");
  await page.goto(BASE); await page.waitForTimeout(400);
  await submit(page, "parent2@example.com");
  ok((posts[0] || {})["유입경로"] === "(직접 방문)", `유입경로 — 지금 「${(posts[0] || {})["유입경로"]}」`);
  await ctx.close();
}

// [3b] 스레드에서 왔다가 같은 탭에서 utm 없는 주소로 다시 온 경우(복습 페이지 갔다 「← 체크」로 돌아옴 등)
//      check.html peera_src 스크립트가 sessionStorage에 남긴 출처를 쓴다 — 안 쓰면 「(직접 방문)」으로 뭉개진다 (11/18 감사 8)
{
  const { ctx, page, posts } = await fresh();
  console.log("[3b] 같은 탭 재방문");
  await page.goto(Q("threads_1124_1")); await page.waitForTimeout(300);
  await page.goto(BASE); await page.waitForTimeout(400);
  await submit(page, "parent4@example.com");
  ok((posts[0] || {})["유입경로"] === "threads_1124_1 / 같은 방문", `유입경로 — 지금 「${(posts[0] || {})["유입경로"]}」`);
  await ctx.close();
}

// [4] 서버 오류
{
  const { ctx, page, posts } = await fresh({ result: "error", error: "test" });
  console.log("[4] 서버가 error");
  await page.goto(BASE); await page.waitForTimeout(400);
  await submit(page, "parent3@example.com");
  const s = await statusOf(page);
  ok(posts.length === 1 && s && /\berr\b/.test(s.cls) && !/\bok\b/.test(s.cls), `실패 문구 — 지금 ${JSON.stringify(s)}`);
  await ctx.close();
}

// [5] 틀린 이메일
{
  const { ctx, page, posts } = await fresh();
  console.log("[5] 틀린 이메일");
  await page.goto(BASE); await page.waitForTimeout(400);
  await submit(page, "not-an-email");
  ok(posts.length === 0, `서버로 안 보냄 — 지금 ${posts.length}번`);
  await ctx.close();
}

await browser.close(); server.close();
console.log(fail ? `\n🟥 실패 ${fail}건` : "\n✅ 전부 통과");
process.exit(fail ? 1 : 0);
