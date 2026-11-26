/* Космос ближе. Three.js r128 / GSAP 3.12.5. Local licensed texture maps; no analytics or accounts. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const fineQuery = matchMedia('(hover: hover) and (pointer: fine)');
  const params = new URLSearchParams(location.search);
  let reduced = motionQuery.matches || params.get('motion') === 'off';
  let paused = reduced;
  const TYPES = {planet:'Планета', moon:'Естественный спутник', dwarf:'Карликовая планета', star:'Звезда / звёздная система', minor:'Малое тело'};
  const nasa = 'https://science.nasa.gov/';
  const bodies = [
    ['sun','Солнце','star','#ffc66e','sun/facts/','Звезда в центре Солнечной системы.','Энергия Солнца рождается при термоядерных реакциях в его недрах.','Светящийся диск и условная зернистость поверхности.','sun'],
    ['mercury','Меркурий','planet','#a19c91','mercury/facts/','Ближайшая к Солнцу планета.','Несмотря на близость к Солнцу, самая горячая планета — Венера.','Каменистая поверхность и ударные кратеры.','rock'],
    ['venus','Венера','planet','#d9b778','venus/venus-facts/','Каменистая планета с плотной атмосферой.','Сильный парниковый эффект делает Венеру самой горячей планетой Солнечной системы.','Светлая облачная оболочка скрывает поверхность.','cloud'],
    ['earth','Земля','planet','#619bc2','earth/facts/','Наш дом в Солнечной системе.','Большую часть поверхности Земли покрывает жидкая вода.','Континенты, океаны и облака; вид построен по карте.','earth'],
    ['moon','Луна','moon','#bbb8b2','moon/facts/','Естественный спутник Земли.','Кратеры и тёмные равнины хранят следы прошлого Луны.','Контраст светлых областей и тёмных равнин.','rock'],
    ['mars','Марс','planet','#c47755','mars/facts/','Каменистая планета с разреженной атмосферой.','Красноватый цвет связан с окисленными минералами железа в породах и пыли.','Ржавые оттенки и условные полярные шапки.','mars'],
    ['jupiter','Юпитер','planet','#d4b99d','jupiter/jupiter-facts/','Самая большая планета Солнечной системы, газовый гигант.','Его полосы — облачные структуры, а Большое Красное Пятно — атмосферный вихрь.','Чередование поясов и зон; маленькие спутники рядом.','bands'],
    ['saturn','Сатурн','planet','#d4be90','saturn/facts/','Газовый гигант с яркой системой колец.','Кольца состоят из отдельных частиц льда, каменистого вещества и пыли.','Промежутки в кольцах: это не сплошная пластина.','bands'],
    ['uranus','Уран','planet','#9bd0d3','uranus/facts/','Ледяной гигант с голубовато-зелёной атмосферой.','Ось вращения Урана сильно наклонена: планета словно лежит на боку.','Наклон оси и тонкое условное кольцо.','ice'],
    ['neptune','Нептун','planet','#698dca','neptune/neptune-facts/','Самая далёкая от Солнца из восьми планет.','В атмосфере этого ледяного гиганта дуют очень сильные ветры.','Облачные полосы; цвет показан условно.','ice'],
    ['binary','Двойная звезда','star','#a9ccff','universe/stars/multiple-star-systems/','Две гравитационно связанные звезды.','Оба светила движутся вокруг общего центра масс.','Движение пары вокруг отмеченного центра. Цвета условные.','binary'],
    ['ganymede','Ганимед','moon','#9b9589','jupiter/jupiter-moons/ganymede/','Спутник Юпитера.','Самый большой естественный спутник в Солнечной системе.','Чередование светлых и тёмных участков.','rock'],
    ['titan','Титан','moon','#c99c53','saturn/moons/titan/','Крупнейший спутник Сатурна.','У Титана плотная атмосфера; на поверхности есть озёра жидких углеводородов.','Золотистая дымка атмосферы.','cloud'],
    ['callisto','Каллисто','moon','#888077','jupiter/jupiter-moons/callisto/','Один из крупных спутников Юпитера.','Его древняя поверхность густо покрыта ударными кратерами.','Многочисленные светлые следы ударов.','rock'],
    ['io','Ио','moon','#d8b865','jupiter/jupiter-moons/io/','Вулканически активный спутник Юпитера.','Ио — самый вулканически активный мир Солнечной системы.','Жёлтые оттенки и тёмные условные вулканические области.','volcanic'],
    ['europa','Европа','moon','#c8baa3','jupiter/jupiter-moons/europa/','Спутник Юпитера с ледяной поверхностью.','Научные данные указывают на океан под ледяной оболочкой.','Сеть условных трещин на льду.','cracks'],
    ['triton','Тритон','moon','#b1bcc2','neptune/moons/triton/','Крупнейший спутник Нептуна.','Он обращается в направлении, противоположном вращению Нептуна.','Светлая ледяная поверхность.','rock'],
    ['eris','Эрида','dwarf','#d1d0cd','dwarf-planets/eris/','Карликовая планета за орбитой Нептуна.','У Эриды есть спутник Дисномия.','Светлая условная поверхность далёкого мира.','rock'],
    ['pluto','Плутон','dwarf','#bea894','dwarf-planets/pluto/','Карликовая планета в поясе Койпера.','На Плутоне есть большая светлая область, напоминающая сердце.','Условный светлый рисунок на поверхности.','pluto'],
    ['haumea','Хаумеа','dwarf','#c7c4bd','dwarf-planets/haumea/','Карликовая планета за Нептуном.','Быстрое вращение связано с её заметно вытянутой формой.','Вытянутый силуэт: форма показана схематично.','rock'],
    ['titania','Титания','moon','#a79f95','uranus/moons/titania/','Крупнейший спутник Урана.','На его поверхности видны кратеры и крупные разломы.','Кратеры и условные линии разломов.','rock'],
    ['makemake','Макемаке','dwarf','#ba9272','dwarf-planets/makemake/','Карликовая планета пояса Койпера.','На её поверхности обнаружены следы замёрзшего метана.','Красновато-коричневые оттенки условной поверхности.','rock'],
    ['oberon','Оберон','moon','#a39489','uranus/moons/oberon/','Один из крупных спутников Урана.','Его поверхность покрыта множеством ударных кратеров.','Древний кратерированный рельеф.','rock'],
    ['rhea','Рея','moon','#c6c5c1','saturn/moons/rhea/','Ледяной спутник Сатурна.','Поверхность Реи густо усеяна кратерами.','Светлая ледяная поверхность и следы ударов.','rock'],
    ['iapetus','Япет','moon','#a69c88','saturn/moons/iapetus/','Спутник Сатурна с контрастной окраской.','Одна большая область его поверхности гораздо темнее другой.','Резкая разница светлых и тёмных областей.','contrast'],
    ['quaoar','Квавар','minor','#a88e79','https://www.esa.int/Science_Exploration/Space_Science/Cheops/ESA_s_Cheops_finds_an_unexpected_ring_around_dwarf_planet_Quaoar','Транснептуновый объект: его орбита лежит за Нептуном.','Вокруг Квавара обнаружена система колец.','Тонкое условное кольцо вокруг небольшого тела.','rock'],
    ['charon','Харон','moon','#aaa5a0','dwarf-planets/pluto/moons/charon/','Крупнейший спутник Плутона.','По сравнению со своей планетой Харон необычно велик.','Светлая поверхность и условная тёмная полярная область.','rock'],
    ['ariel','Ариэль','moon','#c3c3be','uranus/moons/ariel/','Один из крупных спутников Урана.','Каньоны и долины пересекают его ледяную поверхность.','Условные разломы и ударные кратеры.','cracks'],
    ['umbriel','Умбриэль','moon','#777878','uranus/moons/umbriel/','Тёмный спутник Урана.','Его поверхность темнее поверхностей других крупных спутников Урана.','Тёмный кратерированный рельеф.','rock'],
    ['dione','Диона','moon','#bbbcb9','saturn/moons/dione/','Ледяной спутник Сатурна.','Светлые полосы на поверхности связаны с ледяными обрывами.','Светлые условные линии на поверхности.','cracks'],
    ['sedna','Седна','minor','#ad7666','https://science.nasa.gov/asset/hubble/parallax-shift-shows-planetoid-sedna-is-part-of-solar-system/','Далёкий транснептуновый объект.','Седна движется вокруг Солнца по очень вытянутой орбите.','Условные красноватые оттенки; реальная поверхность здесь не воспроизводится.','rock'],
    ['ceres','Церера','dwarf','#a8a7a3','dwarf-planets/ceres/','Карликовая планета в главном поясе астероидов.','Она расположена между орбитами Марса и Юпитера.','Кратеры и условные светлые пятна.','rock'],
    ['orcus','Орк','minor','#a5a39f','https://arxiv.org/abs/0910.4784','Транснептуновый объект пояса Койпера.','У Орка есть спутник Вант.','Условная поверхность; детали рельефа не являются картой.','rock'],
    ['tethys','Тефия','moon','#d0d0cc','saturn/moons/tethys/','Ледяной спутник Сатурна.','Одна из заметных деталей поверхности — большой кратер Одиссей.','Кратеры на светлой поверхности.','rock'],
    ['salacia','Салация','minor','#92938f','https://arxiv.org/abs/2509.02734','Транснептуновый объект.','Салация образует систему со спутником Актеей.','Схематичная поверхность: достоверной карты рельефа здесь нет.','rock'],
    ['varuna','Варуна','minor','#ad8b74','https://arxiv.org/abs/astro-ph/0201082','Крупный объект пояса Койпера.','Изменения блеска позволяют исследовать его вращение и форму.','Вытянутый условный силуэт, а не измеренная модель рельефа.','rock'],
    ['vesta','Веста','minor','#b0a79c','solar-system/asteroids/4-vesta/','Крупный астероид главного пояса.','Его поверхность подробно исследовал космический аппарат Dawn.','Неровный условный силуэт и кратеры.','rock']
  ].map(([id,name,type,color,path,description,feature,look,texture])=>({id,name,type,color,source:path.startsWith('https:')?path:nasa+path,description,feature,look,texture}));
  const byId = Object.fromEntries(bodies.map(b=>[b.id,b]));
  const sourceList=$('#source-object-list');
  if(sourceList)bodies.forEach(body=>{const li=document.createElement('li'),a=document.createElement('a');a.href=body.source;a.target='_blank';a.rel='noopener noreferrer';a.textContent=body.name+' ↗';li.append(a);sourceList.append(li);});
  const visualEngine = window.CosmicVisuals.create(bodies);
  const media = { dome:{src:'images/telescope-visit-2026-v2.png',width:1170,height:652,caption:'Телескоп. Материал из нашего визита',credit:'Фото предоставлено командой проекта'}, gallery:[], video:null }; // See README: local paths, captions and credit.
  const binaryTexture=window.COSMOS_TEXTURE_DATA?.sun;
  if(binaryTexture?.startsWith('data:image/'))$('.binary-pair').style.setProperty('--binary-texture',`url("${binaryTexture}")`);
  const SOLAR_ORDER = ['sun','mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'];
  const solarIds=new Set(SOLAR_ORDER);
  const matchesFilter=(body,filter=currentFilter)=>filter==='solar'?solarIds.has(body.id):filter==='all'||body.type===filter;
  let activeId = null, view = 0, currentFilter = params.get('mode')==='atlas'?'all':'solar';
  let galaxy = null;
  const views = ['спереди','сверху','слева','справа'];
  const visualCache = new Map();
  function seeded(seed) { let a=seed>>>0; return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}; }
  function hash(s){return [...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);}
  function rgb(hex){return hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16));}

  function textureCanvas(body){return visualEngine.texture(body);}
  function illustrate(canvas,id,hero=false){visualEngine.draw(canvas,id,hero);}

  // Decorative backdrop: one canvas, throttled frames and no animation while hidden.
  let backgroundFrame=0, backgroundTime=0, backgroundClock=0, lastBackgroundFrame=0;
  const bg=$('#cosmic-background'),bgctx=bg.getContext('2d'),trail=$('#cursor-trail'),trailctx=trail.getContext('2d');
  let bgWidth=0,bgHeight=0,bgStars=[],pointer={x:0,y:0},particles=[],lastPointer=0;
  function resizeBackdrop(){
    const dpr=Math.min(devicePixelRatio||1,2);bgWidth=innerWidth;bgHeight=innerHeight;
    for(const c of [bg,trail]){c.width=bgWidth*dpr;c.height=bgHeight*dpr;c.getContext('2d').setTransform(dpr,0,0,dpr,0,0);}
    const rand=seeded(2026);bgStars=Array.from({length:innerWidth<700?350:1250},()=>({x:rand()*bgWidth,y:rand()*bgHeight,r:.25+rand()*.9,a:.15+rand()*.55,p:rand()*6.28}));
    drawBackdrop(backgroundClock);
  }
  function drawBackdrop(t){
    bgctx.clearRect(0,0,bgWidth,bgHeight);bgctx.fillStyle='#05060f';bgctx.fillRect(0,0,bgWidth,bgHeight);
    const haze=(x,y,r,color)=>{const g=bgctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');bgctx.fillStyle=g;bgctx.fillRect(0,0,bgWidth,bgHeight);};
    haze(bgWidth*.76,bgHeight*.36,Math.max(bgWidth*.55,500),'#30204b75');haze(bgWidth*.21,bgHeight*.8,400,'#102d4130');
    for(const s of bgStars){const twinkle=paused?1:.78+Math.sin(t*.0009+s.p)*.22;const wrap=(v,size)=>((v%(size+30))+(size+30))%(size+30)-15;const x=wrap(s.x+t*.003*(.6+s.r)+pointer.x*4,bgWidth),y=wrap(s.y+t*.006*(.6+s.r)+pointer.y*3,bgHeight);bgctx.fillStyle=`rgba(223,221,245,${s.a*twinkle})`;bgctx.beginPath();bgctx.arc(x,y,s.r,0,Math.PI*2);bgctx.fill();}
    const rand=seeded(2030),angle=paused?0:t*.000003;
    for(let i=0;i<(innerWidth<700?160:650);i++){
      const radius=rand()*Math.min(bgWidth*.33,440),a=radius*.028+(i%3)*2.094+angle+(rand()-.5)*.5;
      const x=bgWidth*.75+Math.cos(a)*radius,y=bgHeight*.45+Math.sin(a)*radius*.42;bgctx.fillStyle=`rgba(157,127,216,${.03+rand()*.1})`;bgctx.fillRect(x,y,1.1,1.1);
    }
  }
  function backgroundLoop(t){
    if(document.hidden){backgroundFrame=0;return;}
    const delta=Math.min((t-lastBackgroundFrame)||16,80);lastBackgroundFrame=t;if(!paused)backgroundClock+=delta;
    if(t-backgroundTime>40){if(!paused)drawBackdrop(backgroundClock);backgroundTime=t;}
    if(fineQuery.matches&&!paused){trailctx.clearRect(0,0,bgWidth,bgHeight);particles=particles.filter(p=>p.life>0);particles.forEach(p=>{p.life-=.04;p.x+=p.vx;p.y+=.25;trailctx.globalAlpha=Math.max(0,p.life)*.5;trailctx.fillStyle='#ffd27a';trailctx.font=`${p.size}px Georgia`;trailctx.fillText('✧',p.x,p.y);});trailctx.globalAlpha=1;}
    if(!paused||particles.length)backgroundFrame=requestAnimationFrame(backgroundLoop);else backgroundFrame=0;
  }
  function startBackdrop(){if(!backgroundFrame&&!document.hidden)backgroundFrame=requestAnimationFrame(backgroundLoop);}
  function syncMotion(){
    document.body.classList.toggle('custom-cursor',fineQuery.matches&&!reduced);
    document.body.classList.toggle('motion-paused',paused);
    $('#motion-toggle').setAttribute('aria-pressed',String(paused));$('#motion-toggle span').textContent=paused?'Включить движение':'Остановить движение';
    if(paused){particles=[];trailctx.clearRect(0,0,bgWidth,bgHeight);drawBackdrop(backgroundClock);}else startBackdrop();
    if(galaxy)galaxy.requestFrame();
  }
  document.addEventListener('pointermove',event=>{
    if(!fineQuery.matches)return;pointer.x=(event.clientX/innerWidth-.5)*2;pointer.y=(event.clientY/innerHeight-.5)*2;
    const cursor=$('#star-cursor');cursor.style.left=`${event.clientX}px`;cursor.style.top=`${event.clientY}px`;
    cursor.classList.toggle('photo-hover',!!event.target.closest('.photo-button,.planet-art'));
    if(!paused&&event.timeStamp-lastPointer>25){particles.push({x:event.clientX,y:event.clientY,life:1,vx:(Math.random()-.5)*.5,size:5+Math.random()*6});lastPointer=event.timeStamp;startBackdrop();}
  },{passive:true});
  $('#motion-toggle').addEventListener('click',()=>{paused=!paused;syncMotion();});
  motionQuery.addEventListener('change',e=>{reduced=e.matches;paused=reduced;syncMotion();});fineQuery.addEventListener('change',syncMotion);
  addEventListener('resize',resizeBackdrop);resizeBackdrop();syncMotion();startBackdrop();
  document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('page-hidden',document.hidden);if(window.gsap)gsap.globalTimeline.paused(document.hidden);if(!document.hidden){startBackdrop();if(galaxy)galaxy.requestFrame();}});
  illustrate($('#hero-saturn'),'saturn',true);
  $$('[data-illustration]').forEach(c=>illustrate(c,c.dataset.illustration));

  // Navigation and progressive enhancement: copy never depends on GSAP.
  const menu=$('.menu-toggle'),nav=$('#main-nav');
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');nav.classList.toggle('open',open);});
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');nav.classList.remove('open');}));
  function scrollProgress(){const range=document.documentElement.scrollHeight-innerHeight;$('.reading-progress i').style.transform=`scaleX(${range>0?scrollY/range:0})`;}
  addEventListener('scroll',scrollProgress,{passive:true});scrollProgress();
  const navObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){$$('#main-nav a').forEach(a=>a.classList.toggle('active',a.hash===`#${e.target.id}`));}}),{rootMargin:'-15% 0px -55% 0px'});
  $$('main>section[id]').forEach(s=>navObserver.observe(s));
  if(window.gsap&&window.ScrollTrigger)try{
    gsap.registerPlugin(ScrollTrigger);
    const motionContext=gsap.matchMedia();
    motionContext.add('(prefers-reduced-motion: no-preference)',()=>{
      if(reduced)return;
      const split=h=>{if(!h.dataset.linesReady){h.innerHTML=h.innerHTML.split(/<br\s*\/?>/i).map(line=>'<span class="line-mask"><span class="line-inner">'+line+'</span></span>').join('');h.dataset.linesReady='true';}return $$('.line-inner',h);};
      if($('#home').getBoundingClientRect().bottom>0){
        const heroLines=split($('#hero-title'));
        gsap.fromTo(heroLines,{yPercent:110,opacity:0,rotate:1.2},{yPercent:0,opacity:1,rotate:0,duration:1.25,stagger:.13,ease:'power4.out',delay:.12});
        gsap.from('.hero-content>.eyebrow',{x:-24,opacity:0,duration:.9,ease:'power3.out'});
        gsap.from('.hero-description,.hero-actions',{y:25,opacity:0,duration:1,stagger:.13,delay:.45,ease:'power3.out'});
      }
      $$('.section-heading').forEach(heading=>{
        if(heading.getBoundingClientRect().bottom<0)return;
        const lines=split($('h2',heading)),tl=gsap.timeline({paused:true});
        tl.fromTo(lines,{yPercent:110,opacity:0},{yPercent:0,opacity:1,duration:1.05,stagger:.1,ease:'power4.out'}).from($('.eyebrow',heading),{x:-20,opacity:0,duration:.75},0).from($('.section-intro',heading),{x:24,opacity:0,duration:.85},.15);
        ScrollTrigger.create({trigger:heading,start:'top 90%',onEnter:()=>tl.play()});
      });
      $$('.reveal:not(.section-heading)').forEach(el=>{if(el.getBoundingClientRect().bottom<0)return;gsap.from(el,{y:55,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 94%',toggleActions:'play none none none'}});});
      ['.visit-figure','.observatory-copy','.quiz-card','.star-questions'].forEach((selector,i)=>{const el=$(selector);if(el.getBoundingClientRect().bottom<0)return;gsap.from(el,{x:i%2?35:-35,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',toggleActions:'play none none none'}});});
    });
  }catch{
    if(window.ScrollTrigger)ScrollTrigger.getAll().forEach(trigger=>trigger.kill());
    $$('.reveal,.line-inner,.hero-description,.hero-actions,.visit-figure,.observatory-copy,.quiz-card,.star-questions,.section-intro,.eyebrow').forEach(el=>{el.style.removeProperty('opacity');el.style.removeProperty('transform');});
  }

  function fillPanel(id){
    const b=byId[id];$('#panel-type').textContent=TYPES[b.type];$('#panel-title').textContent=b.name;$('#panel-description').textContent=b.description;$('#panel-feature').textContent=b.feature;$('#panel-look').textContent='Визуализация: '+b.look;
    const source=$('#panel-source');source.href=b.source;source.textContent='Источник: '+(b.source.includes('esa.int')?'ESA':b.source.includes('arxiv')?'исследование':'NASA')+' ↗';
    const credit=visualEngine.credit(id);let creditEl=$('#panel-map-credit');if(!creditEl){creditEl=document.createElement('p');creditEl.id='panel-map-credit';creditEl.className='visual-caption';source.after(creditEl);}creditEl.replaceChildren();if(credit.url){const a=document.createElement('a');a.href=credit.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=credit.label+' ↗';creditEl.append(a);}else creditEl.textContent=credit.label;
    $('#view-indicator').textContent=$('#atlas').classList.contains('is-fallback')?'Статичная художественная визуализация':`Вид: ${views[view]}, ${view+1}/4`;
    $('#object-panel').hidden=false;$('#atlas').classList.add('has-selection');$('#scene-help').hidden=true;
    $$('.picker-button').forEach(button=>{const selected=button.dataset.object===id;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
  }
  function selectObject(id){
    if(!byId[id])return;
    if(activeId===id){view=(view+1)%4;}else{activeId=id;view=0;}
    fillPanel(id);if(galaxy)galaxy.select(id,view);
  }
  function exitObject(){
    if(!activeId)return;const prior=activeId;activeId=null;view=0;$('#object-panel').hidden=true;$('#atlas').classList.remove('has-selection');$('#scene-help').hidden=false;
    $$('.picker-button').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});
    if(galaxy)galaxy.reset();
    if($('#object-panel').contains(document.activeElement))$(`.picker-button[data-object="${prior}"]`)?.focus({preventScroll:true});
  }
  $('#next-view').addEventListener('click',()=>activeId&&selectObject(activeId));$('#galaxy-back').addEventListener('click',exitObject);$('#panel-close').addEventListener('click',exitObject);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#lightbox').open)exitObject();});
  const minorButton=document.createElement('button');minorButton.className='filter';minorButton.dataset.filter='minor';minorButton.setAttribute('aria-pressed','false');minorButton.textContent='Малые тела';$('.filter-list').append(minorButton);
  $('.filter[data-filter="all"] span').textContent=String(bodies.length);
  SOLAR_ORDER.slice(1).forEach((id,i)=>{const button=document.createElement('button');button.dataset.go=id;button.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span> ${byId[id].name}`;$('#planet-order').append(button);});
  const picker=$('#object-picker');bodies.forEach(b=>{
    const button=document.createElement('button');button.className='picker-button';button.dataset.object=b.id;button.setAttribute('aria-pressed','false');button.setAttribute('aria-controls','object-panel');button.style.setProperty('--object-color',b.color);
    const dot=document.createElement('span');dot.className='picker-dot';dot.setAttribute('aria-hidden','true');button.append(dot,document.createTextNode(b.name));button.addEventListener('click',event=>{selectObject(b.id);$('#atlas').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});if(event.detail===0){$('#panel-title').tabIndex=-1;$('#panel-title').focus({preventScroll:true});}});picker.append(button);
  });
  function applyFilter(filter){
    exitObject();currentFilter=filter;
    $$('.filter').forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    let count=0;$$('.picker-button,.fallback-object').forEach(b=>{const visible=matchesFilter(byId[b.dataset.object],filter);b.hidden=!visible;if(visible&&b.classList.contains('picker-button'))count++;});
    $('#scene-count').textContent=filter==='solar'?'Солнце и 8 планет':`Объектов: ${count}`;$('#scene-mode').textContent=filter==='solar'?'СОЛНЕЧНАЯ СИСТЕМА':'ИНТЕРАКТИВНЫЙ АТЛАС';$('#solar-guide').hidden=filter!=='solar';$('#atlas').dataset.layout=filter==='solar'?'solar':'atlas';if(galaxy)galaxy.filter(filter);
  }
  $$('.filter').forEach(b=>b.addEventListener('click',()=>applyFilter(b.dataset.filter)));
  const liteLink=document.createElement('a');liteLink.href='?view=cards#explore';liteLink.className='source-link';liteLink.textContent='Облегчённая версия без 3D ↗';$('#explore').append(liteLink);

  function renderFallback(){
    $('#atlas').classList.add('is-fallback');$('#atlas').dataset.renderer='cards';const grid=$('#fallback-grid');grid.hidden=false;
    if(!grid.childElementCount)bodies.forEach(b=>{const button=document.createElement('button');button.className='fallback-object';button.dataset.object=b.id;button.setAttribute('aria-label',`Рассмотреть: ${b.name}`);const c=document.createElement('canvas');c.setAttribute('aria-hidden','true');illustrate(c,b.id);const strong=document.createElement('strong');strong.textContent=b.name;const small=document.createElement('small');small.textContent=TYPES[b.type];button.append(c,strong,small);button.addEventListener('click',()=>{selectObject(b.id);$('#object-panel').scrollIntoView({behavior:reduced?'instant':'smooth',block:'nearest'});});grid.append(button);});
    $('#next-view').hidden=true;$('#view-indicator').textContent='Статичная художественная визуализация';
    // Static mode keeps every explanation and accessible selection, without pretending to show new views.
    $('#object-panel').classList.add('static-panel');
    const note=document.createElement('p');note.className='visual-caption';note.textContent='Открыта облегчённая версия. Выбирай объект в карточках или списке; четырёх ракурсов здесь нет.';grid.prepend(note);
  }

  function initGalaxy(){
    if(params.get('view')==='cards'||!window.THREE){renderFallback();return;}
    const T=window.THREE,host=$('#galaxy-viewport');let renderer;
    try{renderer=new T.WebGLRenderer({antialias:innerWidth>700,alpha:true,powerPreference:'low-power'});}catch{renderFallback();return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.setClearColor(0x000000,0);host.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','Трёхмерная художественная модель космических объектов');renderer.domElement.setAttribute('role','img');$('#atlas').dataset.renderer='webgl';
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(42,1,.1,500),target=new T.Vector3(),home=new T.Vector3(),raycaster=new T.Raycaster(),mouse=new T.Vector2();
    scene.add(new T.AmbientLight(0xc9ccdb,.4));scene.add(new T.HemisphereLight(0xc4d9ff,0x68616f,.35));const key=new T.DirectionalLight(0xfff7e9,1.9);key.position.set(-18,18,28);scene.add(key);const fill=new T.DirectionalLight(0x8a9dcb,.3);fill.position.set(15,-5,-10);scene.add(fill);
    const meshes=[],groups=new Map(),labels=new Map(),orbits=new T.Group();scene.add(orbits);let frame=0,inView=false,lastTime=0,localTime=0,animating=false,hovered=null,tweenFrame=0;
    const spriteCanvas=document.createElement('canvas');spriteCanvas.width=spriteCanvas.height=64;const sc=spriteCanvas.getContext('2d'),sg=sc.createRadialGradient(32,32,0,32,32,32);sg.addColorStop(0,'#fff');sg.addColorStop(.12,'#fff8');sg.addColorStop(.5,'#fff2');sg.addColorStop(1,'#fff0');sc.fillStyle=sg;sc.fillRect(0,0,64,64);const glowMap=new T.CanvasTexture(spriteCanvas);
    const rand=seeded(1988),starCount=innerWidth<700?1600:6000,points=[],colors=[];
    for(let i=0;i<starCount;i++){
      let x,y,z;if(i<starCount*.38){const r=rand()*65,a=r*.16+(i%3)*2.094+(rand()-.5)*.55;x=Math.cos(a)*r;y=Math.sin(a)*r*.42;z=-28+(rand()-.5)*8;}else{x=(rand()-.5)*210;y=(rand()-.5)*135;z=-20-rand()*95;}
      points.push(x,y,z);const shade=new T.Color().setHSL(.61+rand()*.14,.15+rand()*.3,.42+rand()*.45);colors.push(shade.r,shade.g,shade.b);
    }
    const starsGeo=new T.BufferGeometry();starsGeo.setAttribute('position',new T.Float32BufferAttribute(points,3));starsGeo.setAttribute('color',new T.Float32BufferAttribute(colors,3));const starField=new T.Points(starsGeo,new T.PointsMaterial({size:.15,vertexColors:true,map:glowMap,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));scene.add(starField);
    [0x5b378c,0x285f79,0x41305f].forEach((color,i)=>{const sprite=new T.Sprite(new T.SpriteMaterial({map:glowMap,color,opacity:.12,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));sprite.scale.set(60,35,1);sprite.position.set((i-1)*30,(i%2)*12-6,-40);scene.add(sprite);});
    const sphereGeo=new T.SphereGeometry(1,innerWidth<700?48:72,innerWidth<700?32:48);
    function makeMesh(body,radius,emissive=false){
      const texture=new T.CanvasTexture(textureCanvas(body));texture.encoding=T.sRGBEncoding;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      const rocky=!['sun','venus','earth','jupiter','saturn','uranus','neptune','titan','binary'].includes(body.id);
      const material=emissive?new T.MeshBasicMaterial({map:texture}):new T.MeshStandardMaterial({map:texture,roughness:.94,metalness:0,bumpMap:rocky?texture:null,bumpScale:rocky?.018:0});
      visualEngine.onReady(body.id,()=>{texture.image=textureCanvas(body);texture.needsUpdate=true;if(texture.image.dataset.completedCoverage==='true'){material.bumpMap=null;material.needsUpdate=true;}if(activeId===body.id)fillPanel(body.id);requestFrame();});
      const mesh=new T.Mesh(sphereGeo,material);mesh.scale.setScalar(radius);mesh.userData.id=body.id;
      if(body.id==='earth'&&visualEngine.imageSource('earth_clouds')){
        const cloudMap=new T.TextureLoader().load(visualEngine.imageSource('earth_clouds'),()=>requestFrame(),undefined,()=>{clouds.visible=false;requestFrame();});cloudMap.encoding=T.sRGBEncoding;
        const clouds=new T.Mesh(sphereGeo,new T.MeshStandardMaterial({map:cloudMap,alphaMap:cloudMap,transparent:true,opacity:.68,depthWrite:false,roughness:1}));clouds.scale.setScalar(1.012);mesh.add(clouds);
      }
      if(['earth','venus','uranus','neptune','titan'].includes(body.id)){
        const atmosphere=new T.Mesh(sphereGeo,new T.ShaderMaterial({uniforms:{rimColor:{value:new T.Color(body.id==='earth'?0x4c8ed5:body.color)}},vertexShader:'varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform vec3 rimColor; varying vec3 n; varying vec3 v; void main(){float rim=pow(1.0-abs(dot(normalize(n),normalize(v))),3.5);gl_FragColor=vec4(rimColor,rim*0.19);}',transparent:true,depthWrite:false,blending:T.AdditiveBlending}));atmosphere.scale.setScalar(1.035);mesh.add(atmosphere);
      }
      meshes.push(mesh);return mesh;
    }
    function ring(group,body,radius){
      const inner=body.id==='saturn'?1.35:1.78,outer=body.id==='saturn'?2.25:1.85,geo=new T.RingGeometry(radius*inner,radius*outer,144,6),pos=geo.attributes.position,uv=geo.attributes.uv;
      for(let i=0;i<pos.count;i++){const r=Math.hypot(pos.getX(i),pos.getY(i));uv.setXY(i,(r-radius*inner)/(radius*(outer-inner)),.5);}
      let material;
      if(body.id==='saturn'&&visualEngine.imageSource('saturn_ring')){
        const map=new T.TextureLoader().load(visualEngine.imageSource('saturn_ring'),()=>requestFrame(),undefined,()=>{material.map=null;material.color.set(0xc5b79f);material.needsUpdate=true;requestFrame();});map.encoding=T.sRGBEncoding;
        material=new T.MeshStandardMaterial({map,side:T.DoubleSide,transparent:true,opacity:.91,roughness:1,depthWrite:false,alphaTest:.015});
      }else material=new T.MeshBasicMaterial({color:0x929c9e,side:T.DoubleSide,transparent:true,opacity:body.id==='uranus'?.16:.12,depthWrite:false});
      const ringMesh=new T.Mesh(geo,material);ringMesh.rotation.x=-Math.PI/2+.32;ringMesh.rotation.y=.12;ringMesh.userData.id=body.id;group.add(ringMesh);meshes.push(ringMesh);
    }
    bodies.forEach((body,i)=>{
      const sizes={sun:1.95,mercury:.4,venus:.65,earth:.7,mars:.52,jupiter:1.35,saturn:1.12,uranus:.83,neptune:.8};
      const group=new T.Group(),radius=sizes[body.id]||(body.type==='moon'?.58:body.type==='minor'?.57:.8);
      group.userData={body,radius,spin:[]};
      if(body.id==='binary'){
        const a=makeMesh(byId.sun,.56,true),b=makeMesh({...body,color:'#b6d8ff',texture:'sun'},.42,true);a.userData.id=b.userData.id='binary';a.position.x=-.86;b.position.x=.86;group.add(a,b);group.userData.binary=[a,b];group.userData.radius=1.7;
        const center=new T.Mesh(new T.SphereGeometry(.04,8,6),new T.MeshBasicMaterial({color:0xffd27a}));group.add(center);
      }else{
        const mesh=makeMesh(body,radius,body.id==='sun');if(['haumea','varuna'].includes(body.id))mesh.scale.set(radius*1.45,radius*.75,radius);if(body.id==='vesta')mesh.scale.set(radius,radius*.85,radius*.8);group.add(mesh);group.userData.spin.push(mesh);
        if(['saturn','uranus','quaoar'].includes(body.id))ring(group,body,radius);
        if(body.id==='uranus')group.rotation.z=1.4;
        if(body.id==='jupiter'){
          group.userData.moons=[];['io','europa','ganymede','callisto'].forEach((id,j)=>{const m=new T.Mesh(new T.SphereGeometry(.09+j*.012,12,10),new T.MeshStandardMaterial({color:byId[id].color,roughness:1}));m.userData.id='jupiter';group.add(m);group.userData.moons.push(m);});
        }
      }
      const glow=new T.Sprite(new T.SpriteMaterial({map:glowMap,color:body.color,transparent:true,opacity:body.type==='star'?.28:.025,depthWrite:false,blending:T.AdditiveBlending}));glow.scale.setScalar(radius*(body.type==='star'?5:3.2));group.add(glow);group.userData.glow=glow;group.userData.baseOpacity=body.type==='star'?.28:.025;
      scene.add(group);groups.set(body.id,group);
      const label=document.createElement('button');label.className='scene-target';label.dataset.object=body.id;label.setAttribute('aria-label',`Приблизиться: ${body.name}`);label.tabIndex=-1;label.addEventListener('click',()=>selectObject(body.id));$('#object-labels').append(label);labels.set(body.id,label);
    });
    const orbitalRadii=[3.8,6.1,8.5,11,14,17.6,21.4,25.5],orbitalAngles=[2.4,-.65,1.15,3.55,.25,-2.05,2.65,-.8];
    function orbitPosition(radius,angle,mobile){return mobile?new T.Vector3(Math.cos(angle)*radius*.56,Math.sin(angle)*radius,Math.cos(angle)*radius*.18):new T.Vector3(Math.cos(angle)*radius,Math.sin(angle)*radius*.59,Math.sin(angle)*radius*.22);}
    function visibleGroups(){return [...groups.values()].filter(g=>matchesFilter(g.userData.body));}
    function buildSolarLayout(mobile){
      orbits.clear();
      groups.get('sun').position.set(0,0,0);groups.get('sun').userData.base=new T.Vector3();
      SOLAR_ORDER.slice(1).forEach((id,index)=>{
        const radius=orbitalRadii[index],phase=orbitalAngles[index],g=groups.get(id);g.userData.orbit={radius,phase,index,mobile};g.position.copy(orbitPosition(radius,phase+localTime*.000008/(1+index*.65),mobile));g.userData.base=g.position.clone();
        const path=[];for(let step=0;step<=256;step++)path.push(orbitPosition(radius,step/256*Math.PI*2,mobile));
        const line=new T.Line(new T.BufferGeometry().setFromPoints(path),new T.LineBasicMaterial({color:index<4?0x9d90b8:0x797899,transparent:true,opacity:.24,depthWrite:false}));line.userData.planet=id;orbits.add(line);
      });
      groups.forEach(g=>{if(g.userData.body.id!=='uranus')g.rotation.z=0;});
      const width=mobile?32:55,height=mobile?55:35,tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));home.set(0,0,Math.max(width/(2*tan*camera.aspect),height/(2*tan))*1.06+8);
      $('#atlas').dataset.orbitCount=String(orbits.children.length);
    }
    function layout(){
      const visible=visibleGroups(),mobile=host.clientWidth<650,n=visible.length,rng=seeded(707+n*17);
      orbits.children.forEach(line=>{line.geometry.dispose();line.material.dispose();});
      if(currentFilter==='solar'){buildSolarLayout(mobile);return;}
      orbits.clear();$('#atlas').dataset.orbitCount='0';
      const width=mobile?(n<5?12:19):(n<5?22:n<12?34:44),height=mobile?(n<5?13:30):(n<5?12:n<12?18:25),placed=[];
      visible.forEach((g,i)=>{
        let best=null,bestScore=-1;
        for(let k=0;k<180;k++){
          const angle=rng()*Math.PI*2,rr=Math.sqrt(rng())*.94,x=Math.cos(angle)*rr*width*.5,y=Math.sin(angle)*rr*height*.5;
          const score=placed.length?Math.min(...placed.map(p=>Math.hypot(x-p.x,y-p.y)/(g.userData.radius+p.radius+.7))):Math.hypot(x,y)*.08;
          if(score>bestScore){bestScore=score;best={x,y};}
        }
        const z=(rng()-.5)*9;g.position.set(best.x,best.y,z);g.userData.base=g.position.clone();g.userData.phase=rng()*Math.PI*2;g.userData.tilt=(rng()-.5)*.55;
        if(g.userData.body.id!=='uranus')g.rotation.z=g.userData.tilt;
        placed.push({...best,radius:g.userData.radius});
      });
      const tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));home.set(0,0,Math.max(width/(2*tan*camera.aspect),height/(2*tan))*1.13+7);
    }
    function sceneIsVisible(){const rect=host.getBoundingClientRect();return rect.width>0&&rect.height>0&&rect.bottom>-100&&rect.top<innerHeight+100;}
    function requestFrame(){
      if(document.hidden||(!inView&&!sceneIsVisible()))return;
      // A stopped scene still needs a first picture and updates after image decoding.
      if(paused&&!animating){cancelAnimationFrame(frame);frame=0;render(performance.now());}else if(!frame)frame=requestAnimationFrame(render);
    }
    function tweenCamera(position,look){
      if(window.gsap){gsap.killTweensOf(camera.position);gsap.killTweensOf(target);animating=true;const opts={duration:reduced?0:1.6,ease:'power3.inOut',onUpdate:()=>{camera.lookAt(target);requestFrame();}};gsap.to(target,{...opts,x:look.x,y:look.y,z:look.z});gsap.to(camera.position,{...opts,x:position.x,y:position.y,z:position.z,onComplete:()=>{animating=false;requestFrame();}});requestFrame();}
      else{cancelAnimationFrame(tweenFrame);const start=performance.now(),from=camera.position.clone(),fromTarget=target.clone();animating=true;const tick=now=>{const progress=reduced?1:Math.min(1,(now-start)/1600),e=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;camera.position.lerpVectors(from,position,e);target.lerpVectors(fromTarget,look,e);camera.lookAt(target);requestFrame();if(progress<1)tweenFrame=requestAnimationFrame(tick);else animating=false;};tweenFrame=requestAnimationFrame(tick);}
    }
    function updateVisibility(){orbits.visible=currentFilter==='solar'&&!activeId;groups.forEach((g,id)=>{g.visible=activeId?id===activeId:matchesFilter(g.userData.body);labels.get(id).hidden=!g.visible||!!activeId;});}
    function select(id,index){
      updateVisibility();const g=groups.get(id);if(!g)return;const r=g.userData.radius,center=g.position.clone(),mobile=host.clientWidth<650,side=mobile?0:r*1.3,look=center.clone().add(new T.Vector3(side,0,0)),dist=r*(id==='saturn'||id==='quaoar'?8.5:6.5),offsets=[[0,.5,dist],[0,dist,.15],[-dist,.3,0],[dist,.3,0]],o=offsets[index];
      tweenCamera(center.clone().add(new T.Vector3(o[0]+side,o[1],o[2])),look);
      $('#hover-label').hidden=true;
    }
    function reset(){updateVisibility();tweenCamera(home.clone(),new T.Vector3());}
    function resize(){const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();layout();if(activeId)select(activeId,view);else{camera.position.copy(home);target.set(0,0,0);camera.lookAt(target);}requestFrame();}
    function render(time){
      frame=0;if(document.hidden||(!inView&&!sceneIsVisible()))return;const dt=Math.min((time-lastTime)||16,60);lastTime=time;if(!paused)localTime+=dt;
      if(!paused){starField.rotation.z=localTime*.000003;groups.forEach((g,i)=>{if(!g.visible)return;if(!activeId&&g.userData.base){if(currentFilter==='solar'){if(g.userData.body.id==='sun')g.position.set(0,0,0);else{const o=g.userData.orbit;g.position.copy(orbitPosition(o.radius,o.phase+localTime*.000008/(1+o.index*.65),o.mobile));}}else{const phase=g.userData.phase;g.position.x=g.userData.base.x+Math.sin(localTime*.00015+phase)*.32;g.position.y=g.userData.base.y+Math.cos(localTime*.0002+phase)*.37;g.position.z=g.userData.base.z+Math.sin(localTime*.00012+phase)*.2;}}g.userData.spin.forEach(m=>m.rotation.y=localTime*.000035);if(g.userData.binary)g.userData.binary.forEach((m,j)=>m.position.set(Math.cos(localTime*.0006+j*Math.PI)*.86,Math.sin(localTime*.0006+j*Math.PI)*.35,Math.sin(localTime*.0006+j*Math.PI)*.5));if(g.userData.moons)g.userData.moons.forEach((m,j)=>m.position.set(Math.cos(localTime*.0003+j*1.7)*(1.6+j*.24),Math.sin(j)*.25,Math.sin(localTime*.0003+j*1.7)*(1.6+j*.24)));});}
      if(!activeId&&!paused&&fineQuery.matches&&!animating){camera.position.x+=(pointer.x*.5-camera.position.x)*.015;camera.position.y+=(-pointer.y*.35-camera.position.y)*.015;camera.lookAt(target);}
      groups.forEach((g,id)=>{const label=labels.get(id);if(!g.visible||activeId){label.hidden=true;return;}const p=g.position.clone().project(camera),edge=g.position.clone().add(new T.Vector3(g.userData.radius,0,0)).project(camera),x=(p.x*.5+.5)*host.clientWidth,y=(-p.y*.5+.5)*host.clientHeight,r=Math.abs(edge.x-p.x)*host.clientWidth*.5;g.userData.screen={x,y,r};const diameter=Math.max(innerWidth<700?34:24,r*2+8);label.style.width=label.style.height=diameter+'px';label.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;label.hidden=p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1;});
      if(!paused){const positions=starsGeo.attributes.position.array;for(let i=Math.floor(starCount*.38);i<starCount;i++){const at=i*3;positions[at+2]+=dt*.0025;if(positions[at+2]>-18)positions[at+2]=-115;}starsGeo.attributes.position.needsUpdate=true;}
      renderer.render(scene,camera);host.dataset.rendered='true';if(!paused||animating)requestFrame();
    }
    function nearestObject(event){const rect=host.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;let found=null,best=Infinity;groups.forEach((g,id)=>{const s=g.userData.screen;if(!g.visible||!s)return;const distance=Math.hypot(x-s.x,y-s.y);if(distance<Math.min(68,s.r+28)&&distance<best){best=distance;found=id;}});return found;}
    host.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch'||!fineQuery.matches)return;const rect=host.getBoundingClientRect();mouse.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects(meshes.filter(m=>groups.get(m.userData.id)?.visible),false)[0];
      const candidate=hit?.object.userData.id||nearestObject(event);if(hovered&&hovered!==candidate){const g=groups.get(hovered);g.userData.glow.material.opacity=g.userData.baseOpacity;}hovered=candidate;
      const tip=$('#hover-label');if(hovered&&!activeId){const b=byId[hovered];groups.get(hovered).userData.glow.material.opacity=.22;tip.replaceChildren(document.createTextNode(b.name));const small=document.createElement('small');small.textContent=TYPES[b.type];tip.append(small);tip.hidden=false;tip.style.left=`${Math.max(5,Math.min(rect.width-200,event.clientX-rect.left+15))}px`;tip.style.top=`${Math.max(20,event.clientY-rect.top-60)}px`;}else tip.hidden=true;requestFrame();
    },{passive:true});
    host.addEventListener('pointerleave',()=>{$('#hover-label').hidden=true;if(hovered){const g=groups.get(hovered);g.userData.glow.material.opacity=g.userData.baseOpacity;hovered=null;requestFrame();}});
    let down=null;host.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};},{passive:true});
    host.addEventListener('click',event=>{if(event.target.closest('button'))return;if(down&&Math.hypot(event.clientX-down.x,event.clientY-down.y)>10)return;const rect=host.getBoundingClientRect();mouse.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects(meshes.filter(m=>groups.get(m.userData.id)?.visible),false)[0];const hitId=hit?.object.userData.id||(!activeId&&nearestObject(event));if(hitId)selectObject(hitId);else exitObject();});
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();inView=false;cancelAnimationFrame(frame);renderer.dispose();renderFallback();galaxy=null;});
    const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)requestFrame();},{rootMargin:'100px'});observer.observe(host);new ResizeObserver(resize).observe(host);
    addEventListener('scroll',()=>{const visible=sceneIsVisible();if(visible&&!inView){inView=true;requestFrame();}else if(!visible)inView=false;},{passive:true});
    galaxy={select,reset,requestFrame,filter:()=>{layout();updateVisibility();reset();}};resize();
  }
  try{initGalaxy();}catch{renderFallback();}
  applyFilter(currentFilter);

  // More planet cards, generated from the same sourced atlas data.
  const morePlanets=bodies.filter(b=>b.type==='planet'&&!['mars','jupiter','saturn'].includes(b.id));
  const moreButton=document.createElement('button');moreButton.className='button button-outline';moreButton.style.marginTop='25px';moreButton.textContent='Открыть остальные планеты +';moreButton.setAttribute('aria-expanded','false');
  const moreGrid=document.createElement('div');moreGrid.className='planet-grid more-planets';moreGrid.hidden=true;moreGrid.style.marginTop='30px';
  morePlanets.forEach(b=>{const article=document.createElement('article');article.className='planet-card';const art=document.createElement('div');art.className='planet-art';art.dataset.artObject=b.id;const canvas=document.createElement('canvas');canvas.setAttribute('role','img');canvas.setAttribute('aria-label',b.name+' — художественная визуализация');illustrate(canvas,b.id);art.append(canvas);const copy=document.createElement('div');copy.className='card-copy';const h=document.createElement('h3');h.textContent=b.name;const p=document.createElement('p');p.textContent=b.description;const d=document.createElement('details');const s=document.createElement('summary');s.textContent='Узнать больше +';const fact=document.createElement('p');fact.textContent=b.feature;const source=document.createElement('a');source.href=b.source;source.className='source-link';source.target='_blank';source.rel='noopener noreferrer';source.textContent='NASA · '+b.name+' ↗';d.append(s,fact,source);const go=document.createElement('button');go.className='text-link';go.dataset.go=b.id;go.textContent='Рассмотреть в галактике ↗';copy.append(h,p,d,go);article.append(art,copy);moreGrid.append(article);});
  $('.planet-grid').after(moreButton,moreGrid);moreButton.addEventListener('click',()=>{moreGrid.hidden=!moreGrid.hidden;moreButton.setAttribute('aria-expanded',String(!moreGrid.hidden));moreButton.textContent=moreGrid.hidden?'Открыть остальные планеты +':'Свернуть дополнительные карточки −';});
  document.addEventListener('click',event=>{const go=event.target.closest('[data-go]');if(go){applyFilter(solarIds.has(go.dataset.go)?'solar':'all');selectObject(go.dataset.go);$('#atlas').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});}});

  // Quiz: questions derive exclusively from the explanations shown above.
  const questions=[
    {symbol:'☾',q:'Какой объект — естественный спутник Земли?',answers:['Луна','Марс','Венера','Солнце'],answer:0,why:'Луна обращается вокруг Земли. Марс и Венера — планеты, а Солнце — звезда.',source:byId.moon.source},
    {symbol:'◎',q:'Из чего состоят кольца Сатурна?',answers:['Из сплошного металла','Из частиц льда, камня и пыли','Из жидкой воды','Только из света'],answer:1,why:'Кольца состоят из множества отдельных частиц, движущихся вокруг планеты.',source:byId.saturn.source},
    {symbol:'✦',q:'Какого цвета обычно более горячие звёзды?',answers:['Красного','Оранжевого','Голубого или белого','Зелёного'],answer:2,why:'Более горячие звёзды выглядят голубыми или белыми; более холодные — красными или оранжевыми.',source:nasa+'exoplanets/stars/'},
    {symbol:'◉',q:'Откуда у Марса красноватый оттенок?',answers:['От лесов','От окисленных минералов железа','От колец','От жидкой лавы повсюду'],answer:1,why:'Окисленные минералы железа в породах и пыли придают Марсу его характерный оттенок.',source:byId.mars.source},
    {symbol:'✧ ✦',q:'Что связывает светила в двойной звезде?',answers:['Общий центр масс и гравитация','Сплошное кольцо','Только одинаковый цвет','Атмосфера Земли'],answer:0,why:'Две гравитационно связанные звезды движутся вокруг общего центра масс.',source:byId.binary.source},
    {symbol:'≋',q:'Что такое полосы Юпитера?',answers:['Материки','Трещины во льду','Облачные структуры атмосферы','Следы колёс'],answer:2,why:'Светлые зоны и тёмные пояса — облачные структуры в атмосфере газового гиганта.',source:byId.jupiter.source},
    {symbol:'◇',q:'К какому типу объектов относится Плутон?',answers:['Звезда','Спутник Земли','Карликовая планета','Комета'],answer:2,why:'Плутон — карликовая планета пояса Койпера. Он доступен в фильтре «Карликовые планеты» нашего атласа.',source:byId.pluto.source}
  ];
  let questionIndex=0,score=0,answered=false;
  function showQuestion(){
    answered=false;const q=questions[questionIndex];$('#quiz-counter').textContent=`${String(questionIndex+1).padStart(2,'0')} / 07`;$('#quiz-progress-bar').style.width=`${(questionIndex+1)/questions.length*100}%`;$('#quiz-symbol').textContent=q.symbol;$('#quiz-question').textContent=q.q;$('#quiz-question').hidden=false;$('#quiz-symbol').hidden=false;$('#quiz-answers').hidden=false;$('#quiz-feedback').hidden=true;$('#quiz-next').hidden=true;$('#quiz-result').hidden=true;$('#quiz-answers').replaceChildren();
    q.answers.forEach((answer,i)=>{const button=document.createElement('button');button.className='quiz-answer';button.textContent=answer;button.addEventListener('click',()=>chooseAnswer(i));$('#quiz-answers').append(button);});
  }
  function chooseAnswer(index){
    if(answered)return;answered=true;const q=questions[questionIndex],correct=index===q.answer;if(correct)score++;
    $$('.quiz-answer').forEach((button,i)=>{button.disabled=true;button.classList.toggle('correct',i===q.answer);button.classList.toggle('wrong',i===index&&!correct);});
    const feedback=$('#quiz-feedback'),strong=document.createElement('strong');strong.textContent=correct?'Точно! Ещё одно открытие.':'Теперь ты знаешь чуть больше.';const text=document.createElement('p');text.textContent=q.why;const source=document.createElement('a');source.href=q.source;source.target='_blank';source.rel='noopener noreferrer';source.className='source-link';source.textContent='Проверить источник ↗';feedback.replaceChildren(strong,text,source);feedback.hidden=false;$('#quiz-next').hidden=false;$('#quiz-next').textContent=questionIndex===questions.length-1?'Посмотреть результат →':'Следующий вопрос →';
  }
  $('#quiz-next').addEventListener('click',()=>{questionIndex++;if(questionIndex<questions.length){showQuestion();$('#quiz-question').setAttribute('tabindex','-1');$('#quiz-question').focus({preventScroll:true});}else showResult();});
  function showResult(){
    ['quiz-question','quiz-symbol','quiz-answers','quiz-feedback','quiz-next'].forEach(id=>$('#'+id).hidden=true);const result=$('#quiz-result');result.hidden=false;const points=document.createElement('p');points.className='quiz-score';points.textContent=`${score} / ${questions.length}`;const title=document.createElement('h3');title.textContent=score===7?'Космическая интуиция!':'Любопытство уже на орбите.';const copy=document.createElement('p');copy.className='quiz-result-copy';copy.textContent='Теперь знакомые точки на небе стали немного ближе. Продолжим исследование?';const again=document.createElement('button');again.className='button button-light';again.textContent='Попробовать ещё ↻';again.addEventListener('click',()=>{score=0;questionIndex=0;showQuestion();});const back=document.createElement('a');back.href='#explore';back.className='text-link';back.textContent='Вернуться в галактику ↗';result.replaceChildren(points,title,copy,again,back);result.setAttribute('tabindex','-1');result.focus({preventScroll:true});
  }
  showQuestion();

  // Local media and accessible native dialog. No missing image URLs are requested.
  const lightbox=$('#lightbox');let previousFocus=null;
  function openLightbox(content,caption){
    previousFocus=document.activeElement;const figure=$('#lightbox-content');const figcaption=document.createElement('figcaption');figcaption.textContent=caption;figure.replaceChildren(content,figcaption);lightbox.showModal();$('#lightbox-close').focus();
  }
  function closeLightbox(){lightbox.close();previousFocus?.focus({preventScroll:true});}
  $('#lightbox-close').addEventListener('click',closeLightbox);lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox();});lightbox.addEventListener('cancel',e=>{e.preventDefault();closeLightbox();});
  $$('.planet-art').forEach(art=>{const id=art.dataset.artObject||art.closest('[data-card]')?.dataset.card;if(!id)return;art.setAttribute('role','button');art.tabIndex=0;art.setAttribute('aria-label',`Открыть иллюстрацию: ${byId[id].name}`);const open=()=>{const c=document.createElement('canvas');illustrate(c,id);openLightbox(c,`${byId[id].name}. 3D-визуализация. ${visualEngine.credit(id).label}. Не снимок через телескоп.`);};art.addEventListener('click',open);art.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});});
  function createPhoto(item,button){
    if(!item||!item.src?.startsWith('images/'))return;
    const image=new Image();image.alt=item.caption;image.width=item.width||1400;image.height=item.height||1000;image.loading='lazy';
    image.onerror=()=>{image.onerror=null;button.replaceChildren();const card=document.createElement('span');card.className='photo-placeholder';card.textContent=`[${item.caption}]`;button.append(card);button.disabled=true;};
    image.onload=()=>{image.dataset.mediaReady='true';button.disabled=false;};
    const embedded=window.COSMOS_MEDIA_DATA?.[item.src];
    // Keep a portable relative src; the complete 1x candidate takes priority over
    // that fallback, so a missing images/ folder does not create a broken request.
    if(embedded?.startsWith('data:image/')){image.srcset=embedded+' 1x';image.dataset.mediaSource='embedded';}
    image.src=item.src;button.replaceChildren(image);
    button.addEventListener('click',()=>{if(!image.complete||!image.naturalWidth)return;const full=image.cloneNode();full.loading='eager';openLightbox(full,`${item.caption} · ${item.credit||'[Источник фотографии]'}`);});
  }
  if(media.dome){createPhoto(media.dome,$('[data-photo-slot="dome"]'));$('#dome-caption').textContent=media.dome.caption+' · '+media.dome.credit;}else{$('[data-photo-slot="dome"]').disabled=true;}
  media.gallery.forEach(item=>{const figure=document.createElement('figure'),button=document.createElement('button'),caption=document.createElement('figcaption');button.className='photo-button';button.setAttribute('aria-label','Смотреть: '+item.caption);caption.textContent=item.caption+' · '+(item.credit||'[Источник фотографии]');createPhoto(item,button);figure.append(button,caption);$('#visit-gallery').append(figure);});
  if(media.video?.src?.startsWith('media/')){const video=document.createElement('video');video.src=media.video.src;video.controls=true;video.playsInline=true;video.preload='none';if(media.video.poster?.startsWith('images/'))video.poster=media.video.poster;const caption=document.createElement('p');caption.className='visual-caption';caption.textContent=media.video.caption+' · '+(media.video.credit||'[Источник видео]');$('#visit-video').append(video,caption);}
})();
