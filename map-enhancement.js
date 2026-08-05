(() => {
  'use strict';

  // Keep this file ASCII-safe: GitHub Pages will serve the same map data in every browser.
  const beaches = {
    '\uad11\uc548\ub9ac': [35.1532, 129.1187],
    '\ud574\uc6b4\ub300': [35.1587, 129.1603],
    '\uc1a1\uc815': [35.1787, 129.1990],
    '\ub2e4\ub300\ud3ec': [35.0480, 128.9661],
    '\uc1a1\ub3c4': [35.0779, 129.0214],
    // 일광해수욕장: 부산광역시 기장군 일광면 삼성3길 17
    '\uc77c\uad11': [35.2638, 129.2334],
    '\uc784\ub791': [35.3186, 129.2649]
  };
  const labels = {
    toilet: ['\u{1F6BB}', '\ud654\uc7a5\uc2e4'],
    parking: ['\u{1F697}', '\uc8fc\ucc28\uc7a5'],
    trash: ['\u{1F5D1}', '\uc4f0\ub808\uae30\ud1b5'],
    density: ['\u{1F465}', '\uc778\uad6c \ubc00\uc9d1\ub3c4']
  };
  const mapElement = document.getElementById('mapCanvas');
  const select = document.getElementById('mapBeach');
  if (!mapElement || !select) return;

  let map = null;
  let overlays = [];
  let circles = [];
  let facility = 'toilet';
  let libraryLoaded = false;
  let renderVersion = 0;

  const selectedBeach = () => beaches[select.value] ? select.value : '\uad11\uc548\ub9ac';
  const clearMap = () => {
    overlays.forEach((overlay) => overlay.setMap(null));
    circles.forEach((circle) => circle.setMap(null));
    overlays = [];
    circles = [];
  };
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
  const marker = (lat, lng, emoji, text) => {
    const content = `<div style="display:flex;align-items:center;gap:5px;white-space:nowrap;background:#fff;border:1px solid #8bdce7;border-radius:12px;padding:6px 8px;font:700 12px Pretendard,Arial;color:#17485b;box-shadow:0 3px 10px #17485b40"><span style="font-size:16px">${emoji}</span>${escapeHtml(text)}</div>`;
    const overlay = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(lat, lng), content, xAnchor: 0.5, yAnchor: 1.1
    });
    overlay.setMap(map);
    overlays.push(overlay);
  };
  const drawStatic = (name, lat, lng) => {
    const [emoji, label] = labels[facility];
    const offsets = [[.0007, -.0008], [.0014, .0011], [-.0009, .0016]];
    offsets.forEach(([dy, dx], index) => marker(lat + dy, lng + dx, emoji, `${name} ${label} ${index + 1}`));
  };
  const searchNearby = (name, lat, lng, version) => {
    if (!window.kakao.maps.services) {
      drawStatic(name, lat, lng);
      return;
    }
    const service = new window.kakao.maps.services.Places();
    const center = new window.kakao.maps.LatLng(lat, lng);
    const keyword = `${name} ${facility === 'parking' ? '\uc8fc\ucc28\uc7a5' : '\ud654\uc7a5\uc2e4'}`;
    service.keywordSearch(keyword, (results, status) => {
      if (version !== renderVersion) return;
      if (status === window.kakao.maps.services.Status.OK && Array.isArray(results) && results.length) {
        results.slice(0, 15).forEach((place) => {
          marker(Number(place.y), Number(place.x), facility === 'parking' ? '\u{1F697}' : '\u{1F6BB}', place.place_name);
        });
        return;
      }
      // The three nearby guide markers remain available if Kakao search is temporarily unavailable.
      drawStatic(name, lat, lng);
    }, { location: center, radius: 3000, size: 15 });
  };
  const draw = () => {
    if (!map || !window.kakao) return;
    const version = ++renderVersion;
    const name = selectedBeach();
    const [lat, lng] = beaches[name];
    map.setCenter(new window.kakao.maps.LatLng(lat, lng));
    clearMap();
    if (facility === 'density') {
      [[.0007, -.0011, 260, '#ef7077', '\ud63c\uc7a1'], [.0017, .0010, 220, '#f5cf45', '\ubcf4\ud1b5'], [-.0011, .0018, 200, '#67d9ad', '\uc5ec\uc720']].forEach(([dy, dx, radius, color, density]) => {
        const circle = new window.kakao.maps.Circle({
          center: new window.kakao.maps.LatLng(lat + dy, lng + dx), radius,
          strokeWeight: 2, strokeColor: color, strokeOpacity: .7, fillColor: color, fillOpacity: .28
        });
        circle.setMap(map);
        circles.push(circle);
        marker(lat + dy, lng + dx, '\u{1F465}', `${name} ${density}`);
      });
      return;
    }
    if (facility === 'parking' || facility === 'toilet') {
      searchNearby(name, lat, lng, version);
      return;
    }
    drawStatic(name, lat, lng);
  };
  const relayout = () => {
    if (map) window.setTimeout(() => { map.relayout(); draw(); }, 80);
  };
  const installMap = () => {
    if (!window.kakao || !window.kakao.maps || libraryLoaded) return;
    libraryLoaded = true;
    mapElement.innerHTML = '';
    const [lat, lng] = beaches[selectedBeach()];
    map = new window.kakao.maps.Map(mapElement, {
      center: new window.kakao.maps.LatLng(lat, lng), level: 4
    });
    map.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT);
    draw();
  };
  const requestKakao = () => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      window.kakao.maps.load(installMap);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=aadfcaec662fd9742854769149e0fe10&libraries=services&autoload=false';
    script.async = true;
    script.onload = () => window.kakao.maps.load(installMap);
    script.onerror = () => mapElement.setAttribute('aria-label', '\uc9c0\ub3c4\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud574 \uc548\ub0b4 \uc9c0\ub3c4\ub85c \ud45c\uc2dc\ub429\ub2c8\ub2e4.');
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
