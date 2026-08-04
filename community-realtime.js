(() => {
  const SUPABASE_URL = 'https://zrierhrnezckurjuykdx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_SwbyoOcHgicG4N9Mr2-Teg_s1ECQmc4';
  const API_URL = `${SUPABASE_URL}/rest/v1/community_posts`;
  const postList = document.getElementById('postList');
  const postForm = document.getElementById('postForm');
  const modal = document.getElementById('modal');
  if (!postList || !postForm || !modal) return;

  let posts = [];
  let activeFilter = 'all';
  let socket;
  let heartbeat;

  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
  const currentAuthor = () => {
    try {
      const profile = JSON.parse(localStorage.getItem('badayaPendingProfile') || '{}');
      return (profile.nickname || '바다친구').trim().slice(0, 30) || '바다친구';
    } catch {
      return '바다친구';
    }
  };
  const formatTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '방금 전';
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
    return `${date.getMonth() + 1}.${date.getDate()}`;
  };
  const renderPosts = () => {
    const visiblePosts = posts.filter((post) => activeFilter === 'all' || post.post_type === activeFilter);
    postList.innerHTML = visiblePosts.length
      ? visiblePosts.map((post) => `
        <article class="cloud p-4">
          <div class="flex items-center justify-between gap-3">
            <span class="text-xs font-black ${post.post_type === 'EVENT' ? 'text-[#ef8c63]' : 'text-[#55aebc]'}">&lt;${escapeHtml(post.post_type)}&gt;</span>
            <span class="text-[10px] text-[#a5c3c8]">${formatTime(post.created_at)}</span>
          </div>
          <h3 class="font-black mt-1">${escapeHtml(post.title)}</h3>
          <p class="text-sm text-[#6e929b] mt-2 whitespace-pre-wrap">${escapeHtml(post.body)}</p>
          <p class="text-[10px] text-[#6ca9b4] mt-3">${escapeHtml(post.author || '바다친구')}</p>
        </article>`).join('')
      : '<div class="cloud p-6 text-center text-sm text-[#6e929b]">아직 글이 없어요. 첫 바다 이야기를 남겨보세요.</div>';
  };
  const showStatus = (message, isError = true) => {
    let status = document.getElementById('communityStatus');
    if (!status) {
      status = document.createElement('p');
      status.id = 'communityStatus';
      status.className = 'text-sm font-bold mt-3';
      postForm.appendChild(status);
    }
    status.className = `text-sm font-bold mt-3 ${isError ? 'text-red-500' : 'text-teal-700'}`;
    status.textContent = message;
  };
  const loadPosts = async () => {
    try {
      const response = await fetch(`${API_URL}?select=id,post_type,title,body,author,created_at&order=created_at.desc&limit=100`, {
        headers: { apikey: SUPABASE_KEY }
      });
      if (!response.ok) throw new Error('게시글을 불러오지 못했습니다.');
      posts = await response.json();
      renderPosts();
    } catch (error) {
      postList.innerHTML = '<div class="cloud p-6 text-center text-sm text-red-500">게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>';
    }
  };
  const addPost = (post) => {
    if (!post || posts.some((item) => String(item.id) === String(post.id))) return;
    posts.unshift(post);
    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderPosts();
  };
  const connectRealtime = () => {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
    const realtimeUrl = `${SUPABASE_URL.replace('https://', 'wss://')}/realtime/v1/websocket?apikey=${SUPABASE_KEY}&vsn=1.0.0`;
    socket = new WebSocket(realtimeUrl);
    socket.onopen = () => {
      socket.send(JSON.stringify({
        topic: 'realtime:public:community_posts',
        event: 'phx_join',
        payload: { config: { broadcast: { self: false }, presence: { key: '' }, postgres_changes: [{ event: 'INSERT', schema: 'public', table: 'community_posts' }] } },
        ref: '1'
      }));
      heartbeat = setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(Date.now()) }));
      }, 25000);
    };
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event !== 'postgres_changes') return;
        const data = message.payload?.data || {};
        addPost(data.record || data.new || message.payload?.record);
      } catch {
        // Ignore malformed real-time messages and keep the feed usable.
      }
    };
    socket.onclose = () => {
      clearInterval(heartbeat);
      socket = undefined;
      setTimeout(connectRealtime, 3000);
    };
  };

  document.querySelectorAll('.communityFilter').forEach((button) => {
    button.onclick = () => {
      document.querySelectorAll('.communityFilter').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      activeFilter = button.dataset.filter || 'all';
      renderPosts();
    };
  });
  document.querySelector('[data-page="communityPage"]')?.addEventListener('click', () => {
    loadPosts();
    connectRealtime();
  });
  document.getElementById('openModal').onclick = () => {
    document.getElementById('communityStatus')?.remove();
    modal.classList.remove('hidden');
  };
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  postForm.onsubmit = async (event) => {
    event.preventDefault();
    const submitButton = postForm.querySelector('button[type="submit"], button:not([type])');
    const title = document.getElementById('postTitle').value.trim();
    const body = document.getElementById('postBody').value.trim();
    const post_type = document.getElementById('postType').value;
    if (!title || !body) return showStatus('제목과 내용을 모두 입력해 주세요.');
    if (submitButton) submitButton.disabled = true;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({ title, body, post_type, author: currentAuthor() })
      });
      const result = await response.json().catch(() => []);
      if (!response.ok) throw new Error(result.message || '글을 등록하지 못했습니다.');
      addPost(Array.isArray(result) ? result[0] : result);
      postForm.reset();
      modal.classList.add('hidden');
    } catch (error) {
      showStatus(error.message || '글을 등록하지 못했습니다.');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  };

  loadPosts();
  connectRealtime();
})();
