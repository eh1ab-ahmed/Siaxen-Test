// ──────────────────────────────────────
// Siaxen Animated Background Grid
// ──────────────────────────────────────
(function(){
  var c = document.getElementById('bgGrid');
  if(!c) return;
  var ctx = c.getContext('2d');
  var sp = 80;
  var headerH = 60;
  var traces = [];
  var pageH = 0;

  function resize(){
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    pageH = getPageHeight();
    if(traces.length === 0) buildTraces();
  }

  function getPageHeight(){
    return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, window.innerHeight);
  }

  function shuffle(a){
    for(var i=a.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1));
      var t=a[i];a[i]=a[j];a[j]=t;
    }
    return a;
  }

  // Build traces: for each "screen chunk" of the page, place 3H + 2V
  function buildTraces(){
    traces = [];
    var W = c.width, H = c.height;
    pageH = getPageHeight();
    var numChunks = Math.max(1, Math.ceil(pageH / H));

    for(var chunk = 0; chunk < numChunks; chunk++){
      var chunkTop = chunk * H;
      var chunkBot = chunkTop + H;

      // All horizontal grid lines in this chunk
      var hLines = [];
      for(var y = headerH + sp; y < pageH; y += sp){
        if(y >= chunkTop && y < chunkBot) hLines.push(y);
      }
      shuffle(hLines);

      // Pick 3 well-spaced horizontal lines per chunk
      var pickedH = [];
      for(var i = 0; i < hLines.length && pickedH.length < 3; i++){
        var ok = true;
        for(var j = 0; j < pickedH.length; j++){
          if(Math.abs(hLines[i] - pickedH[j]) < sp * 3){ ok = false; break; }
        }
        if(ok) pickedH.push(hLines[i]);
      }

      for(var i = 0; i < pickedH.length; i++){
        var goRight = Math.random() > 0.5;
        traces.push({
          type:'h', line: pickedH[i],
          pos: Math.random() * W,
          dir: goRight ? 1 : -1,
          speed: 0.3 + Math.random() * 0.9,
          len: 120 + Math.random() * 200,
          op: 0.22 + Math.random() * 0.12
        });
      }

      // All vertical grid lines
      var vLines = [];
      for(var x = sp; x < W; x += sp) vLines.push(x);
      shuffle(vLines);

      // Pick 2 well-spaced vertical lines per chunk
      var pickedV = [];
      for(var i = 0; i < vLines.length && pickedV.length < 2; i++){
        var ok = true;
        for(var j = 0; j < pickedV.length; j++){
          if(Math.abs(vLines[i] - pickedV[j]) < sp * 3){ ok = false; break; }
        }
        if(ok) pickedV.push(vLines[i]);
      }

      for(var i = 0; i < pickedV.length; i++){
        traces.push({
          type:'v', line: pickedV[i],
          pos: chunkTop + Math.random() * H,
          dir: -1,
          speed: 0.2 + Math.random() * 0.7,
          len: 120 + Math.random() * 200,
          op: 0.22 + Math.random() * 0.12
        });
      }
    }
  }

  function newHTrace(){
    var W = c.width;
    // Pick any H grid line across full page, not too close to others
    var allY = [];
    for(var y = headerH + sp; y < pageH; y += sp) allY.push(y);
    shuffle(allY);
    var picked = -1;
    for(var i = 0; i < allY.length; i++){
      var ok = true;
      for(var j = 0; j < traces.length; j++){
        if(traces[j] && traces[j].type === 'h' && Math.abs(traces[j].line - allY[i]) < sp * 3){
          ok = false; break;
        }
      }
      if(ok){ picked = allY[i]; break; }
    }
    if(picked === -1) return null;

    var goRight = Math.random() > 0.5;
    return {
      type:'h', line: picked,
      pos: goRight ? -(100 + Math.random() * 300) : W + 100 + Math.random() * 300,
      dir: goRight ? 1 : -1,
      speed: 0.3 + Math.random() * 0.9,
      len: 120 + Math.random() * 200,
      op: 0.22 + Math.random() * 0.12
    };
  }

  function newVTrace(){
    var allX = [];
    for(var x = sp; x < c.width; x += sp) allX.push(x);
    shuffle(allX);
    var picked = -1;
    for(var i = 0; i < allX.length; i++){
      var ok = true;
      for(var j = 0; j < traces.length; j++){
        if(traces[j] && traces[j].type === 'v' && Math.abs(traces[j].line - allX[i]) < sp * 3){
          ok = false; break;
        }
      }
      if(ok){ picked = allX[i]; break; }
    }
    if(picked === -1) return null;

    return {
      type:'v', line: picked,
      pos: pageH + 100 + Math.random() * 300,
      dir: -1,
      speed: 0.2 + Math.random() * 0.7,
      len: 120 + Math.random() * 200,
      op: 0.22 + Math.random() * 0.12
    };
  }

  resize();
  window.addEventListener('resize', resize);

  function animate(){
    ctx.clearRect(0, 0, c.width, c.height);
    var W = c.width, H = c.height;
    var scrollY = window.scrollY || window.pageYOffset;

    // ── Static grid (visible portion) ──
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(58,124,165,0.055)';

    for(var y = headerH + sp; y < pageH; y += sp){
      var screenY = y - scrollY;
      if(screenY < headerH) continue;
      if(screenY > H) break;
      ctx.beginPath(); ctx.moveTo(0, screenY); ctx.lineTo(W, screenY); ctx.stroke();
    }
    for(var x = sp; x <= W; x += sp){
      ctx.beginPath(); ctx.moveTo(x, Math.max(headerH, 0)); ctx.lineTo(x, H); ctx.stroke();
    }

    // ── Traces ──
    for(var i = 0; i < traces.length; i++){
      var t = traces[i];
      if(!t) continue;
      t.pos += t.speed * t.dir;

      var head = t.pos;
      var tail = head - t.len * t.dir;

      if(t.type === 'h'){
        var screenY = t.line - scrollY;
        if(screenY > headerH - 10 && screenY < H + 10){
          var g = ctx.createLinearGradient(tail, screenY, head, screenY);
          g.addColorStop(0, 'rgba(58,124,165,0)');
          g.addColorStop(0.5, 'rgba(58,124,165,' + t.op * 0.4 + ')');
          g.addColorStop(1, 'rgba(58,124,165,' + t.op + ')');
          ctx.beginPath(); ctx.moveTo(tail, screenY); ctx.lineTo(head, screenY);
          ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
        }

        if((t.dir > 0 && tail > W) || (t.dir < 0 && head < 0)){
          traces[i] = newHTrace();
        }
      } else {
        var screenHead = head - scrollY;
        var screenTail = tail - scrollY;

        if(screenTail > headerH - 10 && screenHead < H + 10){
          var dH = Math.max(headerH, Math.min(H, screenHead));
          var dT = Math.max(headerH, Math.min(H, screenTail));

          var g = ctx.createLinearGradient(t.line, dT, t.line, dH);
          g.addColorStop(0, 'rgba(58,124,165,0)');
          g.addColorStop(0.5, 'rgba(58,124,165,' + t.op * 0.4 + ')');
          g.addColorStop(1, 'rgba(58,124,165,' + t.op + ')');
          ctx.beginPath(); ctx.moveTo(t.line, dT); ctx.lineTo(t.line, dH);
          ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
        }

        if(head < headerH && tail < headerH){
          traces[i] = newVTrace();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(58,124,165,0.055)';
    for(var y = headerH + sp; y <= c.height; y += sp){
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke();
    }
    for(var x = sp; x <= c.width; x += sp){
      ctx.beginPath(); ctx.moveTo(x, headerH); ctx.lineTo(x, c.height); ctx.stroke();
    }
  } else {
    animate();
  }
})();
