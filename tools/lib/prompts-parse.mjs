// prompts.html에서 **재료**(제목·리드·쓰는 법·질문 목록)를 꺼내고 그 해시를 만든다.
//
// 왜 따로 뺐나: 2026-09-22에 같은 추출 규칙이 세 곳에 생길 참이었다 —
// tools/sheet.mjs(34개 전체 자료), tools/fridge.mjs(냉장고 1장), 그리고
// peera-growth/운영/검사/문구-냉장고시험.mjs(검사). 한 곳만 고치면 검사가
// 전부 「낡았다」고 거짓말을 한다. 이 레포 안의 두 곳은 여기로 합쳤다.
//
// 🟥 남은 한 곳(다른 레포의 검사)은 여전히 따로다. **아래 정규식을 고치면
//    `peera-growth/운영/검사/문구-냉장고시험.mjs`의 재료해시 함수도 같이 고친다.**
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

export function 읽기(src) {
  const html = readFileSync(src, "utf8");
  const 하나 = (re, 이름) => {
    const m = html.match(re);
    if (!m) throw new Error(`${src}에서 ${이름}를 못 찾았습니다 — 페이지 구조가 바뀌었습니다`);
    return m[1].trim();
  };

  const 제목 = 하나(/<h1>([\s\S]*?)<\/h1>/, "h1");
  const 리드 = 하나(/<p class="lede">([\s\S]*?)<\/p>/, "lede");
  const 쓰는법 = 하나(/<div class="how">([\s\S]*?)<\/div>/, "how");

  // 섹션: <h2>제목</h2> ... <ol>…</ol>  (사이에 안내문 <p>가 있을 수 있다)
  const 섹션 = [];
  const re = /<h2>([^<]+)<\/h2>([\s\S]*?)<ol>([\s\S]*?)<\/ol>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const 안내 = (m[2].match(/<p[^>]*>([\s\S]*?)<\/p>/) || [, ""])[1].trim();
    const 줄 = [...m[3].matchAll(/<li><span class="n">(\d+)<\/span>([\s\S]*?)<\/li>/g)]
      .map(x => ({ n: x[1], t: x[2].trim() }));
    if (줄.length) 섹션.push({ 제목: m[1].trim(), 안내, 줄 });
  }
  if (!섹션.length) throw new Error(`${src}에서 질문 목록을 못 찾았습니다`);

  const 총개수 = 섹션.reduce((a, s) => a + s.줄.length, 0);
  // 🟥 해시에 넣는 키·순서를 바꾸면 기존 기록이 전부 「낡았다」가 된다. 바꾸려면 다시 구워야 한다.
  const 재료해시 = createHash("sha256")
    .update(JSON.stringify({ 제목, 리드, 쓰는법, 섹션 })).digest("hex").slice(0, 16);

  return { html, 제목, 리드, 쓰는법, 섹션, 총개수, 재료해시 };
}

// 번호로 질문을 찾는다. 냉장고 1장은 34개 중 일부만 싣는데,
// **문장은 페이지가 원본**이어야 한다(페이지 문구를 고치면 인쇄물도 따라오게).
export function 번호로(재료, 번호들) {
  const 전부 = new Map(재료.섹션.flatMap(s => s.줄).map(q => [Number(q.n), q.t]));
  return 번호들.map(n => {
    const t = 전부.get(n);
    if (!t) throw new Error(`prompts.html에 ${n}번 질문이 없습니다 — 번호가 바뀌었습니다`);
    return { n, t };
  });
}

// 생성 기록 — 「페이지를 고치고 굽지 않았다」를 정확히 잡기 위한 도장.
// mtime은 git checkout·무관한 편집에도 바뀌어 헛경보가 난다. 그래서 재료 해시를 남긴다.
// 검사: node ../peera-growth/운영/검사/문구-냉장고시험.mjs
export function 기록하기(산출들, 정보) {
  const 기록파일 = path.resolve("data/생성-기록.json");
  let 기록 = {};
  try { 기록 = JSON.parse(readFileSync(기록파일, "utf8")); } catch {}
  for (const 산출 of 산출들.filter(Boolean)) {
    기록[산출.split(path.sep).join("/")] = { ...정보, 구운시각: new Date().toISOString() };
  }
  writeFileSync(기록파일, JSON.stringify(기록, null, 2) + "\n", "utf8");
}
