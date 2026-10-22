/* Real AI photo check: the photo is sent to /api/verify (Gemini, key stays on the server). Rejects trash photos; uncertain ones go to manual review. */
const CFG_AI=()=>window.CT_CONFIG||{},API=CFG_AI().apiBase||'';
const aiWhy=e=>{const st=e.st,c=e.code||'';return !st?'Could not reach the server. Check your internet, and that apiBase/CORS are set if the API is on another host.'
 :st===404||st===405?'The AI service was not found on this website. Deploy the Node server (npm start) or the Netlify Function, and open /api/verify to check it.'
 :c==='not_configured'?'The server has no GEMINI_API_KEY set.'
 :/^upstream_(401|403)$/.test(c)?'Gemini rejected the API key (invalid, restricted, or billing/region not allowed).'
 :c==='upstream_429'?'Gemini quota or rate limit reached. Try again later.'
 :/^upstream_(400|404)$/.test(c)?'Gemini rejected the request or model name'+(e.detail?' ('+e.detail+')':'')+'. Set GEMINI_MODEL to a valid model.'
 :c==='timeout'?'The AI took too long. Try again.':st===429?'Too many checks from this connection. Wait a minute.':'AI service error ('+(c||st)+').'};
const _ai=ai;ai=function(r){const b=_ai(r),a=R.aiRes;if(!a)return b;r.aiVerdict=a.verdict;r.aiConfidence=a.confidence;
 const ok=a.verdict==='genuine'&&b.status==='Verified';return{status:ok?'Verified':'Needs Review',notes:['AI check: '+a.reason+' (confidence '+a.confidence+'%)',...b.notes]}};
const _sub2=submit;
submit=async function(){if(R.busy)return;
 const ok=R.cat&&R.desc.trim().length>=10&&R.lat!=null&&R.conf&&R.img&&rl()<3;if(!ok)return _sub2();
 R.err='';R.aiRes=null;R.busy=true;render();
 try{const r=await fetch(API+'/api/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:R.img,category:R.cat,description:R.desc})});
  if(!r.ok){const e=new Error('http');e.st=r.status;try{const d=await r.json();e.code=d.error;e.detail=d.detail}catch(x){}throw e}const a=await r.json();R.aiRes=a;
  if(a.verdict==='reject'){R.busy=false;R.err='Photo rejected by AI: '+a.reason+' Please retake a clear photo of the actual problem at the site.';R.img=null;R.hash=null;render();return}
 }catch(e){if(CFG_AI().requireAI!==false){R.busy=false;R.err='AI photo verification is unavailable, so the report was not submitted. '+aiWhy(e);render();return}}
 _sub2()};
