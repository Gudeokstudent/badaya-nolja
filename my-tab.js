(() => {
  function getProfile() {
    try { return JSON.parse(localStorage.getItem('badayaPendingProfile') || '{}'); }
    catch { return {}; }
  }
  function renderMyTab() {
    const profile = getProfile();
    const name = profile.nickname || '바다친구';
    const prefs = JSON.parse(localStorage.getItem('badayaPrefs') || '[]');
    const region = document.getElementById('homeRegion')?.value || '광안리';
    document.getElementById('myNickname').textContent = name;
    document.getElementById('myBeach').textContent = `${region} 바다를 보고 있어요`;
    document.getElementById('myPreferences').innerHTML = prefs.length
      ? prefs.map((item) => `<span class="pill px-3 py-2 text-sm font-bold text-[#167b8d]">${item}</span>`).join('')
      : '<p class="text-sm text-[#76a4ae]">아직 선택한 여행 취향이 없어요.</p>';
  }
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const main = document.querySelector('main');
    if (!nav || !main || document.getElementById('myPage')) return;
    const tab = document.createElement('button');
    tab.className = 'nav flex flex-col items-center gap-1 text-xs font-bold w-1/5';
    tab.dataset.page = 'myPage';
    tab.innerHTML = '👤<span>마이</span>';
    nav.querySelectorAll('.nav').forEach((item) => { item.classList.remove('w-1/3', 'w-1/4'); item.classList.add('w-1/5'); });
    nav.appendChild(tab);
    const page = document.createElement('section');
    page.id = 'myPage';
    page.className = 'page hidden';
    page.innerHTML = '<div class="cloud p-5"><div class="flex items-center gap-4"><div class="grid h-16 w-16 place-items-center rounded-full bg-[#d9f8fc] text-3xl">🌊</div><div><p class="text-xs font-black text-[#72a8b2]">MY BADAYA</p><h2 id="myNickname" class="mt-1 text-2xl font-black text-[#167b8d]"></h2><p id="myBeach" class="mt-1 text-sm text-[#6e929b]"></p></div></div><div class="mt-6 border-t border-[#d8f1f4] pt-5"><p class="text-sm font-black text-[#214553]">나의 여행 취향</p><div id="myPreferences" class="mt-3 flex flex-wrap gap-2"></div></div><div class="mt-6 grid grid-cols-2 gap-3"><div class="rounded-2xl bg-[#effcff] p-4"><p class="text-xs font-bold text-[#72a8b2]">커뮤니티</p><p class="mt-1 font-black text-[#167b8d]">바다 이야기 나누기</p></div><div class="rounded-2xl bg-[#effcff] p-4"><p class="text-xs font-bold text-[#72a8b2]">오늘의 바다</p><p class="mt-1 font-black text-[#167b8d]">안전하게 즐기세요</p></div></div></div>';
    main.appendChild(page);
    tab.onclick = () => { document.querySelectorAll('.nav').forEach((item) => item.classList.remove('active')); tab.classList.add('active'); document.querySelectorAll('.page').forEach((item) => item.classList.add('hidden')); page.classList.remove('hidden'); renderMyTab(); };
  });
})();
