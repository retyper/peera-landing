/* 소리로 듣기 — 인앱 창 안내 + 크롬으로 기록째 넘기기
   review.html · korean-review.html 이 <head> 에서 부른다. data-keys 에 그 페이지가 읽는 저장 키를 적는다.

   왜: 스레드·인스타에서 링크를 누르면 앱 안의 창(안드로이드 WebView)에서 열린다. 거기선 speechSynthesis 가
   소리를 내지 않는데(2026-09-23 사장님 안드로이드 실물), speak() 가 오류를 삼켜서 누른 사람은 아무 일도 없는 줄 안다.
   크롬으로 넘기기만 하면 저장소(localStorage)가 달라 체크 기록이 텅 빈 채 열린다 — 그래서 기록을 주소(c=)에 싣는다.
   크롬 쪽에선 c= 를 저장하고 주소에서 뗀 뒤 다시 연다. 새로고침해도 다시 가져오지 않는다. */
(function(){
  var me = document.currentScript;
  var KEYS = ((me && me.getAttribute("data-keys")) || "").split(",").filter(Boolean);
  var UA = navigator.userAgent || "";
  var ANDROID_INAPP = /Android/i.test(UA) && /(; wv\)|Barcelona|Instagram|FBAN|FBAV|KAKAOTALK|NAVER\(inapp|DaumApps|Line\/)/i.test(UA);

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

  /* ── 크롬 쪽: 실려 온 기록 가져오기 ── */
  var q = new URLSearchParams(location.search).get("c");
  if (q) {
    document.documentElement.style.visibility = "hidden";   // 빈 기록으로 그려진 화면을 보이지 않는다
    unpack(q).then(function(o){
      KEYS.forEach(function(k){ try { if (k in o) localStorage.setItem(k, o[k]); } catch(e){} });
    }).catch(function(){}).then(function(){ location.replace(withoutC()); });
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

  function track(n){ try { if (window.gtag) gtag("event", n, { inapp: ANDROID_INAPP ? 1 : 0 }); } catch(e){} }

  var shown = false;
  function note(){
    var box = document.getElementById("sayNote"); if (!box) return;
    box.classList.remove("hide");
    if (shown) return; shown = true;
    track("speak_blocked");
    if (ANDROID_INAPP) {
      box.innerHTML = '<p>이 창은 스레드·인스타 안에서 열린 창이라 소리가 나지 않습니다. '
        + '크롬에서 열면 소리가 나고, 지금까지 한 기록도 그대로 옮겨 갑니다.</p>'
        + '<a class="btn pri" id="aChrome" href="#">크롬에서 이어서 하기</a>'
        + '<p class="sm">안 열리면 오른쪽 위 ⋮ 를 누르고 「브라우저에서 열기」를 골라 주세요.</p>';
      var a = document.getElementById("aChrome");
      a.addEventListener("click", function(){ track("speak_open_chrome"); });
      window.__peeraCarryUrl().then(function(h){ a.setAttribute("href", h); }).catch(function(){});
    } else {
      box.innerHTML = '<p>이 창에서는 소리가 나지 않습니다. 오른쪽 위 메뉴에서 「브라우저에서 열기」를 골라 주세요.</p>';
    }
  }

  /* 페이지의 speak() 첫 줄에서 부른다. true 면 말하지 않고 돌아간다. */
  window.__peeraSpeakBlocked = function(){
    if (ANDROID_INAPP || !window.speechSynthesis || !window.SpeechSynthesisUtterance) { note(); return true; }
    return false;
  };
  window.__peeraSpeakFailed = note;
})();
