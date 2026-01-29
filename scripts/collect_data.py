import os
import json
from datetime import datetime

# 데이터가 저장될 폴더 생성
os.makedirs('data/EURUSD', exist_ok=True)

def fetch_and_save():
    print("데이터 수집 및 가공 시작...")
    now = datetime.now()
    
    # [시간, 시, 고, 저, 종, 틱방향] - 1만 명 동시 접속용 최적화 포맷
    # 우선 시스템 작동 확인을 위한 샘플 데이터를 생성합니다.
    sample_tick = [
        [int(now.timestamp()), 1.0850, 1.0865, 1.0845, 1.0860, 1]
    ]
    
    # 파일명: 2024-01.json 형식으로 저장
    file_name = f"data/EURUSD/{now.strftime('%Y-%m')}.json"
    
    with open(file_name, 'w') as f:
        json.dump(sample_tick, f)
    
    print(f"성공! 로봇이 데이터를 {file_name}에 저장했습니다.")

if __name__ == "__main__":
    fetch_and_save()
