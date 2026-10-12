(function() {
  var game;
  var ui;

  var DateOptions = {hour: 'numeric',
                 minute: 'numeric',
                 second: 'numeric',
                 year: 'numeric',
                 month: 'short',
                 day: 'numeric' };

  var main = function(dendryUI) {
    ui = dendryUI;
    game = ui.game;

    // Add your custom code here.
  };

  var TITLE = "Red Zenit: An Alternate History" + '_' + "Henry Blachman, inspired by Autumn Chen";

  // the url is a link to game.json
  // test url: https://aucchen.github.io/social_democracy_mods/v0.1.json
  // TODO; 
  window.loadMod = function(url) {
      ui.loadGame(url);
  };

  window.showStats = function() {
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('library')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('library');
    }
  };

  window.showMods = function() {
    window.hideOptions();
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('mod_loader')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('mod_loader');
    }
  };
  
  window.showOptions = function() {
      var save_element = document.getElementById('options');
      window.populateOptions();
      save_element.style.display = "block";
      if (!save_element.onclick) {
          save_element.onclick = function(evt) {
              var target = evt.target;
              var save_element = document.getElementById('options');
              if (target == save_element) {
                  window.hideOptions();
              }
          };
      }
  };

  window.hideOptions = function() {
      var save_element = document.getElementById('options');
      save_element.style.display = "none";
  };

  window.disableBg = function() {
      window.dendryUI.disable_bg = true;
      document.body.style.backgroundImage = 'none';
      window.dendryUI.saveSettings();
  };

  window.enableBg = function() {
      window.dendryUI.disable_bg = false;
      window.dendryUI.setBg(window.dendryUI.dendryEngine.state.bg);
      window.dendryUI.saveSettings();
  };

  window.disableAnimate = function() {
      window.dendryUI.animate = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimate = function() {
      window.dendryUI.animate = true;
      window.dendryUI.saveSettings();
  };

  window.disableAnimateBg = function() {
      window.dendryUI.animate_bg = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimateBg = function() {
      window.dendryUI.animate_bg = true;
      window.dendryUI.saveSettings();
  };

  window.disableAudio = function() {
      window.dendryUI.toggle_audio(false);
      window.dendryUI.saveSettings();
  };

  window.enableAudio = function() {
      window.dendryUI.toggle_audio(true);
      window.dendryUI.saveSettings();
  };

  window.enableImages = function() {
      window.dendryUI.show_portraits = true;
      window.dendryUI.saveSettings();
  };

  window.disableImages = function() {
      window.dendryUI.show_portraits = false;
      window.dendryUI.saveSettings();
  };

  window.enableLightMode = function() {
      window.dendryUI.dark_mode = false;
      document.body.classList.remove('dark-mode');
      window.dendryUI.saveSettings();
  };
  window.enableDarkMode = function() {
      window.dendryUI.dark_mode = true;
      document.body.classList.add('dark-mode');
      window.dendryUI.saveSettings();
  };

  // populates the checkboxes in the options view
  window.populateOptions = function() {
    var disable_bg = window.dendryUI.disable_bg;
    var animate = window.dendryUI.animate;
    var disable_audio = window.dendryUI.disable_audio;
    var show_portraits = window.dendryUI.show_portraits;
    if (disable_bg) {
        $('#backgrounds_no')[0].checked = true;
    } else {
        $('#backgrounds_yes')[0].checked = true;
    }
    if (animate) {
        $('#animate_yes')[0].checked = true;
    } else {
        $('#animate_no')[0].checked = true;
    }
    if (disable_audio) {
        $('#audio_no')[0].checked = true;
    } else {
        $('#audio_yes')[0].checked = true;
    }
    if (show_portraits) {
        $('#images_yes')[0].checked = true;
    } else {
        $('#images_no')[0].checked = true;
    }
    if (window.dendryUI.dark_mode) {
        $('#dark_mode')[0].checked = true;
    } else {
        $('#light_mode')[0].checked = true;
    }
  };

  
  // This function allows you to modify the text before it's displayed.
  // E.g. wrapping chat-like messages in spans.
  window.displayText = function(text) {
      return text;
  };

  // This function allows you to do something in response to signals.
  window.handleSignal = function(signal, event, scene_id) {
  };
  
  // This function runs on a new page. Right now, this auto-saves.
  window.onNewPage = function() {
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root' && !window.justLoaded) {
        window.dendryUI.autosave();
    }
    if (window.justLoaded) {
        window.justLoaded = false;
    }
  };

  // Sidebars: on wide screens the left sidebar shows Party/Budget/Movement and the
  // right sidebar shows Politics/Polls/Socio-Economics. On narrow screens the right
  // sidebar is hidden and the left one carries all six tabs. The breakpoint matches
  // the 1200px media query in game.css.
  var RIGHT_TABS = ['status', 'status.polls', 'status.paramilitaries'];
  var wideQuery = window.matchMedia('(min-width: 1201px)');

  var renderStatusScene = function(sceneId, selector) {
      var container = $(selector);
      container.empty();
      var scene = dendryUI.game.scenes[sceneId];
      if (!scene) return;
      dendryUI.dendryEngine._runActions(scene.onArrival);
      var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
      container.append(dendryUI.contentToHTML.convert(displayContent));
  };

  var setActiveButton = function(tabId) {
      var tabButton = document.getElementById(tabId);
      if (!tabButton) return;
      var siblings = tabButton.parentNode.getElementsByClassName('tab_button');
      for (var i = 0; i < siblings.length; i++) {
          siblings[i].className = siblings[i].className.replace(' active', '');
      }
      tabButton.className += ' active';
  };

  // ---- Folketing chart in the Politics tab ----
  // Same party order as the chart shown after elections (election_1928.scene.dry), with
  // the four North Atlantic seats between CD and Radikale. After an election the seats
  // come from that election's result; before the first one they are shared out among
  // parties over the 2% threshold by largest remainder.
  var FOLKETING_ORDER = ['dkp', 'vs', 'sf', 'os', 'a', 'rfb', 'cd', 'b', 'v', 'c', 'kf', 'z'];
  var FOLKETING_SEATS = 175;
  window.selectedParliamentParty = null;

  // insert the North Atlantic seats right after CD, i.e. before Radikale and the right
  var NA_BEFORE = ['b', 'v', 'c', 'kf', 'z'];
  var withNorthAtlantic = function(data) {
      var at = data.length;
      for (var i = 0; i < data.length; i++) {
          if (NA_BEFORE.indexOf(data[i].id) >= 0) { at = i; break; }
      }
      data.splice(at, 0, { id: 'northatlantic', legend: 'northatlantic', name: 'northatlantic', seats: 4 });
      return data;
  };

  var folketingSeats = function() {
      var q = dendryUI.dendryEngine.state.qualities;
      var elected = FOLKETING_ORDER.filter(function(p) { return Number(q[p + '_seats_int']) > 0; });
      if (elected.length > 0) {
          return withNorthAtlantic(elected.map(function(p) {
              return { id: p, legend: p, name: p, seats: Number(q[p + '_seats_int']) };
          }));
      }
      var parties = FOLKETING_ORDER.filter(function(p) {
          if (p == 'z' && !q.z_formed) return false;
          if (p == 'cd' && !q.cd_formed) return false;
          if (p == 'os' && !q.os_formed) return false;
          return Number(q[p + '_r']) >= 2;
      });
      var total = parties.reduce(function(sum, p) { return sum + Number(q[p + '_r']); }, 0);
      var alloc = parties.map(function(p) {
          var exact = total > 0 ? FOLKETING_SEATS * Number(q[p + '_r']) / total : 0;
          return { id: p, seats: Math.floor(exact), remainder: exact - Math.floor(exact) };
      });
      var left = FOLKETING_SEATS - alloc.reduce(function(sum, a) { return sum + a.seats; }, 0);
      alloc.slice().sort(function(x, y) { return y.remainder - x.remainder; })
          .slice(0, left).forEach(function(a) { a.seats += 1; });
      var data = alloc.filter(function(a) { return a.seats > 0; })
          .map(function(a) { return { id: a.id, legend: a.id, name: a.id, seats: a.seats }; });
      return withNorthAtlantic(data);
  };

  var tooltipText = function(el) {
      if (!el) return '';
      var raw = el.getAttribute('data-tooltip') || el.getAttribute('title') || '';
      return raw.replace(/\\n/g, '\n');
  };
  var escapeHtml = function(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  var showPartyDetail = function(root, partyId, seats) {
      var detail = root.querySelector('.party-detail');
      var svg = root.querySelector('.sidebar-parliament');
      if (!detail || !svg) return;
      window.selectedParliamentParty = partyId;
      // highlight the chosen group, fade the rest
      d3.select(svg).selectAll('.seat').attr('opacity', function(d) {
          return (!partyId || d.party.id == partyId) ? 1 : 0.2;
      });
      root.querySelectorAll('.party-row').forEach(function(row) {
          row.classList.toggle('selected', row.getAttribute('data-party') == partyId);
      });
      if (!partyId) return;
      if (partyId == 'northatlantic') {
          detail.innerHTML = '<strong>North Atlantic seats</strong> (' + seats + ' seats)<br>' +
              'Two members each from the Faroe Islands and Greenland, elected separately from the parties of Denmark proper.';
          return;
      }
      var row = root.querySelector('.party-row[data-party="' + partyId + '"]');
      if (!row) {
          detail.innerHTML = '';
          return;
      }
      var label = row.querySelector('.tooltip-text');
      var info = tooltipText(label).split('\n');
      var name = label ? label.textContent : partyId;
      // the relation is everything after the name in the row (a qdisplay, or "This is you!")
      var relation = row.cloneNode(true);
      var cloneLabel = relation.querySelector('.tooltip-text');
      if (cloneLabel) cloneLabel.remove();
      var relationHtml = relation.innerHTML.replace(/^\s*:\s*/, '');
      var html = '<strong>' + escapeHtml(name) + '</strong> (' + seats + (seats == 1 ? ' seat' : ' seats') + ')<br>';
      html += (partyId == 'a' ? '' : 'Relations: ') + relationHtml;
      var body = info.slice(1).join('\n').trim();
      if (body) html += '<div class="party-detail-info">' + escapeHtml(body).replace(/\n/g, '<br>') + '</div>';
      detail.innerHTML = html;
  };

  var drawSidebarParliament = function(root) {
      var svg = root.querySelector('.sidebar-parliament');
      if (!svg || !window.d3 || !d3.parliament) return;
      var width = Math.max(120, root.clientWidth - 4);
      var radius = Math.round(width / 2);
      svg.setAttribute('width', width);
      svg.setAttribute('height', radius + 6);
      var data = folketingSeats();
      var parliament = d3.parliament();
      parliament.width(width).height(radius).innerRadiusCoef(0.4);
      parliament.enter.fromCenter(false).smallToBig(false);
      d3.select(svg).datum(data).call(parliament);

      var group = d3.select(svg).select('.parliament');
      // read the radius from the DOM: d3's select() would overwrite the seat's data
      var firstSeat = group.node() ? group.node().querySelector('.seat') : null;
      var seatR = (firstSeat && Number(firstSeat.getAttribute('r'))) || 3;

      // Hit boxes: every point of the half-circle belongs to the nearest seat (a Voronoi
      // cell), so the gaps between seats are clickable too.
      var seats = group.selectAll('.seat').data().filter(function(d) { return d && d.cartesian; });
      var delaunay = d3.Delaunay.from(seats, function(d) { return d.cartesian.x; }, function(d) { return d.cartesian.y; });
      var voronoi = delaunay.voronoi([-radius - 2, -radius - 2, radius + 2, 2]);
      var clipId = 'folketing-clip-' + (root.id || 'sidebar');
      d3.select(svg).select('#' + clipId).remove();
      d3.select(svg).append('defs').append('clipPath').attr('id', clipId)
          .append('path')
          // the band of seats only: the empty middle of the half-circle is not clickable
          .attr('d', (function() {
              var outer = radius + 2, inner = Math.max(0, radius * 0.4 - seatR * 1.5);
              return 'M' + (-outer) + ',2 A' + outer + ',' + outer + ' 0 0,1 ' + outer + ',2' +
                     ' L' + inner + ',2 A' + inner + ',' + inner + ' 0 0,0 ' + (-inner) + ',2 Z';
          })());
      var onPick = function(e, d) {
          var id = d.party.id;
          showPartyDetail(root, window.selectedParliamentParty == id ? null : id, d.party.seats);
          if (window.selectedParliamentParty == null) {
              root.querySelector('.party-detail').innerHTML = 'Click a party to see its seats and our relations with it.';
          }
      };
      group.append('g').attr('class', 'seat-hitboxes').attr('clip-path', 'url(#' + clipId + ')')
          .selectAll('path').data(seats).enter().append('path')
          .attr('d', function(d, i) { return voronoi.renderCell(i); })
          .attr('fill', 'transparent')
          .style('pointer-events', 'all')
          .style('cursor', 'pointer')
          .on('click', onPick);

      // keep the selection when the sidebar is redrawn after each action
      var selected = window.selectedParliamentParty;
      var still = data.filter(function(p) { return p.id == selected; })[0];
      if (still) showPartyDetail(root, selected, still.seats);
  };

  // ---- Poll bar chart in the Polls tab ----
  // Same left-to-right party order as the Folketing chart.
  var POLL_PARTIES = [
      { id: 'dkp', short: 'DKP', name: 'DKP', color: '#8B0000' },
      { id: 'vs', short: 'VS', name: 'VS', color: '#e26969' },
      { id: 'sf', short: 'SF', name: 'SF', color: '#ee80fa' },
      { id: 'os', short: 'OS', name: 'Oprigtige Socialdemokrater', color: '#e86219', formed: 'os_formed' },
      { id: 'a', short: 'A', name: 'Socialdemokratiet', color: '#E3000F' },
      { id: 'rfb', short: 'RFB', name: 'Retsforbundet', color: '#4e4e94' },
      { id: 'cd', short: 'CD', name: 'Centrum-Demokraterne', color: '#a0a0a0', formed: 'cd_formed' },
      { id: 'b', short: 'B', name: 'Radikale Venstre', color: '#865fac' },
      { id: 'v', short: 'V', name: 'Venstre', color: '#73b0f6' },
      { id: 'c', short: 'C', name: 'Konservative Folkeparti', color: '#0d9340' },
      { id: 'kf', short: 'KF', name: 'Kristeligt Folkeparti', color: '#1f3f96' },
      { id: 'z', short: 'Z', name: 'Fremskridtspartiet', color: '#DCCA4A', formed: 'z_formed' }
  ];

  var drawSidebarPoll = function(root) {
      var svgEl = root.querySelector('.sidebar-poll');
      if (!svgEl || !window.d3) return;
      var q = dendryUI.dendryEngine.state.qualities;
      var data = POLL_PARTIES.filter(function(p) { return !p.formed || q[p.formed]; })
          .map(function(p) {
              var v = Number(q[p.id + '_votesdisp']);
              return { id: p.id, short: p.short, name: p.name, color: p.color, value: Number.isFinite(v) ? v : 0 };
          });
      var width = Math.max(140, root.clientWidth - 4);
      var rowHeight = 20;
      // room on the right for the largest party's percentage ("34.2%" at 11px)
      var margin = { top: 2, right: 44, bottom: 2, left: 32 };
      var height = margin.top + margin.bottom + rowHeight * data.length;
      var svg = d3.select(svgEl).attr('width', width).attr('height', height);
      svg.selectAll('*').remove();

      var y = d3.scaleBand().domain(data.map(function(d) { return d.id; }))
          .range([margin.top, height - margin.bottom]).padding(0.15);
      var maxVal = d3.max(data, function(d) { return d.value; }) || 1;
      var x = d3.scaleLinear().domain([0, maxVal]).range([margin.left, width - margin.right]);

      var rows = svg.selectAll('g.poll-bar').data(data).enter().append('g').attr('class', 'poll-bar');
      // party name to the left of each bar
      rows.append('text').attr('class', 'poll-label')
          .attr('x', margin.left - 4)
          .attr('y', function(d) { return y(d.id) + y.bandwidth() / 2; })
          .attr('dy', '0.35em')
          .attr('text-anchor', 'end')
          .text(function(d) { return d.short; });
      rows.append('rect')
          .attr('x', x(0))
          .attr('y', function(d) { return y(d.id); })
          .attr('height', y.bandwidth())
          .attr('width', function(d) { return Math.max(0, x(d.value) - x(0)); })
          .attr('fill', function(d) { return d.color; });
      // share at the end of each bar
      rows.append('text').attr('class', 'poll-value')
          .attr('x', function(d) { return x(d.value) + 3; })
          .attr('y', function(d) { return y(d.id) + y.bandwidth() / 2; })
          .attr('dy', '0.35em')
          .text(function(d) { return d.value.toFixed(1) + '%'; });
      // hovering a row shows the full name
      rows.append('title').text(function(d) { return d.name + ': ' + d.value.toFixed(1) + '%'; });
      // baseline
      svg.append('line').attr('class', 'poll-axis')
          .attr('x1', x(0)).attr('x2', x(0))
          .attr('y1', margin.top).attr('y2', height - margin.bottom);
  };

  window.updateSidebar = function() {
      // a right-hand tab chosen on a narrow screen moves back to Party when the screen widens
      if (wideQuery.matches && RIGHT_TABS.indexOf(window.statusTab) >= 0) {
          window.statusTab = 'status.politics';
          setActiveButton('politics_tab');
      }
      renderStatusScene(window.statusTab, '#qualities');
      if (wideQuery.matches) {
          renderStatusScene(window.statusTabRight, '#qualities_right');
      } else {
          $('#qualities_right').empty();
      }
      ['#qualities', '#qualities_right'].forEach(function(sel) {
          var root = document.querySelector(sel);
          if (root) {
              drawSidebarParliament(root);
              drawSidebarPoll(root);
          }
      });
  };

  window.changeTab = function(newTab, tabId, side) {
      if (tabId.indexOf('poll_tab') == 0 && dendryUI.dendryEngine.state.qualities.historical_mode) {
          window.alert('Polls are not available in historical mode.');
          return;
      }
      setActiveButton(tabId);
      if (side == 'right') {
          window.statusTabRight = newTab;
      } else {
          window.statusTab = newTab;
      }
      window.updateSidebar();
  };

  var onWidthChange = function() {
      if (window.gameEntered && window.gameEntered()) {
          window.updateSidebar();
      }
  };
  if (wideQuery.addEventListener) {
      wideQuery.addEventListener('change', onWidthChange);
  } else if (wideQuery.addListener) {
      wideQuery.addListener(onWidthChange);
  }

  // true once the player has picked a difficulty (older saves: once the first month has passed)
  window.gameEntered = function() {
      var q = dendryUI.dendryEngine.state.qualities;
      return !!(q.started && (q.game_entered || q.time > 1));
  };

  window.updateHeaderBar = function() {
      var el = document.getElementById('header_bar');
      var scene = dendryUI.game.scenes['status.header_bar'];
      if (!el || !scene) {
          return;
      }
      // hidden on the menus and the intro, until a difficulty is chosen
      el.hidden = !window.gameEntered();
      if (el.hidden) {
          return;
      }
      dendryUI.dendryEngine._runActions(scene.onArrival);
      var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
      el.innerHTML = dendryUI.contentToHTML.convert(displayContent);
      window.bindBudgetPopup();
  };

  // The budget appears when hovering (or tapping) "Resources" in the status bar.
  var hideBudgetPopup = function() {
      var popup = document.getElementById('budget_popup');
      if (popup) popup.hidden = true;
  };
  var showBudgetPopup = function(target) {
      var popup = document.getElementById('budget_popup');
      if (!popup) return;
      renderStatusScene('status.budget', '#budget_popup');
      popup.hidden = false;
      var rect = target.getBoundingClientRect();
      var left = Math.max(8, Math.min(rect.left, window.innerWidth - popup.offsetWidth - 8));
      popup.style.left = left + 'px';
      popup.style.top = (rect.bottom + 6) + 'px';
  };
  window.bindBudgetPopup = function() {
      var target = document.getElementById('resources_hover');
      if (!target) return;
      target.addEventListener('mouseenter', function() { showBudgetPopup(target); });
      target.addEventListener('mouseleave', hideBudgetPopup);
      target.addEventListener('focus', function() { showBudgetPopup(target); });
      target.addEventListener('blur', hideBudgetPopup);
      target.addEventListener('click', function(e) {
          e.stopPropagation();
          var popup = document.getElementById('budget_popup');
          if (popup && popup.hidden) { showBudgetPopup(target); } else { hideBudgetPopup(); }
      });
  };
  document.addEventListener('click', hideBudgetPopup);
  window.addEventListener('scroll', hideBudgetPopup);

  window.onDisplayContent = function() {
      // the sidebar only appears once a difficulty has been chosen
      var started = window.gameEntered();
      var tools = document.getElementById('tools_wrapper');
      if (tools) {
          tools.hidden = !started;
      }
      if (started) {
          window.updateSidebar();
      }
      window.updateHeaderBar();
  };

  /*
   * This function copied from the code for Infinite Space Battle Simulator
   *
   * quality - a number between max and min
   * qualityName - the name of the quality
   * max and min - numbers
   * colors - if true/1, will use some color scheme - green to yellow to red for high to low
   * */
  window.generateBar = function(quality, qualityName, max, min, colors) {
      var bar = document.createElement('div');
      bar.className = 'bar';
      var value = document.createElement('div');
      value.className = 'barValue';
      var width = (quality - min)/(max - min);
      if (width > 1) {
          width = 1;
      } else if (width < 0) {
          width = 0;
      }
      value.style.width = Math.round(width*100) + '%';
      if (colors) {
          value.style.backgroundColor = window.probToColor(width*100);
      }
      bar.textContent = qualityName + ': ' + quality;
      if (colors) {
          bar.textContent += '/' + max;
      }
      bar.appendChild(value);
      return bar;
  };


  window.justLoaded = true;
  window.statusTab = "status.politics";
  window.statusTabRight = "status";
  window.dendryModifyUI = main;
  console.log("Modifying stats: see dendryUI.dendryEngine.state.qualities");

  // --- Click sound effects ---
  var _clickCtx = null;
  function _getClickCtx() {
      if (!_clickCtx) {
          _clickCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return _clickCtx;
  }

  function playClickSound(isChoice) {
      if (window.dendryUI && window.dendryUI.disable_audio) return;
      try {
          var ctx = _getClickCtx();
          var now = ctx.currentTime;

          // Variation: gain and filter resonance only — pitch stays fixed
          var gainVar = 0.88 + Math.random() * 0.24;
          var qVar    = 1.8 + Math.random() * 2.5;

          // --- Initial snap: very short broadband burst for the sharp transient ---
          var snapDur = 0.009;
          var snapBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * snapDur), ctx.sampleRate);
          var snapData = snapBuf.getChannelData(0);
          for (var i = 0; i < snapData.length; i++) snapData[i] = Math.random() * 2 - 1;
          var snapSrc = ctx.createBufferSource();
          snapSrc.buffer = snapBuf;
          var snapGain = ctx.createGain();
          snapGain.gain.setValueAtTime((isChoice ? 0.55 : 0.40) * gainVar, now);
          snapGain.gain.exponentialRampToValueAtTime(0.001, now + snapDur);
          snapSrc.connect(snapGain);
          snapGain.connect(ctx.destination);
          snapSrc.start(now);
          snapSrc.stop(now + snapDur + 0.002);

          // --- Filtered noise body: analogue texture after the snap ---
          var noiseDur = isChoice ? 0.055 : 0.038;
          var noiseBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * noiseDur), ctx.sampleRate);
          var noiseData = noiseBuf.getChannelData(0);
          for (var i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1;
          var noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noiseBuf;
          var bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = isChoice ? 1100 : 1900;
          bp.Q.value = qVar;
          var noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime((isChoice ? 0.52 : 0.40) * gainVar, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDur);
          noiseSrc.connect(bp);
          bp.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noiseSrc.start(now);
          noiseSrc.stop(now + noiseDur + 0.01);

          // --- Low thud: weight beneath the click, fixed pitch ---
          var osc = ctx.createOscillator();
          osc.type = 'triangle';
          var thudDur = isChoice ? 0.13 : 0.08;
          osc.frequency.setValueAtTime(isChoice ? 210 : 310, now);
          osc.frequency.exponentialRampToValueAtTime(isChoice ? 75 : 130, now + thudDur);
          var oscGain = ctx.createGain();
          oscGain.gain.setValueAtTime((isChoice ? 0.38 : 0.26) * gainVar, now);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + thudDur);
          osc.connect(oscGain);
          oscGain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + thudDur + 0.01);

      } catch(e) {}
  }

  document.addEventListener('click', function(e) {
      var target = e.target;
      // Choice links inside the story content get the heavier sound
      var inContent = target.closest && target.closest('#content');
      if (inContent) {
          if (target.tagName === 'A' || target.closest('a')) {
              playClickSound(true);
              return;
          }
      }
      // Everything else: tab buttons, header links, save/load, etc.
      if (target.tagName === 'A' || target.tagName === 'BUTTON' ||
          (target.closest && (target.closest('a') || target.closest('button')))) {
          playClickSound(false);
      }
  }, true);
  // --- End click sounds ---

  window.onload = function() {
    window.dendryUI.loadSettings({show_portraits: true});
    if (window.dendryUI.dark_mode) {
        document.body.classList.add('dark-mode');
    }
    window.pinnedCardsDescription = "Advisor cards - actions are only usable once per 6 months.";
  };

}());
(function () {
  function upgrade(el) {
    const raw = el.getAttribute("title");
    if (raw == null) return;

    // turn literal "\n" into real newlines
    const text = String(raw).replace(/\\n/g, "\n");

    el.setAttribute("data-tooltip", text);
    el.removeAttribute("title"); // stop native tooltip
  }

  // Upgrade on hover/focus (works for dynamically added content)
  document.addEventListener("mouseover", (e) => {
    const el = e.target && e.target.closest ? e.target.closest(".tooltip-text[title]") : null;
    if (el) upgrade(el);
  }, true);

  document.addEventListener("focusin", (e) => {
    const el = e.target && e.target.closest ? e.target.closest(".tooltip-text[title]") : null;
    if (el) upgrade(el);
  }, true);
})();
