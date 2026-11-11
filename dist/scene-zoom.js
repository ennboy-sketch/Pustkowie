'use strict';
(() => {
  const MIN=1,MAX=3;
  function mount(view,scene){
    const previousZoom=scene.style.zoom,previousTouch=view.style.touchAction,previousTab=view.getAttribute('tabindex');
    if(previousTab===null)view.tabIndex=0;
    const previousWidth=scene.style.width,previousHeight=scene.style.height;
    let mapObserver=null;
    if(view.matches('.world-viewport')){
      const fit=()=>{
        if(!view.clientWidth)return;
        if(scene.matches('.is-glade,.is-ubocze,.is-hell-gates')){const height=Math.max(630,view.clientHeight);scene.style.width=`${Math.max(view.clientWidth,height*1.5)}px`;scene.style.height=`${height}px`;return;}
        const mobile=matchMedia('(max-width:700px)').matches;
        scene.style.width=`${mobile?900:view.clientWidth}px`;
        scene.style.height=`${mobile?Math.max(630,view.clientHeight):view.clientHeight}px`;
      };
      mapObserver=new ResizeObserver(fit);mapObserver.observe(view);fit();
    }
    view.classList.add('scene-zoom-viewport');view.style.touchAction='none';
    const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
    const pointers=new Map();
    let scale=1,disposed=false,gesture=false,pinch=null,pan=null,pending=null,frame=0,inertia=0;
    function update(){
      view.dataset.zoomScale=String(scale);
    }
    function local(x,y){const r=view.getBoundingClientRect();return{x:x-r.left-view.clientLeft,y:y-r.top-view.clientTop};}
    function apply(){
      frame=0;
      if(disposed||!pending)return;
      const next=pending;pending=null;
      if(next.type==='zoom'){
        const point=next.world||{x:(view.scrollLeft+next.anchor.x)/scale,y:(view.scrollTop+next.anchor.y)/scale};
        scale=next.scale;scene.style.zoom=String(scale);
        view.scrollLeft=point.x*scale-next.anchor.x;view.scrollTop=point.y*scale-next.anchor.y;update();
      }else{view.scrollLeft=next.left;view.scrollTop=next.top;}
    }
    function flush(){if(frame)cancelAnimationFrame(frame);apply();}
    function schedule(next){pending=next;if(!frame)frame=requestAnimationFrame(apply);}
    function haltInertia(){if(inertia)cancelAnimationFrame(inertia);inertia=0;}
    function zoom(next,anchor={x:view.clientWidth/2,y:view.clientHeight/2},world=null){
      if(disposed)return;haltInertia();
      schedule({type:'zoom',scale:Math.max(MIN,Math.min(MAX,next)),anchor,world});
    }
    function coast(vx,vy){
      if(reducedMotion.matches||Math.hypot(vx,vy)<.04)return;
      let last=performance.now();
      function tick(now){
        inertia=0;if(disposed||!view.isConnected||document.hidden)return;
        const dt=Math.min(32,now-last);last=now;
        const decay=Math.exp(-.006*dt),distance=(1-decay)/.006;
        const left=view.scrollLeft,top=view.scrollTop;
        view.scrollLeft=left+vx*distance;view.scrollTop=top+vy*distance;
        vx*=decay;vy*=decay;
        if(Math.abs(view.scrollLeft-left)<.5)vx=0;
        if(Math.abs(view.scrollTop-top)<.5)vy=0;
        if(Math.hypot(vx,vy)>=.04)inertia=requestAnimationFrame(tick);
      }
      inertia=requestAnimationFrame(tick);
    }
    function wheel(e){
      if(!e.deltaY)return;e.preventDefault();
      const base=pending?.type==='zoom'?pending.scale:scale;
      zoom(base*Math.exp(-Math.max(-200,Math.min(200,e.deltaY))*.002),local(e.clientX,e.clientY));
    }
    function startPan(point){return{x:point.x,y:point.y,left:view.scrollLeft,top:view.scrollTop,lastX:point.x,lastY:point.y,time:performance.now(),vx:0,vy:0};}
    function beginPinch(){
      flush();
      const [a,b]=[...pointers.values()],mid=local((a.x+b.x)/2,(a.y+b.y)/2);
      pinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),scale,world:{x:(view.scrollLeft+mid.x)/scale,y:(view.scrollTop+mid.y)/scale}};
      gesture=true;pan=null;view.classList.add('is-dragging');
    }
    function down(e){
      if(e.pointerType==='mouse'&&e.button!==0)return;
      haltInertia();flush();
      if(!pointers.size)gesture=false;
      const point={x:e.clientX,y:e.clientY};pointers.set(e.pointerId,point);
      if(pointers.size===2)beginPinch();else if(pointers.size===1)pan=startPan(point);
    }
    function move(e){
      if(!pointers.has(e.pointerId))return;
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size>=2&&pinch){
        e.preventDefault();
        const [a,b]=[...pointers.values()];
        zoom(pinch.scale*Math.hypot(a.x-b.x,a.y-b.y)/pinch.distance,local((a.x+b.x)/2,(a.y+b.y)/2),pinch.world);
      }else if(pan){
        const dx=e.clientX-pan.x,dy=e.clientY-pan.y;
        if(!gesture&&Math.hypot(dx,dy)<6)return;
        gesture=true;e.preventDefault();view.classList.add('is-dragging');
        const now=performance.now(),dt=now-pan.time;
        if(dt>0){
          const weight=1-Math.exp(-dt/25);
          pan.vx=pan.vx*(1-weight)+(pan.lastX-e.clientX)/dt*weight;
          pan.vy=pan.vy*(1-weight)+(pan.lastY-e.clientY)/dt*weight;
        }
        pan.lastX=e.clientX;pan.lastY=e.clientY;pan.time=now;
        schedule({type:'pan',left:pan.left-dx,top:pan.top-dy});
      }
      if(gesture&&!view.hasPointerCapture(e.pointerId))view.setPointerCapture(e.pointerId);
    }
    function end(e){
      if(e.type==='lostpointercapture'&&e.target!==view)return;
      if(!pointers.has(e.pointerId))return;
      flush();
      const cancelled=e.type==='pointercancel'||e.type==='lostpointercapture'||e.type==='pointerleave';
      const velocity=!cancelled&&gesture&&pan&&performance.now()-pan.time<80?{x:pan.vx,y:pan.vy}:null;
      pointers.delete(e.pointerId);
      if(view.hasPointerCapture(e.pointerId))view.releasePointerCapture(e.pointerId);
      pinch=null;
      const remaining=[...pointers.values()][0];pan=remaining?startPan(remaining):null;
      if(!remaining){view.classList.remove('is-dragging');if(velocity)coast(velocity.x,velocity.y);}
    }
    function leave(e){if(!view.hasPointerCapture(e.pointerId))end(e);}
    function click(e){if(gesture){gesture=false;if(e.detail!==0){e.preventDefault();e.stopImmediatePropagation();}}}
    function key(e){
      if(e.target!==view)return;
      if(['+','=','-','0'].includes(e.key)){
        e.preventDefault();const base=pending?.type==='zoom'?pending.scale:scale;
        zoom(e.key==='0'?1:base+(e.key==='-'?-.25:.25));
      }
    }
    function restore(e){const p=e.detail;if(!p)return;zoom(p.scale,{x:view.clientWidth/2,y:view.clientHeight/2},{x:scene.clientWidth*p.x,y:scene.clientHeight*p.y});flush();}
    function suspend(){
      haltInertia();flush();
      const ids=[...pointers.keys()];pointers.clear();pan=null;pinch=null;
      for(const id of ids)if(view.hasPointerCapture(id))view.releasePointerCapture(id);
      view.classList.remove('is-dragging');
    }
    const dialog=view.closest('dialog');
    view.addEventListener('scene-restore',restore);view.addEventListener('wheel',wheel,{passive:false});
    view.addEventListener('pointerdown',down);view.addEventListener('pointermove',move,{passive:false});
    view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);view.addEventListener('lostpointercapture',end);view.addEventListener('pointerleave',leave);
    view.addEventListener('click',click,true);view.addEventListener('keydown',key);
    document.addEventListener('pointerdown',haltInertia,true);document.addEventListener('visibilitychange',suspend);
    window.addEventListener('blur',suspend);dialog?.addEventListener('close',suspend);update();
    return ()=>{
      suspend();disposed=true;
      if(mapObserver){mapObserver.disconnect();scene.style.width=previousWidth;scene.style.height=previousHeight;}
      scene.style.zoom=previousZoom;view.style.touchAction=previousTouch;view.classList.remove('scene-zoom-viewport');
      if(previousTab===null)view.removeAttribute('tabindex');delete view.dataset.zoomScale;
      view.removeEventListener('scene-restore',restore);view.removeEventListener('wheel',wheel);
      view.removeEventListener('pointerdown',down);view.removeEventListener('pointermove',move);view.removeEventListener('pointerup',end);view.removeEventListener('pointercancel',end);view.removeEventListener('lostpointercapture',end);view.removeEventListener('pointerleave',leave);
      view.removeEventListener('click',click,true);view.removeEventListener('keydown',key);
      document.removeEventListener('pointerdown',haltInertia,true);document.removeEventListener('visibilitychange',suspend);window.removeEventListener('blur',suspend);dialog?.removeEventListener('close',suspend);
    };
  }
  function inspector(source,title){
    const dialog=document.createElement('dialog');dialog.className='scene-inspector';dialog.setAttribute('aria-label',`Szczegóły lokacji: ${title}`);
    dialog.innerHTML='<div class="scene-inspector-top"><h2></h2><button type="button" aria-label="Zamknij podgląd lokacji">×</button></div><div class="scene-inspector-view" tabindex="0" aria-label="Przybliżany widok lokacji"><img class="scene-inspector-art" alt=""></div>';
    dialog.querySelector('h2').textContent=title;const view=dialog.querySelector('.scene-inspector-view'),art=view.querySelector('img');art.src=source;art.alt=title;document.body.append(dialog);
    let centered=false,closed=false;
    function fit(){if(!art.naturalWidth||!view.clientWidth)return;const ratio=Math.max(view.clientWidth/art.naturalWidth,view.clientHeight/art.naturalHeight);art.style.width=`${art.naturalWidth*ratio}px`;art.style.height=`${art.naturalHeight*ratio}px`;if(!centered){view.scrollLeft=Math.max(0,(view.scrollWidth-view.clientWidth)/2);centered=true;}}
    art.addEventListener('load',fit);const observer=new ResizeObserver(fit);observer.observe(view);dialog.showModal();fit();const stop=mount(view,art);
    function close(){if(closed)return;closed=true;stop();observer.disconnect();art.removeEventListener('load',fit);if(dialog.open)dialog.close();dialog.remove();}
    dialog.querySelector('button').addEventListener('click',close);dialog.addEventListener('close',close);return close;
  }
  const controllers=new Map();
  function scan(){
    for(const [el,stop] of controllers)if(!el.isConnected){stop();controllers.delete(el);}
    for(const selector of ['.world-viewport','.skin-house-viewport','.golden-pony-viewport','.tavern-viewport','.alchemist-viewport','.forge-viewport','.market-viewport','.barracks-viewport','.upstairs-viewport']){
      for(const view of document.querySelectorAll(selector))if(!controllers.has(view)){const scene=view.firstElementChild;if(scene)controllers.set(view,mount(view,scene));}
    }
    for(const scene of document.querySelectorAll('.upstairs-room-art'))if(!controllers.has(scene)){
      const view=document.createElement('div');view.className='room-zoom-viewport';view.tabIndex=0;view.setAttribute('aria-label','Przybliżany widok pokoju');scene.replaceWith(view);view.append(scene);
      function fit(){if(!view.clientWidth)return;scene.style.width=`${view.clientWidth}px`;scene.style.height=`${view.clientWidth}px`;}
      const observer=new ResizeObserver(fit);observer.observe(view);fit();const stop=mount(view,scene);
      controllers.set(scene,()=>{stop();observer.disconnect();});
    }
    for(const scene of document.querySelectorAll('.scout-active-view .scout-scene,.combat-stage'))if(!controllers.has(scene)){
      const button=document.createElement('button');button.className='scene-inspect-button';button.type='button';button.textContent='⌕';button.setAttribute('aria-label','Przybliż lokację');button.title='Przybliż lokację';scene.append(button);
      const previous=scene.style.position;if(getComputedStyle(scene).position==='static')scene.style.position='relative';let close=()=>{};
      function open(){const prop=scene.matches('.combat-stage')?'--combat-art':'--scout-art',source=getComputedStyle(scene).getPropertyValue(prop).trim().match(/^url\(["']?(.*?)["']?\)$/)?.[1];if(!source)return;close();close=inspector(source,scene.querySelector('#combat-location,.scout-heading h3')?.textContent||'Lokacja');}
      button.addEventListener('click',open);controllers.set(scene,()=>{close();button.removeEventListener('click',open);button.remove();scene.style.position=previous;});
    }
  }
  let scheduled=false;const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;scan();});}});observer.observe(document.body,{childList:true,subtree:true});scan();
  window.SceneZoom={mount,restore(view,state){if(view&&state)view.dispatchEvent(new CustomEvent('scene-restore',{detail:state}));},reset(view){controllers.get(view)?.();controllers.delete(view);scan();}};
})();
