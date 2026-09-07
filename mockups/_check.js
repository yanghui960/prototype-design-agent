WB.ready(function(online){ if(!online) return;
  var lvMap={ok:['lv-ok','成功'],error:['lv-err','错误'],warn:['lv-warn','警告'],info:['lv-info','信息']};
  function loadLogs(level){
    WB.api('/api/logs?level='+(level||'all')+'&limit=50').then(function(d){
      if(!d.items) return;
      var tb=document.querySelector('.log-body table');
      if(!tb) return;
      var rows=tb.querySelectorAll('tr'); for(var i=1;i<rows.length;i++) rows[i].remove();
      d.items.forEach(function(l){
        var lv=lvMap[l.level]||lvMap.info;
        var tr=document.createElement('tr');
        tr.innerHTML='<td class="num" style="color:#9AA0A6;">'+l.ts+'</td><td><span class="lv '+lv[0]+'"><span class="lv-dot"></span>'+lv[1]+'</span></td><td class="mod">'+l.module+'</td><td class="msg"></td><td class="cost num">'+l.cost+'</td>';
        tr.querySelector('.msg').textContent=l.message;
        tb.appendChild(tr);
      });
      var vs=document.querySelectorAll('.metric .m-value');
      if(vs.length>=4){
        vs[0].textContent=d.items.length;
        vs[1].textContent=d.items.filter(function(x){return x.level==='error';}).length;
        vs[2].textContent=d.items.filter(function(x){return x.level==='warn';}).length;
      }
      var cnt=document.querySelector('.log-count'); if(cnt) cnt.textContent=d.items.length+' 条';
    });
  }
  loadLogs('all');
  var chips=document.querySelectorAll('.f-chip');
  var map=['all','error','warn','info'];
  chips.forEach(function(c,i){
    c.addEventListener('click',function(){
      chips.forEach(function(x){x.classList.remove('active');}); c.classList.add('active');
      if(map[i]) loadLogs(map[i]);
    });
  });
});
