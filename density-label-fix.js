(() => {
  const update=()=>{document.querySelectorAll('body *').forEach(el=>{if(el.children.length===0&&el.textContent.includes('5분 자동 갱신'))el.textContent=el.textContent.replaceAll('5분 자동 갱신','한 달마다 갱신');});};
  document.addEventListener('DOMContentLoaded',()=>{update();setInterval(update,700);});
})();
