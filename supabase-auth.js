(() => {
  const client = window.supabase.createClient('https://zrierhrnezckurjuykdx.supabase.co', 'sb_publishable_SwbyoOcHgicG4N9Mr2-Teg_s1ECQmc4');
  window.badayaSupabase = client;
  const enter = () => { document.getElementById('authGate')?.remove(); document.querySelector('.app').style.visibility='visible'; document.querySelector('nav').style.visibility='visible'; };
  const error = (message) => { let el=document.getElementById('authError'); if(!el){el=document.createElement('p');el.id='authError';el.className='text-sm text-red-500 mt-3 font-bold';document.querySelector('.auth-card')?.appendChild(el);} el.textContent=message; };
  client.auth.getSession().then(({data:{session}})=>{if(session) enter();});
  const toEmail = (value) => { const id = value.trim().toLowerCase(); return id.includes('@') ? id : `${id}@badaya.local`; };
  document.getElementById('loginForm').onsubmit = async (e) => { e.preventDefault(); const email=toEmail(loginId.value), password=e.target.querySelector('input[type=password]').value; const {error:e1}=await client.auth.signInWithPassword({email,password}); e1?error('아이디 또는 비밀번호를 확인해 주세요.'):enter(); };
  document.getElementById('signupForm').onsubmit = async (e) => { e.preventDefault(); const id=signupId.value.trim(), email=toEmail(id), password=e.target.querySelector('input[type=password]').value, nickname=document.getElementById('nickname').value.trim(); if(!id)return error('아이디를 입력해 주세요.'); const {error:e1}=await client.auth.signUp({email,password,options:{data:{nickname,login_id:id}}}); if(e1)return error(e1.message); localStorage.setItem('badayaPendingProfile',JSON.stringify({nickname,login_id:id})); showAuth('signupStep2'); };
  document.getElementById('finishSignup').onclick = async () => { const preferences=[...document.querySelectorAll('.pref.active')].map(x=>x.textContent); const {data:{user}}=await client.auth.getUser(); const p=JSON.parse(localStorage.getItem('badayaPendingProfile')||'{}'); if(user) await client.from('profiles').upsert({id:user.id,email:user.email,nickname:p.nickname||'',preferences},{onConflict:'id'}); localStorage.setItem('badayaPrefs',JSON.stringify(preferences)); enter(); };
})();
