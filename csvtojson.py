import pandas as pd
import json

# CSV 파일을 UTF-8로 읽기
df = pd.read_csv("25-/25-jungsaeha-patch/pgteam/restaurantlistfi.csv", encoding="utf-8")

# favorites와 rating 기본값 추가
df['favorites'] = 0
df['rating'] = 0

# 딕셔너리로 변환
data = df.to_dict(orient='records')

# JSON 파일을 UTF-8로 저장
with open("25-/25-jungsaeha-patch/pgteam/restaurantlistfi_updated.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
