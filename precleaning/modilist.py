import pandas as pd
import json

# CSV 파일 경로
csv_file_path = "pgteam/restaurantlistfi.csv"

# JSON 파일 저장 경로
json_file_path = "pgteam/restaurantlistfi.json"

# CSV 파일 읽기
df = pd.read_csv(csv_file_path)

# DataFrame → JSON (records 형식: 리스트 안에 각 행이 딕셔너리 형태로)
data = df.to_dict(orient='records')

# JSON 파일 저장
with open(json_file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ JSON 파일 생성 완료! 저장 위치: {json_file_path}")
