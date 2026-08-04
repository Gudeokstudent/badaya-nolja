(() => {
  const choices = ['맛집','숙박','해변 산책','수상 활동','문화·축제','사진 명소','가족 여행','조용한 여행','친구와 여행','혼자 여행'];
  const install = () => {
    const button = document.getElementById('editPrefs');
    if (!button || button.dataset.fixed) return;
    button.dataset.fixed = '1';
    button.onclick = () => {
      const current = JSON.parse(localStorage.getItem('badayaPrefs') || '[]');
      const overlay = document.createElement('div'); overlay.className='fixed inset-0 z-50 grid place-items-center bg-black/30 p-4';
      overlay.innerHTML = `<div class="cloud w-full max-w-md p-5"><h3 class="text-lg font-black">선호 테마 선택</h3><div class="mt-4 grid grid-cols-2 gap-2">${choices.map(x=>`<button type="button" data-pref="${x}" class="pill px-3 py-3 text-sm font-bold ${current.includes(x)?'bg-[#54c5d5] text-white':''}">${x}</button>`).join('')}</div><div class="mt-5 flex gap-2"><button type="button" data-cancel class="pill flex-1 px-3 py-3 font-bold">취소</button><button type="button" data-save class="flex-1 rounded-full bg-[#54c5d5] px-3 py-3 font-bold text-white">저장</button></div></div>`;
      document.body.appendChild(overlay); const selected=new Set(current);
      overlay.querySelectorAll('[data-pref]').forEach(b=>b.onclick=()=>{selected.has(b.dataset.pref)?(selected.delete(b.dataset.pref),b.classList.remove('bg-[#54c5d5]','text-white')):(selected.add(b.dataset.pref),b.classList.add('bg-[#54c5d5]','text-white'));});
      overlay.querySelector('[data-cancel]').onclick=()=>overlay.remove(); overlay.querySelector('[data-save]').onclick=()=>{localStorage.setItem('badayaPrefs',JSON.stringify([...selected]));overlay.remove();document.querySelector('[data-page="myPage"]')?.click();};
    };
  };
  new MutationObserver(install).observe(document.body,{childList:true,subtree:true}); install();
})();
