(function(){
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

  var sections = document.querySelectorAll('main section, .cta-band');
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

  // ---- media: full channel view (about + playlists) rendering, horizontal video flow + modal playback ----
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function renderChannel(key){
    var container = document.getElementById('content-' + key);
    if (!container || container.dataset.rendered) return;
    var info = (typeof CHANNEL_INFO !== 'undefined' && CHANNEL_INFO[key]) || null;
    var playlists = (info && info.playlists) || [];
    var totalVideos = playlists.reduce(function(n,p){ return n + p.videos.length; }, 0);
    var html = '';
    if (info){
      html += '<div class="channel-full-header">';
      html += '<a class="channel-full-yt" href="' + info.url + '" target="_blank" rel="noopener">Visit ' + escapeHtml(info.name) + ' on YouTube ↗</a>';
      html += '<span class="channel-full-count">' + playlists.length + ' playlist' + (playlists.length===1?'':'s') + ' · ' + totalVideos + ' videos</span>';
      html += '</div>';
      if (info.about){
        html += '<p class="channel-about">' + escapeHtml(info.about) + '</p>';
      }
    }
    playlists.forEach(function(pl, pi){
      html += '<details class="playlist"' + (playlists.length === 1 ? ' open' : '') + '><summary><span class="pl-title">' + escapeHtml(pl.title) + '</span><span class="pl-count">' + pl.videos.length + ' video' + (pl.videos.length===1?'':'s') + '</span><span class="pl-chev">›</span></summary>';
      html += '<div class="video-scroll-wrap"><div class="video-scroll" data-playlist="' + pi + '"></div></div></details>';
    });
    container.innerHTML = html || '<p class="placeholder-note">[CONTENT NEEDED]</p>';
    container.dataset.rendered = '1';

    // lazily render each playlist's videos the first time it's opened, then animate them in left-to-right
    container.querySelectorAll('.playlist').forEach(function(det, pi){
      function populate(){
        var scroll = det.querySelector('.video-scroll');
        if (scroll.dataset.rendered) return;
        scroll.dataset.rendered = '1';
        var videos = playlists[pi].videos;
        var cards = videos.map(function(v){
          var thumb = 'https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg';
          var ytUrl = 'https://www.youtube.com/watch?v=' + v.id;
          return '' +
            '<div class="video-card" data-play="' + v.id + '">' +
              '<div class="thumb-wrap">' +
                '<img src="' + thumb + '" alt="" loading="lazy">' +
                '<div class="play-badge"><span class="play-circle"><span class="tri"></span></span></div>' +
              '</div>' +
              '<div class="vcard-body">' +
                '<span class="vcard-title">' + escapeHtml(v.title || 'Untitled') + '</span>' +
                '<a class="vcard-yt" href="' + ytUrl + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">YouTube ↗</a>' +
              '</div>' +
            '</div>';
        }).join('');
        scroll.innerHTML = cards;
        // staggered left-to-right entrance
        var cardEls = scroll.querySelectorAll('.video-card');
        requestAnimationFrame(function(){
          cardEls.forEach(function(card, i){
            setTimeout(function(){ card.classList.add('in'); }, Math.min(i, 14) * 55);
          });
        });
      }
      if (det.hasAttribute('open')) populate();
      det.addEventListener('toggle', function(){ if (det.open) populate(); });
    });
  }

  document.querySelectorAll('.watch-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var key = btn.getAttribute('data-channel');
      var container = document.getElementById('content-' + key);
      if (!container) return;
      var isHidden = container.hasAttribute('hidden');
      if (isHidden){
        renderChannel(key);
        container.removeAttribute('hidden');
        btn.setAttribute('aria-expanded','true');
        btn.childNodes[0].nodeValue = 'Hide details ';
        container.scrollIntoView({behavior:'smooth', block:'nearest'});
      } else {
        container.setAttribute('hidden','');
        btn.setAttribute('aria-expanded','false');
        btn.childNodes[0].nodeValue = 'View more ';
      }
    });
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
      var card = e.target.closest('.video-card');
      if (!card) return;
      var id = card.getAttribute('data-play');
      if (id) openVideo(id);
    });
    backdrop.addEventListener('click', closeVideo);
    closeBtn.addEventListener('click', closeVideo);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeVideo();
    });
  })();

  var burger = document.getElementById('burgerBtn');
  var mmenu = document.getElementById('mobileMenu');
  var mclose = document.getElementById('mobileClose');
  if (burger){
    burger.addEventListener('click', function(){ mmenu.classList.add('open'); });
    mclose.addEventListener('click', function(){ mmenu.classList.remove('open'); });
    mmenu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ mmenu.classList.remove('open'); }); });
  }
})();
