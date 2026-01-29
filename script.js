// [script.js] 우측 고정형 캔들 이동 엔진
const canvas = document.getElementById('chartCanvas');
const ctx = canvas.getContext('2d');

const state = {
    rawData: [],
    currentIndex: 0,
    currentTick: 0,
    speed: 1,
    isPlaying: true,
};

// 1. 캔들 그리기 (우측에서 왼쪽으로 밀리는 로직)
function draw() {
    if (state.rawData.length === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const candleWidth = 20;
    const spacing = 15;
    const rightMargin = 80; // 우측 끝에서 이만큼 띄우고 시작

    // 현재 화면에 보여줄 최대 캔들 개수 계산
    const maxVisible = Math.floor((canvas.width - rightMargin) / (candleWidth + spacing));
    const startIdx = Math.max(0, state.currentIndex - maxVisible);
    const visibleData = state.rawData.slice(startIdx, state.currentIndex + 1);
    
    // 오토 스케일링 (Y축 범위 조절)
    const highs = visibleData.map(d => d[2]);
    const lows = visibleData.map(d => d[3]);
    const yMax = Math.max(...highs) + 0.0005;
    const yMin = Math.min(...lows) - 0.0005;

    const getY = (p) => canvas.height - ((p - yMin) / (yMax - yMin)) * canvas.height;

    // 역순으로 그리기 (가장 최근 것이 우측 끝에 오도록)
    visibleData.forEach((d, i) => {
        const [time, open, high, low, close] = d;
        const isLast = (startIdx + i) === state.currentIndex;
        let curClose = isLast ? open + (close - open) * (state.currentTick / 60) : close;

        // 위치 계산: 우측 끝에서부터 왼쪽으로 배치
        const x = canvas.width - rightMargin - ((visibleData.length - 1 - i) * (candleWidth + spacing));
        
        const color = curClose >= open ? '#00ff6a' : '#ff4d4d';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // 심지
        ctx.beginPath();
        ctx.moveTo(x + candleWidth/2, getY(high));
        ctx.lineTo(x + candleWidth/2, getY(low));
        ctx.stroke();

        // 몸통
        ctx.fillRect(x, Math.min(getY(open), getY(curClose)), candleWidth, Math.max(2, Math.abs(getY(open) - getY(curClose))));
        
        // 마지막 캔들에 현재가 라인 표시 (트레이딩 뷰 스타일)
        if (isLast) {
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, getY(curClose));
            ctx.lineTo(canvas.width, getY(curClose));
            ctx.stroke();
            ctx.setLineDash([]);
        }
    });
}

// 2. 루프 및 데이터 가동 (기존 로직 유지)
function loop() {
    if (state.isPlaying && state.currentIndex < state.rawData.length) {
        state.currentTick += state.speed;
        if (state.currentTick >= 60) {
            state.currentTick = 0;
            state.currentIndex++;
        }
        draw();
    }
    requestAnimationFrame(loop);
}

// 초기화 함수 실행 (기존 init 함수 사용)
init();
