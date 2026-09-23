/* 소리로 듣기 — 인앱 창 안내 + 크롬으로 기록째 넘기기
   review.html · korean-review.html 이 <head> 에서 부른다. data-keys 에 그 페이지가 읽는 저장 키를 적는다.

   왜: 스레드·인스타에서 링크를 누르면 앱 안의 창(안드로이드 WebView)에서 열린다. 거기선 speechSynthesis 가
   소리를 내지 않는데(2026-09-23 사장님 안드로이드 실물), speak() 가 오류를 삼켜서 누른 사람은 아무 일도 없는 줄 안다.
   크롬으로 넘기기만 하면 저장소(localStorage)가 달라 체크 기록이 텅 빈 채 열린다 — 그래서 기록을 주소(c=)에 싣는다.
   크롬 쪽에선 c= 를 크롬에 이미 있던 기록과 **합쳐** 저장하고, 주소에서 뗀 뒤 다시 연다. 새로고침해도 다시 가져오지 않는다.

   왜 덮어쓰지 않고 합치나: 스레드→크롬으로 넘어가 크롬에서 며칠 더 한 사람이, 다음에 스레드 링크로 다시 들어와
   버튼을 누르면 스레드 창에 남은 **옛 기록**이 실려 온다. 덮어쓰면 크롬에서 한 며칠이 사라진다. */
(function(){
  var me = document.currentScript;
  var KEYS = ((me && me.getAttribute("data-keys")) || "").split(",").filter(Boolean);
  var GA_ID = "G-VK77HTLEQH";   // review.html·korean-review.html 하단 gtag config 와 같은 값
  var UA = navigator.userAgent || "";
  var ANDROID_INAPP = /Android/i.test(UA) && /(; wv\)|Barcelona|Instagram|FBAN|FBAV|KAKAOTALK|NAVER\(inapp|DaumApps|Line\/)/i.test(UA);
  var FLAG = "peera_carried";

  function b64u(bytes){ var s = ""; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function unb64u(t){ t = t.replace(/-/g, "+").replace(/_/g, "/"); while (t.length % 4) t += "=";
    var s = atob(t), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
  function pipe(bytes, stream){ return new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer().then(function(a){ return new Uint8Array(a); }); }

  /* 싣기: 앞 글자 z = 압축, u = 그대로 */
  function pack(){
    var o = {};
    KEYS.forEach(function(k){ try { var v = localStorage.getItem(k); if (v != null) o[k] = v; } catch(e){} });
    var raw = new TextEncoder().encode(JSON.stringify(o));
    if (window.CompressionStream) return pipe(raw, new CompressionStream("deflate-raw")).then(function(z){ return "z" + b64u(z); });
    return Promise.resolve("u" + b64u(raw));
  }
  function unpack(t){
    var bytes = unb64u(t.slice(1));
    var p = t.charAt(0) === "z" ? pipe(bytes, new DecompressionStream("deflate-raw")) : Promise.resolve(bytes);
    return p.then(function(b){ return JSON.parse(new TextDecoder().decode(b)); });
  }
  function withoutC(){
    var u = new URL(location.href); u.searchParams.delete("c"); return u.toString();
  }

  /* 합치기 — 값 모양으로 가른다(두 페이지 모두 같은 모양이다).
     · 아는 낱말 {낱말:1} · 끝낸 글자 {글자:1}      → 둘 중 하나라도 체크했으면 체크
     · 복습 기록 {낱말:[단계, 다음 날짜]}            → 다음 날짜가 늦은 쪽(= 더 뒤에 푼 쪽), 같으면 단계가 높은 쪽
       (review.html:421 알아요 = [단계, 오늘+간격], :428 아직 = [0, 오늘+1])
     · 복습 설정 {start, size, lastDone}           → 시작일은 이른 쪽, 마지막으로 끝낸 날은 늦은 쪽, 분량은 가져온 쪽
     · 그 밖(분량 숫자 등)                          → 가져온 쪽
     ⚠ 크롬에서 체크를 **해제한** 낱말은 스레드 쪽 기록 때문에 다시 체크될 수 있다. 시각 기록이 없어 가를 수 없다. */
  function isObj(x){ return x && typeof x === "object" && !Array.isArray(x); }
  function mergeRaw(had, got){
    if (had == null) return got;
    var a, b; try { a = JSON.parse(had); b = JSON.parse(got); } catch(e){ return got; }
    if (!isObj(a) || !isObj(b)) return got;
    var out = {}, k;
    if ("start" in a || "start" in b) {
      for (k in a) out[k] = a[k]; for (k in b) out[k] = b[k];
      if (typeof a.start === "number" && typeof b.start === "number") out.start = Math.min(a.start, b.start);
      if (typeof a.lastDone === "number" && typeof b.lastDone === "number") out.lastDone = Math.max(a.lastDone, b.lastDone);
      return JSON.stringify(out);
    }
    for (k in a) out[k] = a[k];
    for (k in b) {
      var x = out[k], y = b[k];
      if (Array.isArray(x) && Array.isArray(y)) out[k] = (y[1] > x[1] || (y[1] === x[1] && y[0] > x[0])) ? y : x;
      else if (!x) out[k] = y;
    }
    return JSON.stringify(out);
  }

  /* ── 크롬 쪽: 실려 온 기록 가져오기 ── */
  var q = new URLSearchParams(location.search).get("c");
  if (q) {
    window["ga-disable-" + GA_ID] = true;                   // 기록을 실은 긴 주소를 GA 로 보내지 않는다(곧 다시 연다)
    document.documentElement.style.visibility = "hidden";   // 빈 기록으로 그려진 화면을 보이지 않는다
    unpack(q).then(function(o){
      KEYS.forEach(function(k){
        if (!(k in o)) return;
        try { localStorage.setItem(k, mergeRaw(localStorage.getItem(k), o[k])); } catch(e){}
      });
      try { sessionStorage.setItem(FLAG, "1"); } catch(e){}
    }).catch(function(){}).then(function(){
      /* 다시 여는 화면의 GA 가 이전 주소(dr)로 c= 를 싣고 나간다(검사 [J]가 잡음). 이전 주소를 넘기지 않는다.
         utm 은 withoutC() 가 그대로 두므로 채널 판별은 남는다. */
      var m = document.createElement("meta"); m.name = "referrer"; m.content = "no-referrer";
      document.head.appendChild(m);
      location.replace(withoutC());
    });
  }

  /* ── 인앱 창 쪽: 크롬으로 여는 주소 ── */
  window.__peeraCarryUrl = function(){
    return pack().then(function(c){
      var u = new URL(withoutC()); u.searchParams.set("c", c);
      var scheme = location.protocol.replace(":", "");
      return "intent://" + u.host + u.pathname + u.search
        + "#Intent;scheme=" + scheme + ";package=com.android.chrome;S.browser_fallback_url=" + encodeURIComponent(withoutC()) + ";end";
    });
  };

  function track(n, p){ try { if (window.gtag) gtag("event", n, p || {}); } catch(e){} }
  function chromeLink(a, where){
    a.addEventListener("click", function(){ track("speak_open_chrome", { where: where }); });
    window.__peeraCarryUrl().then(function(h){ a.setAttribute("href", h); }).catch(function(){});
  }
  function bar(id, html){
    var d = document.createElement("div");
    d.className = "saynote"; d.id = id; d.innerHTML = html;
    var h = document.querySelector(".wrap > header");
    if (h && h.parentNode) h.parentNode.insertBefore(d, h.nextSibling); else document.body.insertBefore(d, document.body.firstChild);
    return d;
  }

  /* ── 화면이 선 뒤: 위쪽 안내 ── */
  document.addEventListener("DOMContentLoaded", function(){
    if (q) return;
    /* 스레드 창: 누르기 전에 먼저 알려 준다. 카드를 풀다가 넘어가면 풀던 자리부터 다시 시작하게 된다. */
    if (ANDROID_INAPP) {
      bar("inappBar", '<p>스레드·인스타 창에서는 「소리로 듣기」가 되지 않습니다. 크롬에서 열면 소리가 나고, 여기서 한 기록도 그대로 이어집니다.</p>'
        + '<a class="btn pri" id="aChromeTop" href="#">크롬에서 열기</a>');
      chromeLink(document.getElementById("aChromeTop"), "top");
    }
    /* 크롬: 넘어온 첫 화면에서 한 번만 — 기록이 따라왔는지 바로 알게 */
    var carried = false; try { carried = sessionStorage.getItem(FLAG) === "1"; sessionStorage.removeItem(FLAG); } catch(e){}
    if (carried) {
      bar("carriedBar", '<p style="margin:0">스레드 창에서 하던 기록을 그대로 가져왔습니다. 이제 「소리로 듣기」가 됩니다.</p>');
      track("speak_carried_in");
    }
  });

  var shown = false;
  function note(){
    var box = document.getElementById("sayNote"); if (!box) return;
    box.classList.remove("hide");
    if (shown) return; shown = true;
    track("speak_blocked", { inapp: ANDROID_INAPP ? 1 : 0 });
    if (ANDROID_INAPP) {
      box.innerHTML = '<p>이 창은 스레드·인스타 안에서 열린 창이라 소리가 나지 않습니다. '
        + '크롬에서 열면 소리가 나고, 지금까지 한 기록도 그대로 옮겨 갑니다.</p>'
        + '<a class="btn pri" id="aChrome" href="#">크롬에서 이어서 하기</a>'
        + '<p class="sm">안 열리면 오른쪽 위 ⋮ 를 누르고 「브라우저에서 열기」를 골라 주세요.</p>';
      chromeLink(document.getElementById("aChrome"), "card");
    } else {
      box.innerHTML = '<p>이 창에서는 소리가 나지 않습니다. 오른쪽 위 메뉴에서 「브라우저에서 열기」를 골라 주세요.</p>';
    }
  }

  /* 페이지의 speak() 첫 줄에서 부른다. true 면 말하지 않고 돌아간다. */
  window.__peeraSpeakBlocked = function(){
    if (ANDROID_INAPP || !window.speechSynthesis || !window.SpeechSynthesisUtterance) { note(); return true; }
    return false;
  };
})();
