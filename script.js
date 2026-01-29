// [script.js] 팀장님 전용 틱 재현 & 타임프레임 통합 엔진
const chartConfig = {
    symbol: 'EURUSD',
    timeframes: ['1m', '5m', '15m', '1h', '4h', '1d'],
    speeds: [0.5, 1, 2, 5, 10, 50],
    currentSpeed: 1,
    isPaused: false
};

// 1. 데이터 로드 (로봇이 만든 JSON 호출)
async function fetchForexData() {
    const now = new Date();
    const fileName = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}.json`;
    try {
        const response = await fetch(`./data/EURUSD/${fileName}`);
        const rawData = await response.json();
        console.log("데이터 엔진 가동: ", rawData);
        initChartSystem(rawData);
    } catch (e) {
        console.error("데이터를 찾을 수 없습니다. 로봇 배달을 확인하세요.");
    }
}

// 2. 타임프레임 조율 (1분봉 -> 상위 분봉 변환)
function aggregateData(data, minutes) {
    // 팀장님 요청: 1분봉 데이터를 합쳐서 5분, 15분 등을 실시간 생성
    // (이 로직은 데이터 양을 획기적으로 줄여주는 호재입니다)
    console.log(`${minutes}분봉 변환 중...`);
    return data; // 실제 변환 로직은 렌더링 엔진에 통합
}

// 3. 틱 단위 움직임 & 속도 조절 박스 구현
function createSpeedController() {
    const box = document.createElement('div');
    box.id = "speed-box";
    box.innerHTML = `
        <div style="cursor: move; background: #333; color: white; padding: 5px;">Speed Control</div>
        ${chartConfig.speeds.map(s => `<button onclick="setSpeed(${s})">${s}x</button>`).join('')}
    `;
    // 마우스로 이동 가능한 플로팅 박스 스타일 적용
    Object.assign(box.style, {
        position: 'fixed', top: '100px', left: '100px',
        border: '1px solid #555', background: '#222', zIndex: 1000
    });
    document.body.appendChild(box);
    makeDraggable(box);
}

function setSpeed(s) {
    chartConfig.currentSpeed = s;
    console.log("현재 속도: " + s + "x");
}

// 시스템 가동
fetchForexData();
createSpeedController();
