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

  // ---- media: full channel view (about + playlists) rendering + inline playback ----
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
      html += '<span class="channel-full-count">' + playlists.length + ' playlists · ' + totalVideos + ' videos</span>';
      html += '</div>';
      if (info.about){
        html += '<p class="channel-about">' + escapeHtml(info.about) + '</p>';
      }
    }
    playlists.forEach(function(pl, pi){
      html += '<details class="playlist"><summary><span class="pl-title">' + escapeHtml(pl.title) + '</span><span class="pl-count">' + pl.videos.length + ' video' + (pl.videos.length===1?'':'s') + '</span><span class="pl-chev">›</span></summary>';
      html += '<ul class="video-list" data-playlist="' + pi + '"></ul></details>';
    });
    container.innerHTML = html || '<p class="placeholder-note">[CONTENT NEEDED]</p>';
    container.dataset.rendered = '1';

    // lazily render each playlist's videos the first time it's opened
    container.querySelectorAll('.playlist').forEach(function(det, pi){
      det.addEventListener('toggle', function(){
        if (!det.open) return;
        var ul = det.querySelector('.video-list');
        if (ul.dataset.rendered) return;
        ul.dataset.rendered = '1';
        var videos = playlists[pi].videos;
        var items = videos.map(function(v){
          var thumb = 'https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg';
          var ytUrl = 'https://www.youtube.com/watch?v=' + v.id;
          return '' +
            '<li class="video-row">' +
              '<div class="video-row-main" data-play="' + v.id + '">' +
                '<img class="video-thumb" src="' + thumb + '" alt="" loading="lazy">' +
                '<div class="video-info"><span class="vt">' + escapeHtml(v.title || 'Untitled') + '</span><span class="vp">▶ Play on site</span></div>' +
                '<a class="yt-ext-link" href="' + ytUrl + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">YouTube ↗</a>' +
              '</div>' +
              '<div class="video-player" data-slot="' + v.id + '"></div>' +
            '</li>';
        }).join('');
        ul.innerHTML = items;
      });
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

  document.addEventListener('click', function(e){
    var row = e.target.closest('.video-row-main');
    if (!row) return;
    var id = row.getAttribute('data-play');
    var li = row.closest('.video-row');
    var slot = li.querySelector('.video-player');
    var already = slot.classList.contains('open');
    // close any other open player in the same list to keep things tidy
    var list = li.closest('.video-list');
    if (list){
      list.querySelectorAll('.video-player.open').forEach(function(p){
        if (p !== slot){ p.classList.remove('open'); p.innerHTML=''; }
      });
    }
    if (already){
      slot.classList.remove('open'); slot.innerHTML = '';
    } else {
      slot.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
      slot.classList.add('open');
      slot.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }
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
