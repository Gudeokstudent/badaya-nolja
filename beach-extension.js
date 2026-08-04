(() => {
  const newBeaches = {
    송도: { lat: 35.0773, lng: 129.0201 },
    일광: { lat: 35.2602, lng: 129.2335 },
    임랑: { lat: 35.3186, lng: 129.2649 }
  };
  const lists = {
    송도: {
      food: ['송도 조개구이', '송도해수욕장 횟집', '암남공원 맛집', '송도 해물칼국수', '송도 돼지국밥', '송도 바다횟집', '송도 오션뷰 카페', '송도 해물라면', '송도 포장마차', '송도 시장 맛집'],
      stay: ['윈덤 그랜드 부산', '송도 오션뷰 호텔', '송도 비치 게스트하우스', '암남동 스테이', '송도 베이 호텔', '송도 바다펜션', '남포동 호텔', '영도 오션스테이', '송도 레지던스', '송도 감성숙소'],
      activity: ['송도 해상케이블카', '송도 구름산책로', '암남공원 산책', '송도 용궁구름다리', '송도 해수욕장 산책', '송도 카약 체험', '송도 바다 자전거', '송도 일몰 감상', '송도 해안 트레킹', '송도 포토스팟']
    },
    일광: {
      food: ['일광 조개구이', '일광해수욕장 횟집', '일광 해물칼국수', '일광 장어구이', '기장 멸치쌈밥', '일광 돼지국밥', '일광 오션뷰 카페', '일광 해물라면', '일광 국수집', '일광 바다 맛집'],
      stay: ['일광 오션뷰 펜션', '일광 비치 호텔', '기장 오션스테이', '일광 감성숙소', '일광 게스트하우스', '기장 풀빌라', '일광 바다펜션', '기장 호텔', '일광 스테이', '일광 캠핑 숙소'],
      activity: ['일광해수욕장 산책', '일광 일출 감상', '일광 해변 자전거', '기장 해안 산책로', '일광 서핑 체험', '일광 카약 체험', '일광 모래놀이', '일광 포토스팟', '기장 드라이브', '일광 바다 피크닉']
    },
    임랑: {
      food: ['임랑 조개구이', '임랑해수욕장 횟집', '임랑 해물칼국수', '임랑 장어구이', '기장 멸치쌈밥', '임랑 돼지국밥', '임랑 오션뷰 카페', '임랑 해물라면', '임랑 바다 맛집', '장안 맛집'],
      stay: ['임랑 오션뷰 펜션', '임랑 비치 스테이', '기장 바다펜션', '임랑 감성숙소', '임랑 게스트하우스', '장안 펜션', '기장 풀빌라', '임랑 바다숙소', '기장 호텔', '임랑 캠핑 숙소'],
      activity: ['임랑해수욕장 산책', '임랑 일출 감상', '임랑 해변 자전거', '임랑 서핑 체험', '임랑 카약 체험', '기장 해안 드라이브', '임랑 포토스팟', '임랑 바다 피크닉', '장안 해안 산책', '임랑 모래놀이']
    }
  };
  const weatherCodes = { 0:['맑음','☀️'],1:['대체로 맑음','🌤️'],2:['구름 조금','⛅'],3:['흐림','☁️'],45:['안개','🌫️'],48:['안개','🌫️'],51:['이슬비','🌦️'],53:['이슬비','🌦️'],55:['이슬비','🌦️'],61:['비','🌧️'],63:['비','🌧️'],65:['강한 비','🌧️'],80:['소나기','🌦️'],81:['소나기','🌦️'],82:['강한 소나기','⛈️'],95:['뇌우','⛈️'] };
  const trashPoints = {
    광안리:[[35.1548,129.1204],[35.1528,129.1249]], 해운대:[[35.1583,129.1601],[35.1604,129.1640]], 송정:[[35.1783,129.1997],[35.1802,129.2014]], 다대포:[[35.0485,128.9664],[35.0467,128.9688]],
    송도:[[35.0776,129.0208],[35.0757,129.0195]], 일광:[[35.2605,129.2343],[35.2588,129.2322]], 임랑:[[35.3188,129.2653],[35.3172,129.2636]]
  };
  function addOptions() {
    ['homeRegion','mapRegion'].forEach((id) => {
      const select = document.getElementById(id);
      Object.keys(newBeaches).forEach((name) => { if (![...select.options].some((option) => option.value === name)) select.add(new Option(name, name)); });
    });
  }
  function addPlaces() {
    Object.entries(newBeaches).forEach(([name, point]) => {
      regions[name] = point;
      if (!places[name]) places[name] = {};
      Object.entries(lists[name]).forEach(([category, names]) => {
        places[name][category] = names.map((place, index) => [place, (4.9 - index * 0.05).toFixed(1), `https://search.naver.com/search.naver?query=${encodeURIComponent(place + ' 부산')}`]);
      });
    });
    const heading = document.querySelector('#homePage h2');
    if (heading) heading.textContent = '이 바다의 TOP 10';
    renderPlaces();
  }
  async function updateNewBeachWeather() {
    const select = document.getElementById('homeRegion');
    const beach = select.value;
    if (!newBeaches[beach]) return;
    const point = newBeaches[beach];
    weatherBeach.textContent = `${beach} 날씨 불러오는 중`;
    try {
      const params = new URLSearchParams({ latitude: point.lat, longitude: point.lng, current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m', hourly: 'temperature_2m,weather_code,precipitation_probability', timezone: 'Asia/Seoul', forecast_days: '2' });
      const data = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`).then((response) => response.json());
      if (select.value !== beach) return;
      const current = data.current, info = weatherCodes[current.weather_code] || ['날씨 정보','🌊'];
      const currentIndex = Math.max(0, data.hourly.time.findIndex((time) => time === current.time));
      weatherBeach.textContent = `${beach} 현재 날씨`; weatherIcon.textContent = info[1]; weatherTemp.textContent = `${Math.round(current.temperature_2m)}°`; weatherHumidity.textContent = `${current.relative_humidity_2m}%`; weatherWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
      weatherStatus.textContent = `현재 ${info[0]} · 강수확률 ${data.hourly.precipitation_probability[currentIndex] ?? 0}% · Open-Meteo 기준`;
      hourlyForecast.innerHTML = `<div class="hourly-row flex gap-2 text-center text-xs text-[#6e929b]">${Array.from({length:7},(_,offset)=>{const i=currentIndex+offset*4, hour=new Date(data.hourly.time[i]).getHours(), forecast=weatherCodes[data.hourly.weather_code[i]]||['날씨','🌊'];return `<div class="w-16 shrink-0 rounded-2xl bg-[#f6fdff] p-2"><b>${offset===0?'지금':`+${offset*4}h`}</b><span class="block text-[10px] mt-1">${hour}시</span><span class="block text-xl my-1">${forecast[1]}</span><span class="block font-bold text-[#167b8d]">${Math.round(data.hourly.temperature_2m[i])}°</span><small>${data.hourly.precipitation_probability[i]??0}%</small></div>`;}).join('')}</div>`;
    } catch { weatherStatus.textContent = '날씨 정보를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.'; }
  }
  function extendMapFilters() {
    drawFilter = function(type) {
      clearMap(); const region = document.getElementById('mapRegion').value, base = regions[region];
      if (type === 'density') { [[0.0007,-0.0012,280,'#ef4444'],[0.0016,0.0010,230,'#facc15'],[-0.0011,0.0018,210,'#34d399']].forEach((item) => circles.push(new kakao.maps.Circle({ map, center:new kakao.maps.LatLng(base.lat+item[0],base.lng+item[1]), radius:item[2], strokeColor:item[3], strokeOpacity:.55, strokeWeight:1, fillColor:item[3], fillOpacity:.25 }))); map.setCenter(new kakao.maps.LatLng(base.lat,base.lng)); return; }
      if (type === 'parking' || type === 'toilet') { searchKakaoFacilities(type); return; }
      (trashPoints[region] || []).forEach((point, index) => addFacilityMarker(`${region} 해변 쓰레기통 ${index+1}`, point[0], point[1], '🗑️'));
    };
  }
  document.addEventListener('DOMContentLoaded', () => { addOptions(); addPlaces(); extendMapFilters(); document.getElementById('homeRegion').addEventListener('change', updateNewBeachWeather); });
})();
