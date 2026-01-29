// [script.js] 우측 고정 스크롤 & 강제 렌더링 엔진
const canvas = document.getElementById('chartCanvas');
const ctx = canvas.getContext('2d');

const state = {
    rawData: [],
    currentIndex: 0,
    currentTick: 0,
    speed: 1,
    isPlaying: true,
    isLoaded: false
};

// 1. 초기 데이터 로드 (에러 방지 강화)
async function init() {
    try {
        console.log("데이터 로드 시도 중...");
        const res = await fetch(`./data/EURUSD/2026-01.json`);
        const data = await res.json();
        
        // 데이터가 1개뿐일 경우를 대비해 샘플 50개 생성 (테스트용)
        if (data.length < 10) {
            let fakeData = [];
            let lastClose = data[0] ? data[0][4] : 1.0850;
            for (let i = 0; i < 50; i++) {
                let open = lastClose;
                let close = open + (Math.random() - 0.5) * 0.001;
                fakeData.push([Date.now()/1000 + (i*60), open, Math.max(open, close)+0.0002, Math.min(open, close)-0.0002, close]);
                lastClose = close;
            }
            state.rawData = fakeData;
        } else {
            state.rawData = data;
        }
        
        state.isLoaded = true;
        console.log("데이터 로드 완료: ", state.rawData.length, "개");
        resizeCanvas();
        requestAnimationFrame(loop);
    } catch (e) {
        console.error("데이터 로드 실패:", e);
    }
}

// 2. 캔버스 크기 강제 설정
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    console.log("캔버스 크기 설정:", canvas.width, "x", canvas.height);
}

// 3. 우측 고정 캔들 그리기 로직
function draw() {
    if (!state.isLoaded || state.rawData.length === 0) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const candleWidth = 15;
    const spacing = 10;
    const rightMargin = 100;

    // 현재 인덱스까지의 데이터만 추출
    const visibleData = state.rawData.slice(0, state.currentIndex + 1);
    
    // Y축 스케일링 (화면에 보이는 것들만 기준)
    const recentData = visibleData.slice(-20); // 최근 20개 기준
    const highs = recentData.map(d => d[2]);
    const lows = recentData.map(d => d[3]);
    const yMax = Math.max(...highs) + 0.0005;
    const yMin = Math.min(...lows) - 0.0005;
    const getY = (p) => canvas.height - ((p - yMin) / (yMax - yMin)) * canvas.height;

    // 우측에서 왼쪽으로 그리기
    for (let i = 0; i < visibleData.length; i++) {
        const dataIdx = visibleData.length - 1 - i;
        const [time, open, high, low, close] = visibleData[dataIdx];
        const isLast = (dataIdx === state.currentIndex);
        
        let curClose = isLast ? open + (close - open) * (state.currentTick / 60) : close;
        
        // X좌표: 우측 끝(rightMargin)에서 왼쪽으로 밀어내기
        const x = canvas.width - rightMargin - (i * (candleWidth + spacing));
        
        if (x < -candleWidth) break; // 화면 왼쪽으로 벗어나면 그만 그리기

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
    }
}

function loop() {
    if (state.isPlaying && state.isLoaded) {
        state.currentTick += state.speed;
        if (state.currentTick >= 60) {
            state.currentTick = 0;
            state.currentIndex++;
            if (state.currentIndex >= state.rawData.length) state.currentIndex = 0; // 무한 반복
        }
        draw();
    }
    requestAnimationFrame(loop);
}

window.addEventListener('resize', resizeCanvas);
init();
