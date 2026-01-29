// [script.js] 드래그 및 속도 조절 기능 복구 버전
const canvas = document.getElementById('chartCanvas');
const ctx = canvas.getContext('2d');

const state = {
    rawData: [],
    viewData: [],
    currentIndex: 0,
    currentTick: 0,
    speed: 1, // 기본 속도 1x
    isPlaying: true,
    timeframe: 1
};

// 1. [핵심] 플로팅 박스 드래그 및 속도 조절 이벤트
function initControls() {
    const speedBox = document.getElementById('speed-box');
    const dragHandle = document.querySelector('.drag-handle');
    const speedSelect = document.getElementById('speed-select');

    // 속도 조절 (팀장님 요청: 0.5x, 1x, 2x, 5x, 10x, 50x 반영)
    speedSelect.onchange = (e) => {
        state.speed = parseFloat(e.target.value);
        console.log(`속도 변경: ${state.speed}x`);
    };

    // 드래그 로직 (박스가 커지지 않고 이동만 하도록 고정)
    let isDragging = false;
    let offsetX, offsetY;

    dragHandle.onmousedown = (e) => {
        isDragging = true;
        offsetX = e.clientX - speedBox.offsetLeft;
        offsetY = e.clientY = speedBox.offsetTop;
        speedBox.style.cursor = 'grabbing';
    };

    document.onmousemove = (e) => {
        if (!isDragging) return;
        speedBox.style.left = (e.clientX - offsetX) + 'px';
        speedBox.style.top = (e.clientY - offsetY) + 'px';
        speedBox.style.transform = 'none'; // 초기 중앙 정렬 해제
    };

    document.onmouseup = () => {
        isDragging = false;
        speedBox.style.cursor = 'default';
    };
}

// 2. 틱 루프 (설정된 속도 state.speed에 따라 가변 작동)
function loop() {
    if (state.isPlaying && state.viewData.length > 0) {
        // 팀장님 요청: 틱 단위로 빨리감기처럼 이동
        state.currentTick += state.speed; 
        
        if (state.currentTick >= 60) {
            state.currentTick = 0;
            state.currentIndex++;
            if (state.currentIndex >= state.viewData.length) state.currentIndex = 0;
        }
        draw(); // 캔들 그리기
    }
    requestAnimationFrame(loop);
}

// 초기화 실행
initControls();
init(); // 기존 데이터 로드 함수 호출
