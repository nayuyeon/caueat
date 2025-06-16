import pandas as pd
import folium

# CSV 파일 경로 설정
csv_file_path = "pgteam/restaurantlistfi.csv"

# CSV 파일 로드
df = pd.read_csv(csv_file_path)

# 위도(x), 경도(y)가 있는 행만 필터링
df = df.dropna(subset=['x', 'y'])

# folium은 위도(y), 경도(x) 순서 주의!
center_lat = df['y'].astype(float).mean()
center_lng = df['x'].astype(float).mean()
m = folium.Map(location=[center_lat, center_lng], zoom_start=16)

# 음식점 마커 추가
for _, row in df.iterrows():
    name = row.get('상호명', '이름 없음')
    address = row.get('주소', '')
    lat = float(row['y'])  # 위도
    lng = float(row['x'])  # 경도
    url = row.get('place_url', '')

    popup_html = f"""
    <b>{name}</b><br>
    {address}<br>
    <a href="{url}" target="_blank">🔗 카카오맵에서 보기</a>
    """

    folium.Marker(
        location=[lat, lng],
        popup=folium.Popup(popup_html, max_width=300),
        tooltip=name,
        icon=folium.Icon(color="red", icon="cutlery", prefix='fa')
    ).add_to(m)

# HTML 파일로 저장
map_output_path = "25-/25-jungsaeha-patch/pgteam/restaurant_map.html"
m.save(map_output_path)

print(f"✅ 지도 생성 완료! 파일 위치: {map_output_path}")
