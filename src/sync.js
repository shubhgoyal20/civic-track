/* Optional shared state. If /api/state exists (node server.js) data is shared across devices; otherwise it stays on this device. */
(function(){const C=window.CT_CONFIG||{},_save=save;let SV=0,busy=false,dirty=false,off=false;UI.sync='local';
 if(C.demoData===false){let h=false;try{h=!!localStorage.getItem(KEY)}catch(e){}if(!h)S={issues:[],reports:[],reviews:[],cfg:seed().cfg}}
 const act=i=>Math.max(0,...i.activityTimeline.map(e=>e.timestamp)),mb=(a,b,k,pick)=>{const m=new Map();[...a,...b].forEach(x=>{const o=m.get(x[k]);m.set(x[k],o?pick(o,x):x)});return[...m.values()]};
 const merge=(r,l)=>({...r,issues:mb(r.issues,l.issues,'issueId',(a,b)=>act(b)>act(a)?b:a),reports:mb(r.reports,l.reports,'reportId',a=>a),reviews:mb(r.reviews||[],l.reviews||[],'id',(a,b)=>a.decision?a:b)});
 async function put(){if(off)return;if(busy){dirty=true;return}busy=true;try{const r=await fetch('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({baseVersion:SV,state:S})});if(r.status===409){const d=await r.json();S=merge(d.state,S);SV=d.version;_save();busy=false;return put()}if(!r.ok)throw 0;SV=(await r.json()).version;UI.sync='server'}catch(e){UI.sync='local'}busy=false;if(dirty){dirty=false;put()}}
 async function pull(first){try{const r=await fetch('/api/state',{cache:'no-store'});if(!r.ok)throw 0;const d=await r.json();UI.sync='server';
  if(!d.state){SV=0;await put();render();return}
  if(first||d.version!==SV){const typing=route().page==='report'&&!R.done&&(R.desc||R.img);S=first?merge(d.state,S):d.state;SV=d.version;_save();if(first)await put();if(!typing)render()}
 }catch(e){off=true;UI.sync='local';render()}}
 save=function(){_save();put()};window.syncNow=()=>off?Promise.resolve():pull(false);
 setInterval(()=>{if(!off&&!busy&&!document.hidden)pull(false)},20000);pull(true)})();
