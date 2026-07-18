# peera-landing

피어라(Peera) 출시 전 **이메일 사전예약 랜딩페이지**. 정적 페이지 하나(`index.html`)로,
GitHub Pages로 호스팅한다. 감정카드 앱의 피어라 CTA가 이 페이지로 연결된다.

## 배포 (GitHub Pages)

1. GitHub에 **`peera-landing`** 이름으로 새 공개 레포를 만든다(계정: Hephaestosian).
2. 이 폴더를 push 한다:
   ```
   git remote add origin https://github.com/Hephaestosian/peera-landing.git
   git push -u origin main
   ```
3. 레포 **Settings → Pages → Source: `main` / `/root`** 로 Pages를 켠다.
4. 몇 분 뒤 아래 주소로 열린다(앱에 연결된 주소와 동일):
   **https://hephaestosian.github.io/peera-landing/**

## 이메일 수집 연결 (Formspree, 무료)

`index.html`의 폼은 [Formspree](https://formspree.io)로 이메일을 보낸다. 설치:

1. formspree.io 가입 → 새 form 생성(수신 이메일: retyper@naver.com 등).
2. 받은 엔드포인트(예: `https://formspree.io/f/abcdwxyz`)를 복사.
3. `index.html`에서 `action="https://formspree.io/f/YOUR_FORM_ID"` 의
   `YOUR_FORM_ID`를 그 주소로 교체.

> 연결 전에는 폼 제출 시 "아직 폼이 연결되지 않았어요" 안내가 뜬다.
> Google Forms 링크로 대체하고 싶으면 폼 대신 버튼 하나로 바꿔도 된다.

## 구성

- `index.html` — 랜딩페이지(HTML·CSS·JS 인라인, 폰트만 CDN).
- `peera-sprout.png` — 브랜드 이미지(감정카드 앱의 피어라 새싹에서 가져옴).
