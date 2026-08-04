(() => {
  'use strict';

  const beaches = {
    '광안리': [35.1532, 129.1187], '해운대': [35.1587, 129.1603],
    '송정': [35.1787, 129.1990], '다대포': [35.0480, 128.9661],
    '송도': [35.0779, 129.0214], '일광': [35.2630, 129.2021], '임랑': [35.3186, 129.2649]
  };
  const labels = {
    toilet: ['🚻', '화장실'], parking: ['🚗', '주차장'],
    trash: ['🗑️', '쓰레기통'], density: ['👥', '인구밀집도']
  };
  const mapElement = document.getElementById('mapCanvas');
  const select = document.getElementById('mapBeach');
  if (!mapElement || !select) return;

  let map = null;
  let overlays = [];
  let circles = [];
  let facility = 'toilet';
  let libraryLoaded = false;

  const selectedBeach = () => beaches[select.value] ? select.value : '광안리';
  const clearMap = () => {
    overlays.forEach((overlay) => overlay.setMap(null));
    circles.forEach((circle) => circle.setMap(null));
    overlays = [];
    circles = [];
  };
  const marker = (lat, lng, emoji, text) => {
    const content = `<div style="display:flex;align-items:center;gap:5px;white-space:nowrap;background:#fff;border:1px solid #8bdce7;border-radius:12px;padding:6px 8px;font:700 12px Pretendard,Arial;color:#17485b;box-shadow:0 3px 10px #17485b40"><span style="font-size:16px">${emoji}</span>${text}</div>`;
    const overlay = new window.kakao.maps.CustomOverlay({ position: new window.kakao.maps.LatLng(lat, lng), content, xAnchor: 0.5, yAnchor: 1.1 });
    overlay.setMap(map); overlays.push(overlay);
  };
  const draw = () => {
    if (!map || !window.kakao) return;
    const name = selectedBeach();
    const [lat, lng] = beaches[name];
    const center = new window.kakao.maps.LatLng(lat, lng);
    map.setCenter(center); clearMap();
    const [emoji, label] = labels[facility];
    if (facility === 'density') {
      [[.0007,-.0011,260,'#ef7077','혼잡'],[.0017,.0010,220,'#f5cf45','보통'],[-.0011,.0018,200,'#67d9ad','여유']].forEach(([dy, dx, radius, color, density]) => {
        const circle = new window.kakao.maps.Circle({ center: new window.kakao.maps.LatLng(lat + dy, lng + dx), radius, strokeWeight: 2, strokeColor: color, strokeOpacity: .7, fillColor: color, fillOpacity: .28 });
        circle.setMap(map); circles.push(circle);
        marker(lat + dy, lng + dx, '👥', `${name} ${density}`);
      });
      return;
    }
    const offsets = [[.0007,-.0008],[.0014,.0011],[-.0009,.0016]];
    offsets.forEach(([dy, dx], index) => marker(lat + dy, lng + dx, emoji, `${name} ${label} ${index + 1}`));
  };
  const relayout = () => { if (map) { window.setTimeout(() => { map.relayout(); draw(); }, 80); } };
  const installMap = () => {
    if (!window.kakao || !window.kakao.maps || libraryLoaded) return;
    libraryLoaded = true;
    mapElement.innerHTML = '';
    const [lat, lng] = beaches[selectedBeach()];
    map = new window.kakao.maps.Map(mapElement, { center: new window.kakao.maps.LatLng(lat, lng), level: 4 });
    map.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT);
    draw();
  };
  const requestKakao = () => {
    if (window.kakao && window.kakao.maps) { window.kakao.maps.load(installMap); return; }
    const script = document.createElement('script');
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=aadfcaec662fd9742854769149e0fe10&autoload=false';
    script.async = true;
    script.onload = () => window.kakao.maps.load(installMap);
    script.onerror = () => { mapElement.setAttribute('aria-label', '지도를 불러오지 못해 안내 지도로 표시됩니다.'); };
    document.head.appendChild(script);
  };

  document.querySelectorAll('.facility').forEach((button) => button.addEventListener('click', () => {
    facility = button.dataset.facility || 'toilet';
    document.querySelectorAll('.facility').forEach((item) => item.classList.toggle('active', item === button));
    draw();
  }));
  select.addEventListener('change', draw);
  document.querySelectorAll('[data-page="mapPage"]').forEach((button) => button.addEventListener('click', relayout));
  requestKakao();
})();
