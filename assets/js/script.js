// measure header height so the slide-in panel always starts right below it
function syncHeaderHeight(){
  const h=document.querySelector('header.site-nav').offsetHeight;
  document.documentElement.style.setProperty('--header-h', h+'px');
}
syncHeaderHeight();
window.addEventListener('resize', syncHeaderHeight);
window.addEventListener('load', syncHeaderHeight);

// hamburger menu (slide-in panel with the full link list)
const menuBtn=document.getElementById('menuBtn'), navLinks=document.getElementById('navLinks');
menuBtn.addEventListener('click',()=>{
  const isOpen=navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  navLinks.classList.remove('open');
  menuBtn.setAttribute('aria-expanded','false');
}));

// scroll-spy: active nav link + theme swap
const sections=[
  {id:'timeline',theme:'theme-academic'},
  {id:'journey',theme:'theme-academic'},
  {id:'academics',theme:'theme-academic'},
  {id:'sannyas',theme:'theme-spirit'},
  {id:'creations',theme:'theme-create'},
  {id:'books',theme:'theme-create'},
  {id:'blogs',theme:'theme-create'},
  {id:'note',theme:'theme-academic'},
  {id:'disclosure',theme:'theme-academic'}
];
const navAnchors=[...document.querySelectorAll('nav.links a, nav.links-inline a')];
const observer=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const id=entry.target.id;
      const conf=sections.find(s=>s.id===id);
      if(conf){
        document.body.className=conf.theme;
      }
      navAnchors.forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+id));
    }
  });
},{rootMargin:'-45% 0px -50% 0px'});
sections.forEach(s=>{
  const el=document.getElementById(s.id);
  if(el) observer.observe(el);
});

// gallery manual/auto scroll (each gallery strip scrolls right-to-left when in auto mode)
const galleryTimers={};
function setGalleryMode(targetId, mode, btnEl){
  const gallery=document.getElementById(targetId);
  if(!gallery) return;
  const wrap=btnEl.closest('.gallery-controls');
  wrap.querySelectorAll('.gctrl').forEach(b=>b.classList.remove('active'));
  btnEl.classList.add('active');

  if(galleryTimers[targetId]){ clearInterval(galleryTimers[targetId]); delete galleryTimers[targetId]; }

  if(mode==='auto'){
    gallery.scrollLeft = gallery.scrollWidth; // start from the right edge, scroll toward the left
    galleryTimers[targetId]=setInterval(()=>{
      gallery.scrollLeft -= 1.5;
      if(gallery.scrollLeft <= 0) gallery.scrollLeft = gallery.scrollWidth;
    },30);
  }
}

// text-only modal, for entries that don't have a file attached yet
const readerPlaceholderHTML = document.getElementById('readerBody').innerHTML;
function openReader(title){
  document.getElementById('readerTitle').textContent=title;
  document.getElementById('readerBody').innerHTML=readerPlaceholderHTML;
  document.getElementById('readerOverlay').classList.add('open');
}
// abstract modal — pulls the verbatim text from a hidden element on the page
function openAbstractFromEl(title, elId){
  const src=document.getElementById(elId);
  document.getElementById('readerTitle').textContent=title;
  document.getElementById('readerBody').innerHTML='<p style="max-width:66ch;color:var(--ink-soft);line-height:1.75;">'+src.innerHTML+'</p>';
  document.getElementById('readerOverlay').classList.add('open');
}
function closeReader(){
  document.getElementById('readerOverlay').classList.remove('open');
}
document.getElementById('readerOverlay').addEventListener('click',e=>{
  if(e.target.id==='readerOverlay') closeReader();
});

// in-page document reader — expands directly beneath the card, right in the webpage,
// no modal and no new tab. Re-usable for any doc-card once a real file is attached.
function toggleInlineReader(btn, title, fileUrl){
  const card=btn.closest('.doc-card');
  let panel=card.nextElementSibling;

  if(panel && panel.classList.contains('inline-reader') && panel.dataset.for===fileUrl){
    const nowOpen=panel.classList.toggle('open');
    btn.textContent = nowOpen ? 'Hide paper' : 'Read full paper';
    if(nowOpen){
      closeOtherInlineReaders(panel);
      panel.scrollIntoView({behavior:'smooth', block:'nearest'});
    }
    return;
  }
  if(panel && panel.classList.contains('inline-reader')) panel.remove();

  closeOtherInlineReaders(null);

  panel=document.createElement('div');
  panel.className='inline-reader open';
  panel.dataset.for=fileUrl;
  panel._triggerBtn=btn;

  const head=document.createElement('div');
  head.className='inline-reader-head';
  const label=document.createElement('span');
  label.textContent=title;
  const closeBtn=document.createElement('button');
  closeBtn.className='reader-close';
  closeBtn.setAttribute('aria-label','Close reader');
  closeBtn.textContent='×';
  closeBtn.addEventListener('click',()=>{
    panel.classList.remove('open');
    btn.textContent='Read full paper';
  });
  head.appendChild(label);
  head.appendChild(closeBtn);

  const body=document.createElement('div');
  body.className='inline-reader-body';
  body.innerHTML='<iframe src="'+fileUrl+'" title="'+title+'"></iframe>'
    +'<div class="inline-reader-hint">Reading directly on this page. If the paper doesn\'t appear above, make sure <strong>'+fileUrl+'</strong> is saved in the same folder as this page, in Chrome, Firefox, or Edge.</div>';

  panel.appendChild(head);
  panel.appendChild(body);
  card.insertAdjacentElement('afterend', panel);
  btn.textContent='Hide paper';
  panel.scrollIntoView({behavior:'smooth', block:'nearest'});
}

// keeps only one paper expanded at a time, so the page never ends up with
// several PDFs stacked open at once (confusing, and looks "broken")
function closeOtherInlineReaders(exceptPanel){
  document.querySelectorAll('.inline-reader.open').forEach(p=>{
    if(p===exceptPanel) return;
    p.classList.remove('open');
    if(p._triggerBtn) p._triggerBtn.textContent='Read full paper';
  });
}
