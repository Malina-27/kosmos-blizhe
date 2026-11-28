/* Local planetary maps and physically shaded canvas portraits.
 * Texture attribution: images/textures/credits.json and ASSETS.md.
 * Unmapped surfaces are artistic reconstructions, never measured terrain.
 */
(() => {
  'use strict';
  const mapped = new Set('sun mercury venus earth moon mars jupiter saturn uranus neptune io europa ganymede callisto tethys dione rhea iapetus ariel umbriel titania oberon triton haumea makemake eris pluto'.split(' '));
  const jpl = new Set('io europa ganymede callisto tethys dione rhea iapetus ariel umbriel titania oberon triton'.split(' '));
  const illustrative = new Set('haumea makemake eris'.split(' '));
  const seedOf=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,19);
  function random(seed){let state=seed;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
  const smooth=x=>x*x*(3-2*x);
  function noise(x,y,z,seed){
    const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),fx=smooth(x-xi),fy=smooth(y-yi),fz=smooth(z-zi);
    const n=(a,b,c)=>{let v=Math.imul(a,374761393)^Math.imul(b,668265263)^Math.imul(c,1274126177)^seed;v=Math.imul(v^(v>>>13),1274126177);return((v^(v>>>16))>>>0)/4294967295;};
    const mix=(a,b,t)=>a+(b-a)*t;
    const p=(zv)=>mix(mix(n(xi,yi,zv),n(xi+1,yi,zv),fx),mix(n(xi,yi+1,zv),n(xi+1,yi+1,zv),fx),fy);
    return mix(p(zi),p(zi+1),fz);
  }
  function fbm(x,y,z,seed){let value=0,amp=.5;for(let i=0;i<5;i++){value+=noise(x,y,z,seed+i*71)*amp;x*=2.07;y*=2.07;z*=2.07;amp*=.5;}return value;}

  function completeCoverage(photo,draft){
    const {width,height,data}=photo,count=width*height,distance=new Float32Array(count),mean=[0,0,0],draftMean=[0,0,0];let missing=0,valid=0;
    for(let p=0;p<count;p++){
      const at=p*4,brightness=Math.max(data[at],data[at+1],data[at+2]);distance[p]=brightness<22?0:1e6;
      if(brightness<22)missing++;
      if(brightness>35){for(let c=0;c<3;c++)mean[c]+=data[at+c];valid++;}
      for(let c=0;c<3;c++)draftMean[c]+=draft.data[at+c];
    }
    if(missing<count*.005||!valid)return false;
    for(let c=0;c<3;c++){mean[c]/=valid;draftMean[c]=Math.max(1,draftMean[c]/count);}
    // A narrow feather removes the hard edge of a photographic mosaic's coverage.
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){const p=y*width+x;if(x)distance[p]=Math.min(distance[p],distance[p-1]+1);if(y)distance[p]=Math.min(distance[p],distance[p-width]+1);}
    for(let y=height-1;y>=0;y--)for(let x=width-1;x>=0;x--){const p=y*width+x;if(x+1<width)distance[p]=Math.min(distance[p],distance[p+1]+1);if(y+1<height)distance[p]=Math.min(distance[p],distance[p+width]+1);}
    for(let p=0;p<count;p++){
      if(distance[p]>=10)continue;const at=p*4,weight=1-smooth(distance[p]/10);
      for(let c=0;c<3;c++){const neutral=mean[c]*(.84+.16*draft.data[at+c]/draftMean[c]);data[at+c]=Math.round(data[at+c]*(1-weight)+neutral*weight);}
      data[at+3]=255;
    }
    return true;
  }

  function create(bodies){
    const lookup=Object.fromEntries(bodies.map(b=>[b.id,b])),maps=new Map(),pixels=new Map(),listeners=new Map(),portraits=new Map(),states=new Map(),completedMaps=new Set();
    const WIDTH=1024,HEIGHT=512,embedded=window.COSMOS_TEXTURE_DATA||{};
    let ringPixels=null;
    function imageSource(id){
      if(window.COSMOS_TEXTURE_DATA?.[id])return window.COSMOS_TEXTURE_DATA[id];
      if(location.protocol==='file:')return 'images/maps-v6/'+id+'.webp';
      return 'images/maps-v6/'+id+'.webp';
    }
    function announce(id){
      pixels.delete(id);
      document.documentElement.dataset.readyTextures=String([...states.values()].filter(s=>s==='ready').length);
      document.documentElement.dataset.fallbackTextures=String([...states.values()].filter(s=>s==='fallback').length);
      document.documentElement.dataset.completedMaps=[...completedMaps].join(' ');
      for(const fn of listeners.get(id)||[]){try{fn();}catch{document.documentElement.dataset.visualCallbackFailure='true';}}
      for(const c of portraits.get(id)||[]){if(c.isConnected)draw(c,id,c.dataset.hero==='true');}
    }
    function onReady(id,callback){if(!listeners.has(id))listeners.set(id,[]);listeners.get(id).push(callback);}
    function generate(body){
      const detail=mapped.has(body.id)?64:256,height=detail/2,draft=document.createElement('canvas');draft.width=detail;draft.height=height;
      const ctx=draft.getContext('2d'),image=ctx.createImageData(detail,height),base=body.color.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)),seed=seedOf(body.id);
      for(let y=0;y<height;y++){
        const lat=(y/(height-1)-.5)*Math.PI,ny=Math.sin(lat),c=Math.cos(lat);
        for(let x=0;x<detail;x++){
          const lon=(x/detail-.5)*Math.PI*2,nx=Math.sin(lon)*c,nz=Math.cos(lon)*c;
          const terrain=fbm(nx*3+12,ny*3+12,nz*3+12,seed),fine=noise(nx*70+80,ny*70+80,nz*70+80,seed),large=noise(nx*1.3+3,ny*1.3+3,nz*1.3+3,seed);
          let factor=.58+terrain*.85+(fine-.5)*.07;
          if(body.id==='titan')factor=.91+terrain*.12;
          if(body.id==='charon')factor*=ny<-.6?.57:1;
          if(body.id==='pluto')factor*=.8+large*.4;
          const i=(y*detail+x)*4;for(let ch=0;ch<3;ch++)image.data[i+ch]=Math.min(255,base[ch]*factor);image.data[i+3]=255;
        }
      }
      ctx.putImageData(image,0,0);
      const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;canvas.getContext('2d').drawImage(draft,0,0,WIDTH,HEIGHT);return canvas;
    }
    function texture(body){
      if(maps.has(body.id))return maps.get(body.id);
      const canvas=generate(body);maps.set(body.id,canvas);states.set(body.id,mapped.has(body.id)?'loading':'reconstruction');
      if(mapped.has(body.id)){
        const source=imageSource(body.id);
        const fallback=()=>{canvas.dataset.reconstruction='true';states.set(body.id,'fallback');announce(body.id);};
        if(!source){fallback();return canvas;}
        const image=new Image();image.crossOrigin='anonymous';image.decoding='async';
        image.onload=()=>{
          try{
            const staging=document.createElement('canvas');staging.width=WIDTH;staging.height=HEIGHT;const ctx=staging.getContext('2d');ctx.drawImage(image,0,0,WIDTH,HEIGHT);
            const photo=ctx.getImageData(0,0,WIDTH,HEIGHT); // Validate origin before touching the shared GPU/canvas surface.
            // Voyager mosaics contain unobserved regions stored as black, not dark terrain.
            // Fill only that no-data range; retain measured pixels and disclose the completion.
            if(jpl.has(body.id)||body.id==='pluto'){
              const draft=canvas.getContext('2d').getImageData(0,0,WIDTH,HEIGHT);
              if(completeCoverage(photo,draft)){ctx.putImageData(photo,0,0);completedMaps.add(body.id);canvas.dataset.completedCoverage='true';}
            }
            const target=canvas.getContext('2d');target.clearRect(0,0,WIDTH,HEIGHT);target.drawImage(staging,0,0);
            states.set(body.id,'ready');announce(body.id);
          }catch{fallback();}
        };
        image.onerror=fallback;image.src=source;
      }else canvas.dataset.reconstruction='true';
      return canvas;
    }
    function samplePixels(id){
      if(pixels.has(id))return pixels.get(id);
      let canvas=texture(lookup[id]),sample;
      try{sample=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,WIDTH,HEIGHT);}
      catch{canvas=generate(lookup[id]);maps.set(id,canvas);states.set(id,'fallback');sample=canvas.getContext('2d').getImageData(0,0,WIDTH,HEIGHT);queueMicrotask(()=>announce(id));}
      pixels.set(id,sample);return sample;
    }
    function drawRing(ctx,cx,cy,r,front){
      ctx.save();ctx.translate(cx,cy);ctx.rotate(-.08);
      const data=ringPixels;
      const steps=160;for(let i=0;i<steps;i++){
        const ratio=i/(steps-1),rr=r*(1.35+ratio*.9),index=data?Math.min(data.width-1,Math.floor(ratio*(data.width-1)))*4:0;
        let alpha=data?data.data[index+3]/255:(i>72&&i<82?.035:.45+(i%9)*.035);alpha*=front?.88:.52;
        const color=data?[data.data[index],data.data[index+1],data.data[index+2]]:[197,183,159];
        ctx.strokeStyle=`rgba(${color.join(',')},${alpha})`;ctx.lineWidth=r*.009;ctx.beginPath();ctx.ellipse(0,0,rr,rr*.34,0,front?0:Math.PI,front?Math.PI:Math.PI*2);ctx.stroke();
      }ctx.restore();
    }
    function draw(canvas,id,hero=false){
      const body=lookup[id]||lookup.saturn;canvas.dataset.hero=String(hero);canvas.dataset.visualId=body.id;
      if(!portraits.has(id))portraits.set(id,new Set());portraits.get(id).add(canvas);
      const src=id==='binary'?null:samplePixels(id);
      const w=hero?1500:600,h=hero?980:440;canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,w,h);
      if(id==='binary'){
        for(let j=0;j<2;j++){const x=w*.5+(j?85:-85),y=h*.5,g=ctx.createRadialGradient(x,y,0,x,y,115);g.addColorStop(0,'#fff');g.addColorStop(.2,j?'#d7e6ff':'#fff3d2');g.addColorStop(.25,j?'#95b9ff99':'#ffc36d88');g.addColorStop(.55,j?'#6284ff16':'#e1a35216');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-120,y-120,240,240);}return;
      }
      const radius=hero?230:(id==='saturn'?77:124),rx=radius*(['haumea','varuna'].includes(id)?1.45:1),ry=radius*(['haumea','varuna'].includes(id)?.72:1),cx=w*.5,cy=h*.5;
      if(id==='saturn')drawRing(ctx,cx,cy,radius,false);
      const sizeX=Math.ceil(rx*2+4),sizeY=Math.ceil(ry*2+4),out=ctx.createImageData(sizeX,sizeY),sun=id==='sun';
      for(let y=0;y<sizeY;y++)for(let x=0;x<sizeX;x++){
        const nx=(x-sizeX/2)/rx,ny=-(y-sizeY/2)/ry,d=nx*nx+ny*ny;if(d>1)continue;
        const nz=Math.sqrt(1-d),u=(Math.atan2(nx,nz)/(Math.PI*2)+.5),v=.5-Math.asin(ny)/Math.PI;
        const sx=Math.min(src.width-1,Math.max(0,Math.floor(u*src.width))),sy=Math.min(src.height-1,Math.max(0,Math.floor(v*src.height))),si=(sy*src.width+sx)*4,oi=(y*sizeX+x)*4;
        const lambert=Math.max(0,nx*-.49+ny*.46+nz*.74),shade=sun?1:.035+Math.pow(lambert,.86)*.99;
        const rim=id==='earth'?Math.pow(1-nz,5)*Math.max(.05,lambert)*.42:0;
        out.data[oi]=Math.min(255,src.data[si]*shade+rim*30);out.data[oi+1]=Math.min(255,src.data[si+1]*shade+rim*110);out.data[oi+2]=Math.min(255,src.data[si+2]*shade+rim*210);out.data[oi+3]=Math.min(255,(1-d)*radius*180);
      }
      const layer=document.createElement('canvas');layer.width=sizeX;layer.height=sizeY;layer.getContext('2d').putImageData(out,0,0);ctx.drawImage(layer,cx-sizeX/2,cy-sizeY/2);
      if(id==='saturn')drawRing(ctx,cx,cy,radius,true);
      canvas.dataset.visualState=states.get(id)||'reconstruction';
    }
    const ringSource=imageSource('saturn_ring');
    if(ringSource){const ringImage=new Image();ringImage.crossOrigin='anonymous';ringImage.onload=()=>{try{const ring=document.createElement('canvas');ring.width=1024;ring.height=1;const ctx=ring.getContext('2d');ctx.drawImage(ringImage,0,0,1024,1);ringPixels=ctx.getImageData(0,0,1024,1);}catch{ringPixels=null;}for(const c of portraits.get('saturn')||[]){if(c.isConnected)draw(c,'saturn',c.dataset.hero==='true');}};ringImage.src=ringSource;}
    function credit(id){if(states.get(id)==='fallback')return{label:'Карта не загрузилась — показана художественная реконструкция',url:null};const note=completedMaps.has(id)?' · незаснятые области дополнены художественно':'';if(jpl.has(id))return{label:'Карта: NASA / JPL / USGS'+note,url:'https://maps.jpl.nasa.gov/'};if(id==='pluto')return{label:'Карта: NASA / JHUAPL / SwRI'+note,url:'https://science.nasa.gov/resource/pluto-global-color-map/'};if(mapped.has(id))return{label:illustrative.has(id)?'Художественная карта: Solar System Scope · CC BY 4.0':'Карта: Solar System Scope · CC BY 4.0',url:'https://www.solarsystemscope.com/textures/'};return{label:'Художественная реконструкция; карта поверхности неизвестна',url:null};}
    return{texture,draw,onReady,credit,mapped,imageSource};
  }
  window.CosmicVisuals={create,completeCoverage};
})();
