import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query, limit, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCI8iei-gL3kUIEhPlcoOjAVjvWRJ6dezQ',
  authDomain: 'badaya-nolja-de9e3.firebaseapp.com',
  projectId: 'badaya-nolja-de9e3',
  storageBucket: 'badaya-nolja-de9e3.firebasestorage.app',
  messagingSenderId: '656188796031',
  appId: '1:656188796031:web:4bef368a6bdbcef4dba34a'
};

const db = getFirestore(initializeApp(firebaseConfig));
const postList = document.getElementById('postList');
const postForm = document.getElementById('postForm');
const modal = document.getElementById('modal');
let posts = [];
let activeFilter = 'all';

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function getAuthor() {
  try {
    return (JSON.parse(localStorage.getItem('badayaPendingProfile') || '{}').nickname || '바다친구').slice(0, 30);
  } catch {
    return '바다친구';
  }
}

function formatTime(value) {
  if (!value?.toDate) return '방금 전';
  return value.toDate().toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function render() {
  const visible = posts.filter((post) => activeFilter === 'all' || post.post_type === activeFilter);
  postList.innerHTML = visible.length
    ? visible.map((post) => `<article class="cloud p-4"><div class="flex items-center justify-between gap-3"><span class="text-xs font-black ${post.post_type === 'EVENT' ? 'text-[#ef8c63]' : 'text-[#55aebc]'}">&lt;${escapeHtml(post.post_type)}&gt;</span><span class="text-[10px] text-[#a5c3c8]">${formatTime(post.createdAt)}</span></div><h3 class="font-black mt-1">${escapeHtml(post.title)}</h3><p class="text-sm text-[#6e929b] mt-2 whitespace-pre-wrap">${escapeHtml(post.body)}</p><p class="text-[10px] text-[#6ca9b4] mt-3">${escapeHtml(post.author)}</p></article>`).join('')
    : '<div class="cloud p-6 text-center text-sm text-[#6e929b]">아직 글이 없어요. 첫 바다 이야기를 남겨보세요.</div>';
}

function showMessage(text, isError = true) {
  let status = document.getElementById('communityStatus');
  if (!status) {
    status = document.createElement('p');
    status.id = 'communityStatus';
    status.className = 'text-sm mt-3 font-bold';
    postForm.appendChild(status);
  }
  status.className = `text-sm mt-3 font-bold ${isError ? 'text-red-500' : 'text-[#55aebc]'}`;
  status.textContent = text;
}

const feed = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'), limit(100));
onSnapshot(feed, (snapshot) => {
  posts = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
  render();
}, (error) => {
  console.error('Community subscription failed:', error);
  postList.innerHTML = '<div class="cloud p-6 text-center text-sm text-red-500">커뮤니티 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.</div>';
});

document.querySelectorAll('.communityFilter').forEach((button) => {
  button.onclick = () => {
    document.querySelectorAll('.communityFilter').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter || 'all';
    render();
  };
});

document.getElementById('openModal').onclick = () => {
  document.getElementById('communityStatus')?.remove();
  modal.classList.remove('hidden');
};
document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

postForm.onsubmit = async (event) => {
  event.preventDefault();
  const title = document.getElementById('postTitle').value.trim();
  const body = document.getElementById('postBody').value.trim();
  const post_type = document.getElementById('postType').value;
  if (!title || !body) return showMessage('제목과 내용을 모두 입력해 주세요.');
  try {
    await addDoc(collection(db, 'community_posts'), {
      title,
      body,
      post_type,
      author: getAuthor(),
      createdAt: serverTimestamp()
    });
    postForm.reset();
    modal.classList.add('hidden');
  } catch (error) {
    console.error('Community post failed:', error);
    showMessage('글을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
};
