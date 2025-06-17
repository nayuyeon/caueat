// 카테고리별 아이콘 설정
const categoryIcons = {
  '한식': '🍚',
  '양식': '🍝',
  '일식': '🍣',
  '중식': '🥟',
  '분식': '🍜',
  '아시안': '🥢',
  '멕시칸': '🌮',
  '카페/베이커리': '☕'
};

let originalData = []; // 전체 데이터 원본 저장용

// JSON 파일에서 음식점 데이터 불러오기
fetch('restaurantlistfi_updated.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return response.json();
  })
  .then(data => {
    console.log('데이터 불러오기 성공:', data[0]);
    originalData = data;
    renderRestaurantList(originalData); // 리스트 렌더링 실행
  })
  .catch(err => console.error('JSON 불러오기 실패:', err));

// 음식점 리스트 화면에 렌더링하는 함수
function renderRestaurantList(data) {
  const listEl = document.getElementById('restaurant-list');
  const selectedListEl = document.getElementById('selected-list');
  listEl.innerHTML = ''; // 리스트 초기화

  data.forEach(restaurant => {
    const li = document.createElement('li');
    li.className = 'restaurant-item';

    const icon = categoryIcons[restaurant.category] || '🍴'; // 카테고리 아이콘 설정
    li.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <div style="font-size: 24px; width: 30px; text-align: center;" title="${restaurant.category}">
          ${icon}
        </div>
        <div style="flex: 1;">
          <strong>${restaurant.상호명}</strong><br>
          <small>${restaurant.주소}</small><br>
          <span class="favorite" style="cursor:pointer;">❤️ ${restaurant.favorites}</span>
          <span class="rating" style="cursor:pointer;">
            ${'⭐'.repeat(restaurant.rating)}${'☆'.repeat(5 - restaurant.rating)}
          </span>
        </div>
        <button class="add-button">+</button>
      </div>
    `;

    // 선택 여부 및 좋아요 클릭 여부 추적
    let isSelected = false;
    let favClicked = false;

    const button = li.querySelector('.add-button');
    const favEl = li.querySelector('.favorite');
    const ratingEl = li.querySelector('.rating');

    // 좋아요 클릭 시 증가 (한 번만 가능)
    favEl.addEventListener('click', () => {
      if (!favClicked) {
        restaurant.favorites += 1;
        favClicked = true;
        favEl.textContent = `❤️ ${restaurant.favorites}`;
      }
    });

    // 별점 클릭 시 사용자 입력 받기
    ratingEl.addEventListener('click', () => {
      const userRating = prompt("별점을 1~5 사이로 입력하세요:");
      const parsed = parseInt(userRating);

      if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
        restaurant.rating = parsed;
        ratingEl.textContent = `${'⭐'.repeat(parsed)}${'☆'.repeat(5 - parsed)}`;
      } else {
        alert("1~5 사이 숫자를 입력해주세요.");
      }
    });

    // 추가/제거 버튼 클릭 시 선택 목록에 반영
    button.addEventListener('click', () => {
      const itemText = `${restaurant.상호명} (${restaurant.category}) [${restaurant.location || restaurant.장소}]`;

      if (!isSelected) {
        // 선택 항목 추가
        const selectedLi = document.createElement('li');
        selectedLi.className = 'selected-item';
        selectedLi.innerHTML = `
          <span>${itemText}</span>
          <button class="remove-button">X</button>
        `;
        selectedLi.setAttribute('data-name', restaurant.상호명);
        selectedListEl.appendChild(selectedLi);

        // 제거 버튼 이벤트 등록
        selectedLi.querySelector('.remove-button').addEventListener('click', () => {
          selectedLi.remove();
          isSelected = false;
          button.textContent = '+';
          updateRouletteCandidates(); // 룰렛 업데이트
        });

        isSelected = true;
        button.textContent = '-';
        updateRouletteCandidates(); // 룰렛 업데이트
      } else {
        // 이미 선택된 경우 제거
        const existingItems = selectedListEl.querySelectorAll('li');
        existingItems.forEach(item => {
          if (item.getAttribute('data-name') === restaurant.상호명) {
            item.remove();
          }
        });

        isSelected = false;
        button.textContent = '+';
        updateRouletteCandidates(); // 룰렛 업데이트
      }
    });

    listEl.appendChild(li); // 리스트에 추가
  });
}

// 캔버스 및 컨텍스트 준비
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

const spinButton = document.getElementById('spin-button');
const navigateButton = document.getElementById('navigate-button');
const rouletteResultEl = document.getElementById('roulette-result');

let rouletteOptions = []; // 룰렛에 들어갈 음식점 이름 목록
let angleOffset = 0; // 현재 회전 각도
let currentRouletteResultName = ''; // 룰렛 결과 이름
let currentRouletteResultPlaceUrl = ''; // 결과 음식점의 URL

// 룰렛 그리기 함수
function drawRoulette(options) {
  rouletteOptions = options;

  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (options.length === 0) {
    // 비어 있을 경우 기본 메시지 표시
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#cccccc35';
    ctx.fill();
    
    ctx.fillStyle = '#999';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('음식점을 추가해주세요', radius, radius);
  } else {
    // 룰렛 그리기
    const numOptions = options.length;
    const anglePerSlice = (2 * Math.PI) / numOptions;

    options.forEach((option, i) => {
      const startAngle = i * anglePerSlice + angleOffset;
      const endAngle = startAngle + anglePerSlice;

      ctx.fillStyle = `hsl(${(i * 360) / numOptions}, 80%, 70%)`;
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(startAngle + anglePerSlice / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#333';
      ctx.font = '14px sans-serif';
      ctx.fillText(option, radius - 10, 5);
      ctx.restore();
    });
  }
}

// 선택된 항목을 기준으로 룰렛 다시 그리기
function updateRouletteCandidates() {
  const selectedItems = document.querySelectorAll('#selected-list li');
  const options = Array.from(selectedItems).map(item => item.getAttribute('data-name'));

  drawRoulette(options);
  rouletteResultEl.textContent = '';
  currentRouletteResultName = '';
  currentRouletteResultPlaceUrl = '';
}

// 룰렛 돌리기 버튼
spinButton.addEventListener('click', () => {
  if (rouletteOptions.length === 0) {
    alert('먹고 싶은 것을 먼저 추가하세요!');
    return;
  }

  const spins = 5 + Math.random() * 2; // 5~7바퀴 랜덤
  const duration = 3000; // 회전 시간
  const start = performance.now();

  const anglePerSlice = (2 * Math.PI) / rouletteOptions.length;

  const finalAngle = 2 * Math.PI * spins;

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    angleOffset = finalAngle * easeOutCubic(progress);
    drawRoulette(rouletteOptions);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // 결과 계산
      const normalizedAngle = angleOffset % (2 * Math.PI);
      const indexAtTop = Math.floor(((1.5 * Math.PI - normalizedAngle + 2 * Math.PI) % (2 * Math.PI)) / anglePerSlice);
      const resultName = rouletteOptions[indexAtTop];
      rouletteResultEl.textContent = `🍕 ${resultName} 🍕`;
      currentRouletteResultName = resultName;

      // URL 설정
      const matched = originalData.find(r => r.상호명 === resultName);
      currentRouletteResultPlaceUrl = matched ? matched.place_url : '';

      navigateButton.style.display = 'inline-block';
    }
  }

  requestAnimationFrame(animate);
});

// 감속 효과를 위한 easing 함수
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// 길찾기 버튼 클릭 시 해당 URL로 이동
navigateButton.addEventListener('click', () => {
  if (!currentRouletteResultPlaceUrl) {
    alert('먼저 스핀 버튼을 눌러주세요!');
    return;
  }
  window.open(currentRouletteResultPlaceUrl, '_blank');
});

// 필터 적용 함수 (카테고리 & 위치 & 검색어 기반)
function applyFilters() {
  const categoryChecked = document.querySelectorAll('#category-dropdown .dropdown-menu input[type="checkbox"]:checked');
  const areaChecked = document.querySelectorAll('#area-dropdown .dropdown-menu input[type="checkbox"]:checked');

  const selectedCategories = Array.from(categoryChecked).map(cb => cb.value);
  const selectedAreas = Array.from(areaChecked).map(cb => cb.value);

  // 선택된 필터 태그 화면에 표시
  const selectedFiltersEl = document.getElementById('selected-filters');
  selectedFiltersEl.innerHTML = '';

  selectedCategories.forEach(cat => {
    const tag = document.createElement('span');
    tag.style.margin = '0 5px';
    tag.style.padding = '3px 6px';
    tag.style.border = '1px solid #333';
    tag.style.borderRadius = '4px';
    tag.textContent = cat;
    selectedFiltersEl.appendChild(tag);
  });

  selectedAreas.forEach(area => {
    const tag = document.createElement('span');
    tag.style.margin = '0 5px';
    tag.style.padding = '3px 6px';
    tag.style.border = '1px solid #333';
    tag.style.borderRadius = '4px';
    tag.textContent = area;
    selectedFiltersEl.appendChild(tag);
  });

  // 실제 필터링 로직
  const filteredData = originalData.filter(restaurant => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(restaurant.category);
    const matchesArea = selectedAreas.length === 0 || selectedAreas.includes(restaurant.location || restaurant.장소);
    const searchKeyword = document.getElementById('search-input').value.trim();
    const matchesSearch = restaurant.상호명.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesCategory && matchesArea && matchesSearch;
  });

  renderRestaurantList(filteredData);
}

// 필터 체크박스 변경 시 필터 적용
document.querySelectorAll('#category-dropdown .dropdown-menu input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', applyFilters);
});
document.querySelectorAll('#area-dropdown .dropdown-menu input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', applyFilters);
});

// 드롭다운 토글 기능
document.querySelector('#category-dropdown .dropdown-toggle').addEventListener('click', () => {
  const menu = document.querySelector('#category-dropdown .dropdown-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
});
document.querySelector('#area-dropdown .dropdown-toggle').addEventListener('click', () => {
  const menu = document.querySelector('#area-dropdown .dropdown-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
});

// 찜한 식당만 보기 기능
const showFavoritesButton = document.getElementById('show-favorites');
let showingFavoritesOnly = false;

showFavoritesButton.addEventListener('click', () => {
  if (!showingFavoritesOnly) {
    const favoriteData = originalData.filter(r => r.favorites > 0);
    renderRestaurantList(favoriteData);
    showFavoritesButton.textContent = '🔁 전체 식당 보기';
    showingFavoritesOnly = true;
  } else {
    renderRestaurantList(originalData);
    showFavoritesButton.textContent = '❤️ 찜한 식당만 보기';
    showingFavoritesOnly = false;
  }
});

// 별점 정렬 기능
const sortByRatingButton = document.getElementById('sort-by-rating');
let isSortedByRating = false;

sortByRatingButton.addEventListener('click', () => {
  let sortedData;

  if (!isSortedByRating) {
    sortedData = [...originalData].sort((a, b) => b.rating - a.rating);
    sortByRatingButton.textContent = '🔁 원래 순서대로';
    isSortedByRating = true;
  } else {
    sortedData = [...originalData];
    sortByRatingButton.textContent = '⭐ 별점 높은 순';
    isSortedByRating = false;
  }

  renderRestaurantList(sortedData);
});

// 검색 입력 시 자동 필터 적용
document.getElementById('search-input').addEventListener('input', applyFilters);

// 초기 빈 룰렛 그리기
drawRoulette([]);
