(function(){
  var c=document.createElement('canvas');c.width=c.height=128;
  var x=c.getContext('2d'),d=x.createImageData(128,128);
  for(var i=0;i<d.data.length;i+=4){var v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}
  x.putImageData(d,0,0);
  document.querySelector('.noise-overlay').style.backgroundImage='url('+c.toDataURL()+')';
})();

(function(){
  var cv=document.getElementById('snow-canvas'),ctx=cv.getContext('2d');
  var w,h,flakes=[];
  var layers=[
    {count:80,rMin:.3,rMax:1,dMin:.03,dMax:.1,aMax:.2},
    {count:50,rMin:.8,rMax:1.8,dMin:.1,dMax:.25,aMax:.4},
    {count:25,rMin:1.5,rMax:2.8,dMin:.2,dMax:.45,aMax:.6}
  ];
  function resize(){w=cv.width=innerWidth;h=cv.height=innerHeight;}
  addEventListener('resize',resize);resize();
  layers.forEach(function(l,li){
    for(var i=0;i<l.count;i++){
      flakes.push({
        x:Math.random()*w,y:Math.random()*h,
        r:l.rMin+Math.random()*(l.rMax-l.rMin),
        d:l.dMin+Math.random()*(l.dMax-l.dMin),
        a:.05+Math.random()*l.aMax,
        wind:Math.random()*.4-.2,
        wobble:Math.random()*Math.PI*2,
        wSpeed:.003+Math.random()*.008,
        wAmp:.3+Math.random()*.8,
        layer:li
      });
    }
  });
  function drawBatch(layerIdx,blur,shadowCol){
    ctx.shadowBlur=blur;ctx.shadowColor=shadowCol;ctx.fillStyle='#fff';
    for(var i=0;i<flakes.length;i++){
      var f=flakes[i];
      if(f.layer!==layerIdx)continue;
      ctx.globalAlpha=f.a;
      ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();
    }
  }
  function update(){
    var t=performance.now()*.001;
    for(var i=0;i<flakes.length;i++){
      var f=flakes[i];
      f.y+=f.d;f.x+=f.wind+Math.sin(t+f.wobble)*f.wAmp*.02;f.wobble+=f.wSpeed;
      if(f.y>h+5){f.y=-5;f.x=Math.random()*w;}
      if(f.x>w+5)f.x=-5;else if(f.x<-5)f.x=w+5;
    }
  }
  function loop(){
    ctx.clearRect(0,0,w,h);
    drawBatch(0,0,'transparent');
    drawBatch(1,3,'rgba(180,200,255,.25)');
    drawBatch(2,7,'rgba(180,200,255,.4)');
    ctx.globalAlpha=1;ctx.shadowBlur=0;
    update();
    requestAnimationFrame(loop);
  }
  loop();
})();
