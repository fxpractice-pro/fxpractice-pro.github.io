// [script.js] 틱 재생 및 정밀 드래그 엔진
const state = {
    rawData: [],
    currentIndex: 0,
    currentTick: 0,
    speed: 1,
    isPlaying: true,
};

// 1. 드래그 기능 구현 (박스 크기 조절 방지)
const speedBox = document.getElementById('speed-box');
const dragHandle = document.querySelector('.drag-handle');

let isDragging = false;
let offsetX, offsetY;

dragHandle.onmousedown = (e) => {
    isDragging = true;
    // 클릭한 지점과 박스 왼쪽/위 사이의 거리 계산
    offsetX = e.clientX - speedBox.offsetLeft;
    offsetY = e.clientY - speedBox.offsetTop;
    speedBox.style.cursor = 'grabbing';
};

document.onmousemove = (e) => {
    if (!isDragging) return;
    
    // 박스 위치 업데이트 (화면 밖으로 나가지 않게 조절 가능)
    speedBox.style.left = (e.clientX - offsetX) + 'px';
    speedBox.style.top = (e.clientY - offsetY) + 'px';
    speedBox.style.transform = 'none'; // 초기 중앙 정렬 해제
};

document.onmouseup = () => {
    isDragging = false;
    speedBox.style.cursor = 'default';
};

// 2. 틱 재생 로직 (속도 조절 반영)
const speedSelect = document.getElementById('speed-select');
speedSelect.onchange = (e) => {
    state.speed = parseFloat(e.target.value);
};

async function initEngine() {
    const response = await fetch(`./data/EURUSD/2026-01.json`); // 로봇이 만든 파일
    state.rawData = await response.json();
    tickLoop();
}

function tickLoop() {
    if (state.isPlaying && state.rawData[state.currentIndex]) {
        state.currentTick += state.speed;
        
        if (state.currentTick >= 60) {
            state.currentTick = 0;
            state.currentIndex++;
        }
        
        // 시간 및 가격 표시 업데이트
        const data = state.rawData[state.currentIndex];
        document.getElementById('current-time').innerText = new Date(data[0] * 1000).toLocaleTimeString();
    }
    setTimeout(tickLoop, 100);
}

initEngine();
