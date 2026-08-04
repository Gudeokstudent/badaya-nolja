(() => {
  const regionPoints = {
    광안리: { lat: 35.1532, lng: 129.1187 },
    해운대: { lat: 35.1587, lng: 129.1603 },
    송정: { lat: 35.1787, lng: 129.1990 },
    다대포: { lat: 35.0480, lng: 128.9661 }
  };
  const weatherCodes = {
    0: ['맑음', '☀️'], 1: ['대체로 맑음', '🌤️'], 2: ['구름 조금', '⛅'],
    3: ['흐림', '☁️'], 45: ['안개', '🌫️'], 48: ['안개', '🌫️'],
    51: ['이슬비', '🌦️'], 53: ['이슬비', '🌦️'], 55: ['이슬비', '🌦️'],
    61: ['비', '🌧️'], 63: ['비', '🌧️'], 65: ['강한 비', '🌧️'],
    71: ['눈', '🌨️'], 73: ['눈', '🌨️'], 75: ['눈', '🌨️'],
    80: ['소나기', '🌦️'], 81: ['소나기', '🌦️'], 82: ['강한 소나기', '⛈️'], 95: ['뇌우', '⛈️']
  };
  let requestSerial = 0;

  function createCard() {
    const home = document.getElementById('homePage');
    if (!home || document.getElementById('weatherCard')) return;
    const headline = home.querySelector('p');
    if (!headline) return;
    headline.insertAdjacentHTML('afterend', `
      <section id="weatherCard" class="cloud p-4 mb-4" aria-live="polite">
        <div class="flex items-center justify-between">
          <div><p class="text-xs font-black text-[#72a8b2]">실시간 해변 날씨</p><h2 id="weatherBeach" class="font-black mt-1">날씨 불러오는 중</h2></div>
          <span id="weatherIcon" class="text-3xl">☀️</span>
        </div>
        <div class="grid grid-cols-3 gap-2 mt-3 text-center">
          <div class="rounded-2xl bg-[#effcff] p-2"><b id="weatherTemp" class="block text-lg text-[#167b8d]">--°</b><small class="text-[#6e929b]">기온</small></div>
          <div class="rounded-2xl bg-[#effcff] p-2"><b id="weatherWind" class="block text-sm text-[#167b8d]">--</b><small class="text-[#6e929b]">바람</small></div>
          <div class="rounded-2xl bg-[#effcff] p-2"><b id="weatherRain" class="block text-sm text-[#167b8d]">--</b><small class="text-[#6e929b]">강수확률</small></div>
        </div>
        <p id="weatherStatus" class="mt-3 text-center text-sm font-bold text-[#55aebc]">현재 날씨를 확인하고 있어요.</p>
      </section>`);
  }

  async function updateWeather() {
    const select = document.getElementById('homeRegion');
    if (!select || !document.getElementById('weatherCard')) return;
    const beach = select.value;
    const point = regionPoints[beach];
    if (!point) return;
    const id = ++requestSerial;
    weatherBeach.textContent = `${beach} 날씨 불러오는 중`;
    weatherStatus.textContent = '현재 날씨를 확인하고 있어요.';
    try {
      const query = new URLSearchParams({
        latitude: point.lat, longitude: point.lng,
        current: 'temperature_2m,weather_code,wind_speed_10m',
        hourly: 'precipitation_probability', timezone: 'Asia/Seoul', forecast_days: '1'
      });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`);
      if (!response.ok) throw new Error('weather request failed');
      const data = await response.json();
      if (id !== requestSerial) return;
      const current = data.current;
      const [label, icon] = weatherCodes[current.weather_code] || ['날씨 정보', '🌊'];
      const hour = new Date(current.time).getHours();
      weatherBeach.textContent = `${beach} 현재 날씨`;
      weatherIcon.textContent = icon;
      weatherTemp.textContent = `${Math.round(current.temperature_2m)}°`;
      weatherWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
      weatherRain.textContent = `${data.hourly.precipitation_probability[hour] ?? 0}%`;
      weatherStatus.textContent = `${label} · Open-Meteo 기준`;
    } catch (error) {
      if (id !== requestSerial) return;
      weatherBeach.textContent = `${beach} 날씨`;
      weatherStatus.textContent = '날씨 정보를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    createCard();
    const select = document.getElementById('homeRegion');
    if (!select) return;
    select.addEventListener('change', updateWeather);
    updateWeather();
  });
})();
