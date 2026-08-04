(() => {
  const show=()=>{const app=document.querySelector('.app');const gate=document.getElementById('authGate');if(app){app.style.visibility='visible';app.style.display='block';}if(gate){gate.style.display='flex';gate.style.visibility='visible';}document.body.style.overflow='auto';document.documentElement.style.overflow='auto';};
  document.addEventListener('DOMContentLoaded',()=>{setTimeout(show,3500);});
})();
