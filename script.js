const canvas = document.getElementById('chartCanvas');
const ctx = canvas.getContext('2d');

const state = {
    rawData: [],
    viewData: [],
    currentIndex: 0,
    currentTick: 0,
    speed: 1,
    isPlaying: true,
    isLoaded: false
};

// 1. 드래그 및 속도 조절 복구 (박스 크기 변형 방지)
function initControls() {
    const speedBox = document.getElementById('speed-box');
    const dragHandle = document.querySelector('.drag-handle');
    const speedSelect = document.getElementById('speed-select');

    speedSelect.onchange = (e) => { state.speed = parseFloat(e.target.value); };

    let isDragging = false;
    let offsetX, offsetY;

    dragHandle.onmousedown = (e) => {
        isDragging = true;
        offsetX = e.clientX - speedBox.offsetLeft;
        offsetY = e.clientY - speedBox.offsetTop;
        speedBox.style.cursor = 'grabbing';
    };

    document.onmousemove = (e) => {
        if (!isDragging) return;
        speedBox.style.left = (e.clientX - offsetX) + 'px';
        speedBox.style.top = (e.clientY - offsetY) + 'px';
        speedBox.style.transform = 'none';
    };

    document.onmouseup = () => { isDragging = false; };
}

// 2. 캔들 그리기 (우측 고정 & 오토 스케일링)
function draw() {
    if (!state.isLoaded || state.rawData.length === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const candleWidth = 18;
    const spacing = 12;
    const rightMargin = 100;

    // 현재까지의 데이터 추출
    const visibleData = state.rawData.slice(0, state.currentIndex + 1);
    
    // Y축 범위 계산 (화면 밖으로 나가지 않게 조절)
    const recent = visibleData.slice(-30); 
    const highs = recent.map(d => d[2]);
    const lows = recent.map(d => d[3]);
    const yMax = Math.max(...highs) + 0.0005;
    const yMin = Math.min(...lows) - 0.0005;
    const getY = (p) => canvas.height - ((p - yMin) / (yMax - yMin)) * canvas.height;

    // 우측에서 왼쪽으로 그리기
    for (let i = 0; i < visibleData.length; i++) {
        const dIdx = visibleData.length - 1 - i;
        const [time, open, high, low, close] = visibleData[dIdx];
        const x = canvas.width - rightMargin - (i * (candleWidth + spacing));
        
        if (x < -candleWidth) break;

        const isLast = (dIdx === state.currentIndex);
        let curClose = isLast ? open + (close - open) * (state.currentTick / 60) : close;
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

// 3. 데이터 로드 및 루프
async function init() {
    try {
        const res = await fetch(`./data/EURUSD/2026-01.json`);
        state.rawData = await res.json();
        
        // 데이터가 부족할 때 자동 생성 (안전장치)
        if (state.rawData.length < 5) {
            let fake = [];
            for(let i=0; i<100; i++) fake.push([Date.now()/1000 + (i*60), 1.085, 1.086, 1.084, 1.0855]);
            state.rawData = fake;
        }
        
        state.isLoaded = true;
        resize();
        loop();
    } catch (e) { console.error("데이터 로드 실패"); }
}

function loop() {
    if (state.isPlaying && state.isLoaded) {
        state.currentTick += state.speed;
        if (state.currentTick >= 60) {
            state.currentTick = 0;
            state.currentIndex++;
            if (state.currentIndex >= state.rawData.length) state.currentIndex = 0;
        }
        draw();
    }
    requestAnimationFrame(loop);
}

function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}

window.onresize = resize;
initControls();
init();
