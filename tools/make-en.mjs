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
rep('<title>피어라 — 라이티한테 문자가 왔어요, 아이가 먼저 전화를 겁니다</title>',
    '<title>Peera — Laity just texted. Your child calls first.</title>');
rep('content="라이티한테 문자가 오면, 아이가 먼저 전화를 겁니다. 오늘 나눈 이야기가 그대로 손글씨 일기가 돼요. 잘한 건 확실히 칭찬하고, 고칠 건 살짝. 7~11세를 위한 피어라, 출시 소식을 가장 먼저 받아보세요."',
    'content="Laity texts. Your child calls first. Today\'s story becomes today\'s handwritten diary — in Korean and English. Praise loudly, correct gently. Peera, for ages 7–11. Be first to hear when it launches."');
rep('<meta property="og:title" content="피어라 — 라이티한테 문자가 왔어요, 아이가 먼저 전화를 겁니다">',
    '<meta property="og:title" content="Peera — Laity just texted. Your child calls first.">');
rep('<meta property="og:description" content="숲속 친구 라이티의 하루 한 번 문자. 아이가 전화를 걸어 나눈 이야기가 한글·영어 손글씨 일기로 피어납니다.">',
    '<meta property="og:description" content="One text a day from Laity, a squirrel in the forest. Your child calls, talks, and turns that story into a handwritten diary — Korean and English.">');
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
rep('"description": "숲속 다람쥐 라이티가 하루 한 번 문자를 보내면 아이가 직접 전화를 걸어 오늘 하루를 이야기하고, 그 마음을 한글·영어 손글씨 일기로 쓰는 7~11세 대상 앱. 출시 전 사전예약 진행 중.",',
    '"description": "A squirrel named Laity texts once a day. The child calls, talks about their day, and turns it into a handwritten diary in Korean and English. For ages 7–11. Pre-registration open before launch.",');

// ── 헤더/히어로 ──
rep('<span class="eyebrow rise in"><span class="dot"></span> 7~11세 · 출시 준비 중 · 사전예약 받는 중</span>',
    '<span class="eyebrow rise in"><span class="dot"></span> Ages 7–11 · In development · Pre-registration open</span>');
rep('<h1 class="rise in"><span class="hl-laity">라이티</span>한테 문자가 왔어요<br>\n        <span class="sms">“오늘 있었던 일 통화하자!”</span></h1>',
    '<h1 class="rise in"><span class="hl-laity">Laity</span> just texted<br>\n        <span class="sms">“Tell me about your day!”</span></h1>');
rep('<b>아이가 먼저 전화를 겁니다.</b><br>\n        오늘 나눈 이야기가 그대로 일기가 돼요.',
    '<b>Your child calls first.</b><br>\n        Today’s story becomes today’s diary.');

// 폼
rep('placeholder="이메일 주소" required aria-label="이메일 주소"', 'placeholder="Email address" required aria-label="Email address"');
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

// 폰 데모 접근성 라벨
rep('aria-label="피어라 앱 미리보기: 다람쥐 라이티가 문자를 보내고, 아이가 전화를 걸어 이야기를 나눈 뒤, 그 마음이 손글씨 일기가 되는 장면"',
    'aria-label="Peera app preview: Laity the squirrel sends a text, the child calls and talks, and that story becomes a handwritten diary"');

// ── 세 걸음 ──
rep('<span class="kicker">피어라의 세 걸음</span>', '<span class="kicker">Three steps</span>');
rep('<h2>말한 마음이<br class="desk">글이 되기까지</h2>', '<h2>From spoken<br class="desk">to written</h2>');
rep('<p>쓰기를 가르치기 전에,<br class="desk">쓰고 싶은 이야기부터 만들어 줍니다.</p>',
    '<p>Before teaching how to write,<br class="desk">we give them something worth writing.</p>');
rep('<h3>1 · 문자를 받고,<br>전화를 걸어요</h3>', '<h3>1 · A text arrives,<br>they call back</h3>');
rep('<p>하루 한 통, 라이티가 문자를 보내요.<br>궁금해진 아이가 먼저 전화를 겁니다.</p>',
    '<p>One text a day from Laity.<br>Curious, your child calls first.</p>');
rep('<h3>2 · 태블릿에<br>손으로 써요</h3>', '<h3>2 · They write it<br>by hand</h3>');
rep('<p>통화에서 꺼낸 이야기가 글감이 돼요.<br>막히면 <b>"이거 어떻게 써?"</b> 하고 물어봐요.</p>',
    '<p>The call gives them something to say.<br>Stuck? They ask <b>“How do I write this?”</b></p>');
rep('<h3>3 · 봐주고,<br>다시 써요</h3>', '<h3>3 · Feedback,<br>then rewrite</h3>');
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
rep('<h3>라이티 도움 <em>쓰는 중</em></h3>', '<h3>Laity’s help <em>while writing</em></h3>');
rep('<p>아이가 <b>지금 쓴 글씨를 눈으로 보고</b> 답해요.<br>\n             말로 묻고 목소리로 들으니, 혼자서도 물어봅니다.</p>',
    '<p>Laity <b>looks at what they just wrote</b> and answers.<br>\n             They ask out loud and hear it back, so they can do it alone.</p>');
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
rep('<b>라이티 도움</b>', '<b>Laity’s help</b>');
rep('<div class="h-line kid">"자전거 어떻게 써?"</div>', '<div class="h-line kid">“How do I write bicycle?”</div>');
rep('<div class="h-line">네가 쓴 글씨 봤어! \'자전거\'는 자·전·거 세 글자야. 한 글자씩 천천히 써봐.</div>',
    '<div class="h-line">I saw what you wrote! “자전거” is three blocks: 자·전·거. Try one at a time.</div>');
rep('<div class="h-mic">🎙️ 눌러서 더 물어보기</div>', '<div class="h-mic">🎙️ Tap to ask more</div>');
rep('<div class="p-draw" aria-hidden="true">', '<div class="p-draw" aria-hidden="true">');

// ── 라이티 도감 ──
rep('<div class="dex-card rise" aria-label="라이티 캐릭터 카드">', '<div class="dex-card rise" aria-label="Laity character card">');
rep('<img class="avatar" src="laity-avatar.png" alt="라이티 얼굴">', '<img class="avatar" src="laity-avatar.png" alt="Laity’s face">');
rep('<div class="nm"><b>라이티</b><span>다람쥐 · 8살 · 남자아이</span></div>',
    '<div class="nm"><b>Laity</b><span>Squirrel · age 8 · boy</span></div>');
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
    '<p>Laity isn’t a feature — he’s <b>an eight-year-old with a life.</b>\n           He lives in a treehouse and he’s scared of thunder.</p>');
rep('<p>친구라서 시키지 않아도 하루를 들려줘요.<br>\n           그래서 <b>일기로 쓸 때도 술술 나옵니다.</b></p>',
    '<p>Because he’s a friend, they tell him about the day unprompted.<br>\n           And that’s why <b>the diary comes out easily.</b></p>');
rep('<blockquote class="quote">"헐! 종이접기 했어? 뭐 접었는지 진짜 궁금하다!"</blockquote>',
    '<blockquote class="quote">“Whoa! You did origami? I really want to know what you made!”</blockquote>');

// ── 친구 연결(준비 중) ──
rep('<span class="soon-badge">다음 단계 · 준비 중</span>', '<span class="soon-badge">Coming next · in development</span>');
rep('<p class="big">지금은 라이티와 둘이서.<br>곧 <b>친구들 글도 함께</b> 봐요.</p>',
    '<p class="big">Today, just Laity.<br>Soon, <b>friends’ writing too.</b></p>');
rep('아이가 쓴 글을 또래와 나누고 서로의 생각을 보는 기능을 준비하고 있습니다.\n        다만 <b>아직 제공되지 않는 기능</b>이에요. 아이 안전과 개인정보 보호 설계를 먼저 끝낸 뒤에 열겠습니다.\n        출시 시점의 제공 범위와 방식은 달라질 수 있습니다.',
    'We’re building a way for children to share their writing and see how others think.\n        This is <b>not available yet.</b> We’ll open it only after the child-safety and privacy design is finished.\n        Scope and approach may change by launch.');

// ── 약속 ──
rep('<span class="kicker">부모님께 드리는 약속</span>', '<span class="kicker">Our promises to parents</span>');
rep('<h2>재미보다 먼저 지키는 것들</h2>', '<h2>What comes before fun</h2>');
rep('<p>아이의 마음을 다루는 앱이니까요.</p>', '<p>This app handles a child’s feelings.</p>');
rep('<h3><span class="pi">🤍</span>힘든 마음엔 들뜨지 않아요</h3>', '<h3><span class="pi">🤍</span>No confetti over sadness</h3>');
rep('<p>속상한 이야기엔 축하 대신,<br><b>그 마음을 먼저 알아줍니다.</b></p>',
    '<p>When the story hurts, instead of celebrating<br><b>Laity acknowledges the feeling first.</b></p>');
rep('<h3><span class="pi">🌳</span>어른과 연결해요</h3>', '<h3><span class="pi">🌳</span>We point to grown-ups</h3>');
rep('<p>안전에 관한 얘기가 나오면<br><b>"믿는 어른에게 꼭 얘기해줘"</b>라고 권해요.</p>',
    '<p>If safety comes up, Laity says<br><b>“Please tell a grown-up you trust.”</b></p>');
rep('<h3><span class="pi">🔋</span>붙잡지 않아요</h3>', '<h3><span class="pi">🔋</span>We don’t hold on</h3>');
rep('<p>문자는 <b>하루 딱 한 통</b>.<br>라이티 폰 배터리가 다 되면 통화도 끝나요.</p>',
    '<p><b>One text a day.</b><br>When Laity’s phone battery runs out, the call ends.</p>');
rep('<h3><span class="pi">✏️</span>틀려도 괜찮아요</h3>', '<h3><span class="pi">✏️</span>Mistakes are fine</h3>');
rep('<p>틀린 말은 <b>바른 말로 다시 들려줄 뿐</b>이에요.<br>광고도 없습니다.</p>',
    '<p>A wrong word is simply <b>said back the right way.</b><br>And there are no ads.</p>');

// ── 근거 ──
rep('<span class="kicker">왜 이렇게 만들었나</span>', '<span class="kicker">Why we built it this way</span>');
rep('<h2>근거 위에 만듭니다</h2>', '<h2>Built on evidence</h2>');
rep('<p>재미있게만 만들지 않았어요.<br class="desk">쌓인 연구가 가리키는 쪽으로 만들었습니다.</p>',
    '<p>We didn’t only make it fun.<br class="desk">We built toward what the research points to.</p>');

rep('<h3>말이 먼저, 글은 그다음</h3>', '<h3>Talking comes first</h3>');
rep('<p class="big">어릴 때 말한 만큼<br>나중에 씁니다.</p>', '<p class="big">What they say early<br>shapes what they write later.</p>');
rep('유아·초기 아동기의 <b>구어(말하기) 능력이 이후의 쓰기 능력을 예측</b>한다는 연구가 반복해서\n          보고됩니다.\n          미국 국가조기문해패널(NELP)은 어휘·구어 발달을 이후 문해력의 핵심 예측 요인으로 꼽았습니다.\n          <br>→ 그래서 피어라는 <b>쓰기 전에 통화</b>부터 합니다.',
    'Studies repeatedly report that <b>oral language in early childhood predicts later writing ability.</b>\n          The U.S. National Early Literacy Panel identified vocabulary and oral language development as core\n          predictors of later literacy.\n          <br>→ That’s why Peera <b>starts with a call, not a page.</b>');

rep('<h3>쓰면 읽기가 자란다</h3>', '<h3>Writing lifts reading</h3>');
rep('<p class="big">쓰기는 읽기를<br>같이 끌어올려요.</p>', '<p class="big">Writing pulls reading<br>up along with it.</p>');
rep('Graham &amp; Hebert, <b>「Writing to Read」</b>(Harvard Educational Review, 2011 · 카네기재단 지원 메타분석).\n          읽은 것에 대해 글을 쓰면 읽기 이해가 향상됐고(효과크기 .40~.51), 철자·문장 구성 지도는 .79였습니다.\n          <br>→ 그래서 피어라는 <b>매일 조금씩 씁니다.</b>',
    'Graham &amp; Hebert, <b>“Writing to Read”</b> (Harvard Educational Review, 2011 · Carnegie-funded meta-analysis).\n          Writing about what students read improved reading comprehension (effect sizes .40–.51); teaching spelling\n          and sentence construction, .79.\n          <br>→ That’s why Peera <b>writes a little every day.</b>');

rep('<h3>고쳐쓰기까지가 한 세트</h3>', '<h3>Rewriting completes it</h3>');
rep('<p class="big">쓰고 → 봐주고 →<br>다시 쓰기.</p>', '<p class="big">Write → look →<br>write again.</p>');
rep('쓰기 전략을 단계적으로 가르치고 스스로 점검하게 하는 <b>SRSD(자기조절 전략 개발)</b>는 초등\n          쓰기 지도에서 근거가 가장 두텁게 쌓인 접근으로 꼽힙니다(Graham·Harris 등, 미국 교육부 WWC 검토 대상).\n          <br>→ 그래서 첨삭에서 끝내지 않고 <b>고쳐쓰기까지</b> 갑니다.',
    '<b>SRSD (Self-Regulated Strategy Development)</b> — teaching writing strategies step by step and building\n          self-monitoring — is among the most heavily evidenced approaches in elementary writing instruction\n          (Graham, Harris et al.; reviewed by the U.S. Department of Education’s What Works Clearinghouse).\n          <br>→ That’s why we don’t stop at feedback — <b>the child rewrites.</b>');

rep('<h3>칭찬은 능력이 아니라 과정에</h3>', '<h3>Praise the process, not the ability</h3>');
rep('<p class="big">"똑똑하네" 대신<br>"해냈구나".</p>', '<p class="big">“You worked hard”<br>over “You’re smart.”</p>');
rep('Mueller &amp; Dweck(1998), <i>Journal of Personality and Social Psychology</i>. <b>능력을\n          칭찬받은 아이는 실패한 뒤 더 빨리 포기</b>했고, 과정을 칭찬받은 아이는 계속 시도했습니다.\n          (캐럴 드웩 — 현 스탠퍼드대 교수)\n          <br>→ 그래서 피어라엔 <b>점수도 등수도 없습니다.</b>',
    'Mueller &amp; Dweck (1998), <i>Journal of Personality and Social Psychology</i>. <b>Children praised for\n          ability gave up faster after failure</b>; children praised for effort kept trying.\n          (Carol Dweck — now at Stanford)\n          <br>→ That’s why Peera has <b>no scores and no ranking.</b>');

rep('※ 위 연구들은 <b>피어라를 검증한 것이 아닙니다.</b> 피어라가 어떤 원리를 따라 설계됐는지를 밝히는\n      근거입니다. 피어라는 아직 출시 전이며, 저희 앱의 학습 효과는 검증된 바 없습니다. 확인되지 않은\n      효과를 약속드리지 않겠습니다.',
    '※ These studies <b>do not validate Peera.</b> They explain the principles Peera was designed around.\n      Peera has not launched yet, and our app’s learning outcomes have not been measured. We will not promise\n      results we haven’t verified.');

// ── 마무리 CTA ──
rep('<h2>라이티의 첫 문자,<br>우리 아이에게 닿게 해주세요</h2>', '<h2>Let Laity’s first text<br>reach your child</h2>');
rep('<p>준비되는 대로 가장 먼저 알려드릴게요.</p>', '<p>We’ll tell you the moment it’s ready.</p>');

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
rep('<span class="call-name">라이티 🌰</span>', '<span class="call-name">Laity 🌰</span>');
rep('<i class="rec"></i>통화 중 <span id="callTime">', '<i class="rec"></i>On call <span id="callTime">');
rep('<span class="batt">라이티 폰 <i class="case">', '<span class="batt">Laity’s phone <i class="case">');
rep('<span class="mic">🎙️</span><br>버튼 없이, 아이가 말하면 라이티가 들어요',
    '<span class="mic">🎙️</span><br>No buttons — they talk, Laity listens');
rep('<div class="n-head"><b>라이티</b><span>지금</span></div>', '<div class="n-head"><b>Laity</b><span>now</span></div>');
rep('<b>라이티</b>\n            <span>전화 거는 중<i>.</i><i>.</i><i>.</i></span>',
    '<b>Laity</b>\n            <span>Calling<i>.</i><i>.</i><i>.</i></span>');
rep('<span class="d-label">오늘의 일기 · 통화에서 꺼낸 마음</span>',
    '<span class="d-label">Today’s diary · from the call</span>');

// ── 폰 데모 대사(30초 연출) ──
rep("const NOTIF_TEXT = '나 오늘 진짜 커다란 도토리를 주웠어!';",
    "const NOTIF_TEXT = 'I found a REALLY big acorn today!';");
rep("{ who: 'laity', text: '어? 지우야, 안녕! 오늘 하루 어땠어?' }",
    "{ who: 'laity', text: 'Oh, hi Mia! How was your day?' }");
rep("{ who: 'kid',   text: '라이티야! 아까 문자 봤어. 도토리 어디서 주웠어?' }",
    "{ who: 'kid',   text: 'Laity! I saw your text. Where did you find the acorn?' }");
rep("{ who: 'laity', text: '참나무 밑에서! 너무 커서 들고 오다 데굴데굴 굴렀지 뭐야. 너는 오늘 뭐 했어?' }",
    "{ who: 'laity', text: 'Under the big oak! It was so heavy I rolled all the way home. What did you do today?' }");
rep("{ who: 'kid',   text: '학교에서 종이접기 했어. 어려웠는데 끝까지 했어' }",
    "{ who: 'kid',   text: 'We did origami at school. It was hard but I finished it' }");
rep("{ who: 'laity', text: '끝까지 해냈구나, 멋지다! 그때 기분이 어땠어?' }",
    "{ who: 'laity', text: 'You finished it — that’s awesome! How did that feel?' }");
rep("{ who: 'kid',   text: '뿌듯했어!' }", "{ who: 'kid',   text: 'I felt proud!' }");
rep("{ who: 'laity', text: '그 뿌듯한 마음, 우리 일기로 남겨볼까?' }",
    "{ who: 'laity', text: 'That proud feeling — want to put it in your diary?' }");
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
