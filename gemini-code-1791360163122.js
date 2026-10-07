let map;
let markers = [];

// 1. 지도 초기화 (강남역 중심 임시 설정)
function initMap(lat = 37.4979, lng = 127.0276) {
    if (!map) {
        map = L.map('map').setView([lat, lng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lng], 14);
    }
}

// 2. 일자리 데이터 불러오기
async function fetchJobs(lat, lng) {
    const listEl = document.getElementById('jobList');
    listEl.innerHTML = '<div class="loading">일자리를 불러오는 중입니다...</div>';
    
    // 기존 마커 제거
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    try {
        // 서버에 데이터 요청 (현재 위치 기반 검색어 활용 가능)
        const response = await fetch(`/api/jobs?lat=${lat}&lng=${lng}`);
        const data = await response.json();
        
        if (data.jobs && data.jobs.length > 0) {
            listEl.innerHTML = ''; // 로딩 텍스트 제거
            
            data.jobs.forEach(job => {
                // 리스트 카드 생성
                const card = document.createElement('a');
                card.className = 'job-card';
                card.href = job.link;
                card.target = '_blank'; // 새창 열기
                card.innerHTML = `
                    <div class="card-top">
                        <span class="badge">${job.source}</span>
                        <span class="distance">📍 ${job.distance}km</span>
                    </div>
                    <div class="company">${job.company}</div>
                    <div class="title">${job.title}</div>
                    <div class="transit">🚶 도보 ${Math.floor(job.distance * 15)}분 | 🚗 차량 ${Math.floor(job.distance * 3)}분</div>
                `;
                listEl.appendChild(card);

                // 지도 마커 생성
                const marker = L.marker([job.lat, job.lng]).addTo(map)
                    .bindPopup(`<b>${job.company}</b><br>${job.title}`);
                markers.push(marker);
            });
        } else {
            listEl.innerHTML = '<div class="loading">해당 반경에 채용 정보가 없습니다.</div>';
        }
    } catch (error) {
        listEl.innerHTML = '<div class="loading">데이터를 불러오는데 실패했습니다.</div>';
    }
}

// 3. 내 위치 검색 버튼 클릭 이벤트
document.getElementById('locationBtn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            initMap(lat, lng);
            
            // 내 위치에 파란색 원 표시
            L.circle([lat, lng], { color: '#007bff', fillColor: '#007bff', fillOpacity: 0.5, radius: 100 }).addTo(map);
            
            fetchJobs(lat, lng);
        }, () => {
            alert('위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.');
            initMap();
            fetchJobs(37.4979, 127.0276); // 기본값 강남역
        });
    } else {
        alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
    }
});

// 시작 시 기본 지도 로드
initMap();
fetchJobs(37.4979, 127.0276);