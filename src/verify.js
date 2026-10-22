/* Real AI photo check: the photo is sent to /api/verify (Gemini, key stays on the server). Rejects trash photos; uncertain ones go to manual review. */
const CFG_AI=()=>window.CT_CONFIG||{},API=CFG_AI().apiBase||'';
const _ai=ai;ai=function(r){const b=_ai(r),a=R.aiRes;if(!a)return b;r.aiVerdict=a.verdict;r.aiConfidence=a.confidence;
 const ok=a.verdict==='genuine'&&b.status==='Verified';return{status:ok?'Verified':'Needs Review',notes:['AI check: '+a.reason+' (confidence '+a.confidence+'%)',...b.notes]}};
const _sub2=submit;
submit=async function(){if(R.busy)return;
 const ok=R.cat&&R.desc.trim().length>=10&&R.lat!=null&&R.conf&&R.img&&rl()<3;if(!ok)return _sub2();
 R.err='';R.aiRes=null;R.busy=true;render();
 try{const r=await fetch(API+'/api/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:R.img,category:R.cat,description:R.desc})});
  if(!r.ok)throw new Error('http '+r.status);const a=await r.json();R.aiRes=a;
  if(a.verdict==='reject'){R.busy=false;R.err='Photo rejected by AI: '+a.reason+' Please retake a clear photo of the actual problem at the site.';R.img=null;R.hash=null;render();return}
 }catch(e){if(CFG_AI().requireAI!==false){R.busy=false;R.err='AI photo verification is unavailable right now, so the report was not submitted. Please try again in a minute.';render();return}}
 _sub2()};
