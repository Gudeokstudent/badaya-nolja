(() => {
  const regions={광안리:'Gwangalli',해운대:'Haeundae',송정:'Songjeong',다대포:'Dadaepo',송도:'Songdo',일광:'Ilgwang',임랑:'Imrang'};
  const words={홈:'Home',지도:'Map',커뮤니티:'Community',추천:'Recommend',마이:'My',맛집:'Restaurants',숙박:'Hotels',활동:'Activities',전체:'All',글쓰기:'Write post',화장실:'Restroom',주차장:'Parking',휴지통:'Trash bin',인구밀집:'Crowding',인구밀집도:'Crowding',지도:'Map',스카이뷰:'Sky view',평점순:'By rating','5분 자동 갱신':'Auto-refresh every 5 min', '나는 지금':'I am at', '바다다!':' beach!','NAVER RANKING':'NAVER RANKING','이 바다의 TOP 3':'TOP 3 for this beach','선호 테마 선택':'Choose travel preferences'};
  const translate=(text,lang)=>lang==='en'?(regions[text]||words[text]||text):text;
  const run=()=>{
    const lang=localStorage.getItem('badayaLang')||'ko'; if(lang!=='en') return;
    document.querySelectorAll('select').forEach(select=>{[...select.options].forEach(o=>{o.textContent=translate(o.value||o.textContent.trim(),lang)});});
    document.querySelectorAll('button,nav span,label,h1,h2,h3,p,small,span,a').forEach(el=>{if(el.children.length===0){const s=el.textContent.trim();if(words[s])el.textContent=words[s];else if(regions[s])el.textContent=regions[s];}});
    document.querySelectorAll('input,textarea').forEach(el=>{if(words[el.placeholder?.trim()])el.placeholder=words[el.placeholder.trim()];});
    document.querySelectorAll('.overlay-label,.facility-label,.place-label').forEach(el=>{let s=el.textContent;Object.entries(regions).forEach(([ko,en])=>s=s.replaceAll(ko,en));el.textContent=s;});
    const replacements={'광안리 현재 날씨':'Gwangalli current weather','현재 해변 날씨':'Current beach weather','습도':'Humidity','바람':'Wind','기온':'Temperature','현재 대체로 맑음':'Mostly clear now','강수확률':'Precipitation chance','이 바다의 TOP 3':'TOP 3 for this beach','네이버 검색':'Naver search','전화':'Phone','리뷰':'Reviews','맛집':'Restaurants','숙박':'Hotels','활동':'Activities','지금':'Now'};
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(node=>{let s=node.nodeValue;if(!s||s.includes('바다야 놀자'))return;Object.entries(regions).forEach(([ko,en])=>s=s.replaceAll(ko,en));Object.entries(replacements).forEach(([ko,en])=>s=s.replaceAll(ko,en));node.nodeValue=s;});
  };
  window.addEventListener('badaya-language-change',run); document.addEventListener('change',e=>{if(e.target.id==='myLanguage'){localStorage.setItem('badayaLang',e.target.value);run();}}); document.addEventListener('DOMContentLoaded',()=>{run();setInterval(run,700);});
})();
