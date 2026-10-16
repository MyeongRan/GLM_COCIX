document.addEventListener('DOMContentLoaded', () => {
    
    // --- Clock Simulator for OS StatusBar ---
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById('status-clock').textContent = `${hours}:${minutes}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- State Management (v3) ---
    const state = {
        // User Onboarding Info
        username: '유명란',
        userRole: 'housewife', // student_child, student_teen, college, worker, housewife, senior
        userBirth: '1975-06-12',
        userRank: 'neighbor', // neighbor (이웃) -> pre-author (예비작가) -> author (작가)
        
        userPoints: 250,
        userPosts: [
            { id: 1, title: '나의 따뜻한 겨울 귤향기', category: 'essay', date: '2026-05-15', status: '매칭 진행 중' },
            { id: 2, title: '오븐 속에서 구워지는 첫 소금빵', category: 'recipe', date: '2026-05-24', status: '출판 대기' }
        ],
        walletFundingsCount: 0,
        currentCategory: 'essay',
        isMatchingCompleted: false,
        surveyStep: 0,
        surveyAnswers: [],
        writeMode: 'guided',          // guided (가이드 질문형) | free (자유롭게 쓰기)
        lastGuidedCategory: 'essay',
        tempDraft: null,
        resumingDraft: false,
        selectedCover: 'A',
        currentFundingProj: null,
        matchingOption: 'merge' // merge (세대 융합) | split (세대별 맞춤)
    };

    // --- 언어 헬퍼: 영문 페이지(lang=en)에서는 영어 문구 사용 ---
    const IS_EN = document.documentElement.lang === 'en';
    const tr = (ko, en) => (IS_EN ? en : ko);

    // --- Expanded Categories and Templates (v3) ---
    const categoriesData = [
        { key: "essay", name: "📖 자서전 (기혼자)", icon: "bx-face" },
        { key: "parent_biography", name: "👵 부모님 생애 대필", icon: "bx-heart-circle" },
        { key: "student", name: "🎓 성장기 (학생용)", icon: "bx-book-reader" },
        { key: "worker", name: "💼 직장인 에세이", icon: "bx-briefcase" },
        { key: "travel", name: "✈️ 여행", icon: "bx-compass" },
        { key: "newlywed", name: "💍 신혼생활", icon: "bx-heart" },
        { key: "inlaws", name: "🏡 시집생활", icon: "bx-home-smile" },
        { key: "love", name: "💕 연애생활", icon: "bx-star" },
        { key: "picnic", name: "🎒 소풍", icon: "bx-cookie" },
        { key: "misunderstanding", name: "💬 오해", icon: "bx-message-rounded-dots" },
        { key: "joy", name: "☀️ 기쁨", icon: "bx-smile" },
        { key: "friend", name: "🤝 친구", icon: "bx-group" },
        { key: "stranger", name: "🧭 낯선 장소에서", icon: "bx-map-pin" },
        { key: "sea", name: "🌊 바다", icon: "bx-water" },
        { key: "sad", name: "💧 내가 슬픈 이유", icon: "bx-sad" },
        { key: "lonely", name: "🍂 내가 외로울 땐", icon: "bx-cloud-rain" },
        { key: "empty", name: "🌫️ 혼자인 느낌이 들 때", icon: "bx-ghost" }
    ];

    const formTemplates = {
        essay: {
            guide: "자신의 인생을 차분히 회고하며 기록할 수 있는 4단계 성찰 양식입니다.",
            fields: [
                { label: "1단계: 유년 시절의 추억 (옛 골목길과 고향의 향수)", placeholder: "예: 방학동 시장 골목 붕어빵 냄새와 차가운 바람 소리", type: "textarea" },
                { label: "2단계: 풋풋했던 연애 시절 (첫 만남과 고백의 설렘)", placeholder: "예: 첫 고백의 순간 편지에 담아 전했던 손발 오글거리던 진심", type: "textarea" },
                { label: "3단계: 결혼 생활의 약속과 시집살이의 에피소드", placeholder: "예: 서툰 결혼 생활 속에서도 나를 지탱해 준 배우자의 격려", type: "textarea" },
                { label: "4단계: 아이가 첫 울음을 터뜨린 날부터 육아 분투기", placeholder: "예: 밤샘 간호하며 땀 흘리는 아이의 머리맡에서 기도하던 밤", type: "textarea" }
            ]
        },
        parent_biography: {
            guide: "부모님의 평생 생애를 쉽게 대필하거나 부모님 스스로 기록할 수 있도록 5단계 가이드를 지원합니다.",
            fields: [
                { label: "1단계: 부모님의 유년 시절과 그리운 고향의 추억", placeholder: "예: 어릴 적 냇가에서 물장구치고 썰매 타던 흙내음 가득한 고향 마을", type: "textarea" },
                { label: "2단계: 부모님이 말해주신 첫 연애와 손편지, 혹은 어색했던 중매의 추억", placeholder: "예: 아버지의 첫 연애편지를 숨겨 보관하며 두근거리던 가슴 한구석", type: "textarea" },
                { label: "3단계: 전통 결혼식 날의 풍경 및 눈물겨운 시집살이 극복기", placeholder: "예: 시댁 어르신들의 눈치를 보며 가마솥 밥을 짓던 부엌의 자욱한 김", type: "textarea" },
                { label: "4단계: 자녀들의 출산과 끼니를 굶어가며 길러낸 육아 분투", placeholder: "예: 자식들 입에 하얀 쌀밥이 들어가는 것을 보며 배가 불렀던 희생의 세월", type: "textarea" },
                { label: "5단계: 노년에 접어들어 자녀들이 오해로 다툴 때 해주고 싶으신 가르침", placeholder: "예: 형제간에 서로 조금만 져주고 사랑으로 화목하게 지내라는 눈물 섞인 당부", type: "textarea" }
            ]
        },
        student: {
            guide: "학생 청소년을 위한 공부 비법 및 고민 극복 성찰 템플릿입니다.",
            fields: [
                { label: "1단계: 나만의 과목별 공부 비법 및 암기 꿀팁", placeholder: "예: 수학 오답노트에 막힌 원인을 파란 펜으로 꼼꼼히 적는 법", type: "textarea" },
                { label: "2단계: 시험 기간 극심한 멘탈 붕괴를 극복했던 마인드셋", placeholder: "예: 성적이 떨어진 날 나를 다독이며 먹던 매운 떡볶이와 일기 쓰기", type: "textarea" },
                { label: "3단계: 진로 고민이나 친구와의 오해를 이겨냈던 소중한 경험", placeholder: "예: 진로 문제로 혼자 방황할 때 나를 묵묵히 지켜봐 준 담임 선생님의 말 한마디", type: "textarea" }
            ]
        },
        worker: {
            guide: "사회생활을 견뎌내는 직장인의 애환과 일상 성찰을 돕는 템플릿입니다.",
            fields: [
                { label: "1. 첫 출근 날 입었던 복장과 잔뜩 긴장했던 사무실의 공기", placeholder: "예: 새벽부터 정장을 다려 입고 긴장해 차가운 생수만 마시던 첫날의 기억", type: "textarea" },
                { label: "2. 늦은 밤 고단한 퇴근길, 지친 나를 위해 선물해 준 소소한 보상", placeholder: "예: 편의점 수입맥주 한 캔과 좋아하는 인디밴드의 음악을 들으며 걷던 길", type: "textarea" }
            ]
        },
        travel: {
            guide: "낯선 여행지에서 느낀 내면의 변화와 성찰을 기록합니다.",
            fields: [
                { label: "1. 여행지의 묘사 및 떠나게 된 계기", placeholder: "예: 일상에 번아웃이 와 무작정 가방을 싸고 떠난 제주도 서쪽 바다", type: "input" },
                { label: "2. 그곳에서 마주한 낯선 풍경과 내면의 평온함", placeholder: "예: 해질녘 붉게 물든 노을을 바라보며 마침내 되찾은 여유", type: "textarea" }
            ]
        },
        newlywed: {
            guide: "서로 다른 두 사람이 만나 하나를 이뤄가는 신혼 생활의 기록입니다.",
            fields: [
                { label: "1. 가구 배치부터 요리까지, 둘만의 소소한 첫 살림의 기억", placeholder: "예: 삐뚤빼뚤 조립한 거실 책상과 처음 망친 계란말이 요리", type: "textarea" },
                { label: "2. 맞춰가는 과정에서 생긴 작은 다툼과 화해의 비책", placeholder: "예: 화가 나도 한 시간 뒤에는 서로 손잡고 웃기로 했던 규칙", type: "textarea" }
            ]
        },
        inlaws: {
            guide: "가족이 되어가는 어색하지만 따뜻한 시집 생활의 사연을 기록합니다.",
            fields: [
                { label: "1. 시부모님과의 첫 식사나 잊지 못할 명절 일화", placeholder: "예: 잔뜩 긴장해 땀을 흘리던 며느리에게 며느리가 아닌 딸이라며 쥐어주신 용돈", type: "textarea" },
                { label: "2. 서로를 이해하며 진짜 가족이 되었던 순간", placeholder: "예: 아기가 아플 때 어머니가 밤새 끓여와 주신 미역국 한 그릇", type: "textarea" }
            ]
        },
        love: {
            guide: "사랑하고 사랑받으며 성장했던 소중한 연애 생활을 담습니다.",
            fields: [
                { label: "1. 연인과 자주 가던 아지트나 함께 들었던 노래", placeholder: "예: 대학로 소극장 뒤편 낡은 카페와 그 시절 유행하던 발라드", type: "input" },
                { label: "2. 그 사람이 내 곁에 있어 가장 든든했던 순간", placeholder: "예: 힘든 하루 끝에 말없이 안아주며 내 편이 되어준 순간", type: "textarea" }
            ]
        },
        picnic: {
            guide: "맑은 하늘 아래 이웃, 가족들과 떠났던 즐거운 소풍에 대한 기억입니다.",
            fields: [
                { label: "1. 소풍 전날 돗자리와 김밥을 준비하던 설렘", placeholder: "예: 소풍 전날 밤, 비가 오지 않기를 기도하며 쌌던 김밥 도시락", type: "textarea" },
                { label: "2. 그날 숲속이나 공원에서 나누었던 소중한 대화", placeholder: "예: 잔디밭에 누워 바라본 뭉게구름과 친구들의 해맑은 웃음소리", type: "textarea" }
            ]
        },
        misunderstanding: {
            guide: "말 한마디로 엉켰던 오해와, 용기 내어 실타래를 풀었던 화해의 기록입니다.",
            fields: [
                { label: "1. 소중한 사람과 사소한 일로 서먹해졌던 계기", placeholder: "예: 약속 시간에 늦은 친구에게 상처를 주는 차가운 말을 내뱉었던 날", type: "textarea" },
                { label: "2. 자존심을 내려놓고 먼저 진심을 고백했던 화해의 방법", placeholder: "예: 편지에 미안하다는 글자 세 자를 적어 조심스레 가방에 넣어두었던 날", type: "textarea" }
            ]
        },
        joy: {
            guide: "내 삶을 환하게 밝혀주었던 큰 기쁨과 환희의 순간을 남깁니다.",
            fields: [
                { label: "1. 나를 세상에서 가장 행복하게 만들었던 기쁜 성취나 사건", placeholder: "예: 합격 통지서를 받고 온 가족이 끌어안고 눈물을 흘리며 기뻐했던 저녁", type: "textarea" }
            ]
        },
        friend: {
            guide: "내 등 뒤를 묵묵히 받쳐주는 든든한 친구에 대한 에세이입니다.",
            fields: [
                { label: "1. 베스트 친구, 남자친구 혹은 여자친구와 겪은 평생의 에피소드", placeholder: "예: 힘든 군대 시절 매달 손편지를 써주며 위로해 주던 평생의 단짝 친구", type: "textarea" },
                { label: "2. 내 곁의 인연에게 꼭 전하고 싶었지만 쑥스러워 묻어둔 고마움", placeholder: "예: 말하지 않아도 내 슬픔을 눈치채 주는 네가 있어 참 고맙다.", type: "textarea" }
            ]
        },
        stranger: {
            guide: "낯선 여행지, 낯선 집, 낯선 환경 속에서 나 자신을 깊이 성찰한 이야기입니다.",
            fields: [
                { label: "1. 내가 마주한 낯선 상황과 그곳의 이국적인 분위기", placeholder: "예: 홀로 떠난 타국 기차역 플랫폼에서 마주한 이방인들의 미소", type: "textarea" },
                { label: "2. 익숙한 곳을 벗어남으로써 깨닫게 된 내 안의 새로운 힘", placeholder: "예: 의지할 곳 없던 그곳에서 비로소 온전히 나 스스로를 믿게 되었습니다.", type: "textarea" }
            ]
        },
        sea: {
            guide: "끝없이 밀려오는 파도와 바다를 보며 털어놓았던 마음의 소리입니다.",
            fields: [
                { label: "1. 눈앞에 펼쳐진 푸른 바다의 색과 철썩이는 파도 소리", placeholder: "예: 겨울바다의 매서운 바람 속에서도 찬란하게 부서지던 흰 거품들", type: "textarea" },
                { label: "2. 바다를 향해 외치거나 속으로 다짐했던 마음속 응어리", placeholder: "예: 지나간 미련은 파도에 씻어 보내고, 이제 다시 시작하겠다는 다짐", type: "textarea" }
            ]
        },
        sad: {
            guide: "내가 슬픈 이유를 마주하고, 눈물을 통해 마음을 정화하는 템플릿입니다.",
            fields: [
                { label: "1. 최근 혹은 마음속 깊이 묻어둔 나를 가장 눈물짓게 하는 이유", placeholder: "예: 점점 작아지는 부모님의 어깨와 늘어난 흰머리를 문득 바라보았을 때", type: "textarea" },
                { label: "2. 슬픔의 터널을 지나며 스스로를 보듬었던 나만의 따뜻한 방법", placeholder: "예: 조용히 슬픈 음악을 들으며 실컷 울고 난 뒤, 스스로에게 끓여준 따뜻한 차 한 잔", type: "textarea" }
            ]
        },
        lonely: {
            guide: "내가 외로울 때, 고독을 친구 삼아 내면을 들여다보는 글쓰기입니다.",
            fields: [
                { label: "1. 유독 세상에 나 혼자만 남겨진 듯 쓸쓸하게 느껴지는 순간", placeholder: "예: 비가 추적추적 내리는 일요일 오후, 아무에게도 연락이 오지 않는 적막한 거실", type: "textarea" },
                { label: "2. 고독을 외면하지 않고 온전히 받아들여 나를 사랑해 주는 일", placeholder: "예: 나를 위해 예쁜 그릇에 음식을 담아 대접하고, 좋아하는 책을 소리 내어 읽어주는 시간", type: "textarea" }
            ]
        },
        empty: {
            guide: "군중 속의 고독, 옆에 누군가 있어도 혼자인 느낌이 들 때의 극복 템플릿입니다.",
            fields: [
                { label: "1. 사람들 틈에 섞여 웃고 있으면서도 가슴 한구석이 텅 빈 것처럼 쓸쓸했던 감정", placeholder: "예: 연말 동창 모임에서 떠들썩하게 대화하고 돌아오는 지하철 안에서의 공허함", type: "textarea" },
                { label: "2. 타인의 시선에서 벗어나 내 영혼의 안식을 채우기 위해 하는 나만의 리츄얼(의식)", placeholder: "예: 조명을 끄고 아로마 향을 피운 채 가만히 누워 내 숨소리에만 귀를 기울이는 것", type: "textarea" }
            ]
        }
    };


    // =====================================================================
    // --- Extended Categories (v3.1): 글쓰기 소재 확대 ---
    // =====================================================================
    const _f = (label, placeholder, type = 'textarea') => ({ label, placeholder, type });
    const _t = (guide, ...fields) => ({ guide, fields });

    const extraCategories = [
        // 나의 이야기
        { key: "childhood", name: "🧸 어린 시절의 기억", icon: "bx-happy", group: "나의 이야기" },
        { key: "hometown", name: "🏡 고향과 옛 동네", icon: "bx-home-heart", group: "나의 이야기" },
        { key: "turning", name: "🌱 인생의 전환점", icon: "bx-trending-up", group: "나의 이야기" },
        { key: "proud", name: "🏅 내가 자랑스러웠던 순간", icon: "bx-medal", group: "나의 이야기" },
        { key: "regret", name: "🍃 지금이라면 달리 했을 일", icon: "bx-undo", group: "나의 이야기" },
        { key: "letter_self", name: "✉️ 나에게 쓰는 편지", icon: "bx-envelope", group: "나의 이야기" },
        // 가족 · 사랑 · 관계
        { key: "parenting", name: "👶 육아 일기", icon: "bx-baby-carriage", group: "가족·사랑·관계" },
        { key: "parent_thanks", name: "💐 부모님께 전하는 마음", icon: "bx-heart", group: "가족·사랑·관계" },
        { key: "sibling", name: "👫 형제자매 이야기", icon: "bx-group", group: "가족·사랑·관계" },
        { key: "grandparent", name: "🧓 할머니 할아버지", icon: "bx-user-voice", group: "가족·사랑·관계" },
        { key: "pet", name: "🐶 반려동물과 함께", icon: "bx-bone", group: "가족·사랑·관계" },
        { key: "breakup", name: "🥀 이별과 그리움", icon: "bx-heart-circle", group: "가족·사랑·관계" },
        // 학교와 일터
        { key: "exam", name: "📝 시험과 입시", icon: "bx-pencil", group: "학교와 일터" },
        { key: "teacher", name: "🍎 잊지 못할 선생님", icon: "bx-chalkboard", group: "학교와 일터" },
        { key: "startup", name: "🚀 도전과 창업", icon: "bx-rocket", group: "학교와 일터" },
        { key: "military", name: "🪖 군대 이야기", icon: "bx-shield", group: "학교와 일터" },
        { key: "retirement", name: "🎖️ 은퇴 이후의 삶", icon: "bx-sun", group: "학교와 일터" },
        // 감정과 마음
        { key: "gratitude", name: "🙏 고마웠던 사람", icon: "bx-donate-heart", group: "감정과 마음" },
        { key: "anger", name: "🔥 화가 났던 날", icon: "bx-angry", group: "감정과 마음" },
        { key: "fear", name: "🌙 두려움과 불안", icon: "bx-moon", group: "감정과 마음" },
        { key: "hope", name: "🌈 희망과 다짐", icon: "bx-star", group: "감정과 마음" },
        { key: "comfort", name: "🫂 위로받았던 순간", icon: "bx-hug", group: "감정과 마음" },
        { key: "healing", name: "🌿 나를 돌보는 시간", icon: "bx-leaf", group: "감정과 마음" },
        // 여행과 장소
        { key: "mountain", name: "⛰️ 산과 숲", icon: "bx-landscape", group: "여행과 장소" },
        { key: "city_night", name: "🌃 도시의 밤", icon: "bx-buildings", group: "여행과 장소" },
        { key: "train", name: "🚉 기차와 버스 안에서", icon: "bx-train", group: "여행과 장소" },
        { key: "spring", name: "🌸 봄", icon: "bx-sun", group: "여행과 장소" },
        { key: "summer", name: "🍉 여름", icon: "bx-sun", group: "여행과 장소" },
        { key: "autumn", name: "🍁 가을", icon: "bx-wind", group: "여행과 장소" },
        { key: "winter", name: "❄️ 겨울", icon: "bx-water", group: "여행과 장소" },
        // 음식 · 취미 · 문화
        { key: "recipe", name: "🍳 오븐 속 추억 (음식 레시피)", icon: "bx-restaurant", group: "음식·취미·문화" },
        { key: "soulfood", name: "🍲 어머니의 소울푸드", icon: "bx-bowl-hot", group: "음식·취미·문화" },
        { key: "cafe", name: "☕ 단골 카페와 가게", icon: "bx-coffee", group: "음식·취미·문화" },
        { key: "music", name: "🎧 나를 위로한 음악", icon: "bx-headphone", group: "음식·취미·문화" },
        { key: "book", name: "📚 인생 책 한 권", icon: "bx-book-open", group: "음식·취미·문화" },
        { key: "hobby", name: "🎨 나만의 취미", icon: "bx-palette", group: "음식·취미·문화" },
        { key: "exercise", name: "🏃 운동과 건강", icon: "bx-run", group: "음식·취미·문화" },
        // 기념일과 이웃
        { key: "holiday", name: "🎑 명절 풍경", icon: "bx-gift", group: "기념일과 이웃" },
        { key: "birthday", name: "🎂 생일과 기념일", icon: "bx-cake", group: "기념일과 이웃" },
        { key: "volunteer", name: "🤲 나눔과 봉사", icon: "bx-donate-heart", group: "기념일과 이웃" },
        { key: "dobong", name: "🏞️ 도봉구 우리 동네 이야기", icon: "bx-map-pin", group: "기념일과 이웃" }
    ];

    // 기존 17개 분류에 그룹 지정
    const baseGroups = {
        essay: "나의 이야기", parent_biography: "나의 이야기",
        student: "학교와 일터", worker: "학교와 일터",
        travel: "여행과 장소", picnic: "여행과 장소", stranger: "여행과 장소", sea: "여행과 장소",
        newlywed: "가족·사랑·관계", inlaws: "가족·사랑·관계", love: "가족·사랑·관계", friend: "가족·사랑·관계",
        misunderstanding: "감정과 마음", joy: "감정과 마음", sad: "감정과 마음", lonely: "감정과 마음", empty: "감정과 마음"
    };
    categoriesData.forEach(c => { c.group = baseGroups[c.key] || "기타"; });
    extraCategories.forEach(c => categoriesData.push(c));

    // '자유 글쓰기' (분류 없음) : 목록 맨 앞에 배치
    categoriesData.unshift({ key: "free", name: "✏️ " + tr("자유 글쓰기", "Free Writing"), icon: "bx-edit-alt", group: tr("자유롭게 쓰기", "Write Freely") });
    formTemplates.free = _t("제목과 본문만으로 자유롭게 쓰는 방식입니다.",
        _f("본문", "자유롭게 이야기를 적어 보세요. 형식은 없습니다."));

    Object.assign(formTemplates, {
        // ---- 나의 이야기 ----
        childhood: _t("어린 시절의 장면을 오감으로 떠올려 기록합니다.",
            _f("1. 가장 선명하게 남아 있는 어린 시절의 장면", "예: 여름 저녁 평상에 누워 수박을 먹던 마당의 냄새와 모깃불 연기"),
            _f("2. 그때 가장 좋아했던 놀이나 장난감, 함께한 친구", "예: 해 질 때까지 구슬치기하다 어머니가 부르는 소리에 뛰어가던 골목")),
        hometown: _t("내가 자란 곳의 풍경과 사람들을 기록합니다.",
            _f("1. 고향(옛 동네)의 길과 가게, 계절마다 달랐던 풍경", "예: 시장 입구 방앗간의 고소한 참기름 냄새와 겨울 붕어빵 아저씨"),
            _f("2. 지금은 사라졌지만 마음에 남은 장소", "예: 철거된 동네 목욕탕과 그 앞 평상에서 마시던 바나나우유"),
            _f("3. 그곳에 다시 간다면 가장 먼저 하고 싶은 일", "예: 골목 끝 친구 집 담벼락에 손바닥을 대어 보고 싶다")),
        turning: _t("삶의 방향이 바뀐 결정적 순간을 돌아봅니다.",
            _f("1. 인생이 달라졌다고 느낀 순간과 그날의 상황", "예: 다니던 회사를 그만두겠다고 말하던 새벽의 부엌"),
            _f("2. 그 선택을 하기까지 가장 두려웠던 것과 힘이 되어 준 한마디", "예: 해보고 후회하는 게 낫다던 친구의 짧은 문자")),
        proud: _t("스스로 뿌듯했던 순간을 충분히 칭찬하며 기록합니다.",
            _f("1. 내가 해냈다고 느꼈던 순간", "예: 세 번 떨어지고 나서 마침내 합격 문자를 확인하던 오후"),
            _f("2. 그 순간 가장 먼저 떠오른 사람과 해주고 싶은 말", "예: 늘 말없이 도시락을 싸 주시던 어머니에게 전하는 고맙다는 말")),
        regret: _t("후회를 부드럽게 바라보며 지금의 나에게 전하는 글입니다.",
            _f("1. 지금이라면 다르게 했을 선택과 그때의 사정", "예: 사과 한마디를 미루다 연락이 끊겨 버린 친구"),
            _f("2. 그 경험이 지금의 나에게 남긴 배움", "예: 미안하다는 말은 마음먹은 날 바로 하는 것이라는 사실")),
        letter_self: _t("과거 또는 미래의 나에게 편지를 쓰는 양식입니다.",
            _f("1. 편지를 받을 나는 몇 살인가요? 안부 인사부터 적어 보세요", "예: 열일곱의 나에게, 잘 지내니? 지금 많이 불안하지?"),
            _f("2. 꼭 전하고 싶은 위로와 응원", "예: 네가 걱정하는 일의 절반은 일어나지 않고, 나머지 절반도 지나가"),
            _f("3. 편지의 마지막 인사", "예: 십 년 뒤에 다시 편지 쓸게. 그때까지 밥 잘 챙겨 먹어", "input")),
        // ---- 가족 · 사랑 · 관계 ----
        parenting: _t("아이와 함께 자란 부모의 시간을 기록합니다.",
            _f("1. 아이와 함께한 가장 웃겼거나 뭉클했던 하루", "예: 처음으로 '엄마'라고 부르며 걸어와 안기던 아침"),
            _f("2. 육아 중 가장 지치고 힘들었던 순간과 나를 일으킨 것", "예: 새벽 세 시 열이 오르던 아이를 업고 달리던 응급실 복도")),
        parent_thanks: _t("부모님께 쑥스러워 못 했던 마음을 글로 전합니다.",
            _f("1. 부모님 하면 떠오르는 장면 하나", "예: 비 오는 날 우산을 내 쪽으로만 기울이시던 아버지의 젖은 어깨"),
            _f("2. 그동안 하지 못했던 말", "예: 그때 화내서 죄송했고, 사실은 늘 자랑스러웠다는 말"),
            _f("3. 앞으로 함께 하고 싶은 일", "예: 어머니와 둘이 기차 타고 바다 보러 가기")),
        sibling: _t("가장 가깝고도 서먹했던 형제자매와의 이야기를 기록합니다.",
            _f("1. 함께 자라며 가장 많이 싸웠거나 가장 많이 웃었던 일", "예: 하나뿐인 과자를 반으로 가르려다 가루가 되어 버린 오후"),
            _f("2. 어른이 되어 달라진 서로의 관계", "예: 명절에만 만나지만 눈빛만 봐도 서로의 안부를 아는 사이")),
        grandparent: _t("할머니·할아버지가 남긴 기억과 가르침을 기록합니다.",
            _f("1. 조부모님 댁의 풍경과 냄새, 소리", "예: 아궁이 불 냄새와 이불 속에서 듣던 옛날이야기"),
            _f("2. 가장 기억에 남는 말씀이나 손맛", "예: 밥은 먹고 다니냐며 쥐여주시던 꼬깃꼬깃한 용돈")),
        pet: _t("함께 살아온 반려동물과의 시간을 기록합니다.",
            _f("1. 처음 만난 날과 이름을 지어 준 이유", "예: 비 오는 날 현관 앞에서 떨고 있던 작은 갈색 강아지"),
            _f("2. 이 아이 덕분에 달라진 나의 일상", "예: 퇴근길이 기다려지고, 혼잣말이 늘고, 산책으로 계절을 알게 되었다")),
        breakup: _t("지나간 인연을 정리하며 마음을 어루만지는 글입니다.",
            _f("1. 그 사람과의 가장 따뜻했던 기억 하나", "예: 첫눈이 오던 날 아무 말 없이 장갑 한쪽을 건네주던 손"),
            _f("2. 이별 후 시간이 지나며 알게 된 나의 마음", "예: 그리움은 줄어드는 게 아니라 내 안에 자리를 잡는 것이라는 사실")),
        // ---- 학교와 일터 ----
        exam: _t("시험과 입시를 지나온 나(또는 우리 가족)의 이야기입니다.",
            _f("1. 시험을 앞둔 가장 긴장되던 밤과 아침의 풍경", "예: 새벽 네 시, 불 꺼진 거실에서 혼자 암기장을 넘기던 기억"),
            _f("2. 결과와 상관없이 나를 지켜 준 한마디", "예: 괜찮아, 어디서든 너는 너야, 라고 말해 주던 가족의 목소리")),
        teacher: _t("나에게 영향을 준 선생님과 스승을 기록합니다.",
            _f("1. 그 선생님을 처음 만난 장면과 첫인상", "예: 교실 문을 열자 칠판 가득 우리 이름을 써 두셨던 새 학기 첫날"),
            _f("2. 지금도 마음에 남은 가르침", "예: 틀려도 괜찮으니 손부터 들어 보라던 말씀")),
        startup: _t("새로운 도전을 시작한 용기와 시행착오를 기록합니다.",
            _f("1. 도전을 결심하게 된 계기와 가장 설레던 순간", "예: 퇴근 후 식탁에서 시작한 작은 아이디어에 처음 주문이 들어온 날"),
            _f("2. 가장 힘들었던 고비와 버티게 한 힘", "예: 통장 잔고를 보며 잠 못 들던 밤 곁에서 기다려 준 가족")),
        military: _t("군 복무 시절의 추억과 성장을 기록합니다.",
            _f("1. 입대하던 날의 풍경과 마음", "예: 연병장 앞에서 어머니와 말없이 포옹하던 아침"),
            _f("2. 그곳에서 만난 사람들과 잊지 못할 에피소드", "예: 혹한의 보초를 서며 나눠 먹던 초코파이 한 조각")),
        retirement: _t("일을 마친 뒤 맞는 새로운 시간의 이야기입니다.",
            _f("1. 마지막 출근(퇴근)하던 날의 풍경과 마음", "예: 책상 위 짐을 상자에 담으며 조용히 인사하던 복도"),
            _f("2. 이제야 해 보고 싶은 일과 달라진 하루", "예: 아침 느린 산책, 미뤄 둔 붓글씨, 손주와의 점심")),
        // ---- 감정과 마음 ----
        gratitude: _t("고마운 사람에게 마음을 전하는 글입니다.",
            _f("1. 고마웠던 사람과 그 사람이 내게 해 준 일", "예: 이사하던 날 말없이 짐을 날라 준 옆집 아저씨"),
            _f("2. 그 마음을 어떻게 전하고 싶은지", "예: 따뜻한 밥 한 끼와 손편지로 늦은 감사를 전하고 싶다")),
        anger: _t("화가 났던 순간을 차분히 풀어 보는 글입니다.",
            _f("1. 화가 났던 상황과 그때 몸에서 일어난 반응", "예: 얼굴이 달아오르고 말이 빨라지던 회의실의 오후"),
            _f("2. 시간이 지나 다시 보니 보이는 것들", "예: 그날의 분노 밑에는 서운함과 인정받고 싶은 마음이 있었다")),
        fear: _t("두려움과 불안을 마주하고 달래 보는 글입니다.",
            _f("1. 가장 두려웠던 순간이나 반복되는 걱정", "예: 발표 전날 밤마다 천장만 바라보던 긴 시간"),
            _f("2. 불안할 때 나를 진정시키는 방법", "예: 따뜻한 차를 마시며 걱정을 종이에 적어 서랍에 넣어 두기")),
        hope: _t("앞으로를 향한 바람과 다짐을 기록합니다.",
            _f("1. 요즘 내가 가장 바라는 것 한 가지", "예: 올해는 아이와 함께 저녁을 먹는 날을 늘리고 싶다"),
            _f("2. 그것을 위해 오늘 할 수 있는 작은 행동", "예: 퇴근 후 휴대폰을 서랍에 넣고 아이와 십 분 이야기하기")),
        comfort: _t("힘들 때 위로가 되었던 순간을 기록합니다.",
            _f("1. 지쳐 있던 나에게 위로가 되어 준 사람이나 장면", "예: 말없이 따뜻한 수프를 끓여 두고 간 친구의 메모"),
            _f("2. 나도 누군가에게 건네고 싶은 위로의 말", "예: 지금 충분히 잘하고 있어요, 오늘은 쉬어도 괜찮아요")),
        healing: _t("바쁜 일상 속 나를 돌보는 나만의 시간을 기록합니다.",
            _f("1. 나를 편안하게 하는 장소, 향기, 소리", "예: 창가 햇살 아래 식어 가는 차 한 잔과 잔잔한 피아노 소리"),
            _f("2. 오늘 나에게 해 주고 싶은 작은 선물", "예: 일찍 불을 끄고 푹 자기, 좋아하는 길로 돌아서 걷기")),
        // ---- 여행과 장소 ----
        mountain: _t("산과 숲에서 만난 풍경과 생각을 기록합니다.",
            _f("1. 오르던 길의 소리와 냄새, 힘들었던 순간", "예: 가쁜 숨 사이로 들려오던 계곡물 소리와 젖은 흙냄새"),
            _f("2. 정상(혹은 쉼터)에서 마주한 풍경과 마음", "예: 땀을 식히던 바위 위에서 갑자기 모든 걱정이 작아 보였다")),
        city_night: _t("도시의 밤이 주는 고독과 설렘을 기록합니다.",
            _f("1. 밤거리의 불빛과 소리, 걷고 있던 나", "예: 퇴근 후 빌딩 불빛이 하나둘 꺼지는 강변을 걸으며"),
            _f("2. 밤이기에 솔직해질 수 있었던 생각", "예: 낮에는 말하지 못한 속마음이 가로등 아래에서야 정리되었다")),
        train: _t("이동하는 시간 속에서 떠오른 생각을 기록합니다.",
            _f("1. 창밖 풍경과 옆자리, 흘러나오던 소리", "예: 새벽 첫 기차 창밖으로 안개가 걷히던 들판"),
            _f("2. 이동 중에 떠오른 지난 기억이나 앞으로의 생각", "예: 목적지가 가까워질수록 점점 또렷해지던 고향 집의 모습")),
        spring: _t("봄에 얽힌 기억과 감정을 기록합니다.",
            _f("1. 내가 기억하는 가장 인상 깊은 봄의 풍경", "예: 교정 가득 벚꽃잎이 흩날리던 입학식 날"),
            _f("2. 봄이 오면 떠오르는 사람과 음식", "예: 쑥 향 가득한 어머니의 쑥국과 함께 오던 따뜻한 바람")),
        summer: _t("여름에 얽힌 기억과 감정을 기록합니다.",
            _f("1. 여름 하면 떠오르는 장면과 소리", "예: 매미 소리 속 평상에 둘러앉아 먹던 차가운 수박"),
            _f("2. 가장 뜨거웠던 여름날의 사건", "예: 갑자기 쏟아진 소나기에 모두 마당으로 뛰어나가던 오후")),
        autumn: _t("가을에 얽힌 기억과 감정을 기록합니다.",
            _f("1. 가을의 풍경과 냄새, 소리", "예: 낙엽 밟는 소리와 어디선가 풍겨 오던 군고구마 냄새"),
            _f("2. 가을이 되면 더 짙어지는 감정", "예: 괜히 안부가 궁금해지고 오래된 노래가 듣고 싶어진다")),
        winter: _t("겨울에 얽힌 기억과 감정을 기록합니다.",
            _f("1. 가장 따뜻했던 겨울의 기억", "예: 눈 오는 날 가족이 둘러앉아 귤을 까먹던 아랫목"),
            _f("2. 추위 속에서 더 고마웠던 사람이나 물건", "예: 손에 쥐여 주던 호빵과 목에 둘러 주던 낡은 목도리")),
        // ---- 음식 · 취미 · 문화 ----
        recipe: _t("나만의 요리와 그에 얽힌 추억을 레시피 형식으로 기록합니다.",
            _f("1. 요리 이름과 이 요리에 얽힌 추억", "예: 오븐 속에서 구워지던 첫 소금빵과 온 집 안에 퍼지던 버터 향"),
            _f("2. 재료와 만드는 순서(핵심 팁 포함)", "예: 소금 3g, 버터 20g, 반죽을 밀어 돌돌 말아 200도에서 12분"),
            _f("3. 이 음식을 먹는 순간의 감정", "예: 갓 구운 빵을 찢어 한 입 먹던 순간 목이 메어 왔다")),
        soulfood: _t("마음을 채워 준 소울푸드와 그 사람의 이야기를 기록합니다.",
            _f("1. 나의 소울푸드와 처음 먹었던 날의 기억", "예: 아픈 날마다 어머니가 끓여 주시던 뭇국의 따뜻한 김"),
            _f("2. 그 음식에 담긴 사람의 정성과 지금의 그리움", "예: 이제는 같은 맛을 내려 해도 어딘가 부족한 그 손맛")),
        cafe: _t("단골 가게가 내 일상에 남긴 이야기를 기록합니다.",
            _f("1. 자주 가는 카페(가게)와 내 지정석, 주문하는 메뉴", "예: 창가 두 번째 자리, 늘 시키는 따뜻한 라테"),
            _f("2. 그곳의 사장님이나 풍경이 내게 준 위로", "예: 말없이 서비스 쿠키를 건네던 사장님의 눈인사")),
        music: _t("음악과 함께한 시간을 기록합니다.",
            _f("1. 내 삶의 한 장면과 함께 떠오르는 노래", "예: 군 입대 전날 밤 이어폰으로 반복해 듣던 노래"),
            _f("2. 그 노래를 들으면 되살아나는 감정", "예: 첫 구절만 들어도 그 해 겨울의 공기가 되살아난다")),
        book: _t("한 권의 책이 내 삶에 남긴 흔적을 기록합니다.",
            _f("1. 인생 책 한 권과 그 책을 만난 때", "예: 방황하던 스무 살, 헌책방에서 우연히 집어 든 얇은 시집"),
            _f("2. 책 속 문장이나 장면이 내 삶에 미친 영향", "예: 지친 날마다 펼쳐 보게 되는 낡은 책갈피의 한 장면")),
        hobby: _t("나를 즐겁게 하는 취미 이야기를 기록합니다.",
            _f("1. 취미를 시작하게 된 계기", "예: 우연히 얻은 중고 카메라로 골목을 찍기 시작한 주말"),
            _f("2. 이 취미 덕분에 만난 사람과 달라진 나", "예: 같은 동호회 사람들과 새벽 일출 사진을 찍으러 다니며 웃음이 늘었다")),
        exercise: _t("운동과 건강을 지켜 가는 나의 이야기를 기록합니다.",
            _f("1. 운동(걷기·러닝·요가 등)을 시작한 계기", "예: 건강검진 결과를 받은 날 처음 신발끈을 묶고 나선 저녁"),
            _f("2. 몸과 마음에 찾아온 변화", "예: 숨이 차던 계단이 가벼워지고 잠이 깊어졌다")),
        // ---- 기념일과 이웃 ----
        holiday: _t("명절의 풍경과 가족의 기억을 기록합니다.",
            _f("1. 명절의 소리와 냄새, 북적이던 풍경", "예: 전 부치는 고소한 냄새와 방마다 울리던 웃음소리"),
            _f("2. 올해(혹은 지난날)의 명절에 느낀 감정", "예: 비어 있는 자리를 바라보며 오히려 가족의 소중함을 느꼈다")),
        birthday: _t("생일과 기념일에 남은 마음을 기록합니다.",
            _f("1. 가장 기억에 남는 생일(기념일)의 풍경", "예: 촛불을 끄기 전 가족이 함께 불러 준 서툰 노래"),
            _f("2. 선물보다 오래 남은 마음", "예: 서툰 글씨로 쓴 카드 속 한 줄이 아직도 서랍 속에 있다")),
        volunteer: _t("나누고 도운 경험이 남긴 마음을 기록합니다.",
            _f("1. 나눔(봉사)을 하게 된 계기와 그날의 풍경", "예: 연말 연탄 배달 길에 만난 할머니의 환한 인사"),
            _f("2. 나눔이 오히려 내게 준 것", "예: 받은 것보다 더 큰 따뜻함이 가슴에 남았다")),
        dobong: _t("내가 사는 도봉구(우리 동네)의 장소와 사람들을 기록합니다.",
            _f("1. 우리 동네에서 가장 좋아하는 길, 시장, 가게", "예: 방학동 시장 골목의 붕어빵 아저씨와 도봉산 아래 산책길"),
            _f("2. 이웃과 얽힌 따뜻한 에피소드", "예: 엘리베이터에서 건네받은 귤 한 봉지와 짧은 안부 인사"),
            _f("3. 이 동네에 바라는 모습", "예: 아이들이 골목에서 마음껏 뛰어놀 수 있는 마을"))
    });

    // 카테고리 이름에서 앞쪽 이모지를 제거한 라벨
    const catLabelOf = (name) => name.replace(/^\S+\s+/, '');
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // 글쓰기 분류 <select> 를 그룹별로 채움 (기존에는 옵션이 비어 있었음)
    function populateCategorySelect() {
        const sel = document.getElementById('write-category');
        const groups = [];
        categoriesData.forEach(c => {
            const g = c.group || "기타";
            if (!groups.includes(g)) groups.push(g);
        });
        const prev = sel.value;
        sel.innerHTML = '';
        groups.forEach(g => {
            const og = document.createElement('optgroup');
            og.label = g;
            categoriesData.filter(c => (c.group || "기타") === g).forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.key;
                opt.textContent = c.name;
                og.appendChild(opt);
            });
            sel.appendChild(og);
        });
        if (prev && formTemplates[prev]) sel.value = prev;
    }

    // --- Onboarding Personalization Rules (v3 Age Mapping) ---
    const personalizationRules = {
        student_child: ["student", "picnic", "friend", "joy", "sad", "childhood", "pet", "spring", "summer", "birthday", "teacher"],
        student_teen: ["student", "picnic", "friend", "joy", "sad", "lonely", "exam", "teacher", "music", "hobby", "hope", "fear"],
        college: ["travel", "stranger", "love", "lonely", "empty", "sea", "breakup", "startup", "military", "city_night", "music", "letter_self"],
        worker: ["worker", "stranger", "empty", "travel", "sad", "lonely", "startup", "healing", "cafe", "city_night", "exercise", "turning"],
        housewife: ["essay", "newlywed", "inlaws", "parent_biography", "joy", "friend", "parenting", "recipe", "soulfood", "holiday", "dobong", "parent_thanks"],
        senior: ["parent_biography", "essay", "lonely", "empty", "joy", "hometown", "grandparent", "retirement", "turning", "regret", "gratitude", "holiday"]
    };
    // --- DOM Elements ---
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.nav-item');
    
    // Header Info Elements
    const headerUserRank = document.getElementById('header-user-rank');
    const headerUserName = document.getElementById('header-user-name');
    
    // Wallet UI Elements
    const walletBalance = document.getElementById('wallet-balance');
    const walletPostsCount = document.getElementById('wallet-posts-count');
    const walletSettlementVal = document.getElementById('wallet-settlement-val');
    const settlementViews = document.getElementById('settlement-views');
    const settlementIncentive = document.getElementById('settlement-incentive');

    // Studio List Elements
    const myWritingCount = document.getElementById('my-writing-count');
    const myPostListGrid = document.getElementById('my-post-list-grid');


    // --- 1. v3 SMS & Profile Onboarding Screen Flow ---
    const authScreen = document.getElementById('auth-onboarding-screen');
    
    const panelStep1 = document.getElementById('auth-panel-step1');
    const panelStep2 = document.getElementById('auth-panel-step2');
    const panelStep3 = document.getElementById('auth-panel-step3');
    
    const sendSmsBtn = document.getElementById('send-sms-btn');
    const verifySmsBtn = document.getElementById('verify-sms-btn');
    const completeSignupBtn = document.getElementById('complete-signup-btn');
    
    const inputPhone = document.getElementById('auth-phone-num');
    const virtualOtpCode = document.getElementById('virtual-otp-code');
    const pinInputs = [
        document.getElementById('pin-0'),
        document.getElementById('pin-1'),
        document.getElementById('pin-2'),
        document.getElementById('pin-3')
    ];

    let generatedOtp = '1234';

    // Auto-focus move helper for 4-digit SMS OTP inputs
    pinInputs.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            if (e.key >= 0 && e.key <= 9) {
                if (index < 3) pinInputs[index + 1].focus();
            } else if (e.key === 'Backspace') {
                if (index > 0) pinInputs[index - 1].focus();
            }
        });
    });

    // Step 1: Send virtual SMS
    sendSmsBtn.addEventListener('click', () => {
        const phone = inputPhone.value.trim();
        if (!phone || phone.length < 10) {
            showTemporaryToast("유효한 휴대폰 번호를 입력해 주세요.", "warning");
            return;
        }

        // Generate 가상 4자리 인증번호
        generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
        virtualOtpCode.textContent = generatedOtp;

        showTemporaryToast(`인증번호 [${generatedOtp}]가 휴대폰으로 전송되었습니다.`, "mint");
        
        panelStep1.classList.remove('active');
        panelStep2.classList.add('active');
        pinInputs[0].focus();
    });

    // Step 2: Verify SMS Code
    verifySmsBtn.addEventListener('click', () => {
        const enteredOtp = pinInputs.map(input => input.value).join('');
        if (enteredOtp !== generatedOtp) {
            showTemporaryToast("인증번호가 일치하지 않습니다. 다시 입력해 주세요.", "warning");
            return;
        }

        showTemporaryToast("휴대폰 인증 성공! 상세 회원 정보를 입력하세요.", "mint");
        panelStep2.classList.remove('active');
        panelStep3.classList.add('active');
    });

    // Handle Role Cards choice
    const roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            roleCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            state.userRole = card.getAttribute('data-role');
        });
    });

    // Step 3: Complete Sign-up & Save user info
    completeSignupBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('reg-username');
        const birthInput = document.getElementById('reg-birth');

        if (!nameInput.value.trim()) {
            showTemporaryToast("필명을 적어주세요.", "warning");
            return;
        }

        state.username = nameInput.value.trim();
        state.userBirth = birthInput.value;
        state.userRank = 'neighbor'; // Reset to Neighbor (이웃)

        // Set Rank Banner UI
        updateRankUI();

        // Close Auth Page
        authScreen.classList.add('hidden');

        // Build Customized home screen cards depending on role
        initializePersonalizedApp();

        showGeneralOkModal(
            "반갑습니다, 이웃님!",
            `<strong>${state.username} 이웃님</strong>, 가입을 진심으로 환영합니다!<br>첫 에세이를 작성하시면 <strong>'예비작가'</strong>로 즉시 등업됩니다.`,
            "bx-smile"
        );
    });

    // --- Helper: Dynamic User Rank UI Update ---
    function updateRankUI() {
        headerUserName.textContent = state.username;
        
        // Remove class lists
        headerUserRank.className = 'rank-badge';
        
        if (state.userRank === 'neighbor') {
            headerUserRank.textContent = '이웃';
            headerUserRank.classList.add('rank-neighbor');
            walletSettlementVal.textContent = "가입 후 정산 대기";
            settlementViews.textContent = "0 회";
            settlementIncentive.textContent = "미대상";
        } else if (state.userRank === 'pre-author') {
            headerUserRank.textContent = '예비작가';
            headerUserRank.classList.add('rank-pre-author');
            walletSettlementVal.textContent = "+50 p";
            settlementViews.textContent = "380 회";
            settlementIncentive.textContent = "조회수 정산중 (1p)";
        } else if (state.userRank === 'author') {
            headerUserRank.textContent = '작가';
            headerUserRank.classList.add('rank-author');
            walletSettlementVal.textContent = "+3,450 p";
            settlementViews.textContent = "1,240 회";
            settlementIncentive.textContent = "5.5% 인세 배당 (2p)";
        }
    }

    // --- Helper: Wallet UI update ---
    function updateWalletUI() {
        walletBalance.textContent = state.userPoints.toLocaleString();
        walletPostsCount.textContent = `${state.userPosts.length} 편`;
        myWritingCount.textContent = `${state.userPosts.length}편 완료`;
        updateRankUI();
    }


    // --- 2. Navigation Control ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            screens.forEach(screen => {
                screen.classList.remove('active');
                if (screen.id === targetId) {
                    screen.classList.add('active');
                }
            });

            if (targetId === 'screen-write') {
                renderPostList();
            }
            if (targetId === 'screen-local') {
                updateWalletUI();
            }
        });
    });


    // --- 3. Personalization App Constructor (v3 Role-based) ---
    function initializePersonalizedApp() {
        // 1. Build Horizontal tag chips
        const cloud = document.getElementById('home-category-cloud');
        cloud.innerHTML = '';
        
        const priorityKeys = personalizationRules[state.userRole] || personalizationRules['housewife'];
        const matchedCats = categoriesData.filter(cat => priorityKeys.includes(cat.key));
        
        // Add others at back
        categoriesData.forEach(cat => {
            if (!priorityKeys.includes(cat.key)) matchedCats.push(cat);
        });

        matchedCats.forEach(cat => {
            const chip = document.createElement('div');
            chip.className = 'tag-chip';
            chip.innerHTML = `<i class="bx ${cat.icon}" style="margin-right:4px;"></i> ${catLabelOf(cat.name)}`;
            chip.addEventListener('click', () => {
                document.querySelector('.nav-item[data-target="screen-write"]').click();
                writeCategorySelect.value = cat.key;
                state.writeMode = (cat.key === 'free') ? 'free' : 'guided';
                openWriteOverlay();
                handleCategoryChange();
            });
            cloud.appendChild(chip);
        });

        // 2. Set default recommended topic based on Age segment
        const recCategory = document.getElementById('recommended-category');
        const recQuestion = document.getElementById('recommended-question');
        const recTips = document.getElementById('recommended-tips');
        const homeHeroTitle = document.getElementById('home-hero-title');

        if (state.userRole === 'student_child' || state.userRole === 'student_teen') {
            recCategory.textContent = "성장기 (학생용)";
            recQuestion.textContent = '"시험지 빨간 줄을 보고 눈물 쏟던 날, 나를 위로해 주었던 나만의 소울 간식과 일기는?"';
            recTips.textContent = "시험 극복 단계: 성적이 떨어진 날의 절망과 오답노트를 다시 편 의지를 적어주세요.";
            homeHeroTitle.innerHTML = "내 공부 비법 &<br>수능 극복 앤솔로지";
            writeCategorySelect.value = "student";
        } else if (state.userRole === 'college' || state.userRole === 'worker') {
            recCategory.textContent = "직장인 에세이";
            recQuestion.textContent = '"첫 직장 출근 날, 낯선 사무실의 차가운 정적 속에서 무슨 음료를 드셨나요?"';
            recTips.textContent = "직장인 단계: 사회 초년생의 서툰 긴장감과 퇴근길의 고단함을 묘사해 보세요.";
            homeHeroTitle.innerHTML = "청춘의 방황 &<br>첫 출근 극복 앤솔로지";
            writeCategorySelect.value = "worker";
        } else if (state.userRole === 'senior') {
            recCategory.textContent = "부모님 생애 대필";
            recQuestion.textContent = '"자녀가 커서 새살림을 꾸리고 독립하던 결혼식 날 아침, 눈물 흘리며 건넨 한마디는?"';
            recTips.textContent = "가족 성찰 단계: 부모님의 수줍었던 연애편지나 눈물의 시집살이 옛날이야기를 적어보세요.";
            homeHeroTitle.innerHTML = "부모님 평생 자서전<br>공동 출판 앤솔로지";
            writeCategorySelect.value = "parent_biography";
        } else {
            recCategory.textContent = "자서전 (기혼자)";
            recQuestion.textContent = '"아이의 첫 울음소리를 듣던 분만실 안의 기억은 어떤 모습인가요?"';
            recTips.textContent = "육아 좌충우돌 단계: 소리, 냄새, 가슴 저릿하던 감정을 입체적으로 적어주세요.";
            homeHeroTitle.innerHTML = "도봉구 홈베이킹<br>레시피 앤솔로지";
            writeCategorySelect.value = "essay";
        }

        handleCategoryChange();
    }


    // --- 4. Write Studio & Overlay (Second Window) ---
    const writeOverlayWindow = document.getElementById('write-overlay-window');
    const openWriteOverlayBtn = document.getElementById('open-write-overlay-btn');
    const closeWriteOverlayBtn = document.getElementById('close-write-overlay-btn');

    function openWriteOverlay() {
        writeOverlayWindow.classList.add('active');
    }
    function closeWriteOverlay() {
        writeOverlayWindow.classList.remove('active');
    }

    openWriteOverlayBtn.addEventListener('click', openWriteOverlay);
    closeWriteOverlayBtn.addEventListener('click', closeWriteOverlay);

    // Categories dropdown click bind
    const writeCategorySelect = document.getElementById('write-category');
    const formatGuideText = document.getElementById('format-guide-text');
    const dynamicFormFields = document.getElementById('dynamic-form-fields');

    const formatGuideBox = document.getElementById('format-guide');
    const writeCategoryLabel = document.getElementById('write-category-label');
    const writeModeBtns = document.querySelectorAll('.write-mode-btn');
    const writeModeHint = document.getElementById('write-mode-hint');
    const writeTitleInput = document.getElementById('write-title');

    function collectFieldValues() {
        return Array.from(document.querySelectorAll('#dynamic-form-fields .field-content')).map(f => f.value);
    }

    function updateWriteModeUI() {
        const free = state.writeMode === 'free';
        writeModeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === state.writeMode));
        formatGuideBox.style.display = free ? 'none' : '';
        writeCategoryLabel.textContent = free ? tr('주제 분류 (선택)', 'Topic Category (optional)') : tr('글쓰기 주제 분류', 'Writing Topic Category');
        writeModeHint.textContent = free
            ? tr('제목과 본문만 바로 쓰는 방식입니다. 주제 분류는 선택 사항이에요.', 'Just write a title and your text. Choosing a topic is optional.')
            : tr('주제를 고르면 질문이 나옵니다. 질문에 답하듯 차근차근 적어 보세요.', 'Pick a topic and answer the guided questions step by step.');
    }

    function renderWriteForm() {
        updateWriteModeUI();
        dynamicFormFields.innerHTML = '';

        // ---- 자유롭게 쓰기: 본문 칸 하나 ----
        if (state.writeMode === 'free') {
            const group = document.createElement('div');
            group.className = 'form-group';
            const label = document.createElement('label');
            label.className = 'form-label';
            label.setAttribute('for', 'write-field-0');
            label.textContent = tr('본문', 'Your Story');
            const ta = document.createElement('textarea');
            ta.className = 'form-textarea field-content free-body';
            ta.id = 'write-field-0';
            ta.placeholder = tr('자유롭게 이야기를 적어 보세요. 형식은 없습니다.', 'Write freely. There is no required format.');
            group.appendChild(label);
            group.appendChild(ta);
            dynamicFormFields.appendChild(group);
            return;
        }

        // ---- 가이드 질문형(기본): 분류별 질문 양식 ----
        const cat = (state.currentCategory && state.currentCategory !== 'free') ? state.currentCategory : 'essay';
        const currentTpl = formTemplates[cat] || formTemplates['essay'];
        formatGuideText.textContent = currentTpl.guide;

        currentTpl.fields.forEach((field, index) => {
            const group = document.createElement('div');
            group.className = 'form-group';

            const label = document.createElement('label');
            group.appendChild(label);

            if (currentTpl.fields.length > 1) {
                label.className = 'form-label';
                label.innerHTML = `<span class="step-number" style="display:inline-flex; margin-right:6px;">${index+1}</span> ${field.label}`;
            } else {
                label.className = 'form-label';
                label.textContent = field.label;
            }

            let element;
            if (field.type === 'input') {
                element = document.createElement('input');
                element.type = 'text';
                element.className = 'form-input field-content';
            } else {
                element = document.createElement('textarea');
                element.className = 'form-textarea field-content';
            }
            element.placeholder = field.placeholder;
            element.id = `write-field-${index}`;

            group.appendChild(element);
            dynamicFormFields.appendChild(group);
        });
    }

    function handleCategoryChange() {
        const cat = writeCategorySelect.value;
        const wasFree = state.writeMode === 'free';
        const prevBody = document.getElementById('write-field-0');
        const keep = (wasFree && prevBody) ? prevBody.value : '';

        state.currentCategory = cat;
        if (cat === 'free') state.writeMode = 'free';
        else if (state.writeMode === 'guided') state.lastGuidedCategory = cat;

        renderWriteForm();
        if (state.writeMode === 'free' && keep) document.getElementById('write-field-0').value = keep;
    }

    // 작성 방식 전환 (입력한 내용은 최대한 보존)
    writeModeBtns.forEach(btn => btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode === state.writeMode) return;
        const prev = collectFieldValues().map(v => v.trim()).filter(Boolean);
        state.writeMode = mode;

        if (mode === 'free') {
            writeCategorySelect.value = 'free';
            state.currentCategory = 'free';
        } else {
            if (writeCategorySelect.value === 'free') {
                writeCategorySelect.value = (state.lastGuidedCategory && state.lastGuidedCategory !== 'free') ? state.lastGuidedCategory : 'essay';
            }
            state.currentCategory = writeCategorySelect.value;
        }
        renderWriteForm();
        const first = document.getElementById('write-field-0');
        if (first && prev.length) first.value = prev.join('\n\n');
    }));

    writeCategorySelect.addEventListener('change', handleCategoryChange);
    populateCategorySelect();

    // Upload Post (Upgrades User to Pre-Author)
    const publishBtn = document.getElementById('publish-btn');
    publishBtn.addEventListener('click', () => {
        const titleEl = document.getElementById('write-title');
        const title = titleEl.value.trim();
        const contentFields = document.querySelectorAll('.field-content');

        if (!title) {
            showTemporaryToast(tr("에세이의 제목을 적어주세요.", "Please enter a title."), "warning");
            return;
        }

        let isAnyFieldEmpty = false;
        contentFields.forEach(field => {
            if (!field.value.trim()) isAnyFieldEmpty = true;
        });

        if (isAnyFieldEmpty) {
            showTemporaryToast(state.writeMode === 'free'
                ? tr("본문을 적어주세요.", "Please write your story.")
                : tr("성찰 가이드라인의 질문에 성실히 답변을 적어주세요.", "Please answer the guided questions."), "warning");
            return;
        }

        // Upgrade Rank to Pre-Author (예비작가)
        let rankUpgraded = false;
        if (state.userRank === 'neighbor') {
            state.userRank = 'pre-author';
            rankUpgraded = true;
        }

        // Add to state
        state.userPosts.push({
            id: Date.now(),
            title: title,
            category: state.currentCategory,
            mode: state.writeMode,
            contents: Array.from(contentFields).map(f => f.value.trim()),
            date: new Date().toISOString().split('T')[0],
            status: '매칭 대기'
        });
        if (state.resumingDraft) { state.tempDraft = null; state.resumingDraft = false; }

        state.userPoints += 200;
        triggerCoinRain();

        // UI Reset
        titleEl.value = '';
        contentFields.forEach(f => f.value = '');
        
        closeWriteOverlay();
        renderPostList();
        updateWalletUI();

        if (rankUpgraded) {
            showGeneralOkModal(
                "축하합니다! 예비작가 등업!",
                `첫 번째 소중한 에세이 등록에 성공하여 <strong>'예비작가'</strong>로 등업되셨습니다!<br>독자 조회 포인트 정산(조회수당 1p) 혜택이 즉시 활성화됩니다.`,
                "bx-award"
            );
        } else {
            showTemporaryToast("에세이가 업로드되었습니다. +200p가 지갑에 적립되었습니다.", "mint");
        }

        // Navigate to Matching screen
        setTimeout(() => {
            document.querySelector('.nav-item[data-target="screen-matching"]').click();
        }, 1300);
    });

    // ----- 임시저장 / 이어 쓰기 -----
    function resumeDraft() {
        const d = state.tempDraft;
        if (!d) return;
        state.writeMode = d.mode;
        writeCategorySelect.value = d.category;
        state.currentCategory = d.category;
        if (d.mode === 'guided') state.lastGuidedCategory = d.category;
        renderWriteForm();
        writeTitleInput.value = d.title;
        document.querySelectorAll('#dynamic-form-fields .field-content').forEach((f, i) => { f.value = d.values[i] || ''; });
        state.resumingDraft = true;
        openWriteOverlay();
    }

    document.getElementById('save-temp-btn').addEventListener('click', () => {
        const values = collectFieldValues();
        const title = writeTitleInput.value.trim();
        if (!title && !values.some(v => v.trim())) {
            showTemporaryToast(tr("저장할 내용이 아직 없습니다.", "Nothing to save yet."), "warning");
            return;
        }
        state.tempDraft = { title: title, category: writeCategorySelect.value, mode: state.writeMode, values: values };
        state.resumingDraft = true;
        renderPostList();
        showTemporaryToast(tr("임시저장되었습니다. 스튜디오 목록에서 이어 쓸 수 있어요.", "Draft saved. Continue it from the Studio list."), "mint");
    });

    // ----- 홈: 추천 토픽으로 바로 글쓰기 -----
    document.getElementById('write-now-shortcut-btn').addEventListener('click', () => {
        document.querySelector('.nav-item[data-target="screen-write"]').click();
        state.writeMode = 'guided';
        if (writeCategorySelect.value === 'free') writeCategorySelect.value = state.lastGuidedCategory || 'essay';
        handleCategoryChange();
        openWriteOverlay();
    });

    // ----- 글쓰기 성향 진단 (3문항) -----
    const surveyModal = document.getElementById('survey-modal');
    const surveyTitle = document.getElementById('survey-question-title');
    const surveyDesc = document.getElementById('survey-question-desc');
    const surveyOptions = document.getElementById('survey-options-container');

    const surveyQuestions = [
        { desc: tr('내 지난 삶을 돌이켜 보았을 때, 가장 마음에 깊게 남는 감정은 무엇인가요?', 'Looking back on your life, which emotion stays with you most deeply?'),
          options: [
            { label: tr('그리움', 'Longing'), cats: ['hometown', 'childhood', 'grandparent', 'breakup'] },
            { label: tr('사랑과 설렘', 'Love & Flutter'), cats: ['love', 'newlywed', 'parenting', 'parent_thanks'] },
            { label: tr('고마움', 'Gratitude'), cats: ['gratitude', 'parent_thanks', 'comfort', 'friend'] },
            { label: tr('도전과 성장', 'Challenge & Growth'), cats: ['turning', 'startup', 'proud', 'hope'] }
          ] },
        { desc: tr('지금 가장 쓰고 싶은 이야기는 언제의 이야기인가요?', 'Which period of your life do you most want to write about?'),
          options: [
            { label: tr('어린 시절', 'Childhood'), cats: ['childhood', 'hometown', 'student', 'grandparent'] },
            { label: tr('청춘의 한때', 'My Youth'), cats: ['love', 'exam', 'friend', 'military', 'student', 'travel', 'breakup'] },
            { label: tr('요즘의 일상', 'Everyday Life Now'), cats: ['healing', 'cafe', 'hobby', 'worker', 'exercise', 'dobong', 'parenting', 'gratitude', 'comfort'] },
            { label: tr('앞으로의 바람', 'Hopes Ahead'), cats: ['hope', 'letter_self', 'retirement', 'regret', 'turning', 'startup'] }
          ] },
        { desc: tr('어떤 방식으로 쓰는 것이 편하신가요?', 'Which writing style feels most comfortable?'),
          options: [
            { label: tr('질문에 답하듯 차근차근 (가이드 질문형)', 'Step by step, answering questions (Guided)'), mode: 'guided' },
            { label: tr('제목과 본문을 바로 자유롭게 (자유롭게 쓰기)', 'Straight to a title and free text (Free)'), mode: 'free' }
          ] }
    ];

    function renderSurveyStep() {
        const q = surveyQuestions[state.surveyStep];
        surveyTitle.textContent = tr(`글쓰기 성향 진단 (${state.surveyStep + 1}/3)`, `Writing Style Assessment (${state.surveyStep + 1}/3)`);
        surveyDesc.textContent = q.desc;
        surveyOptions.innerHTML = '';
        surveyOptions.style.flexDirection = 'column';
        q.options.forEach(opt => {
            const b = document.createElement('button');
            b.className = 'btn-secondary';
            b.textContent = opt.label;
            b.addEventListener('click', () => {
                state.surveyAnswers[state.surveyStep] = opt;
                if (state.surveyStep < surveyQuestions.length - 1) { state.surveyStep++; renderSurveyStep(); }
                else finishSurvey();
            });
            surveyOptions.appendChild(b);
        });
    }

    function openSurvey() {
        state.surveyStep = 0;
        state.surveyAnswers = [];
        renderSurveyStep();
        surveyModal.classList.add('active');
    }

    function finishSurvey() {
        surveyModal.classList.remove('active');
        const [a1, a2, a3] = state.surveyAnswers;
        const pick = a1.cats.find(k => a2.cats.includes(k)) || a1.cats[0];
        document.querySelector('.nav-item[data-target="screen-write"]').click();
        writeCategorySelect.value = pick;
        state.currentCategory = pick;
        state.lastGuidedCategory = pick;
        state.writeMode = a3.mode;
        renderWriteForm();
        openWriteOverlay();
        const info = categoriesData.find(c => c.key === pick);
        showTemporaryToast(tr(`추천 주제: ${catLabelOf(info.name)}`, `Suggested topic: ${catLabelOf(info.name)}`), 'mint');
    }

    document.getElementById('start-survey-btn').addEventListener('click', openSurvey);
    document.getElementById('close-survey-btn').addEventListener('click', () => surveyModal.classList.remove('active'));

    // Render Studio Post list
    function renderPostList() {
        myPostListGrid.innerHTML = '';

        // 임시저장 글(이어 쓰기) 카드
        if (state.tempDraft) {
            const dc = document.createElement('div');
            dc.className = 'post-item-card draft-card';
            dc.innerHTML = `
                <div class="post-item-details">
                    <h4 class="post-item-title">${esc(state.tempDraft.title || tr('(제목 없음)', '(Untitled)'))}</h4>
                    <div class="post-item-meta"><span style="color:var(--accent-warning); font-weight:600;">${tr('임시저장', 'Draft')}</span> • <span>${tr('눌러서 이어 쓰기', 'Tap to continue')}</span></div>
                </div>
                <span class="badge badge-warning" style="flex-shrink:0;">${tr('이어 쓰기', 'Resume')}</span>`;
            dc.addEventListener('click', resumeDraft);
            myPostListGrid.appendChild(dc);
        }
        state.userPosts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'post-item-card';

            const catInfo = categoriesData.find(c => c.key === post.category) || { name: '에세이' };
            const catLabel = catLabelOf(catInfo.name);

            let badgeClass = 'badge-purple';
            if (post.status === '출판 대기') badgeClass = 'badge-warning';
            if (post.status === '출판 완료') badgeClass = 'badge-mint';

            card.innerHTML = `
                <div class="post-item-details">
                    <h4 class="post-item-title">${esc(post.title)}</h4>
                    <div class="post-item-meta">
                        <span style="color:var(--primary-light); font-weight:600;">${catLabel}</span> • <span>${post.date}</span>
                    </div>
                </div>
                <span class="badge ${badgeClass}" style="flex-shrink:0;">${post.status}</span>
            `;
            myPostListGrid.appendChild(card);
        });
    }


    // --- AI Matching DOM references (누락되어 오류가 나던 부분) ---
    const matchingAuraTrigger = document.getElementById('matching-aura-trigger');
    const matchingIcon = document.getElementById('matching-icon');
    const matchingStatusLbl = document.getElementById('matching-status-lbl');
    const matchingHelperText = document.getElementById('matching-helper-text');
    const matchingResultsList = document.getElementById('matching-results-list');

    // --- 5. AI Matching: Segmented (Merge vs Split Options) ---
    const matchOptMerge = document.getElementById('match-opt-merge');
    const matchOptSplit = document.getElementById('match-opt-split');

    matchOptMerge.addEventListener('click', () => {
        matchOptMerge.classList.add('active');
        matchOptSplit.classList.remove('active');
        state.matchingOption = 'merge';
        if (state.isMatchingCompleted) renderMatchingResults();
    });

    matchOptSplit.addEventListener('click', () => {
        matchOptSplit.classList.add('active');
        matchOptMerge.classList.remove('active');
        state.matchingOption = 'split';
        if (state.isMatchingCompleted) renderMatchingResults();
    });

    // Radar Matcher Aura Trigger
    matchingAuraTrigger.addEventListener('click', () => {
        if (state.isMatchingCompleted) {
            state.isMatchingCompleted = false;
            matchingIcon.className = "bx bx-compass ai-matching-icon";
            matchingStatusLbl.textContent = "AI 매칭 시작";
            matchingHelperText.innerHTML = "원형 버튼을 터치해 보세요.";
            matchingResultsList.innerHTML = `
                <div class="glass-card" style="text-align: center; color: var(--text-muted); padding: 30px 10px;">
                    <i class="bx bx-message-square-detail" style="font-size: 32px; margin-bottom: 8px;"></i>
                    <p style="font-size: 13px;">에세이 작성 완료 후 AI 매칭을 실행하면 이곳에 공동 앤솔로지 프로젝트 펀딩이 활성화됩니다.</p>
                </div>
            `;
            return;
        }

        matchingAuraTrigger.classList.add('matching');
        matchingIcon.className = "bx bx-loader-alt ai-matching-icon bx-spin";
        matchingStatusLbl.textContent = "AI 분석 중";

        const textSequence = state.matchingOption === 'merge'
            ? ["서로 다른 세대(청년-노년) 간 공통 정서 탐색 중...", "10대의 고민과 70대의 지혜 대조 클러스터링 중...", "세대 융합형 앤솔로지 매칭 성공!"]
            : ["가입자 분류(주부/학생)에 적합한 동세대 작가 탐색 중...", "동일 연령대 관심 주제 매핑 매치 분석 중...", "세대별 맞춤 앤솔로지 매칭 성공!"];

        matchingHelperText.textContent = textSequence[0];
        setTimeout(() => matchingHelperText.textContent = textSequence[1], 1000);
        setTimeout(() => matchingHelperText.textContent = textSequence[2], 2000);

        setTimeout(() => {
            matchingAuraTrigger.classList.remove('matching');
            state.isMatchingCompleted = true;
            matchingIcon.className = "bx bx-check-double ai-matching-icon";
            matchingIcon.style.color = "var(--accent)";
            matchingStatusLbl.textContent = "매칭 완료";
            
            // Set all posts to ready for publishing status
            state.userPosts.forEach(p => {
                if (p.status === '매칭 대기') p.status = '출판 대기';
            });
            renderPostList();

            renderMatchingResults();
        }, 3000);
    });

    // Matching Results Renderer (Depends on Generation Merge/Split options)
    function renderMatchingResults() {
        let projects = [];

        if (state.matchingOption === 'merge') {
            // 세대 융합형 앤솔로지 데이터
            projects = [
                {
                    id: 'proj-merge-happy',
                    title: "우리가 가장 행복할 때: 세대간의 소풍과 대화",
                    category: "세대 공감 앤솔로지 • 4인 공동 저작",
                    desc: "10대 청소년이 말하는 소풍의 행복, 30대 직장인의 퇴근길 행복, 그리고 70대 어르신이 엮어낸 첫 아이 출산과 결혼의 행복이 한 권에 결합한 세대 연결 기획 사화집입니다.",
                    authors: [
                        { name: "유명란 이웃 (주부)", title: "오븐 속에서 구워지는 첫 소금빵" },
                        { name: "이영민 이웃 (학생)", title: "학교 앞 잔디밭 돗자리 깔고 나눈 친구와의 소풍" },
                        { name: "최은경 이웃 (직장인)", title: "금요일 지친 몸을 안고 찾아간 제주 서쪽 바다 여행" },
                        { name: "박용수 이웃 (어르신)", title: "부모님 생애 대필: 중매로 만나 첫 아이 안아보던 날" }
                    ],
                    avatars: [
                        "https://api.dicebear.com/7.x/bottts/svg?seed=user_yoomran",
                        "https://api.dicebear.com/7.x/pixel-art/svg?seed=ym",
                        "https://api.dicebear.com/7.x/pixel-art/svg?seed=ek",
                        "https://api.dicebear.com/7.x/pixel-art/svg?seed=ys"
                    ],
                    progress: 82
                },
                {
                    id: 'proj-merge-lonely',
                    title: "옆에 누군가 있어도 외로울 때 어떻게 하시나요?",
                    category: "감성 융합 앤솔로지 • 3인 공동 저작",
                    desc: "현대 사회 속 군중 속의 고독을 세대별로 조명합니다. 청년들이 말하는 독립 라이프의 쓸쓸함과, 50대 부모가 말하는 자식을 결혼시키고 난 후의 공허함을 융합한 에세이입니다.",
                    authors: [
                        { name: "유명란 이웃 (주부)", title: "나의 따뜻한 겨울 귤향기" },
                        { name: "김선우 이웃 (청년)", title: "원룸의 낯선 적막함과 내가 외로움을 달래는 방법" },
                        { name: "강영희 이웃 (어르신)", title: "부모님 생애: 질병을 만나 쓸쓸히 병상에 누워있던 시절" }
                    ],
                    avatars: [
                        "https://api.dicebear.com/7.x/bottts/svg?seed=user_yoomran",
                        "https://api.dicebear.com/7.x/pixel-art/svg?seed=sw",
                        "https://api.dicebear.com/7.x/pixel-art/svg?seed=yh"
                    ],
                    progress: 40
                }
            ];
        } else {
            // 세대별 맞춤형 앤솔로지 데이터 (가입자의 housewife 롤 기준 매칭)
            projects = [
                {
                    id: 'proj-split-baking',
                    title: "도봉구 주부 작가들의 레시피와 시집살이의 눈물",
                    category: "주부 전용 앤솔로지 • 4인 공동 저작",
                    desc: "시집살이의 갈등을 요리로 승화시켰던 주부 동지들의 사연입니다. 시부모님과의 첫 대면부터 시어머니가 끓여주던 잊지 못할 미역국 요리 레시피가 실려있습니다.",
                    authors: [
                        { name: "유명란 이웃", title: "오븐 속에서 구워지는 첫 소금빵" },
                        { name: "송희정 이웃", title: "시집 식구들과 처음 치른 전통 혼례 날의 식은땀" },
                        { name: "한순자 이웃", title: "시어머니가 끓여주시던 매콤 짭조름한 된장찌개" },
                        { name: "정은숙 이웃", title: "남편과 함께 일군 신혼 단칸방의 조그만 살림 일지" }
                    ],
                    avatars: [
                        "https://api.dicebear.com/7.x/bottts/svg?seed=user_yoomran",
                        "https://api.dicebear.com/7.x/pixel-art/svg?seed=song",
                        "https://api.dicebear.com/7.x/pixel-art/svg?seed=han",
                        "https://api.dicebear.com/7.x/pixel-art/svg?seed=jung"
                    ],
                    progress: 92
                }
            ];
        }

        matchingResultsList.innerHTML = '';
        projects.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'glass-card matching-card';
            card.innerHTML = `
                <div class="matching-card-header">
                    <span class="badge badge-purple">${proj.category}</span>
                    <div class="author-avatars-group">
                        ${proj.avatars.map(av => `<img src="${av}" class="author-avatar-img" alt="Author">`).join('')}
                    </div>
                </div>
                <h4 class="matching-card-title">${proj.title}</h4>
                <div class="matching-card-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${proj.progress}%" id="fill-${proj.id}"></div>
                    </div>
                    <span class="progress-percent" id="text-${proj.id}">${proj.progress}%</span>
                </div>
                <div class="matching-actions">
                    <span class="reward-preview" style="font-size:11px; color:var(--text-muted);"><i class="bx bxs-gift"></i> 소책자 인쇄 리워드</span>
                    <button class="btn-primary btn-inline" id="open-fund-detail-${proj.id}">
                        <i class="bx bx-show-alt"></i> 기획 보기
                    </button>
                </div>
            `;
            matchingResultsList.appendChild(card);

            document.getElementById(`open-fund-detail-${proj.id}`).addEventListener('click', () => {
                openFundingOverlay(proj);
            });
        });
    }

    // --- 6. Funding Overlay Controller (v3 Detail & Rank Upgrades) ---
    const fundingOverlay = document.getElementById('funding-detail-overlay');
    const closeFundingOverlayBtn = document.getElementById('close-funding-overlay-btn');
    const fundingDetailTitle = document.getElementById('funding-detail-title');
    const fundingDetailDesc = document.getElementById('funding-detail-desc');
    const fundingCoAuthors = document.getElementById('funding-co-authors');
    const confirmFundingActionBtn = document.getElementById('confirm-funding-action-btn');

    closeFundingOverlayBtn.addEventListener('click', () => {
        fundingOverlay.classList.remove('active');
    });

    function openFundingOverlay(project) {
        state.currentFundingProj = project;
        fundingDetailTitle.textContent = project.title;
        fundingDetailDesc.textContent = project.desc;

        fundingCoAuthors.innerHTML = '';
        project.authors.forEach(auth => {
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 0;
                font-size: 12px;
                border-bottom: 1px dashed rgba(255,255,255,0.03);
            `;
            item.innerHTML = `
                <span style="font-weight:600; color:#fff;">${auth.name}</span>
                <span style="color:var(--text-sub); font-size:11px;">"${auth.title}"</span>
            `;
            fundingCoAuthors.appendChild(item);
        });

        if (project.progress >= 100) {
            confirmFundingActionBtn.disabled = true;
            confirmFundingActionBtn.textContent = "공동 출판 완료";
            confirmFundingActionBtn.style.background = "var(--accent)";
        } else {
            confirmFundingActionBtn.disabled = false;
            confirmFundingActionBtn.textContent = "펀딩 참여 (100 포인트 차감)";
            confirmFundingActionBtn.style.background = "linear-gradient(135deg, var(--primary), var(--secondary))";
        }

        fundingOverlay.classList.add('active');
    }

    // Process Funding & Award "작가" Title (Rank Upgrade)
    confirmFundingActionBtn.addEventListener('click', () => {
        const proj = state.currentFundingProj;
        if (!proj) return;

        if (state.userPoints < 100) {
            showTemporaryToast("참여 포인트가 부족합니다.", "warning");
            return;
        }

        state.userPoints -= 100;
        state.walletFundingsCount += 1;
        updateWalletUI();

        fundingOverlay.classList.remove('active');

        const newProgress = proj.progress + 18 >= 100 ? 100 : proj.progress + 18;
        proj.progress = newProgress;
        renderMatchingResults();

        if (newProgress === 100) {
            // Upgrade Rank to Author (작가)
            state.userRank = 'author';
            updateRankUI();

            const successModal = document.getElementById('funding-success-modal');
            successModal.classList.add('active');

            state.userPosts.forEach(p => {
                if (p.status === '출판 대기') p.status = '출판 완료';
            });
            renderPostList();

            const claimDelivery = document.getElementById('claim-delivery-btn');

            const deliveryHandler = () => {
                successModal.classList.remove('active');
                claimDelivery.removeEventListener('click', deliveryHandler);
                
                showGeneralOkModal(
                    "실물 배송 신청 완료", 
                    "공동 앤솔로지 단행본 **실물 소책자 1부**가 회원 정보의 주소로 배송 신청되었습니다. (수수료 무료 리워드)",
                    "bx-truck"
                );
            };

            claimDelivery.addEventListener('click', deliveryHandler);
        } else {
            showTemporaryToast(`펀딩 성공! 달성률이 ${newProgress}%로 상승하였습니다.`, "purple");
        }
    });

    // --- 7. Local Map & Sub-actions ( 동네친구, 동호회, 마을기업) ---
    const localDetailsContainer = document.getElementById('local-details-container');
    const localRecommendations = {
        banghak: {
            title: "방학동 요리 작가 협동조합",
            badge: "마을기업 설립 제안",
            badgeClass: "badge-purple",
            desc: "도봉구 방학동 인근의 요리 레시피 앤솔로지 작가들이 힘을 합쳤습니다. 펀딩 수익금의 이익 정산판을 활용해 오프라인 공동 베이킹 카페 '마을 빵집'을 개업하는 지자체 매칭 지원 공모를 추진합니다.",
            count: "현재 4명 작가 연결 완료",
            marker: "banghak"
        },
        chang: {
            title: "창동 수험생 부모 멘토링 네트워크",
            badge: "재능기부 마을사업",
            badgeClass: "badge-mint",
            desc: "수능 다이어리 작가들의 따뜻한 정서를 지역에 환원합니다. 서울시 마을사업 예산 지원을 유치하여 저소득 계층 수험생들의 야간 자율학습 멘탈을 케어해 주는 감성 카운슬링 동호회를 출범합니다.",
            count: "총 5명 참여자 조율 중",
            marker: "chang"
        },
        ssangmun: {
            title: "쌍문동 청소년 북콘서트 연대",
            badge: "문화재생 사업 공모",
            badgeClass: "badge-warning",
            desc: "쌍문동 청소년 성장 고민 앤솔로지 작가들이 주최합니다. 쌍문동 청소년 문화의 집 다목적 홀을 무상 지원받아 이웃 주민들이 함께 모여 음악과 글을 나누는 소형 감성 콘서트를 기획합니다.",
            count: "3명 작가 매칭 준비",
            marker: "ssangmun"
        }
    };

    function updateLocalRecommendation(key) {
        const data = localRecommendations[key];
        if (!data) return;

        document.querySelectorAll('.marker-pin').forEach(pin => pin.classList.remove('active'));
        const pin = document.querySelector(`#marker-${key} .marker-pin`);
        if (pin) pin.classList.add('active');

        localDetailsContainer.innerHTML = `
            <div class="glass-card recommendation-card" style="border-left: 3px solid; border-left-color: ${key === 'banghak' ? 'var(--primary)' : key === 'chang' ? 'var(--accent)' : 'var(--accent-warning)'}">
                <div class="recommendation-header">
                    <h4 class="recommendation-title">${data.title}</h4>
                    <span class="badge ${data.badgeClass}">${data.badge}</span>
                </div>
                <p class="recommendation-desc">${data.desc}</p>
                
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted); margin-bottom: 12px;">
                    <span>인적 네트워크</span>
                    <span class="recommendation-meta-val" style="color:#fff; font-weight:600;">${data.count}</span>
                </div>

                <div class="local-action-row">
                    <button class="btn-secondary btn-inline" id="local-friend-btn">
                        <i class="bx bx-user-plus"></i> 친구 맺기
                    </button>
                    <button class="btn-primary btn-inline" id="local-join-btn">
                        <i class="bx bx-run"></i> 모임 신청
                    </button>
                </div>
            </div>
        `;

        document.getElementById('local-friend-btn').addEventListener('click', () => {
            showGeneralOkModal(
                "친구 신청 전송", 
                `해당 ${data.title}에 속한 지역 이웃 작가들에게 동네 친구 신청을 보냈습니다. 친구 수락 시 1:1 메시지 기능이 열립니다.`,
                "bx-user-plus"
            );
        });

        document.getElementById('local-join-btn').addEventListener('click', () => {
            showGeneralOkModal(
                "모임 참가 신청", 
                `[${data.title}] 지역 동호회 소그룹 참가 신청서가 전송되었습니다. 이웃 작가들의 조율을 거쳐 승인됩니다.`,
                "bx-check-circle"
            );
        });
    }

    document.getElementById('marker-banghak').addEventListener('click', () => updateLocalRecommendation('banghak'));
    document.getElementById('marker-chang').addEventListener('click', () => updateLocalRecommendation('chang'));
    document.getElementById('marker-ssangmun').addEventListener('click', () => updateLocalRecommendation('ssangmun'));

    // Init map recommendation
    updateLocalRecommendation('banghak');


    // --- 8. General Modal Helper ---
    const generalOkModal = document.getElementById('general-ok-modal');
    const generalOkIcon = document.getElementById('general-ok-icon');
    const generalOkTitle = document.getElementById('general-ok-title');
    const generalOkDesc = document.getElementById('general-ok-desc');
    const generalOkBtn = document.getElementById('general-ok-btn');

    function showGeneralOkModal(title, desc, iconClass = "bx-check-circle") {
        generalOkTitle.innerHTML = title;
        generalOkDesc.innerHTML = desc;
        generalOkIcon.innerHTML = `<i class="bx ${iconClass}"></i>`;
        generalOkModal.classList.add('active');
    }
    
    generalOkBtn.addEventListener('click', () => {
        generalOkModal.classList.remove('active');
    });


    // --- 9. Coin Rain Effect & Toast Alert ---
    function triggerCoinRain() {
        const mockup = document.querySelector('.phone-mockup');
        const numCoins = 10;
        
        for (let i = 0; i < numCoins; i++) {
            const coin = document.createElement('div');
            coin.className = 'coin-particle';
            
            const startX = 100 + Math.random() * 200;
            const startY = 200 + Math.random() * 200;
            
            coin.style.left = `${startX}px`;
            coin.style.top = `${startY}px`;
            
            const x = (Math.random() - 0.5) * 160; 
            const y = -100 - Math.random() * 80;
            const xEnd = x + (Math.random() - 0.5) * 50;

            coin.style.setProperty('--x', `${x}px`);
            coin.style.setProperty('--y', `${y}px`);
            coin.style.setProperty('--x-end', `${xEnd}px`);

            mockup.appendChild(coin);

            coin.addEventListener('animationend', () => {
                coin.remove();
            });
        }
    }

    function showTemporaryToast(message, type = 'purple') {
        const oldToast = document.querySelector('.custom-toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        
        let borderClr = 'var(--primary)';
        if (type === 'mint') borderClr = 'var(--accent)';
        else if (type === 'warning') borderClr = 'var(--accent-warning)';

        toast.style.cssText = `
            position: absolute;
            top: 75px;
            left: 16px;
            right: 16px;
            background: rgba(5, 7, 18, 0.95);
            border-left: 4px solid ${borderClr};
            border-right: 1px solid var(--glass-border);
            border-top: 1px solid var(--glass-border);
            border-bottom: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 12px 14px;
            font-size: 11px;
            font-weight: 500;
            line-height: 1.4;
            color: var(--text-main);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            z-index: 9999;
            pointer-events: none;
            backdrop-filter: blur(8px);
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.25s, transform 0.25s;
        `;
        toast.innerHTML = message;
        
        const container = document.querySelector('.phone-mockup');
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 50);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 250);
        }, 4000);
    }
});
