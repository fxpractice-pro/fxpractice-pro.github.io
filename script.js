// Oanda API 설정 (무료 GitHub Pages 환경이므로 클라이언트에 키 노출)
const OANDA_API_KEY = '3a026cce1daad9b10146f78861531012-2c1afca8dbad0e9f354e65f170af174c';
const OANDA_ACCOUNT_ID = '101-001-38007121-001'; // <<<=== 여기에 계정 ID 입력!
const instrument = 'EUR_USD'; // 통화쌍 설정 가능
const granularity = 'H1'; // 1시간봉 (3년치 데이터를 감당하기 위함)

let isPlaying = false;
let currentIndex = 0;
let speed = 500; // 초기 속도 설정 (ms)
let intervalId;
let allCandleData = [];

const statusEl = document.getElementById('status');
const indexDisplayEl = document.getElementById('index-display');
const chartArea = document.getElementById('chart-area');

// 1. 차트 생성 (Lightweight Charts API 사용)
const chart = LightweightCharts.createChart(chartArea, {
  width: chartArea.clientWidth,
  height: 500,
  layout: { textColor: '#d1d4dc', background: { type: 'solid', color: '#fff' } },
});
const candleSeries = chart.addCandlestickSeries();


// 2. Oanda API 데이터 가져오기
async function fetchAndLoadData() {
    statusEl.textContent = '상태: 데이터 로딩 중...';
    // 3년 전 날짜 계산 (Unix 타임스탬프)
    const threeYearsAgo = Math.floor(Date.now() / 1000 - (3 * 365 * 24 * 60 * 60));
    
    // CORS 문제 해결을 위해 프록시 서버 사용을 권장하지만, 일단 직접 호출
    const url = `api-fxpractice.oanda.com{instrument}/candles?price=M&granularity=${granularity}&from=${threeYearsAgo}`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${OANDA_API_KEY}` }
        });
        
        if (!response.ok) throw new Error('API 호출 실패: ' + response.statusText);
        
        const data = await response.json();
        
        allCandleData = data.candles.map(c => ({
            time: new Date(c.time).getTime() / 1000,
            open: parseFloat(c.mid.o),
            high: parseFloat(c.mid.h),
            low: parseFloat(c.mid.l),
            close: parseFloat(c.mid.c),
        }));

        statusEl.textContent = '상태: 로드 완료. 일시정지됨';
        // 초기 데이터 로드 (첫 100개 봉만 표시)
        candleSeries.setData(allCandleData.slice(0, 100));
        currentIndex = 100;

    } catch (error) {
        console.error("Oanda API 오류:", error);
        statusEl.textContent = '상태: 오류 발생! Console 확인';
    }
}

// 3. 재생/일시정지 토글
function togglePlayPause() {
    if (isPlaying) {
        clearInterval(intervalId);
        statusEl.textContent = '상태: 일시정지';
    } else {
        intervalId = setInterval(updateChart, speed);
        statusEl.textContent = `상태: 재생 중 (${(1000/speed).toFixed(1)}x)`;
    }
    isPlaying = !isPlaying;
}

// 4. 속도 변경
function changeSpeed(multiplier) {
    speed = 1000 / multiplier; 
    if (isPlaying) {
        clearInterval(intervalId);
        intervalId = setInterval(updateChart, speed);
        statusEl.textContent = `상태: 재생 중 (${multiplier}x)`;
    }
}

// 5. 다음 데이터 업데이트 (Tick by Tick 시뮬레이션)
function updateChart() {
    if (currentIndex < allCandleData.length) {
        const nextCandle = allCandleData[currentIndex];
        // 차트에 새로운 캔들 추가
        candleSeries.update(nextCandle); 
        currentIndex++;
        indexDisplayEl.textContent = currentIndex;
    } else {
        clearInterval(intervalId);
        isPlaying = false;
        statusEl.textContent = '상태: 시뮬레이션 종료';
    }
}

// 6. Rewind 기능 (단순화: 100개 봉 뒤로 돌아가기)
function rewindData() {
    currentIndex = Math.max(100, currentIndex - 100);
    candleSeries.setData(allCandleData.slice(0, currentIndex));
    chart.timeScale().fitContent(); // 차트 스케일 재조정
    indexDisplayEl.textContent = currentIndex;
    if (isPlaying) togglePlayPause(); // 재생 중이면 일시정지
    statusEl.textContent = '상태: Rewind됨. 일시정지';
}

// 7. 매매 시뮬레이션 (Trading Logics)
function placeTrade(type) {
    const currentCandle = allCandleData[currentIndex - 1];
    if (currentCandle) {
        console.log(`${type} 주문 @ ${currentCandle.close} (시간: ${new Date(currentCandle.time * 1000).toISOString()})`);
        const journalEl = document.getElementById('journal');
        journalEl.value += `\n[${type}] @ ${currentCandle.close}`;
        // 여기에 실제 가상 손익 계산 및 통계 로직 추가 필요
    }
}


// 웹사이트 로드 시 데이터 불러오기
fetchAndLoadData();

// 창 크기 변경 시 차트 크기 조정
window.addEventListener('resize', () => {
    chart.resize(chartArea.clientWidth, 500);
});
