// 라이티 원본(assets/writy-wink.png)은 배경이 흰색(#FEFEFE)으로 채워진 정사각 아이콘이다.
// 종이에서는 안 보이지만, 말풍선 위에 겹쳐 놓으려면 배경이 **투명**해야 한다.
//
// 🟥 near-white를 전부 투명으로 바꾸면 **눈 흰자와 이빨이 같이 뚫린다.**
//    그래서 색으로 지우지 않고 **테두리에서 시작하는 flood fill**로 지운다 —
//    바깥과 이어진 흰색만 사라지고, 몸 안쪽에 갇힌 흰색은 남는다.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const { PNG } = createRequire(import.meta.url)("pngjs");

const p = PNG.sync.read(readFileSync("assets/writy-wink.png"));
const { width: W, height: H, data } = p;
const 흰가 = i => data[i] >= 244 && data[i + 1] >= 244 && data[i + 2] >= 244;
const 방문 = new Uint8Array(W * H);
const 큐 = [];
for (let x = 0; x < W; x++) { 큐.push(x, (H - 1) * W + x); }
for (let y = 0; y < H; y++) { 큐.push(y * W, y * W + W - 1); }

let 지움 = 0;
while (큐.length) {
  const k = 큐.pop();
  if (방문[k]) continue;
  방문[k] = 1;
  const i = k * 4;
  if (!흰가(i)) continue;
  data[i + 3] = 0; 지움++;
  const x = k % W, y = (k - x) / W;
  if (x > 0) 큐.push(k - 1);
  if (x < W - 1) 큐.push(k + 1);
  if (y > 0) 큐.push(k - W);
  if (y < H - 1) 큐.push(k + W);
}
writeFileSync("assets/writy-wink-cut.png", PNG.sync.write(p));

// 확인: 눈 흰자·이빨이 남아 있어야 한다. 몸 안쪽(중앙부)에 불투명 흰 픽셀이 0개면 뚫린 것이다.
let 안쪽흰색 = 0;
for (let y = 60; y < 200; y++) for (let x = 60; x < 200; x++) {
  const i = (y * W + x) * 4;
  if (data[i + 3] === 255 && 흰가(i)) 안쪽흰색++;
}
console.log(`지운 배경 ${지움}px / ${W * H} · 몸 안쪽에 남은 흰 픽셀 ${안쪽흰색}px`);
let 남은몸 = 0;
for (let k = 0; k < W * H; k++) if (data[k * 4 + 3] === 255) 남은몸++;
console.log(`남은 라이티 ${남은몸}px (기대 12,000~26,000)`);
// 빨개지는 조건: ①옅은 틈으로 flood fill이 몸 안까지 새면 남은몸이 급감한다
//               ②눈 흰자·이빨이 바깥과 이어져 있었다면 안쪽흰색이 0이 된다
if (남은몸 < 12000 || 남은몸 > 26000) { console.error("🟥 배경이 몸 안까지 샜거나 거의 못 지웠다"); process.exit(1); }
if (안쪽흰색 === 0) { console.error("🟥 눈·이빨까지 뚫렸다"); process.exit(1); }

// 🟥 원본 캔버스 256×256인데 라이티 실루엣은 x 61~231 · y 63~185(=171×123)뿐이다.
//    그대로 쓰면 170px로 넣어도 실제 캐릭터는 113px로 보인다. 잘라서 내보낸다.
//    (측정: 이 파일 위쪽 바운딩박스 계산 — assets/writy-wink.png x 61~231, y 63~185)
{
  let x0 = W, x1 = -1, y0 = H, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (data[i + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const 여백 = 4;
  x0 = Math.max(0, x0 - 여백); y0 = Math.max(0, y0 - 여백);
  x1 = Math.min(W - 1, x1 + 여백); y1 = Math.min(H - 1, y1 + 여백);
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const 잘린 = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = ((y + y0) * W + (x + x0)) * 4, d = (y * w + x) * 4;
    잘린.data[d] = data[s]; 잘린.data[d + 1] = data[s + 1];
    잘린.data[d + 2] = data[s + 2]; 잘린.data[d + 3] = data[s + 3];
  }
  writeFileSync("assets/writy-wink-cut.png", PNG.sync.write(잘린));
  console.log(`잘라냄: ${w}×${h} (원본 ${W}×${H} — 빈 여백 ${Math.round((1 - w * h / (W * H)) * 100)}% 제거)`);
  if (w < 120 || h < 90) { console.error("🟥 너무 많이 잘렸다"); process.exit(1); }
}
