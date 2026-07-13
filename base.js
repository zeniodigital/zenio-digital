// CURSOR
let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
const ring=document.getElementById('cring'),dot=document.getElementById('cdot');
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
if(matchMedia('(hover:hover) and (pointer:fine)').matches){(function anim(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;ring.style.transform='translate3d('+rx+'px,'+ry+'px,0) translate(-50%,-50%)';dot.style.transform='translate3d('+mx+'px,'+my+'px,0) translate(-50%,-50%)';requestAnimationFrame(anim)})();}
document.querySelectorAll('a,button,[onclick]').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ring.style.width='46px';ring.style.height='46px';ring.style.borderColor='rgba(224,92,0,.75)'});
  el.addEventListener('mouseleave',()=>{ring.style.width='32px';ring.style.height='32px';ring.style.borderColor='rgba(224,92,0,.45)'});
});

// NAV SCROLL
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>20));

// MENU MOBILE
let mOpen=false;
function toggleMenu(){mOpen=!mOpen;document.getElementById('nm').style.display=mOpen?'flex':'none'}

// REVEAL
const rObs=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{if(e.isIntersecting)setTimeout(()=>e.target.classList.add('vis'),i*70)});
},{threshold:.07});
document.querySelectorAll('.rv').forEach(el=>rObs.observe(el));

// COUNTERS
const cObs=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el=entry.target,target=parseInt(el.dataset.target);
      let start=null;const dur=1400;
      const step=ts=>{if(!start)start=ts;const p=Math.min((ts-start)/dur,1),ease=1-Math.pow(1-p,3);el.textContent=Math.round(ease*target);if(p<1)requestAnimationFrame(step);else el.textContent=target};
      requestAnimationFrame(step);cObs.unobserve(el);
    }
  });
},{threshold:.5});
document.querySelectorAll('.counter').forEach(c=>cObs.observe(c));

// BARS VISUAL
const bObs=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.querySelectorAll('.sv-fill').forEach(b=>{setTimeout(()=>{b.style.width=b.dataset.w},200)});
      bObs.unobserve(entry.target);
    }
  });
},{threshold:.3});
document.querySelectorAll('.sol-visual').forEach(el=>bObs.observe(el));

// FAQ
function toggleFaq(btn){
  const item=btn.parentElement;
  const wasOpen=item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
  if(!wasOpen)item.classList.add('open');
}

// PRICING TOGGLE
let isEco=false;
function swMode(){
  isEco=!isEco;
  document.getElementById('tog').classList.toggle('active',isEco);
  document.getElementById('tecobadge').style.opacity=isEco?'1':'0';
  document.getElementById('lw').classList.toggle('on',!isEco);
  document.getElementById('le').classList.toggle('on',isEco);
  const names=isEco?['Básica','Estándar','Avanzada','Enterprise']:['Starter','Business','Pro','Premium'];
  const prices=isEco?['18,500','28,500','45,000','Cotización']:['7,500','12,500','16,500','24,500'];
  const notes=isEco?['MXN · pago único','MXN · pago único','MXN · cotización','según proyecto']:['MXN · pago único','MXN · pago único','MXN · pago único','MXN · pago único'];
  const feats=isEco?[
    ['Hasta 20 productos','Carrito de compras','Pasarela de pago','SSL incluido','Panel admin','SEO básico','Entrega en 10 días','off:Filtros avanzados'],
    ['Hasta 100 productos','Filtros y categorías','Múltiples pasarelas','Gestión de envíos','Analytics','Capacitación','Entrega en 15 días','SEO avanzado'],
    ['Catálogo sin límite','Integraciones CRM','Email marketing','Precios por cliente','Automatizaciones','Desarrollo a medida','Soporte premium','Tiempo según proyecto'],
    ['Todo personalizado','Integraciones a medida','API y conectores','Escalabilidad total','SLA soporte','Documentación','Capacitación equipo','Cotización directa']
  ]:[
    ['1 página (landing)','Diseño personalizado','Mobile-first','Formulario de contacto','SEO básico','Entrega en 5 días','off:Blog o secciones extra','off:Identidad visual'],
    ['Hasta 5 secciones','Diseño personalizado','Mobile-first','Formulario + WhatsApp','SEO completo','Google Analytics','Entrega en 7 días','off:Identidad visual'],
    ['Secciones ilimitadas','Diseño personalizado','Mobile-first','Blog incluido','SEO avanzado','Google Analytics','Mantenimiento 1 mes','Entrega en 7 días'],
    ['Todo lo del Pro','Identidad visual completa','Logo y branding','Fotografía de producto','SEO premium','Mantenimiento 3 meses','Soporte prioritario','Entrega en 10 días']
  ];
  [0,1,2,3].forEach(i=>{
    document.getElementById('pt'+i).textContent=names[i];
    document.getElementById('pv'+i).textContent=prices[i];
    document.getElementById('pn'+i).textContent=notes[i];
    const ul=document.getElementById('pf'+i);
    ul.innerHTML=feats[i].map(f=>{const off=f.startsWith('off:'),t=off?f.slice(4):f;return`<li class="${off?'off':''}">${t}</li>`}).join('');
  });
}
