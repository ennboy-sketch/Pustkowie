'use strict';
(() => {
  const MIN=1,MAX=3;
  function mount(view,scene,{mousePan=false}={}){
    const parent=view.parentElement,position=parent.style.position,needsPosition=getComputedStyle(parent).position==='static';
    if(needsPosition)parent.style.position='relative';
    const previousZoom=scene.style.zoom,previousTouch=view.style.touchAction,previousTab=view.getAttribute('tabindex');
    if(previousTab===null)view.tabIndex=0;
    const previousWidth=scene.style.width,previousHeight=scene.style.height;let mapObserver=null;
    if(view.matches('.world-viewport')){const fit=()=>{if(!view.clientWidth)return;const mobile=matchMedia('(max-width:700px)').matches;scene.style.width=`${mobile?900:view.clientWidth}px`;scene.style.height=`${mobile?Math.max(630,view.clientHeight):view.clientHeight}px`;};mapObserver=new ResizeObserver(fit);mapObserver.observe(view);fit();}
    view.classList.add('scene-zoom-viewport');view.style.touchAction='none';
    const controls=document.createElement('div');controls.className='scene-zoom-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Przybliżanie lokacji');
    controls.innerHTML='<button type="button" data-zoom="out" aria-label="Oddal widok">−</button><button type="button" data-zoom="reset" aria-label="Przywróć skalę 100%">100%</button><button type="button" data-zoom="in" aria-label="Przybliż widok">+</button>';
    parent.append(controls);
    let scale=1,disposed=false,gesture=false,pinch=null,pan=null;
    const pointers=new Map();
    function update(){view.dataset.zoomScale=String(scale);controls.querySelector('[data-zoom=reset]').textContent=`${Math.round(scale*100)}%`;controls.querySelector('[data-zoom=out]').disabled=scale<=MIN;controls.querySelector('[data-zoom=in]').disabled=scale>=MAX;}
    function local(x,y){const r=view.getBoundingClientRect();return{x:x-r.left-view.clientLeft,y:y-r.top-view.clientTop};}
    function set(next,anchor={x:view.clientWidth/2,y:view.clientHeight/2},world=null){
      if(disposed)return;
      next=Math.max(MIN,Math.min(MAX,next));
      const point=world||{x:(view.scrollLeft+anchor.x)/scale,y:(view.scrollTop+anchor.y)/scale};
      scale=next;scene.style.zoom=String(scale);view.scrollLeft=point.x*scale-anchor.x;view.scrollTop=point.y*scale-anchor.y;update();
    }
    function control(e){const button=e.target.closest('[data-zoom]');if(!button)return;const type=button.dataset.zoom;set(type==='reset'?1:scale+(type==='in'?.25:-.25));}
    function wheel(e){if(!e.deltaY)return;e.preventDefault();set(scale*Math.exp(-Math.max(-200,Math.min(200,e.deltaY))*.002),local(e.clientX,e.clientY));}
    function beginPinch(){const [a,b]=[...pointers.values()],mid=local((a.x+b.x)/2,(a.y+b.y)/2);pinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),scale,world:{x:(view.scrollLeft+mid.x)/scale,y:(view.scrollTop+mid.y)/scale}};gesture=true;pan=null;}
    function down(e){
      if(e.pointerType==='mouse'&&!mousePan){gesture=false;return;}
      if(e.pointerType!=='touch'&&!(mousePan&&e.pointerType==='mouse'&&e.button===0))return;
      if(!pointers.size)gesture=false;
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size===2)beginPinch();else if(pointers.size===1)pan={x:e.clientX,y:e.clientY,left:view.scrollLeft,top:view.scrollTop};
    }
    function move(e){
      if(!pointers.has(e.pointerId))return;
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size>=2&&pinch){
        e.preventDefault();const [a,b]=[...pointers.values()];set(pinch.scale*Math.hypot(a.x-b.x,a.y-b.y)/pinch.distance,local((a.x+b.x)/2,(a.y+b.y)/2),pinch.world);
      }else if(pan){
        const dx=e.clientX-pan.x,dy=e.clientY-pan.y;if(!gesture&&Math.hypot(dx,dy)<6)return;
        gesture=true;e.preventDefault();view.scrollLeft=pan.left-dx;view.scrollTop=pan.top-dy;
      }
      if(gesture&&!view.hasPointerCapture(e.pointerId))view.setPointerCapture(e.pointerId);
    }
    function end(e){
      if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);if(view.hasPointerCapture(e.pointerId))view.releasePointerCapture(e.pointerId);
      pinch=null;const remaining=[...pointers.values()][0];pan=remaining?{x:remaining.x,y:remaining.y,left:view.scrollLeft,top:view.scrollTop}:null;
    }
    function click(e){if(gesture){e.preventDefault();e.stopImmediatePropagation();gesture=false;}}
    function key(e){if(e.target!==view)return;if(['+','=','-','0'].includes(e.key)){e.preventDefault();set(e.key==='0'?1:scale+(e.key==='-'?-.25:.25));}}
    controls.addEventListener('click',control);view.addEventListener('wheel',wheel,{passive:false});view.addEventListener('pointerdown',down);view.addEventListener('pointermove',move,{passive:false});view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);view.addEventListener('click',click,true);view.addEventListener('keydown',key);update();
    return ()=>{disposed=true;if(mapObserver){mapObserver.disconnect();scene.style.width=previousWidth;scene.style.height=previousHeight;}for(const id of pointers.keys())if(view.hasPointerCapture(id))view.releasePointerCapture(id);pointers.clear();controls.remove();scene.style.zoom=previousZoom;view.style.touchAction=previousTouch;view.classList.remove('scene-zoom-viewport');if(previousTab===null)view.removeAttribute('tabindex');delete view.dataset.zoomScale;if(needsPosition)parent.style.position=position;controls.removeEventListener('click',control);view.removeEventListener('wheel',wheel);view.removeEventListener('pointerdown',down);view.removeEventListener('pointermove',move);view.removeEventListener('pointerup',end);view.removeEventListener('pointercancel',end);view.removeEventListener('click',click,true);view.removeEventListener('keydown',key);};
  }
  function inspector(source,title){
    const dialog=document.createElement('dialog');dialog.className='scene-inspector';dialog.setAttribute('aria-label',`Szczegóły lokacji: ${title}`);
    dialog.innerHTML='<div class="scene-inspector-top"><h2></h2><button type="button" aria-label="Zamknij podgląd lokacji">×</button></div><div class="scene-inspector-view" tabindex="0" aria-label="Przybliżany widok lokacji"><img class="scene-inspector-art" alt=""></div>';
    dialog.querySelector('h2').textContent=title;const view=dialog.querySelector('.scene-inspector-view'),art=view.querySelector('img');art.src=source;art.alt=title;document.body.append(dialog);
    let centered=false,closed=false;
    function fit(){if(!art.naturalWidth||!view.clientWidth)return;const ratio=Math.max(view.clientWidth/art.naturalWidth,view.clientHeight/art.naturalHeight);art.style.width=`${art.naturalWidth*ratio}px`;art.style.height=`${art.naturalHeight*ratio}px`;if(!centered){view.scrollLeft=Math.max(0,(view.scrollWidth-view.clientWidth)/2);centered=true;}}
    art.addEventListener('load',fit);const observer=new ResizeObserver(fit);observer.observe(view);dialog.showModal();fit();const stop=mount(view,art,{mousePan:true});
    function close(){if(closed)return;closed=true;stop();observer.disconnect();art.removeEventListener('load',fit);if(dialog.open)dialog.close();dialog.remove();}
    dialog.querySelector('button').addEventListener('click',close);dialog.addEventListener('close',close);return close;
  }
  const controllers=new Map();
  function scan(){
    for(const [el,stop] of controllers)if(!el.isConnected){stop();controllers.delete(el);}
    for(const selector of ['.world-viewport','.tavern-viewport','.alchemist-viewport','.forge-viewport','.barracks-viewport','.upstairs-viewport']){
      for(const view of document.querySelectorAll(selector))if(!controllers.has(view)){const scene=view.firstElementChild;if(scene)controllers.set(view,mount(view,scene,{mousePan:selector==='.world-viewport'}));}
    }
    for(const scene of document.querySelectorAll('.upstairs-room-art'))if(!controllers.has(scene)){
      const view=document.createElement('div');view.className='room-zoom-viewport';view.tabIndex=0;view.setAttribute('aria-label','Przybliżany widok pokoju');scene.replaceWith(view);view.append(scene);
      function fit(){if(!view.clientWidth)return;scene.style.width=`${view.clientWidth}px`;scene.style.height=`${view.clientWidth}px`;}
      const observer=new ResizeObserver(fit);observer.observe(view);fit();const stop=mount(view,scene,{mousePan:true});
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
  window.SceneZoom={mount};
})();
