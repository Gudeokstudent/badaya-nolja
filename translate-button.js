(() => {
  const add=()=>{
    document.getElementById('myLanguage')?.remove();
    const label=document.getElementById('myLanguageLabel'); if(label) label.textContent='지역';
    const header=document.querySelector('header'); if(!header||document.getElementById('translateButton'))return;
    const button=document.createElement('button');button.id='translateButton';button.type='button';button.className='pill px-3 py-2 text-xs font-bold';button.textContent='🌐 Translate';
    button.onclick=()=>{const box=document.getElementById('google_translate_element');if(box)box.classList.toggle('translate-open');};
    header.appendChild(button);
    const box=document.createElement('div');box.id='google_translate_element';box.className='translate-box';document.body.appendChild(box);
    const style=document.createElement('style');style.textContent='.translate-box{display:none;position:fixed;right:16px;top:64px;z-index:80;padding:10px;background:#fff;border:1px solid #a8e4ec;border-radius:14px;box-shadow:0 8px 25px #21455333}.translate-box.translate-open{display:block}.goog-te-gadget{font:12px system-ui!important}.goog-te-gadget select{border:1px solid #a8e4ec;border-radius:10px;padding:6px}';document.head.appendChild(style);
    window.googleTranslateElementInit=()=>new google.translate.TranslateElement({pageLanguage:'ko',includedLanguages:'en,ja,zh-CN,ko',autoDisplay:false},'google_translate_element');
    const script=document.createElement('script');script.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';document.head.appendChild(script);
  };
  document.addEventListener('DOMContentLoaded',()=>{add();new MutationObserver(add).observe(document.body,{childList:true,subtree:true});});
})();
