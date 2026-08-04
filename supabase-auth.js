(() => {
  const SUPABASE_URL = 'https://zrierhrnezckurjuykdx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_SwbyoOcHgicG4N9Mr2-Teg_s1ECQmc4';
  const SESSION_KEY = 'badayaSupabaseSession';

  const init = () => {
    const panelIds = ['loginPanel', 'signupStep1', 'signupStep2'];
    const panel = (id) => document.getElementById(id);
    const showPanel = (id) => {
      panelIds.forEach((panelId) => panel(panelId)?.classList.toggle('show', panelId === id));
      const message = document.getElementById('authMessage');
      if (message) message.remove();
    };
    const visibleCard = () => document.querySelector('.auth-panel.show .auth-card');
    const showMessage = (message, isError = true) => {
      let element = document.getElementById('authMessage');
      if (!element) {
        element = document.createElement('p');
        element.id = 'authMessage';
        element.className = 'text-sm mt-3 font-bold';
      }
      element.className = `text-sm mt-3 font-bold ${isError ? 'text-red-500' : 'text-teal-700'}`;
      element.textContent = message;
      visibleCard()?.appendChild(element);
    };
    const enter = () => {
      document.getElementById('authGate')?.remove();
      const app = document.querySelector('.app');
      const nav = document.querySelector('nav');
      if (app) app.style.visibility = 'visible';
      if (nav) nav.style.visibility = 'visible';
    };
    const toEmail = (value) => {
      const id = value.trim().toLowerCase();
      return id.includes('@') ? id : `${id}@badaya.local`;
    };
    const request = async (path, options = {}) => {
      const response = await fetch(`${SUPABASE_URL}${path}`, {
        ...options,
        headers: {
          apikey: SUPABASE_KEY,
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.msg || body.message || '요청을 처리하지 못했습니다.');
      return body;
    };
    const saveSession = (session) => {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    };
    const readSession = () => {
      try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
      catch { return null; }
    };

    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const finishButton = document.getElementById('finishSignup');
    // Replace the page's old demo-only handlers with the real authentication flow.
    if (signupForm) signupForm.onsubmit = null;
    if (loginForm) loginForm.onsubmit = null;
    if (finishButton) finishButton.onclick = null;
    const signupButton = signupForm?.querySelector('button');
    if (signupButton) signupButton.textContent = '회원가입';

    signupForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const id = document.getElementById('signupId')?.value.trim() || '';
      const password = signupForm.querySelector('input[type="password"]')?.value || '';
      const nickname = document.getElementById('nickname')?.value.trim() || '';
      if (!id || !password || !nickname) return showMessage('이메일, 비밀번호, 닉네임을 모두 입력해 주세요.');
      if (password.length < 6) return showMessage('비밀번호는 6자 이상 입력해 주세요.');
      if (signupButton) signupButton.disabled = true;
      try {
        await request('/auth/v1/signup', {
          method: 'POST',
          body: JSON.stringify({ email: toEmail(id), password, data: { nickname, login_id: id } })
        });
        localStorage.setItem('badayaPendingProfile', JSON.stringify({ nickname, login_id: id }));
        showPanel('loginPanel');
        showMessage('회원가입이 완료되었습니다. 이제 로그인해 주세요.', false);
      } catch (error) {
        showMessage(error.message);
      } finally {
        if (signupButton) signupButton.disabled = false;
      }
    }, { capture: true });

    loginForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const id = document.getElementById('loginId')?.value.trim() || '';
      const password = loginForm.querySelector('input[type="password"]')?.value || '';
      if (!id || !password) return showMessage('이메일과 비밀번호를 입력해 주세요.');
      const loginButton = loginForm.querySelector('button');
      if (loginButton) loginButton.disabled = true;
      try {
        const session = await request('/auth/v1/token?grant_type=password', {
          method: 'POST',
          body: JSON.stringify({ email: toEmail(id), password })
        });
        saveSession(session);
        showPanel('signupStep2');
      } catch (error) {
        showMessage('이메일 또는 비밀번호를 확인해 주세요.');
      } finally {
        if (loginButton) loginButton.disabled = false;
      }
    }, { capture: true });

    finishButton?.addEventListener('click', async (event) => {
      event.stopImmediatePropagation();
      const preferences = [...document.querySelectorAll('.pref.active')].map((element) => element.textContent.trim());
      const session = readSession();
      const profile = JSON.parse(localStorage.getItem('badayaPendingProfile') || '{}');
      if (session?.access_token && session?.user?.id) {
        try {
          await request('/rest/v1/profiles?on_conflict=id', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              Prefer: 'resolution=merge-duplicates,return=minimal'
            },
            body: JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              nickname: profile.nickname || '',
              preferences
            })
          });
        } catch (error) {
          // A profile table or RLS policy may not be configured yet. The authenticated session still works.
        }
      }
      localStorage.setItem('badayaPrefs', JSON.stringify(preferences));
      enter();
    }, { capture: true });

    if (readSession()?.access_token) enter();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
