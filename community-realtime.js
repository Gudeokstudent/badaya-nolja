import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query, limit, serverTimestamp, doc, getDoc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCI8iei-gL3kUIEhPlcoOjAVjvWRJ6dezQ', authDomain: 'badaya-nolja-de9e3.firebaseapp.com',
  projectId: 'badaya-nolja-de9e3', storageBucket: 'badaya-nolja-de9e3.firebasestorage.app',
  messagingSenderId: '656188796031', appId: '1:656188796031:web:4bef368a6bdbcef4dba34a'
};

const db = getFirestore(initializeApp(firebaseConfig));
const postList = document.getElementById('postList');
const postForm = document.getElementById('postForm');
const modal = document.getElementById('modal');
let posts = [];
let activeFilter = 'all';
const likesByPost = new Map();
const commentsByPost = new Map();
const subscriptions = new Map();
const visitorId = (() => {
  const key = 'badayaVisitorId';
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
})();

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
function getAuthor() {
  try { return (JSON.parse(localStorage.getItem('badayaPendingProfile') || '{}').nickname || '바다친구').slice(0, 30); }
  catch { return '바다친구'; }
}
function formatTime(value) {
  return value?.toDate ? value.toDate().toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '방금 전';
}
function subscribePostDetails(postId) {
  if (subscriptions.has(postId)) return;
  subscriptions.set(postId, []);
  const stopLikes = onSnapshot(collection(db, 'community_posts', postId, 'likes'), (snapshot) => {
    likesByPost.set(postId, { count: snapshot.size, liked: snapshot.docs.some((item) => item.id === visitorId) });
    render();
  });
  const stopComments = onSnapshot(query(collection(db, 'community_posts', postId, 'comments'), orderBy('createdAt', 'asc'), limit(50)), (snapshot) => {
    commentsByPost.set(postId, snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    render();
  });
  subscriptions.set(postId, [stopLikes, stopComments]);
}
function postHtml(post) {
  const like = likesByPost.get(post.id) || { count: 0, liked: false };
  const comments = commentsByPost.get(post.id) || [];
  const commentsHtml = comments.length ? comments.map((comment) => `<li class="rounded-xl bg-[#f5fdff] px-3 py-2"><b class="text-[#167b8d]">${escapeHtml(comment.author)}</b><span class="ml-2">${escapeHtml(comment.body)}</span><small class="block mt-1 text-[#9bbbc1]">${formatTime(comment.createdAt)}</small></li>`).join('') : '';
  return `<article class="cloud p-4"><div class="flex items-center justify-between gap-3"><span class="text-xs font-black ${post.post_type === 'EVENT' ? 'text-[#ef8c63]' : 'text-[#55aebc]'}">&lt;${escapeHtml(post.post_type)}&gt;</span><span class="text-[10px] text-[#a5c3c8]">${formatTime(post.createdAt)}</span></div><h3 class="font-black mt-1">${escapeHtml(post.title)}</h3><p class="text-sm text-[#6e929b] mt-2 whitespace-pre-wrap">${escapeHtml(post.body)}</p><p class="text-[10px] text-[#6ca9b4] mt-3">${escapeHtml(post.author)}</p><div class="flex items-center gap-2 mt-4"><button class="likeButton pill px-3 py-2 text-sm font-bold ${like.liked ? 'active' : ''}" data-post-id="${post.id}" aria-label="좋아요">${like.liked ? '♥' : '♡'} 좋아요 <span>${like.count}</span></button><span class="text-xs text-[#76a4ae]">댓글 ${comments.length}</span></div><ul class="space-y-2 mt-3">${commentsHtml}</ul><form class="commentForm flex gap-2 mt-3" data-post-id="${post.id}"><input required maxlength="300" class="min-w-0 flex-1 rounded-xl border border-[#b9e7ed] px-3 py-2 text-sm" placeholder="답글을 남겨보세요"><button class="rounded-xl bg-[#55cadb] text-white px-3 text-sm font-bold">등록</button></form></article>`;
}
function render() {
  const visible = posts.filter((post) => activeFilter === 'all' || post.post_type === activeFilter);
  postList.innerHTML = visible.length ? visible.map(postHtml).join('') : '<div class="cloud p-6 text-center text-sm text-[#6e929b]">아직 글이 없어요. 첫 바다 이야기를 남겨보세요.</div>';
  visible.forEach((post) => subscribePostDetails(post.id));
  postList.querySelectorAll('.likeButton').forEach((button) => button.onclick = toggleLike);
  postList.querySelectorAll('.commentForm').forEach((form) => form.onsubmit = submitComment);
}
async function toggleLike(event) {
  const postId = event.currentTarget.dataset.postId;
  const likeRef = doc(db, 'community_posts', postId, 'likes', visitorId);
  try {
    const saved = await getDoc(likeRef);
    if (saved.exists()) await deleteDoc(likeRef);
    else await setDoc(likeRef, { createdAt: serverTimestamp() });
  } catch (error) { console.error('Like update failed:', error); }
}
async function submitComment(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector('input');
  const body = input.value.trim();
  if (!body) return;
  const button = form.querySelector('button');
  button.disabled = true;
  try {
    await addDoc(collection(db, 'community_posts', form.dataset.postId, 'comments'), { body, author: getAuthor(), createdAt: serverTimestamp() });
    input.value = '';
  } catch (error) { console.error('Comment submit failed:', error); }
  finally { button.disabled = false; }
}
function showMessage(text, isError = true) {
  let status = document.getElementById('communityStatus');
  if (!status) { status = document.createElement('p'); status.id = 'communityStatus'; status.className = 'text-sm mt-3 font-bold'; postForm.appendChild(status); }
  status.className = `text-sm mt-3 font-bold ${isError ? 'text-red-500' : 'text-[#55aebc]'}`;
  status.textContent = text;
}
const feed = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'), limit(100));
onSnapshot(feed, (snapshot) => { posts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((post) => post.title && post.body); render(); }, (error) => {
  console.error('Community subscription failed:', error);
  postList.innerHTML = '<div class="cloud p-6 text-center text-sm text-red-500">커뮤니티 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.</div>';
});
document.querySelectorAll('.communityFilter').forEach((button) => button.onclick = () => {
  document.querySelectorAll('.communityFilter').forEach((item) => item.classList.remove('active'));
  button.classList.add('active'); activeFilter = button.dataset.filter || 'all'; render();
});
document.getElementById('openModal').onclick = () => { document.getElementById('communityStatus')?.remove(); modal.classList.remove('hidden'); };
document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
postForm.onsubmit = async (event) => {
  event.preventDefault();
  const title = document.getElementById('postTitle').value.trim();
  const body = document.getElementById('postBody').value.trim();
  const post_type = document.getElementById('postType').value;
  if (!title || !body) return showMessage('제목과 내용을 모두 입력해 주세요.');
  try {
    await addDoc(collection(db, 'community_posts'), { title, body, post_type, author: getAuthor(), createdAt: serverTimestamp() });
    postForm.reset(); modal.classList.add('hidden');
  } catch (error) { console.error('Community post failed:', error); showMessage('글을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.'); }
};
