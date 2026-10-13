'use strict';
const $=id=>document.getElementById(id);
let distance=400,running=false,last=0;
function state(){
 if($('enabled').value==='no')return {tag:'BİLDİRİMLER KAPALI',title:'Navigasyon sürüyor',message:'Acil araç bildirimi bu sürücüye ulaşmıyor. Uyarı katmanının kapsama sınırını görüyorsunuz.',show:false};
 if($('route').value==='opposite')return {tag:'BU GÜZERGÂHA UYARI YOK',title:'Rotanız açık',message:'Bu örnekte ambulans karşı yönde, fiziksel olarak ayrılmış yolda. İlgisiz sürücüye uyarı gösterilmiyor.',show:false};
 if(distance<=0)return {tag:'GEÇİŞ TAMAMLANDI',title:'Ambulans geçti',message:'Yaklaşım bildirimi kapandı. Normal navigasyon görünümüne dönülüyor.',show:false};
 const space=$('space').value;
 const message=space==='blocked'?'Kenarda uygun alan yok. Ani yana kaçış önerilmiyor; kavşakta kuyruğun boşalması bekleniyor.':space==='pedestrian'?'Yaya geçişi var. Yaya alanına girmeden geçişin tamamlanması bekleniyor.':distance>200?'Yaklaşım bilgisi alındı. Ani manevra yapmadan çevrenizi kontrol edin.':'Uygun alan varsa kontrollü biçimde koridor açmaya hazırlanın. Bu uyarı kırmızı ışıkta geçiş talimatı değildir.';
 return {tag:'ACİL ARAÇ YAKLAŞIYOR',title:Math.round(distance)+' m arkanda ambulans var',message,show:true};
}
function update(){const n=state();$('tag').textContent=n.tag;$('title').textContent=n.title;$('message').textContent=n.message;$('meters').textContent=Math.round(distance)+' m';$('distance').value=Math.round(distance);$('ambulance').style.display=n.show?'grid':'none';$('ambulance').style.top=(147+distance/400*133)+'px';$('relation').textContent=$('route').value==='same'?'Aynı güzergâh · arkanızda':'Karşı yön · ayrılmış yol';$('play').textContent=running?'Ⅱ Duraklat':distance<=0?'↺ Yeniden yaklaş':'▶ Yaklaşmayı oynat';$('speak').disabled=!n.show||!('speechSynthesis' in window)}
function cancelVoice(){if('speechSynthesis'in window)speechSynthesis.cancel();$('status').textContent=''}
function setDistance(d){cancelVoice();distance=d;running=false;update()}
document.querySelectorAll('[data-distance]').forEach(b=>b.onclick=()=>setDistance(+b.dataset.distance));
$('distance').oninput=()=>setDistance(+$('distance').value);
['enabled','route','space'].forEach(id=>$(id).onchange=()=>{cancelVoice();update()});
$('play').onclick=()=>{cancelVoice();if(distance<=0)distance=400;running=!running;update()};
$('speak').onclick=()=>{const n=state();if(!n.show||!('speechSynthesis'in window))return;cancelVoice();const u=new SpeechSynthesisUtterance(n.title+'. '+n.message);u.lang='tr-TR';u.rate=.95;u.onstart=()=>{$('status').textContent='Sesli örnek okunuyor…'};u.onend=()=>{$('status').textContent='Sesli örnek tamamlandı.'};u.onerror=()=>{$('status').textContent='Ses oynatılamadı. Bildirim metni ekranda görünür.'};speechSynthesis.speak(u)};
async function full(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{$('status').textContent='Tam ekran için F11 tuşunu kullanabilirsiniz.'}}
$('full').onclick=full;
$('present').onclick=()=>{document.body.classList.add('screen-only');$('controls').classList.remove('hidden');if(!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{});distance=400;running=true;update()};
$('controls').onclick=()=>{document.body.classList.remove('screen-only');$('controls').classList.add('hidden')};
document.addEventListener('keydown',e=>{if(e.code==='Escape')$('controls').click();if(['INPUT','SELECT','BUTTON'].includes(e.target.tagName))return;if(e.code==='KeyF')full();if(e.code==='Space'){e.preventDefault();$('play').click()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;cancelVoice();update()}});
function frame(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;if(running){distance=Math.max(0,distance-dt*20);if(distance<=0)running=false;update()}requestAnimationFrame(frame)}
window.NAV={get:()=>({distance,running,...state()})};update();requestAnimationFrame(frame);
