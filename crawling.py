import requests
import csv
import json
import time

# [당신의 Kakao REST API 키를 여기에 입력하세요]
KAKAO_API_KEY = "KakaoAK 2916fc05820ef95c488c58c62b896219"  # 반드시 KakaoAK 포함

SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"
HEADERS = {"Authorization": KAKAO_API_KEY}

INPUT_CSV_PATH = "pgteam/restaurantlist.csv"
OUTPUT_JSON_PATH = "pgteam/results.json"
OUTPUT_CSV_PATH = "pgteam/results.csv"

results = []

with open(INPUT_CSV_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        name = row["상호명"]
        query = f"{name} 동작구"  # <- 위치 기반 키워드 (흑석동 또는 동작구 추천)
        params = {"query": query}

        print(f"🔍 검색 중: {query}")
        try:
            res = requests.get(SEARCH_URL, headers=HEADERS, params=params)
            res.raise_for_status()
            documents = res.json().get("documents", [])

            if documents:
                top_result = documents[0]
                print(f"✅ {name} → {top_result['place_name']}")
                results.append({
                    "id": row["id"],
                    "상호명": name,
                    "검색어": query,
                    "주소": top_result.get("road_address_name", ""),
                    "x": top_result.get("x", ""),
                    "y": top_result.get("y", ""),
                    "place_url": top_result.get("place_url", ""),
                    "category": top_result.get("category_name", "")
                })
            else:
                print(f"❌ {name} → 결과 없음")
        except Exception as e:
            print(f"❌ {name} → 오류 발생: {e}")
        
        time.sleep(0.2)  # 카카오 API 요청 간 딜레이 (Rate Limit 방지)

# JSON 저장
with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as jf:
    json.dump(results, jf, ensure_ascii=False, indent=2)

# CSV 저장
with open(OUTPUT_CSV_PATH, 'w', newline='', encoding='utf-8') as cf:
    fieldnames = ["id", "상호명", "검색어", "주소", "x", "y", "place_url", "category"]
    writer = csv.DictWriter(cf, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(results)

print("✅ 검색 완료 및 결과 저장 완료")
