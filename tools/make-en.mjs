// 한국어 index.html → 영어 en.html 생성.
//
//   node tools/make-en.mjs index.html en.html
//
// 의존성 없음(순수 문자열 치환). 한국어판 카피를 고치면 반드시 다시 돌린다.
// CSS·스크립트·목업 구조는 그대로 두고 '보이는 문구'만 치환한다.
// 치환 실패가 있으면 콘솔에 찍고 종료코드 1 — 한국어가 섞인 채 배포되는 걸 막는다.
import fs from "node:fs";
import path from "node:path";

const SRC = process.argv[2];
const OUT = process.argv[3];
let s = fs.readFileSync(SRC, "utf8");

const R = [];
const rep = (a, b) => R.push([a, b]);

// ── head ──
rep('<html lang="ko">', '<html lang="en">');
rep('<title>피어라 | 화난 게 아니라 아쉬웠던 거야, 손글씨 일기 앱</title>',
    '<title>Peera | Not angry — just let down. A handwritten diary app.</title>');
rep('content="라이티가 하루 한 번 문자를 보내면 아이가 통화로 오늘 이야기를 들려줍니다. 그 이야기가 손글씨 일기가 되는 초등학생용 앱입니다."',
    'content="Writy texts once a day, your child calls and tells the day, and it becomes a handwritten diary. A diary app for elementary-age kids."');
rep('<meta property="og:title" content="화난 게 아니라 아쉬웠던 거야 | 피어라">',
    '<meta property="og:title" content="Not angry — just a little let down. | Peera">');
rep('<meta property="og:description" content="오늘 들려준 이야기가 손글씨 일기가 됩니다. 초등학생용 앱 피어라.">',
    '<meta property="og:description" content="What your child tells becomes a handwritten diary. Peera, for elementary-age kids.">');
rep('<meta property="og:url" content="https://retyper.github.io/peera-landing/">',
    '<meta property="og:url" content="https://retyper.github.io/peera-landing/en.html">');
rep('peera-og.png">\n<meta property="og:image:width"', 'peera-og-en.png">\n<meta property="og:image:width"');
rep('<meta name="twitter:image" content="https://retyper.github.io/peera-landing/peera-og.png">',
    '<meta name="twitter:image" content="https://retyper.github.io/peera-landing/peera-og-en.png">');
rep('<link rel="canonical" href="https://retyper.github.io/peera-landing/">',
    '<link rel="canonical" href="https://retyper.github.io/peera-landing/en.html">');
// 언어 라우팅 방향을 뒤집는다
rep("var THIS = 'ko', OTHER = 'en.html';", "var THIS = 'en', OTHER = 'index.html';");

// 구조화 데이터
rep('"name": "피어라 (Peera)"', '"name": "Peera"');
rep('"url": "https://retyper.github.io/peera-landing/",', '"url": "https://retyper.github.io/peera-landing/en.html",');
rep('"description": "라이티가 하루 한 번 문자를 보내고, 아이가 통화로 오늘 일을 들려주면 손글씨 일기로 이어지는 초등학생용 앱입니다.",',
    '"description": "Writy texts once a day; the child calls, tells the day, and it becomes a handwritten diary. A diary app for elementary-age kids.",');
rep('"audience": { "@type": "EducationalAudience", "educationalRole": "student", "audienceType": "예비초·초등학생" },',
    '"audience": { "@type": "EducationalAudience", "educationalRole": "student", "audienceType": "elementary-age children" },');

// ── 헤더/히어로 ──
rep('<span class="eyebrow rise in"><span class="dot"></span> 매일 한 번, 오늘을 들려주는 시간</span>',
    '<span class="eyebrow rise in"><span class="dot"></span> A daily moment to share today</span>');
// 히어로 h1 아이 인용 순환 — 4개 각각 매핑(구조·클래스는 그대로 두고 문구만 치환)
// EN은 한 줄이 길면 3줄로 접혀 순환 시 높이가 튄다 → 각 문장을 2줄로 짧게 유지(줄1 ≤ 약 18자).
rep('<span class="q">“</span>사실, 친구가 다른 친구랑만 놀아서<br>좀 서운했어<span class="q">”</span>',
    '<span class="q">“</span>Actually, they left me out,<br>and it stung<span class="q">”</span>');
rep('<span class="q">“</span>사실, 안 그랬는데 내 탓이라서<br>억울했어<span class="q">”</span>',
    '<span class="q">“</span>Actually, it wasn’t me,<br>so unfair<span class="q">”</span>');
rep('<span class="q">“</span>사실, 친구가 먼저 가버려서<br>서운했어<span class="q">”</span>',
    '<span class="q">“</span>Actually, they left without me,<br>and it hurt<span class="q">”</span>');
rep('<span class="q">“</span>사실, 종이접기를 나만 못 해서<br>속상했어<span class="q">”</span>',
    '<span class="q">“</span>Actually, I couldn’t keep up,<br>and I felt sad<span class="q">”</span>');
rep('aria-label="아이가 오늘 하루를 자기 말로 들려주는 순간"',
    'aria-label="A child telling their day in their own words"');
rep('<b>라이티가 하루 한 번 문자를 보냅니다.</b><br>\n        대화 직후, 아이가 직접 하루를 손글씨로 남깁니다.',
    '<b>Writy texts once a day.</b><br>\n        Right after the call, your child writes the day by hand.');
rep('<p class="sms-line rise in"><span class="sms">“오늘 있었던 일 통화하자!”</span></p>',
    '<p class="sms-line rise in"><span class="sms">“Tell me about your day!”</span></p>');

// 폼
rep('placeholder="이메일 주소" required aria-label="이메일 주소"', 'placeholder="Email address" required aria-label="Email address"');
// 히어로 버튼만 라벨이 다르다(ChatGPT 안1). 마무리 CTA는 아래 rep가 그대로 처리.
rep('<button class="btn" type="submit" disabled>먼저 알림받기</button>', '<button class="btn" type="submit" disabled>Get notified first</button>');
rep('<button class="btn" type="submit" disabled>출시 소식 받기</button>', '<button class="btn" type="submit" disabled>Get launch news</button>');
rep('<span>출시 알림을 받기 위한 <b>이메일 주소 수집·이용</b>에 동의합니다.\n            출시 안내 발송 후 지체 없이 파기해요.\n            <a href="privacy.html" target="_blank" rel="noopener">개인정보처리방침</a></span>',
    '<span>I agree to the <b>collection and use of my email address</b> to receive the launch notice.\n            It is deleted as soon as the notice is sent.\n            <a href="privacy-en.html" target="_blank" rel="noopener">Privacy notice</a></span>');
rep('<p class="note">출시되면 이 메일로 <b>딱 한 번</b> 알려드려요. 광고는 보내지 않습니다.</p>',
    '<p class="note">One email, <b>once</b>, when we launch. No marketing.</p>');
rep('<p class="note">출시되면 <b>딱 한 번</b> 알려드려요. 광고는 보내지 않습니다.</p>',
    '<p class="note">One email, <b>once</b>, when we launch. No marketing.</p>');
rep('value="[피어라] 사전예약 신청 — 히어로"', 'value="[Peera] Pre-registration — hero (EN)"');
rep('value="[피어라] 사전예약 신청 — 마무리 CTA"', 'value="[Peera] Pre-registration — final CTA (EN)"');
// ★필드 '이름'은 한국어 그대로 둔다 — JS가 [name="신청위치"]로 찾고, 알림 메일을
//   받는 쪽도 한국어라 양쪽 페이지가 같은 형식으로 와야 한다. 값만 EN으로 구분한다.
rep('name="신청위치" value="히어로"', 'name="신청위치" value="히어로 (EN)"');
rep('name="신청위치" value="마무리 CTA"', 'name="신청위치" value="마무리 CTA (EN)"');
rep('name="유입경로" data-source-field value="(직접 방문)"', 'name="유입경로" data-source-field value="(직접 방문)"');
rep('name="개인정보동의" value="동의함"', 'name="개인정보동의" value="동의함"');

// 지불의향(WTP) — 보이는 문구만 치환. data-wtp-val 값(시트로 전송)과 필드명은 한국어 유지.
rep('<p class="wtp-q">마지막으로 하나만요 🙏 출시되면 <b>월 얼마</b>면 신청하시겠어요?</p>',
    '<p class="wtp-q">One last thing 🙏 At launch, <b>how much a month</b> would you sign up for?</p>');
rep('aria-label="지불의향"', 'aria-label="Willingness to pay"');
rep('<button type="button" data-wtp-val="무료여야 신청" aria-pressed="false">무료여야 신청해요</button>',
    '<button type="button" data-wtp-val="무료여야 신청" aria-pressed="false">Only if it’s free</button>');
rep('<button type="button" data-wtp-val="~1만원" aria-pressed="false">~1만원</button>',
    '<button type="button" data-wtp-val="~1만원" aria-pressed="false">Up to ₩10,000</button>');
rep('<button type="button" data-wtp-val="1~2만원" aria-pressed="false">1~2만원</button>',
    '<button type="button" data-wtp-val="1~2만원" aria-pressed="false">₩10,000–20,000</button>');
rep('<button type="button" data-wtp-val="2만원 이상도" aria-pressed="false">2만원 이상도</button>',
    '<button type="button" data-wtp-val="2만원 이상도" aria-pressed="false">Even ₩20,000+</button>');
rep('<p class="wtp-thanks" hidden>솔직한 답 고마워요. 가격을 정하는 데 큰 도움이 됩니다.</p>',
    '<p class="wtp-thanks" hidden>Thanks for the honest answer. It really helps us set the price.</p>');

// 폰 데모 접근성 라벨
rep('aria-label="피어라 앱 미리보기: 다람쥐 라이티가 문자를 보내고, 아이가 전화를 걸어 이야기를 나눈 뒤, 그 마음이 손글씨 일기가 되는 장면"',
    'aria-label="Peera app preview: Writy the squirrel sends a text, the child calls and talks, and that story becomes a handwritten diary"');

// ── 문제/해결 장면(실사 이미지 자리 안내 포함) ──
rep('<span class="tag">이미지 자리</span>', '<span class="tag">Image slot</span>');
rep('alt="어린이집·학교 얘기를 물어도 앞에서 울기만 하는 아이"',
    'alt="A child who only cries when asked about daycare or school"');
rep('실사 3D · 유치원/학교 얘기에<br>앞에서 울기만 하는 아이<br>',
    'Photoreal 3D · a child who only cries<br>when asked about school<br>');
rep('<code>scene-worry.jpg</code> · 권장 1200×1500', '<code>scene-worry.jpg</code> · Suggested 1200×1500');
rep('<span class="kicker">이런 순간, 있으셨죠</span>', '<span class="kicker">You know this moment</span>');
rep('<h2>무슨 일 있었냐 물어도<br>울기만 하는 아이</h2>', '<h2>You ask what happened —<br>they just cry</h2>');
rep('<p>어린이집에서, 학교에서 오늘 무슨 일이 있었는지 물어도 앞에서 울기만 할 때.</p>',
    '<p>When you ask what happened at daycare or school today, and they only cry in front of you.</p>');
rep('<p><b>답답하고, 또 걱정되셨을 거예요.</b></p>', '<p><b>It’s frustrating — and worrying.</b></p>');
rep('<p class="turn">말하기 싫은 게 아니라,<br>아직 꺼내는 법을 모를 뿐이에요.</p>',
    '<p class="turn">It’s not that they won’t talk.<br>They just don’t know how to yet.</p>');

rep('alt="라이티와 전화하며 태블릿에 일기를 쓰는, 웃는 아이"',
    'alt="A smiling child writing a diary while on a call with Writy"');
rep('실사 3D · 라이티와 전화하며<br>태블릿에 일기 쓰는 아이(웃는 얼굴)<br>',
    'Photoreal 3D · a smiling child on a call<br>with Writy, writing in a diary<br>');
rep('<code>scene-diary.jpg</code> · 권장 1600×1000', '<code>scene-diary.jpg</code> · Suggested 1600×1000');
rep('<span class="kicker">피어라를 만나면</span>', '<span class="kicker">With Peera</span>');
rep('<h2>라이티랑 통화하다 보면<br>일기가 저절로 써져요</h2>',
    '<h2>Talking with Writy,<br>the diary writes itself</h2>');
rep('<p>울던 아이가 신나서 오늘 이야기를 꺼내요.<br>그 이야기가 그대로 오늘 일기가 됩니다.</p>',
    '<p>The child who was crying can’t wait to share the day.<br>And that story becomes today’s diary.</p>');

// ── 세 걸음 ──
rep('<span class="kicker">피어라의 세 걸음</span>', '<span class="kicker">Three steps</span>');
rep('<h2>말한 마음이<br class="desk">글이 되기까지</h2>', '<h2>From spoken<br class="desk">to written</h2>');
rep('<p>쓰기를 가르치기 전에,<br class="desk">쓰고 싶은 이야기부터 만들어 줍니다.</p>',
    '<p>Before teaching how to write,<br class="desk">we give them something worth writing.</p>');
rep('<h3>문자를 받고,<br>전화를 걸어요</h3>', '<h3>A text arrives,<br>they call back</h3>');
rep('<p>하루 한 통, 라이티가 문자를 보내요.<br>궁금해진 아이가 먼저 전화를 겁니다.</p>',
    '<p>One text a day from Writy.<br>Curious, your child calls first.</p>');
rep('<h3>태블릿에<br>손으로 써요</h3>', '<h3>They write it<br>by hand</h3>');
rep('<p>통화에서 꺼낸 이야기가 글감이 돼요.<br>막히면 <b>"이거 어떻게 써?"</b> 하고 물어봐요.</p>',
    '<p>The call gives them something to say.<br>Stuck? They ask <b>“How do I write this?”</b></p>');
rep('<h3>봐주고,<br>다시 써요</h3>', '<h3>Feedback,<br>then rewrite</h3>');
rep('<p><b>잘한 건 확실히 칭찬하고,</b><br>주의할 곳만 살짝 짚어줘요.</p>',
    '<p><b>What they did well, said clearly.</b><br>One thing to watch, said lightly.</p>');
rep('<div class="en"><span>한글 쓰기</span><span>영어 쓰기</span><span>그림일기</span></div>',
    '<div class="en"><span>Korean writing</span><span>English writing</span><span>Picture diary</span></div>');
rep('<b>7세에 시작해서, 11세까지.</b>', '<b>Start at 7. Stay through 11.</b>');
rep('<span>학년이 바뀌어도 같은 친구와 씁니다.</span>', '<span>The same friend, grade after grade.</span>');

// ── 쓰기 섹션 ──
rep('<span class="kicker">태블릿 + 펜</span>', '<span class="kicker">Tablet + pen</span>');
rep('<h2>잘한 건 확실히,<br class="desk">고칠 건 살짝</h2>', '<h2>Praise loudly,<br class="desk">correct gently</h2>');
rep('<p>칭찬은 크게 하고,<br class="desk">주의할 곳만 가볍게 짚어줍니다.</p>',
    '<p>We say the good part out loud,<br class="desk">and touch the rest lightly.</p>');
rep('<div class="p-top"><span>2026년 7월 18일 토요일</span><span>맑음 ☀️</span></div>',
    '<div class="p-top"><span>Saturday, July 18, 2026</span><span>Sunny ☀️</span></div>');
rep('<h3>라이티 도움 <em>쓰는 중</em></h3>', '<h3>Writy’s help <em>while writing</em></h3>');
rep('<p>아이가 <b>지금 쓴 글씨를 눈으로 보고</b> 답해요.<br>\n             말로 묻고 목소리로 들으니, 혼자서도 물어봅니다.</p>',
    '<p>Writy <b>looks at what they just wrote</b> and answers.<br>\n             They ask out loud and hear it back, so they can do it alone.</p>');
rep('<h3>다정한 첨삭 <em>다 쓴 뒤</em></h3>', '<h3>Warm feedback <em>when done</em></h3>');
rep('<p><b>잘 쓴 곳은 확실하게 짚어 칭찬</b>하고,<br>\n             주의할 곳만 하나 가볍게 알려줘요.</p>',
    '<p><b>The good parts get named, clearly.</b><br>\n             Then one thing to watch, lightly.</p>');
rep('<h3>고쳐쓰기 <em>다시</em></h3>', '<h3>Rewriting <em>again</em></h3>');
rep('<p>흐린 밑글씨 위에 아이가 다시 씁니다.<br>\n             지우는 게 아니라 <b>다시 써보는 경험</b>이에요.</p>',
    '<p>Faint guide letters appear, and they write over them.<br>\n             Not erasing — <b>the experience of writing it again.</b></p>');
rep('<div class="mini-diary" aria-label="아이 일기 예시">오늘 아빠랑 자전거를 탔다.<br>처음엔 무서웠는데 재미있써서 또 타고싶다.</div>',
    '<div class="mini-diary" aria-label="Example of a child’s diary">오늘 아빠랑 자전거를 탔다.<br>처음엔 무서웠는데 재미있써서 또 타고싶다.</div>');
rep('<div class="p-comment">아빠랑 탄 게 진짜 신났구나!<br>다음엔 혼자서도 탈 수 있을 거야 🚲</div>',
    '<div class="p-comment">You were so excited to ride with Dad!<br>Next time you’ll ride on your own 🚲</div>');
rep('<span class="p-btn">고쳐쓰기</span>', '<span class="p-btn">Rewrite</span>');
rep('<span class="p-btn primary">저장하기</span>', '<span class="p-btn primary">Save</span>');
rep('<b>라이티 도움</b>', '<b>Writy’s help</b>');
rep('<div class="h-line kid">"자전거 어떻게 써?"</div>', '<div class="h-line kid">“How do I write bicycle?”</div>');
rep('<div class="h-line">네가 쓴 글씨 봤어! \'자전거\'는 자·전·거 세 글자야. 한 글자씩 천천히 써봐.</div>',
    '<div class="h-line">I saw what you wrote! “자전거” is three blocks: 자·전·거. Try one at a time.</div>');
rep('<div class="h-mic">🎙️ 눌러서 더 물어보기</div>', '<div class="h-mic">🎙️ Tap to ask more</div>');
rep('<div class="p-draw" aria-hidden="true">', '<div class="p-draw" aria-hidden="true">');

// ── 라이티 도감 ──
rep('<div class="dex-card rise" aria-label="라이티 캐릭터 카드">', '<div class="dex-card rise" aria-label="Writy character card">');
rep('<img class="avatar" src="writy-avatar.png" alt="라이티 얼굴">', '<img class="avatar" src="writy-avatar.png" alt="Writy’s face">');
rep('<div class="nm"><b>라이티</b><span>다람쥐 · 8살 · 남자아이</span></div>',
    '<div class="nm"><b>Writy</b><span>Squirrel · age 8 · boy</span></div>');
rep('<li><span class="k">사는 곳</span><span>초록숲 한가운데, 커다란 참나무 꼭대기 나무집</span></li>',
    '<li><span class="k">Home</span><span>A treehouse atop a great oak, deep in the green forest</span></li>');
rep('<li><span class="k">가족</span><span>포근한 엄마, 도토리 잘 찾는 아빠, 장난꾸러기 여동생 콩이</span></li>',
    '<li><span class="k">Family</span><span>A warm mom, a dad who finds the best acorns, and Kongi, his mischievous little sister</span></li>');
rep('<li><span class="k">좋아하는 것</span><span>볶은 도토리, 숨바꼭질, 비 온 뒤 흙냄새</span></li>',
    '<li><span class="k">Loves</span><span>Roasted acorns, hide-and-seek, the smell of earth after rain</span></li>');
rep('<li><span class="k">무서워하는 것</span><span>천둥소리 (사실은 아주 많이)</span></li>',
    '<li><span class="k">Afraid of</span><span>Thunder (quite a lot, honestly)</span></li>');
rep('<li><span class="k">버릇</span><span>신나면 꼬리를 파닥파닥, 놀라면 "헐!"</span></li>',
    '<li><span class="k">Habits</span><span>Tail flapping when excited, “Whoa!” when surprised</span></li>');
rep('<span class="kicker">왜 캐릭터가 중요한가요</span>', '<span class="kicker">Why a character matters</span>');
rep('<h2>아이는 앱이 아니라<br>친구에게 마음을 열어요</h2>', '<h2>Children open up to<br>a friend, not an app</h2>');
rep('<p>라이티는 기능이 아니라 <b>삶이 있는 여덟 살 친구</b>예요.\n           나무집에 살고, 천둥을 무서워합니다.</p>',
    '<p>Writy isn’t a feature — he’s <b>an eight-year-old with a life.</b>\n           He lives in a treehouse and he’s scared of thunder.</p>');
rep('<p>친구라서 시키지 않아도 하루를 들려줘요.<br>\n           그래서 <b>일기로 쓸 때도 술술 나옵니다.</b></p>',
    '<p>Because he’s a friend, they tell him about the day unprompted.<br>\n           And that’s why <b>the diary comes out easily.</b></p>');
rep('<blockquote class="quote">"헐! 종이접기 했어? 뭐 접었는지 진짜 궁금하다!"</blockquote>',
    '<blockquote class="quote">“Whoa! You did origami? I really want to know what you made!”</blockquote>');

// ── 친구 연결(준비 중) ──
rep('<span class="soon-badge">다음 단계 · 준비 중</span>', '<span class="soon-badge">Coming next · in development</span>');
rep('<p class="big">지금은 라이티와 둘이서.<br>곧 <b>친구들 글도 함께</b> 봐요.</p>',
    '<p class="big">Today, just Writy.<br>Soon, <b>friends’ writing too.</b></p>');
rep('아이가 쓴 글을 또래와 나누고 서로의 생각을 보는 기능을 준비하고 있습니다.\n        다만 <b>아직 제공되지 않는 기능</b>이에요. 아이 안전과 개인정보 보호 설계를 먼저 끝낸 뒤에 열겠습니다.\n        출시 시점의 제공 범위와 방식은 달라질 수 있습니다.',
    'We’re building a way for children to share their writing and see how others think.\n        This is <b>not available yet.</b> We’ll open it only after the child-safety and privacy design is finished.\n        Scope and approach may change by launch.');

// ── 약속 ──
rep('<span class="kicker">부모님께 드리는 약속</span>', '<span class="kicker">Our promises to parents</span>');
rep('<h2>재미보다 먼저 지키는 것들</h2>', '<h2>What comes before fun</h2>');
rep('<p>아이의 마음을 다루는 앱이니까요.</p>', '<p>This app handles a child’s feelings.</p>');
rep('<h3><span class="pi">🤍</span>힘든 마음엔 들뜨지 않아요</h3>', '<h3><span class="pi">🤍</span>No confetti over sadness</h3>');
rep('<p>속상한 이야기엔 축하 대신,<br><b>그 마음을 먼저 알아줍니다.</b></p>',
    '<p>When the story hurts, instead of celebrating<br><b>Writy acknowledges the feeling first.</b></p>');
rep('<h3><span class="pi">🌳</span>어른과 연결해요</h3>', '<h3><span class="pi">🌳</span>We point to grown-ups</h3>');
rep('<p>안전에 관한 얘기가 나오면<br><b>"믿는 어른에게 꼭 얘기해줘"</b>라고 권해요.</p>',
    '<p>If safety comes up, Writy says<br><b>“Please tell a grown-up you trust.”</b></p>');
rep('<h3><span class="pi">🔋</span>붙잡지 않아요</h3>', '<h3><span class="pi">🔋</span>We don’t hold on</h3>');
rep('<p>문자는 <b>하루 딱 한 통</b>.<br>라이티 폰 배터리가 다 되면 통화도 끝나요.</p>',
    '<p><b>One text a day.</b><br>When Writy’s phone battery runs out, the call ends.</p>');
rep('<h3><span class="pi">✏️</span>틀려도 괜찮아요</h3>', '<h3><span class="pi">✏️</span>Mistakes are fine</h3>');
rep('<p>틀린 말은 <b>바른 말로 다시 들려줄 뿐</b>이에요.<br>광고도 없습니다.</p>',
    '<p>A wrong word is simply <b>said back the right way.</b><br>And there are no ads.</p>');

// ── 근거 ──
rep('<span class="kicker">왜 이렇게 만들었나</span>', '<span class="kicker">Why we built it this way</span>');
rep('<h2>근거 위에 만듭니다</h2>', '<h2>Built on evidence</h2>');
rep('<p>재미있게만 만들지 않았어요.<br class="desk">쌓인 연구가 가리키는 쪽으로 만들었습니다.</p>',
    '<p>We didn’t only make it fun.<br class="desk">We built toward what the research points to.</p>');

// 뇌과학 결론 한 줄 + 실제 논문 그림 3장(fMRI) — Kersey & James (2013), CC BY 4.0
rep('<p class="brain-headline rise">손으로 써야 <b>뇌가 켜집니다</b></p>',
    '<p class="brain-headline rise">Writing by hand <b>switches the brain on</b></p>');
rep('<span class="rf-tag">실제 논문 그림 · 아동 fMRI 연구</span>',
    '<span class="rf-tag">Real published figures · child fMRI studies</span>');
rep('alt="아동 fMRI: 직접 써서 배운 글자(B)와 눈으로만 배운 글자(C)를 볼 때의 뇌 활성 차이"',
    'alt="Child fMRI: brain activity differs for letters learned by writing (B) vs. letters only watched (C)"');
rep('alt="막대그래프: 직접 써서 배운 글자의 뇌 활성이 눈으로만 배운 글자보다 약 2배 이상 높음"',
    'alt="Bar chart: brain activation for letters learned by writing is more than double that for letters only watched"');
rep('alt="뇌 단면: 손으로 써서 배운 글자가 눈으로만 본 것보다 더 활성화되는 영역"',
    'alt="Brain slices: regions that activate more for letters learned by writing than only watched"');
rep('<figcaption>Fig. 4 · <b>직접 써서 배운 글자(B)</b> vs <b>눈으로만 배운 글자(C)</b> — 나중에 볼 때 뇌가 켜지는 모습이 다릅니다</figcaption>',
    '<figcaption>Fig. 4 · <b>Letters learned by writing (B)</b> vs <b>letters only watched (C)</b> — the brain lights up differently later</figcaption>');
rep('<figcaption>Fig. 8 · 직접 써서 배운 글자를 볼 때 <b>뇌 활성이 두 배 이상</b> (능동 vs 수동 vs 안 배움)</figcaption>',
    '<figcaption>Fig. 8 · Letters learned by writing drive <b>more than double</b> the brain activation (active vs. passive vs. not learned)</figcaption>');
rep('<figcaption>Fig. 6 · 손으로 써서 배운 글자가 <b>눈으로만 본 것보다 더 켜지는</b> 뇌 영역</figcaption>',
    '<figcaption>Fig. 6 · Brain regions that light up <b>more for hand-written letters</b> than only-watched ones</figcaption>');
rep('alt="아동 fMRI: 철자 훈련 전(Pre)과 후(Post)의 뇌 활성 변화 — 훈련군(TG)과 대기군(WG) 비교"',
    'alt="Child fMRI: brain activation before (Pre) and after (Post) spelling intervention — training group (TG) vs. waiting group (WG)"');
rep('<figcaption><b>다른 연구</b> · 훈련을 <b>받은 아이(TG)</b>는 훈련 뒤(Post) 뇌 활성이 뚜렷이 바뀌었지만, <b>안 받고 기다린 아이(WG)</b>는 거의 그대로 — <b>훈련이 뇌를 바꿉니다</b></figcaption>',
    '<figcaption><b>A different study</b> · children who <b>got the training (TG)</b> showed clear brain-activation changes afterward, while those who <b>only waited (WG)</b> barely changed — <b>training reshapes the brain</b></figcaption>');
rep('출처: Kersey &amp; James (2013), <i>Frontiers in Psychology</i> 4:567 (Fig. 4·8·6) · Gebauer 외 (2012), <i>PLOS ONE</i> 7:e38201 (Fig. 5) — 모두 <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY</a>, <a href="https://www.frontiersin.org/articles/10.3389/fpsyg.2013.00567/full" target="_blank" rel="noopener">원문1</a> · <a href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0038201" target="_blank" rel="noopener">원문2</a> (형식·크기 조정). 아동 fMRI 연구들이며, 피어라를 검증한 것이 아니라 설계가 따른 원리를 보여줍니다.',
    'Sources: Kersey &amp; James (2013), <i>Frontiers in Psychology</i> 4:567 (Figs. 4·8·6) · Gebauer et al. (2012), <i>PLOS ONE</i> 7:e38201 (Fig. 5) — both <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY</a>, <a href="https://www.frontiersin.org/articles/10.3389/fpsyg.2013.00567/full" target="_blank" rel="noopener">source 1</a> · <a href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0038201" target="_blank" rel="noopener">source 2</a> (reformatted/resized). These are fMRI studies in children; they do not validate Peera, but show the principle Peera was designed around.');

// ── 논문 근거 캐러셀(넘기는 카드) — 전문가 일러스트(가상)+기관 이름표+말풍선+보조글+피어라 적용 ──
rep('<div class="carousel" id="evidCarousel" aria-roledescription="carousel" aria-label="피어라 설계 근거">',
    '<div class="carousel" id="evidCarousel" aria-roledescription="carousel" aria-label="What Peera is built on">');
rep('<button class="caro-arw prev" type="button" aria-label="이전 근거">‹</button>',
    '<button class="caro-arw prev" type="button" aria-label="Previous">‹</button>');
rep('<button class="caro-arw next" type="button" aria-label="다음 근거">›</button>',
    '<button class="caro-arw next" type="button" aria-label="Next">›</button>');
rep('<div class="caro-dots" role="tablist" aria-label="근거 넘기기"></div>',
    '<div class="caro-dots" role="tablist" aria-label="Browse the evidence"></div>');
rep('전문가 사진', 'Expert photo');  // 슬라이드별 expert-1..6.jpg (파일명은 라틴이라 그대로)
rep("(i + 1) + '번째 근거'", "'Evidence ' + (i + 1)");
// 이름표(한글 포함분만; 라틴 전용 이름표는 그대로)
rep('<figcaption class="slide-name">미국 국가조기문해패널 · NELP</figcaption>',
    '<figcaption class="slide-name">U.S. National Early Literacy Panel</figcaption>');
rep('<figcaption class="slide-name">미국 교육부 · What Works Clearinghouse</figcaption>',
    '<figcaption class="slide-name">U.S. Dept. of Education · What Works Clearinghouse</figcaption>');
// ※ 이름표에 실존 연구자 이름을 쓰지 않는다 — 바로 위 일러스트가 그 사람의 초상으로 읽히기 때문.
//    연구자 이름은 본문(slide-sub) 인용으로만 둔다.
// 말풍선
rep('<p class="slide-quote">어릴 때 말한 만큼,<br>나중에 씁니다.</p>',
    '<p class="slide-quote">What they say early<br>shapes what they write.</p>');
rep('<p class="slide-quote">쓰기는 읽기를<br>같이 끌어올립니다.</p>',
    '<p class="slide-quote">Writing pulls<br>reading up too.</p>');
rep('<p class="slide-quote">한 번 쓰고 끝내지 않고,<br>고쳐 쓸 때 늡니다.</p>',
    '<p class="slide-quote">They grow when they revise,<br>not at the first draft.</p>');
rep('<p class="slide-quote">‘똑똑하네’ 대신<br>‘해냈구나’.</p>',
    '<p class="slide-quote">‘You worked hard’<br>over ‘You’re smart.’</p>');
rep('<p class="slide-quote">말로 예열하면<br>쉽게 써집니다.</p>',
    '<p class="slide-quote">Talk first,<br>and writing flows.</p>');
rep('<p class="slide-quote">도우며 쓰면<br>훨씬 쉬워집니다.</p>',
    '<p class="slide-quote">Help makes<br>writing easier.</p>');
// 보조글
rep('<p class="slide-sub">유아·초기 아동기의 <b>구어(말하기) 능력이 이후 쓰기 능력을 예측</b>한다고 반복해서 보고됩니다.</p>',
    '<p class="slide-sub">Studies repeatedly find that <b>early oral language predicts later writing ability.</b></p>');
rep('<p class="slide-sub">읽은 것에 대해 글을 쓰면 <b>읽기 이해가 향상</b>됐습니다(카네기재단 지원 메타분석).</p>',
    '<p class="slide-sub">Writing about what you read <b>improved reading comprehension</b> (Carnegie-funded meta-analysis).</p>');
rep('<p class="slide-sub">전략을 단계로 가르치고 스스로 점검하는 <b>SRSD</b>가 초등 쓰기에서 근거가 가장 두텁습니다.</p>',
    '<p class="slide-sub"><b>SRSD</b> — teaching strategies step by step with self-checking — has the strongest evidence base in elementary writing.</p>');
rep('<p class="slide-sub"><b>능력을 칭찬받은 아이는 실패 뒤 더 빨리 포기</b>했고, 과정을 칭찬받으면 계속 시도했습니다(뮬러·드웩 1998, 당시 컬럼비아대).</p>',
    '<p class="slide-sub"><b>Children praised for ability gave up faster after failure</b>; those praised for effort kept trying (Mueller &amp; Dweck 1998, then at Columbia).</p>');
rep('<p class="slide-sub">쓰기 전에 말로 이야기(사전쓰기)하면 어휘·문장·내용이 좋아집니다(<b>효과크기 .32</b>, 그레이엄·페린 메타분석).</p>',
    '<p class="slide-sub">Talking ideas through first (prewriting) improves vocabulary, sentences, and content (<b>effect size .32</b>, Graham &amp; Perin meta-analysis).</p>');
rep('<p class="slide-sub">옆에서 함께 도우며 쓰기는 <b>효과가 큰 편입니다(효과크기 .75, 그레이엄·페린)</b>. 막힐 때 즉각 힌트·예시를 줍니다.</p>',
    '<p class="slide-sub">Writing with side-by-side help is <b>highly effective (effect size .75, Graham &amp; Perin)</b>, giving hints and examples right when stuck.</p>');
// 피어라 적용(ap-tag 포함)
rep('<p class="slide-apply"><span class="ap-tag">피어라는 이렇게</span> 쓰기 전에 <b>통화</b>부터 합니다.</p>',
    '<p class="slide-apply"><span class="ap-tag">In Peera</span> we start with a <b>call</b> before writing.</p>');
rep('<p class="slide-apply"><span class="ap-tag">피어라는 이렇게</span> <b>매일 조금씩</b> 써요.</p>',
    '<p class="slide-apply"><span class="ap-tag">In Peera</span> we write <b>a little every day.</b></p>');
rep('<p class="slide-apply"><span class="ap-tag">피어라는 이렇게</span> 첨삭에서 끝내지 않고 <b>고쳐쓰기까지</b> 가요.</p>',
    '<p class="slide-apply"><span class="ap-tag">In Peera</span> we don’t stop at feedback — <b>the child rewrites.</b></p>');
rep('<p class="slide-apply"><span class="ap-tag">피어라는 이렇게</span> <b>점수도 등수도</b> 없어요.</p>',
    '<p class="slide-apply"><span class="ap-tag">In Peera</span> there are <b>no scores, no ranking.</b></p>');
rep('<p class="slide-apply"><span class="ap-tag">피어라는 이렇게</span> 쓰기 전에 <b>통화로 예열</b>해요.</p>',
    '<p class="slide-apply"><span class="ap-tag">In Peera</span> Writy <b>warms up with a call</b> before writing.</p>');
rep('<p class="slide-apply"><span class="ap-tag">피어라는 이렇게</span> 쓰는 중에도 <b>라이티가</b> 도와줘요.</p>',
    '<p class="slide-apply"><span class="ap-tag">In Peera</span> <b>Writy helps</b> as they write.</p>');

// 도우며 쓰기 결과 막대그래프(실제 논문 데이터로 구성)
rep('<span class="rf-tag">실제 논문 데이터로 구성 · 도우며 쓰기 결과</span>',
    '<span class="rf-tag">Built from real published data · writing-with-help results</span>');
rep('<h4 class="df-title">도우며 쓴 그룹이 <b>약 2배</b> 더 늘었어요</h4>',
    '<h4 class="df-title">Writing with help improved <b>about twice</b> as much</h4>');
rep('aria-label="글쓰기 점수 향상: 혼자 쓰기 +7.7점, 도움받아 쓰기 +15.4점"',
    'aria-label="Writing-score gain: writing alone +7.7 points, writing with help +15.4 points"');
rep('<div class="df-labels"><span>혼자 쓰기</span><span>도움받아 쓰기</span></div>',
    '<div class="df-labels"><span>Writing alone</span><span>Writing with help</span></div>');
rep('<p class="df-cap">도움받으며 쓴 그룹은 대조군보다 글쓰기 점수가 <b>약 두 배 더 향상</b>됐어요. 다른 연구에서도 <b>도우면 덜 힘들게(인지부하 ↓)</b> 더 잘 썼습니다.</p>',
    '<p class="df-cap">The group that wrote with help improved <b>about twice as much</b> as the control group. In another study, <b>help also lowered mental effort (cognitive load ↓)</b>, and they wrote better.</p>');
rep('데이터 출처: Li (2023) · Jiang &amp; Kalyuga (2022), <i>Frontiers in Psychology</i> — 실제 보고된 수치로 구성한 그래프입니다. 피어라를 검증한 것이 아니라 설계가 따른 원리를 보여줍니다.',
    'Data: Li (2023) · Jiang &amp; Kalyuga (2022), <i>Frontiers in Psychology</i> — a chart built from the figures these studies report. It does not validate Peera, but shows the principle Peera was designed around.');

rep('※ 위 연구들은 <b>피어라를 검증한 것이 아닙니다.</b> 피어라가 어떤 원리를 따라 설계됐는지를 밝히는\n      근거입니다. 피어라는 아직 출시 전이며, 저희 앱의 학습 효과는 검증된 바 없습니다. 확인되지 않은\n      효과를 약속드리지 않겠습니다.',
    '※ These studies <b>do not validate Peera.</b> They explain the principles Peera was designed around.\n      Peera has not launched yet, and our app’s learning outcomes have not been measured. We will not promise\n      results we haven’t verified.');
rep('슬라이드의 인물 사진은 <b>AI로 만든 가상 인물</b>이며, 실존 인물이나 해당 연구의 연구자가 아닙니다.',
    'The people pictured in the slides are <b>AI-generated fictional people</b> — not real individuals, and not the researchers behind these studies.');

// ── 마무리 CTA ──
rep('<h2>라이티의 첫 문자,<br>우리 아이에게 닿게 해주세요</h2>', '<h2>Let Writy’s first text<br>reach your child</h2>');
rep('<p>준비되는 대로 가장 먼저 알려드릴게요.</p>', '<p>We’ll tell you the moment it’s ready.</p>');

// ── 30일 체험단(선착순 30명) ──
rep('선착순 30명 · 30일 무료 체험단', 'First 30 only · 30-day free trial');
rep('<h2>무료로 먼저 써볼 30명을 찾아요</h2>', '<h2>Looking for 30 to try it free first</h2>');
rep('<p>출시 전, <b>30일 무료 체험</b>을 딱 30명만 모십니다.<br>아이와 써보고 솔직한 후기를 들려주세요.</p>',
    '<p>Before launch, just <b>30 families</b> get a 30-day free trial.<br>Try it with your child and tell us honestly.</p>');
rep('value="[피어라] 30일 체험단 신청"', 'value="[Peera] 30-day trial application (EN)"');
rep('name="신청위치" value="30일 체험단"', 'name="신청위치" value="30일 체험단 (EN)"');
rep('<button class="btn" type="submit" disabled>무료로 먼저 써보기</button>',
    '<button class="btn" type="submit" disabled>Try it free first</button>');
rep('<span>체험단 안내를 받기 위한 <b>이메일 주소 수집·이용</b>에 동의합니다.\n            선정 안내 발송 후 지체 없이 파기해요.\n            <a href="privacy.html" target="_blank" rel="noopener">개인정보처리방침</a></span>',
    '<span>I agree to the <b>collection and use of my email address</b> to receive trial information.\n            It is deleted as soon as the selection notice is sent.\n            <a href="privacy-en.html" target="_blank" rel="noopener">Privacy notice</a></span>');
rep('<p class="note"><b>선착순 30명</b>에 선정되면 개별 안내드려요. 광고는 보내지 않습니다.</p>',
    '<p class="note"><b>The first 30</b> selected are contacted individually. No marketing.</p>');

// ── 푸터 ──
rep('<b>피어라</b>\n    </div>', '<b>Peera</b>\n    </div>');
rep('<div class="langsw"><b>한국어</b> <span>·</span> <a href="en.html?lang=en">English</a></div>',
    '<div class="langsw"><a href="index.html?lang=ko">한국어</a> <span>·</span> <b>English</b></div>');
rep('<div>만든 팀 <b>Peer</b> · 문의 <a href="mailto:retyper92@gmail.com">retyper92@gmail.com</a></div>',
    '<div>Made by team <b>Peer</b> · Contact <a href="mailto:retyper92@gmail.com">retyper92@gmail.com</a></div>');
rep('<div><a href="privacy.html">개인정보 수집·이용 안내</a> <span class="fsep">— 사전예약 페이지</span></div>',
    '<div><a href="privacy-en.html">Privacy notice</a> <span class="fsep">— this pre-registration page</span></div>');
rep('<a href="https://hephaestosian.github.io/legal/privacy-peera.html" target="_blank" rel="noopener">앱 개인정보처리방침</a>\n      ·\n      <a href="https://hephaestosian.github.io/legal/terms-peera.html" target="_blank" rel="noopener">앱 이용약관</a>\n      <span class="fsep">— 피어라 앱</span>',
    '<a href="https://hephaestosian.github.io/legal/privacy-peera.html" target="_blank" rel="noopener">App Privacy Policy</a>\n      ·\n      <a href="https://hephaestosian.github.io/legal/terms-peera.html" target="_blank" rel="noopener">App Terms of Service</a>\n      <span class="fsep">— the Peera app</span>');
rep('<div class="from-cards">감정카드 앱에서 오셨나요? 반가워요 — 마음의 씨앗이 여기서 손글씨의 꽃으로 피어납니다. 🌱</div>',
    '<div class="from-cards">Came from the Emotion Cards app? Welcome — the seed of a feeling blooms here into handwriting. 🌱</div>');

// ── 쿠키 배너 ──
rep('aria-label="쿠키 사용 동의"', 'aria-label="Cookie consent"');
rep('방문 통계를 위해 <b>구글 애널리틱스 쿠키</b>를 사용하려 합니다.\n        광고에는 쓰지 않아요. 거부하셔도 사전예약에는 아무 지장이 없습니다.\n        <a href="privacy.html">자세히</a>',
    'We’d like to use <b>Google Analytics cookies</b> to measure visits.\n        Never for advertising. Declining does not affect pre-registration in any way.\n        <a href="privacy-en.html">Details</a>');
rep('<button type="button" id="cNo">거부</button>', '<button type="button" id="cNo">Decline</button>');
rep('<button type="button" class="ok" id="cYes">동의</button>', '<button type="button" class="ok" id="cYes">Accept</button>');

// ── 폰 목업 UI ──
rep('<a class="brand" href="#" aria-label="피어라 홈">', '<a class="brand" href="#" aria-label="Peera home">');
rep('<nav class="langtop" aria-label="언어 선택">\n      <b aria-current="true">한국어</b>\n      <a href="en.html?lang=en" hreflang="en">EN</a>\n    </nav>',
    '<nav class="langtop" aria-label="Language">\n      <a href="index.html?lang=ko" hreflang="ko">한국어</a>\n      <b aria-current="true">EN</b>\n    </nav>');
rep('<b>피어라</b><span>Peera</span>', '<b>Peera</b><span>피어라</span>');
rep('<span class="call-name">라이티 🌰</span>', '<span class="call-name">Writy 🌰</span>');
rep('<i class="rec"></i>통화 중 <span id="callTime">', '<i class="rec"></i>On call <span id="callTime">');
rep('<span class="batt">라이티 폰 <i class="case">', '<span class="batt">Writy’s phone <i class="case">');
rep('<span class="mic">🎙️</span><br>버튼 없이, 아이가 말하면 라이티가 들어요',
    '<span class="mic">🎙️</span><br>No buttons — they talk, Writy listens');
rep('<div class="n-head"><b>라이티</b><span>지금</span></div>', '<div class="n-head"><b>Writy</b><span>now</span></div>');
rep('<b>라이티</b>\n            <span>전화 거는 중<i>.</i><i>.</i><i>.</i></span>',
    '<b>Writy</b>\n            <span>Calling<i>.</i><i>.</i><i>.</i></span>');
rep('<span class="d-label">오늘의 일기 · 통화에서 꺼낸 마음</span>',
    '<span class="d-label">Today’s diary · from the call</span>');

// ── 폰 데모 대사(30초 연출) ──
rep("const NOTIF_TEXT = '나 오늘 진짜 커다란 도토리를 주웠어!';",
    "const NOTIF_TEXT = 'I found a REALLY big acorn today!';");
rep("{ who: 'writy', text: '어? 지우야, 안녕! 오늘 하루 어땠어?' }",
    "{ who: 'writy', text: 'Oh, hi Mia! How was your day?' }");
rep("{ who: 'kid',   text: '라이티야! 아까 문자 봤어. 도토리 어디서 주웠어?' }",
    "{ who: 'kid',   text: 'Writy! I saw your text. Where did you find the acorn?' }");
rep("{ who: 'writy', text: '참나무 밑에서! 너무 커서 들고 오다 데굴데굴 굴렀지 뭐야. 너는 오늘 뭐 했어?' }",
    "{ who: 'writy', text: 'Under the big oak! It was so heavy I rolled all the way home. What did you do today?' }");
rep("{ who: 'kid',   text: '학교에서 종이접기 했어. 어려웠는데 끝까지 했어' }",
    "{ who: 'kid',   text: 'We did origami at school. It was hard but I finished it' }");
rep("{ who: 'writy', text: '끝까지 해냈구나, 멋지다! 그때 기분이 어땠어?' }",
    "{ who: 'writy', text: 'You finished it — that’s awesome! How did that feel?' }");
rep("{ who: 'kid',   text: '뿌듯했어!' }", "{ who: 'kid',   text: 'I felt proud!' }");
rep("{ who: 'writy', text: '그 뿌듯한 마음, 우리 일기로 남겨볼까?' }",
    "{ who: 'writy', text: 'That proud feeling — want to put it in your diary?' }");
rep("const DIARY_TEXT = '오늘 종이접기를 했다.\\n어려웠는데 끝까지 해서 뿌듯했다.';",
    "const DIARY_TEXT = 'Today I did origami.\\nIt was hard but I finished it and felt proud.';");

// ── 폼 상태 메시지(JS 문자열) ──
rep("'전송이 잘 안 됐어요. 잠시 후 다시 시도해 주세요.'", "'Something went wrong. Please try again in a moment.'");
rep("'네트워크 연결을 확인해 주세요.'", "'Please check your network connection.'");

// 적용 — 공백/줄바꿈 차이에 관대하게 매칭한다(원문 들여쓰기를 일일이 맞추지 않으려고).
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
let miss = 0;
for (const [a, b] of R) {
  if (s.includes(a)) { s = s.split(a).join(b); continue; }
  const re = new RegExp(a.split(/\s+/).map(esc).join("\\s+"));
  if (re.test(s)) { s = s.replace(re, () => b); continue; }
  console.log("MISS: " + a.slice(0, 78).replace(/\n/g, "\\n"));
  miss++;
}

fs.writeFileSync(OUT, s, "utf8");

// 남은 한국어 검사(의도적으로 남기는 것 제외)
const KEEP = ["오늘 아빠랑", "처음엔 무서웠는데", "자전거", "한국어", "자·전·거"];
let body = s.replace(/<style[\s\S]*?<\/style>/g, "")
            .replace(/<script[\s\S]*?<\/script>/g, "")   // 코드 주석의 한국어는 남겨도 된다
            .replace(/<!--[\s\S]*?-->/g, "");
const leftovers = [...new Set((body.match(/[가-힣]{2,}/g) || []))].filter(w => !KEEP.some(k => k.includes(w) || w.includes(k)));

console.log("\n치환 " + (R.length - miss) + "/" + R.length + (miss ? "  ⚠️ 실패 " + miss : "  ✅"));
console.log(leftovers.length ? "남은 한국어: " + leftovers.slice(0, 25).join(", ") : "남은 한국어 없음 ✅");
process.exit(miss ? 1 : 0);
