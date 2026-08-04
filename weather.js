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
  const style = document.createElement('style');
  style.textContent = `.weather-sketch{display:grid;place-items:center;width:42px;height:42px;color:#167b8d}.weather-sketch svg{width:38px;height:38px;stroke:currentColor;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}.weather-sketch .fill{fill:currentColor;stroke:none}.hourly-scroll{overflow-x:auto;scrollbar-width:thin}.hourly-row{min-width:max-content}`;
  document.head.appendChild(style);
  const metricIcons = {
    humidity: '<i class="weather-sketch" aria-label="습도"><svg viewBox="0 0 48 48"><path d="M24 4C17 14 10 21 10 30a14 14 0 0 0 28 0C38 21 31 14 24 4Z"/><path d="M18 32l12-10M18 23h.1M30 32h.1"/></svg></i>',
    wind: '<i class="weather-sketch" aria-label="바람"><svg viewBox="0 0 48 48"><path d="M5 16h25c6 0 7-9 1-9-3 0-4 2-4 4"/><path d="M5 24h33c7 0 8 10 1 10-3 0-5-2-5-5"/><path d="M5 32h16c5 0 6 7 1 7-2 0-3-1-3-3"/></svg></i>',
    temperature: '<i class="weather-sketch" aria-label="기온"><svg viewBox="0 0 48 48"><path d="M27 27V9a5 5 0 0 0-10 0v18a10 10 0 1 0 10 0Z"/><path d="M22 15v17"/><circle class="fill" cx="22" cy="34" r="4"/></svg></i>'
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
          <div class="rounded-2xl bg-[#effcff] p-2 flex flex-col items-center">${metricIcons.humidity}<b id="weatherHumidity" class="block text-sm text-[#167b8d]">--%</b><small class="text-[#6e929b]">습도</small></div>
          <div class="rounded-2xl bg-[#effcff] p-2 flex flex-col items-center">${metricIcons.wind}<b id="weatherWind" class="block text-sm text-[#167b8d]">--</b><small class="text-[#6e929b]">바람</small></div>
          <div class="rounded-2xl bg-[#effcff] p-2 flex flex-col items-center">${metricIcons.temperature}<b id="weatherTemp" class="block text-lg text-[#167b8d]">--°</b><small class="text-[#6e929b]">기온</small></div>
        </div>
        <p id="weatherStatus" class="mt-3 text-center text-sm font-bold text-[#55aebc]">현재 상황을 확인하고 있어요.</p>
        <div class="border-t border-[#d8f1f4] mt-4 pt-3"><p class="text-xs font-black text-[#72a8b2] mb-2">시간별 예보</p><div id="hourlyForecast" class="hourly-scroll"><div class="hourly-row flex gap-2 text-center text-xs text-[#6e929b]">불러오는 중...</div></div></div>
      </section>`);
  }

  function renderHourly(data, currentTime) {
    const container = document.getElementById('hourlyForecast');
    const start = data.hourly.time.findIndex(time => time === currentTime);
    const first = start >= 0 ? start : 0;
    const cards = Array.from({ length: 6 }, (_, offset) => {
      const i = first + offset;
      const hour = new Date(data.hourly.time[i]).getHours();
      const [label, icon] = weatherCodes[data.hourly.weather_code[i]] || ['날씨 정보', '🌊'];
      return `<div class="w-16 shrink-0 rounded-2xl bg-[#f6fdff] p-2"><b>${offset === 0 ? '지금' : hour + '시'}</b><span class="block text-xl my-1">${icon}</span><span class="block font-bold text-[#167b8d]">${Math.round(data.hourly.temperature_2m[i])}°</span><small>${data.hourly.precipitation_probability[i] ?? 0}%</small><span class="sr-only">${label}</span></div>`;
    });
    container.innerHTML = `<div class="hourly-row flex gap-2 text-center text-xs text-[#6e929b]">${cards.join('')}</div>`;
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
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
        hourly: 'temperature_2m,weather_code,precipitation_probability', timezone: 'Asia/Seoul', forecast_days: '1'
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
      weatherHumidity.textContent = `${current.relative_humidity_2m}%`;
      weatherWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
      renderHourly(data, current.time);
      weatherStatus.textContent = `현재 ${label} · 강수확률 ${data.hourly.precipitation_probability[hour] ?? 0}% · Open-Meteo 기준`;
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
