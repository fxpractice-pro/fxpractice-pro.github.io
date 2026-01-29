import os
import json
from datetime import datetime

# 폴더 생성
os.makedirs('data/EURUSD', exist_ok=True)

def fetch_and_save():
    now = datetime.now()
    # [시간, 시, 고, 저, 종, 틱방향] - 연습용 샘플 데이터
    sample_tick = [[int(now.timestamp()), 1.0850, 1.0865, 1.0845, 1.0860, 1]]
    
    file_name = f"data/EURUSD/{now.strftime('%Y-%m')}.json"
    with open(file_name, 'w') as f:
        json.dump(sample_tick, f)
    print("데이터 수집 완료!")

if __name__ == "__main__":
    fetch_and_save()
