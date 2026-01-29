// [script.js] 오토 스케일링 기능이 탑재된 캔들 엔진
const canvas = document.getElementById('chartCanvas');
const ctx = canvas.getContext('2d');

const state = {
    rawData: [],
    currentIndex: 0,
    currentTick: 0,
    speed: 1,
    isPlaying: true,
    yMin: 0,
    yMax: 0
};

// 1. 가격을 화면 Y좌표로 변환 (자동 범위 조절)
function updateYRange(visibleData) {
    const highs = visibleData.map(d => d[2]);
    const lows = visibleData.map(d => d[3]);
    state.yMax = Math.max(...highs) + 0.0005; // 여유 공간 추가
    state.yMin = Math.min(...lows) - 0.0005;
}

function priceToY(price) {
    return canvas.height - ((price - state.yMin) / (state.yMax - state.yMin)) * canvas.height;
}

// 2. 캔들 그리기 핵심
function drawCandles() {
    if (state.rawData.length === 0) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 현재 화면에 보일 데이터 추출 및 범위 업데이트
    const visibleData = state.rawData.slice(0, state.currentIndex + 1);
    updateYRange(visibleData);

    const candleWidth = 12;
    const spacing = 6;

    visibleData.forEach((d, i) => {
        const [time, open, high, low, close] = d;
        const isLast = i === state.currentIndex;
        let currentClose = isLast ? open + (close - open) * (state.currentTick / 60) : close;

        const x = i * (candleWidth + spacing) + 20; // 왼쪽 여백
        const yOpen = priceToY(open);
        const yClose = priceToY(currentClose);
        const yHigh = priceToY(high);
        const yLow = priceToY(low);

        const color = currentClose >= open ? '#00ff6a' : '#ff4d4d';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // 심지
        ctx.beginPath();
        ctx.moveTo(x + candleWidth/2, yHigh);
        ctx.lineTo(x + candleWidth/2, yLow);
        ctx.stroke();

        // 몸통
        ctx.fillRect(x, Math.min(yOpen, yClose), candleWidth, Math.max(1, Math.abs(yOpen - yClose)));
    });
}

// 3. 엔진 가동 및 루프
async function initEngine() {
    try {
        const response = await fetch(`./data/EURUSD/2026-01.json`); 
        state.rawData = await response.json();
        console.log("데이터 확인:", state.rawData); // 여기서 데이터가 나오는지 F12로 확인 필수!
        requestAnimationFrame(tickLoop);
    } catch (e) {
        console.error("파일 로드 실패. data 폴더 안의 파일명을 확인하세요.");
    }
}

function tickLoop() {
    if (state.isPlaying && state.rawData[state.currentIndex]) {
        state.currentTick += state.speed;
        if (state.currentTick >= 60) {
            state.currentTick = 0;
            state.currentIndex++;
        }
        drawCandles();
        
        const data = state.rawData[state.currentIndex];
        const timeStr = new Date(data[0] * 1000).toLocaleTimeString();
        document.getElementById('current-time').innerText = `${timeStr} (${state.speed}x)`;
    }
    requestAnimationFrame(tickLoop);
}

// 캔들 사이즈 초기화
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;
initEngine();
