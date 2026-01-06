// Oanda API 설정
const OANDA_API_KEY = '3a026cce1daad9b10146f78861531012-2c1afca8dbad0e9f354e65f170af174c';
const OANDA_ACCOUNT_ID = '101-001-38007121-001'; // 계정 ID 확인 완료
const instrument = 'EUR_USD'; 
const granularity = 'H1'; 

let isPlaying = false;
let currentIndex = 0;
let speed = 500; 
let intervalId;
let allCandleData = [];

const statusEl = document.getElementById('status');
const indexDisplayEl = document.getElementById('index-display');
const chartArea = document.getElementById('chart-area');

// 1. 차트 생성 (Lightweight Charts API 사용)
const chart = LightweightCharts.create(chartArea, {
  width: chartArea.clientWidth,
  height: 500,
  layout: { textColor: '#d1d4dc', background: { type: 'solid', color: '#fff' } },
});
const candleSeries = chart.addCandlestickSeries();


// 2. Oanda API 데이터 가져오기 (대체 프록시 서버 경유)
async function fetchAndLoadData() {
    statusEl.textContent = '상태: 데이터 로딩 중...';
    const threeYearsAgo = Math.floor(Date.now() / 1000 - (3 * 365 * 24 * 60 * 60));
    
    const url = `api-fxpractice.oanda.com{instrument}/candles?price=M&granularity=${granularity}&from=${threeYearsAgo}`;
    
    // !!! 대체 무료 프록시 서버(api.allorigins.win) 사용 !!!
    const proxyUrl = `api.allorigins.win{encodeURIComponent(url)}`;

    try {
        const response = await fetch(proxyUrl, {
            headers: { 
                'Authorization': `Bearer ${OANDA_API_KEY}`,
            }
        });
        
        if (!response.ok) throw new Error('Proxy server error or API call failed: ' + response.statusText);
        
        const proxyData = await response.json();
        // allorigins.win은 결과값을 JSON 문자열로 감싸서 주기 때문에 파싱이 한 번 더 필요
        const data = JSON.parse(proxyData.contents); 

        allCandleData = data.candles.map(c => ({
            time: new Date(c.time).getTime() / 1000,
            open: parseFloat(c.mid.o),
            high: parseFloat(c.mid.h),
            low: parseFloat(c.mid.l),
            close: parseFloat(c.mid.c),
        }));

        statusEl.textContent = '상태: 로드 완료. 일시정지됨';
        candleSeries.setData(allCandleData.slice(0, 100));
        currentIndex = 100;

    } catch (error) {
        console.error("Oanda API 오류:", error);
        statusEl.textContent = '상태: 오류 발생! 콘솔 확인';
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
        candleSeries.update(nextCandle); 
        currentIndex++;
        indexDisplayEl.textContent = currentIndex;
    } else {
        clearInterval(intervalId);
        isPlaying = false;
        statusEl.textContent = '상태: 시뮬레이션 종료';
    }
}

// 6. Rewind 기능 (단순화)
function rewindData() {
    currentIndex = Math.max(100, currentIndex - 100);
    candleSeries.setData(allCandleData.slice(0, currentIndex));
    chart.timeScale().fitContent(); 
    indexDisplayEl.textContent = currentIndex;
    if (isPlaying) togglePlayPause(); 
    statusEl.textContent = '상태: Rewind됨. 일시정지';
}

// 7. 매매 시뮬레이션 (Trading Logics)
function placeTrade(type) {
    const currentCandle = allCandleData[currentIndex - 1];
    if (currentCandle) {
        console.log(`${type} 주문 @ ${currentCandle.close}`);
        const journalEl = document.getElementById('journal');
        journalEl.value += `\n[${type}] @ ${currentCandle.close}`;
    }
}

fetchAndLoadData();

window.addEventListener('resize', () => {
    chart.resize(chartArea.clientWidth, 500);
});
