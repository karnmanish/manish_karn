(function(){
  // ---- basic content-protection deterrents ----
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  document.addEventListener('dragstart', function(e){
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });
  document.addEventListener('keydown', function(e){
    var k = e.key ? e.key.toLowerCase() : '';
    if ((e.ctrlKey || e.metaKey) && ['s','u','p'].indexOf(k) !== -1){ e.preventDefault(); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i','j','c'].indexOf(k) !== -1){ e.preventDefault(); }
    if (k === 'f12'){ e.preventDefault(); }
  });

  // ---- explore/banner-board: auto + manual thumbnail scrolling ----
  (function(){
    var wrap = document.getElementById('ebTrackWrap');
    var track = document.getElementById('ebBoardTrack');
    var dotsWrap = document.getElementById('ebDots');
    var prevBtn = document.getElementById('ebPrev');
    var nextBtn = document.getElementById('ebNext');
    if (!wrap || !track) return;
    var slides = track.querySelectorAll('.eb-board-slide');
    if (!slides.length) return;

    slides.forEach(function(_, i){
      var dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', function(){ goTo(i); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll('span');
    var current = 0;

    function goTo(i){
      current = ((i % slides.length) + slides.length) % slides.length;
      wrap.scrollTo({ left: slides[current].offsetLeft, behavior: 'smooth' });
      dots.forEach(function(d,di){ d.classList.toggle('active', di === current); });
    }
    prevBtn.addEventListener('click', function(){ goTo(current - 1); });
    nextBtn.addEventListener('click', function(){ goTo(current + 1); });

    // keep dots in sync if the person manually drags/scrolls the track
    var scrollTimer;
    wrap.addEventListener('scroll', function(){
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function(){
        var closest = 0, closestDist = Infinity;
        slides.forEach(function(s, i){
          var dist = Math.abs(s.offsetLeft - wrap.scrollLeft);
          if (dist < closestDist){ closestDist = dist; closest = i; }
        });
        current = closest;
        dots.forEach(function(d,di){ d.classList.toggle('active', di === current); });
      }, 120);
    });

    // auto-advance
    var autoTimer = setInterval(function(){ goTo(current + 1); }, 5000);
    wrap.addEventListener('mouseenter', function(){ clearInterval(autoTimer); });
    wrap.addEventListener('mouseleave', function(){ autoTimer = setInterval(function(){ goTo(current + 1); }, 5000); });
  })();

  // ---- top banner: auto-rotate if more than one slide is present ----
  (function(){
    var banner = document.getElementById('siteBanner');
    var track = document.getElementById('bannerTrack');
    var dotsWrap = document.getElementById('bannerDots');
    if (!banner || !track) return;
    var slides = track.querySelectorAll('.banner-slide');
    if (slides.length <= 1) return; // nothing to rotate yet
    banner.classList.add('multi');
    slides.forEach(function(s, i){
      var dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', function(){ show(i); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll('span');
    var current = 0;
    function show(i){
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = i;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }
    setInterval(function(){ show((current + 1) % slides.length); }, 5500);
  })();

  document.getElementById('footYear').textContent = '© ' + new Date().getFullYear();

  var timeEl = document.getElementById('localTime');
  function updateTime(){
    try{
      var fmt = new Intl.DateTimeFormat('en-US', {hour:'2-digit', minute:'2-digit', hour12:false, timeZone:'Asia/Kathmandu'});
      timeEl.textContent = 'Kathmandu · ' + fmt.format(new Date()) + ' NPT';
    }catch(e){ timeEl.textContent = 'Kathmandu, Nepal'; }
  }
  updateTime(); setInterval(updateTime, 30000);

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, {threshold:0.15});
    reveals.forEach(function(el){ io.observe(el); });
  } else { reveals.forEach(function(el){ el.classList.add('is-visible'); }); }

  var counters = document.querySelectorAll('[data-count]');
  var done = false;
  function runCounters(){
    if (done) return; done = true;
    counters.forEach(function(el){
      var target = parseFloat(el.getAttribute('data-count'));
      var dur = 1100, start = null;
      function step(ts){
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.floor(p * target);
        if (p < 1) requestAnimationFrame(step); else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }
  var journey = document.getElementById('journey');
  if ('IntersectionObserver' in window){
    var io2 = new IntersectionObserver(function(entries){ entries.forEach(function(e){ if (e.isIntersecting) runCounters(); }); }, {threshold:0.4});
    io2.observe(journey);
  } else { runCounters(); }

  var sections = document.querySelectorAll('main section, .explore-banner-section');
  var navLinks = document.querySelectorAll('nav.nav-links a');
  if ('IntersectionObserver' in window){
    var io3 = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          var id = e.target.getAttribute('id');
          navLinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + id); });
        }
      });
    }, {threshold:0.5});
    sections.forEach(function(s){ if (s.id) io3.observe(s); });
  }

  // ---- tree timeline ----
  (function(){
    var wrap = document.getElementById('treeWrap');
    var panel = document.getElementById('tlPanel');
    if (!wrap || !panel) return;
    var leaves = wrap.querySelectorAll('.tl-leaf');

    function activate(leaf){
      leaves.forEach(function(n){ n.classList.remove('active'); n.removeAttribute('aria-selected'); });
      leaf.classList.add('active'); leaf.setAttribute('aria-selected','true');
      var tpl = document.getElementById(leaf.getAttribute('data-target'));
      if (tpl) panel.innerHTML = tpl.innerHTML;
    }
    leaves.forEach(function(n){ n.addEventListener('click', function(){ activate(n); }); });
    var initial = wrap.querySelector('.tl-leaf.active') || leaves[leaves.length-1];
    if (initial){
      var tpl0 = document.getElementById(initial.getAttribute('data-target'));
      if (tpl0) panel.innerHTML = tpl0.innerHTML;
    }

    // stagger each leaf's reveal to roughly match when the tree "grows" past its height
    var growDuration = 3100; // ms, matches the CSS clip-path transition
    leaves.forEach(function(leaf){
      var topPct = parseFloat(leaf.style.top) || 0;
      var delay = Math.round(growDuration * (1 - topPct/100) * 0.9) + 150;
      leaf.style.transitionDelay = delay + 'ms';
    });

    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting){
            wrap.classList.add('grown');
            io.unobserve(wrap);
            setTimeout(function(){
              leaves.forEach(function(leaf){ leaf.style.transitionDelay = ''; });
            }, growDuration + 1400);
          }
        });
      }, {threshold:0.25});
      io.observe(wrap);
    } else {
      wrap.classList.add('grown');
      leaves.forEach(function(leaf){ leaf.style.transitionDelay = ''; });
    }
  })();

  // ---- projects & activities: alternating timeline animation ----
  (function(){
    var wrap = document.getElementById('projTimeline');
    if (!wrap) return;
    var items = wrap.querySelectorAll('.proj-item');
    if ('IntersectionObserver' in window){
      var lineIo = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting){ wrap.classList.add('grown'); lineIo.unobserve(wrap); }
        });
      }, {threshold:0.15});
      lineIo.observe(wrap);

      var itemIo = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting){ e.target.classList.add('in'); itemIo.unobserve(e.target); }
        });
      }, {threshold:0.3});
      items.forEach(function(it){ itemIo.observe(it); });
    } else {
      wrap.classList.add('grown');
      items.forEach(function(it){ it.classList.add('in'); });
    }
  })();

  // ---- nav dropdowns (Manish Karn / Yog M Creations) ----
  (function(){
    var drops = document.querySelectorAll('.nav-drop');
    drops.forEach(function(drop){
      var btn = drop.querySelector('.nav-drop-btn');
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var isOpen = drop.classList.contains('open');
        drops.forEach(function(d){ d.classList.remove('open'); d.querySelector('.nav-drop-btn').setAttribute('aria-expanded','false'); });
        if (!isOpen){ drop.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
      });
    });
    document.addEventListener('click', function(){
      drops.forEach(function(d){ d.classList.remove('open'); d.querySelector('.nav-drop-btn').setAttribute('aria-expanded','false'); });
    });
    document.querySelectorAll('.nav-drop-menu a').forEach(function(a){
      a.addEventListener('click', function(){
        drops.forEach(function(d){ d.classList.remove('open'); });
      });
    });
  })();

  // ---- projects & activities: book-style article reader ----
  (function(){
    var modal = document.getElementById('articleModal');
    var content = document.getElementById('articleModalContent');
    var backdrop = document.getElementById('articleModalBackdrop');
    var closeBtn = document.getElementById('articleModalClose');
    if (!modal || !content) return;

    function openArticle(btn){
      var key = btn.getAttribute('data-proj');
      var tpl = document.getElementById('projmore-' + key);
      var card = btn.closest('.proj-card');
      if (!tpl || !card) return;
      var tag = card.querySelector('.proj-tag') ? card.querySelector('.proj-tag').textContent : '';
      var date = card.querySelector('.proj-date') ? card.querySelector('.proj-date').textContent : '';
      var title = card.querySelector('h3') ? card.querySelector('h3').innerHTML : '';
      if (btn.classList.contains('proj-secondary-btn')){
        tag = btn.textContent.replace('→','').trim().toUpperCase();
      }
      content.innerHTML =
        '<span class="article-tag">' + tag + '</span><span class="article-date">' + date + '</span>' +
        '<h2>' + title + '</h2>' +
        '<div class="article-body">' + tpl.innerHTML + '</div>';
      modal.removeAttribute('hidden');
      modal.querySelector('.article-modal-box').scrollTop = 0;
    }
    function closeArticle(){
      modal.setAttribute('hidden','');
      content.innerHTML = '';
    }
    document.querySelectorAll('.proj-read-btn').forEach(function(btn){
      btn.addEventListener('click', function(){ openArticle(btn); });
    });
    backdrop.addEventListener('click', closeArticle);
    closeBtn.addEventListener('click', closeArticle);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeArticle();
    });
  })();

  // ---- books: View more toggle ----
  document.querySelectorAll('.book-more-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var key = btn.getAttribute('data-book');
      var panel = document.getElementById('bookmore-' + key);
      if (!panel) return;
      var isHidden = panel.hasAttribute('hidden');
      if (isHidden){
        panel.removeAttribute('hidden');
        btn.setAttribute('aria-expanded','true');
        btn.childNodes[0].nodeValue = 'Show less ';
      } else {
        panel.setAttribute('hidden','');
        btn.setAttribute('aria-expanded','false');
        btn.childNodes[0].nodeValue = 'View more ';
      }
    });
  });

  // ---- media: populate each channel's live preview thumbnail from CHANNEL_INFO ----
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  document.querySelectorAll('.channel-preview').forEach(function(link){
    var key = link.getAttribute('data-channel');
    var info = (typeof CHANNEL_INFO !== 'undefined' && CHANNEL_INFO[key]) || null;
    var firstVideo = info && info.playlists && info.playlists[0] && info.playlists[0].videos[0];
    if (!firstVideo) { link.style.display = 'none'; return; }
    var img = link.querySelector('.channel-preview-thumb');
    img.src = 'https://i.ytimg.com/vi/' + firstVideo.id + '/mqdefault.jpg';
    img.alt = firstVideo.title || '';
    link.href = 'https://www.youtube.com/watch?v=' + firstVideo.id;
    link.setAttribute('data-play', firstVideo.id);
  });

  // ---- video modal playback ----
  (function(){
    var modal = document.getElementById('videoModal');
    var player = document.getElementById('videoModalPlayer');
    var backdrop = document.getElementById('videoModalBackdrop');
    var closeBtn = document.getElementById('videoModalClose');
    if (!modal || !player) return;

    function openVideo(id){
      player.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
      modal.removeAttribute('hidden');
    }
    function closeVideo(){
      modal.setAttribute('hidden','');
      player.innerHTML = '';
    }
    document.addEventListener('click', function(e){
      var card = e.target.closest('[data-play]');
      if (!card) return;
      var id = card.getAttribute('data-play');
      if (!id) return;
      e.preventDefault();
      openVideo(id);
    });
    backdrop.addEventListener('click', closeVideo);
    closeBtn.addEventListener('click', closeVideo);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeVideo();
    });
  })();

  // ---- footer: connect icons reveal hidden details ----
  document.querySelectorAll('.connect-icon-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var key = btn.getAttribute('data-connect');
      var detail = document.getElementById('connect-' + key);
      if (!detail) return;
      var isHidden = detail.hasAttribute('hidden');
      if (isHidden){
        detail.removeAttribute('hidden');
        btn.setAttribute('aria-expanded','true');
      } else {
        detail.setAttribute('hidden','');
        btn.setAttribute('aria-expanded','false');
      }
    });
  });

  var burger = document.getElementById('burgerBtn');
  var mmenu = document.getElementById('mobileMenu');
  var mclose = document.getElementById('mobileClose');
  if (burger){
    burger.addEventListener('click', function(){ mmenu.classList.add('open'); });
    mclose.addEventListener('click', function(){ mmenu.classList.remove('open'); });
    mmenu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ mmenu.classList.remove('open'); }); });
  }
})();
