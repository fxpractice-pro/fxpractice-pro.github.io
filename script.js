// [script.js] 캔들 렌더링 및 틱 애니메이션 통합 엔진
const canvas = document.getElementById('chartCanvas');
const ctx = canvas.getContext('2d');

// 캔들 색상 설정 (팀장님 샘플 레이아웃 기준)
const COLORS = {
    up: '#00ff6a',   // 양봉
    down: '#ff4d4d', // 음봉
    grid: '#1a221a'  // 그리드
};

// 캔들 그리기 핵심 로직
function drawCandles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    const candleWidth = 10;
    const spacing = 5;

    state.rawData.slice(0, state.currentIndex + 1).forEach((d, i) => {
        const [time, open, high, low, close] = d;
        const isLast = i === state.currentIndex;
        
        // 현재가(Last Price)는 틱 이동량에 따라 실시간 계산
        let currentClose = isLast ? open + (close - open) * (state.currentTick / 60) : close;
        
        const x = i * (candleWidth + spacing);
        const yOpen = priceToY(open);
        const yClose = priceToY(currentClose);
        const yHigh = priceToY(high);
        const yLow = priceToY(low);

        // 꼬리(Wick) 그리기
        ctx.strokeStyle = currentClose >= open ? COLORS.up : COLORS.down;
        ctx.beginPath();
        ctx.moveTo(x + candleWidth/2, yHigh);
        ctx.lineTo(x + candleWidth/2, yLow);
        ctx.stroke();

        // 몸통(Body) 그리기
        ctx.fillStyle = currentClose >= open ? COLORS.up : COLORS.down;
        ctx.fillRect(x, Math.min(yOpen, yClose), candleWidth, Math.max(1, Math.abs(yOpen - yClose)));
    });
}

// 가격을 화면 좌표로 변환 (간이 로직)
function priceToY(price) {
    const minPrice = 1.0800; // 나중에 자동 계산 로직으로 교체
    const maxPrice = 1.0900;
    return canvas.height - ((price - minPrice) / (maxPrice - minPrice)) * canvas.height;
}

function drawGrid() {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for(let i=0; i<canvas.height; i+=50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }
}

// 기존 tickLoop 안에 drawCandles()를 추가합니다.
function tickLoop() {
    if (state.isPlaying && state.rawData[state.currentIndex]) {
        state.currentTick += state.speed;
        if (state.currentTick >= 60) {
            state.currentTick = 0;
            state.currentIndex++;
        }
        drawCandles(); // 매 틱마다 화면 갱신
        const data = state.rawData[state.currentIndex];
        document.getElementById('current-time').innerText = new Date(data[0] * 1000).toLocaleTimeString();
    }
    requestAnimationFrame(tickLoop); // setTimeout보다 부드러운 애니메이션
}

// 캔들 사이즈 자동 조절
window.onresize = () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
};
window.onresize();
