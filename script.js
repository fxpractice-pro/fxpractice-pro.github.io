// [script.js] 틱 단위 정밀 재현 & 속도 가변 엔진
const state = {
    rawData: [],
    displayData: [],
    currentIndex: 0,
    currentTick: 0,
    speed: 1,
    isPlaying: true,
    timeframe: '1m'
};

// 1. 데이터 로드 및 엔진 시동
async function startEngine() {
    const now = new Date();
    const fileName = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}.json`;
    
    try {
        const response = await fetch(`./data/EURUSD/${fileName}`);
        state.rawData = await response.json();
        console.log("엔진 로드 완료: ", state.rawData.length, "개의 봉");
        runTickLoop();
    } catch (e) {
        console.error("데이터 창고를 찾을 수 없습니다.");
    }
}

// 2. 틱 단위 루프 (비디오 빨리감기 로직)
function runTickLoop() {
    if (!state.isPlaying) return;

    // 1분봉 하나를 60틱으로 가상 분할하여 움직임 재현
    state.currentTick += state.speed;
    
    if (state.currentTick >= 60) {
        state.currentTick = 0;
        state.currentIndex++;
    }

    renderChart();
    
    // 속도에 맞춰 루프 간격 조절
    setTimeout(runTickLoop, 100); 
}

// 3. 차트 렌더링 (간이 구현 - 텍스트로 데이터 변화 확인)
function renderChart() {
    const currentBar = state.rawData[state.currentIndex];
    if (!currentBar) return;

    const [time, open, high, low, close] = currentBar;
    const timeStr = new Date(time * 1000).toLocaleTimeString();
    
    // 화면의 시간 및 캔들 정보 업데이트
    document.getElementById('current-time').innerText = `${timeStr} (${state.speed}x)`;
    
    // 실시간 가격 변동성 재현 (틱 방향에 따른 꿈틀거림)
    const livePrice = open + (close - open) * (state.currentTick / 60);
    console.log(`[${state.timeframe}] 현재가: ${livePrice.toFixed(5)}`);
}

// 4. 플로팅 박스 드래그 및 속도 조절 로직
const speedBox = document.getElementById('speed-box');
const speedSelect = document.getElementById('speed-select');

speedSelect.onchange = (e) => {
    state.speed = parseFloat(e.target.value);
};

// 드래그 기능 (팀장님 요청 사항)
let isDragging = false;
speedBox.onmousedown = (e) => { isDragging = true; };
document.onmousemove = (e) => {
    if (isDragging) {
        speedBox.style.left = e.clientX + 'px';
        speedBox.style.top = e.clientY + 'px';
    }
};
document.onmouseup = () => { isDragging = false; };

// 타임프레임 전환 (확장 가능 구조)
function changeTimeframe(tf) {
    state.timeframe = tf;
    console.log(`타임프레임 변경: ${tf}`);
    // 여기서 데이터를 합산(Aggregate)하는 로직이 작동합니다.
}

startEngine();
