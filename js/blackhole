window.BH={journey:0,flash:0};
window.glFailed=false;

function lerp(a,b,t){return a+(b-a)*t;}
function smoothstepJS(e0,e1,x){var t=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return t*t*(3-2*t);}

var canvas=document.getElementById('bg-canvas');
var gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');

function resizeGL(){
  var dpr=devicePixelRatio||1;
  canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;
  canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';
  if(gl)gl.viewport(0,0,canvas.width,canvas.height);
}
resizeGL();
addEventListener('resize',resizeGL);

var animFrameId=null;
var frameCount=0;
var MAX_FRAMES=3600;

if(gl){
  function mkS(t,s){
    var sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){console.error('Shader error:',gl.getShaderInfoLog(sh));return null;}
    return sh;
  }
  function mkP(v,f){
    var vs=mkS(gl.VERTEX_SHADER,v),fs=mkS(gl.FRAGMENT_SHADER,f);
    if(!vs||!fs)return null;
    var p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.error('Link error:',gl.getProgramInfoLog(p));return null;}
    return p;
  }

  var qBuf=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,qBuf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var pVS='attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}';

  var bhFS=[
'precision highp float;',
'uniform float uTime;',
'uniform float uT;',
'uniform float uAspect;',
'uniform float uFlash;',
'varying vec2 vUV;',
'',
'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
'float noise(vec2 p){',
'  vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
'  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);',
'}',
'float fbm(vec2 p){',
'  float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);',
'  for(int i=0;i<6;i++){v+=a*noise(p);p=r*p*2.1;a*=.48;}',
'  return v;',
'}',
'',
'void main(){',
'  vec2 uv=vUV*2.-1.;',
'  uv.x*=uAspect;',
'  float d=length(uv);',
'  float angle=atan(uv.y,uv.x);',
'  float approachT=smoothstep(0.,.35,uT);',
'  float crossT=smoothstep(.32,.62,uT);',
'  float insideT=smoothstep(.55,.85,uT);',
'  float singulT=smoothstep(.86,1.,uT);',
'  float bhR=mix(.04,.28,approachT);',
'  float inHole=smoothstep(bhR,bhR*.3,d);',
'  vec3 col=vec3(0.);',
'  float diskFade=1.-smoothstep(.35,.68,uT);',
'  float dI=bhR*1.5, dO=bhR*5.;',
'  float diskM=smoothstep(dI*.8,dI,d)*(1.-smoothstep(dO,dO*1.12,d));',
'  float t1=fbm(vec2(angle*2.5+uTime*.7,d*6.-uTime*1.8));',
'  float t2=fbm(vec2(angle*5.5-uTime*.4,d*13.+uTime*1.2));',
'  float turb=t1*.6+t2*.4;',
'  float doppler=1.+.6*sin(angle+uTime*.25);',
'  float diskB=(.15+turb*.85)*diskM*doppler*diskFade*(1.-inHole);',
'  float temp=1.-smoothstep(dI,dO,d);',
'  vec3 dCool=vec3(.82,.12,.04);',
'  vec3 dWarm=vec3(1.,.68,.12);',
'  vec3 dHot=vec3(1.,.94,.78);',
'  vec3 dCol=temp>.5?mix(dWarm,dHot,(temp-.5)*2.):mix(dCool,dWarm,temp*2.);',
'  float pR=bhR*1.45;',
'  float photon=smoothstep(pR*.93,pR,d)*(1.-smoothstep(pR,pR*1.07,d))*5.*diskFade*(1.-inHole);',
'  vec3 photonCol=vec3(1.,.93,.72);',
'  float eR=mix(bhR*2.5,bhR*1.2,crossT);',
'  float einstein=smoothstep(eR*.96,eR,d)*(1.-smoothstep(eR,eR*1.04,d))*3.5*crossT*(1.-insideT*.7);',
'  vec3 einsteinCol=vec3(1.,.76,.28);',
'  float glow=bhR*.2/(d+bhR*.1)*(1.-inHole)*(1.-crossT*.8);',
'  vec3 glowCol=vec3(.88,.62,.18);',
'  col+=dCol*diskB;',
'  col+=photonCol*photon;',
'  col+=einsteinCol*einstein;',
'  col+=glowCol*glow;',
'  float streakI=smoothstep(.3,.65,uT)*(1.-smoothstep(.82,1.,uT));',
'  float streaks=0.;',
'  for(int i=0;i<5;i++){',
'    float fi=float(i);',
'    float sa=angle*(10.+fi*3.)+fi*1.2566+uTime*(1.5+fi*.3);',
'    float sl=smoothstep(.018,0.,abs(sin(sa)));',
'    float sr=smoothstep(.04,.28,d)*smoothstep(1.8,.4,d);',
'    float sp=.6+.4*sin(d*18.-uTime*10.+fi*1.7);',
'    streaks+=sl*sr*sp*(1.-fi*.12);',
'  }',
'  streaks*=streakI*(1.-inHole);',
'  vec3 streakCol=mix(vec3(1.,.52,.08),vec3(1.,.88,.72),insideT);',
'  col+=streakCol*streaks*.75;',
'  float tunnelI=smoothstep(.52,.8,uT)*(1.-smoothstep(.93,1.,uT));',
'  float tFreq=mix(6.,55.,insideT);',
'  float tSpeed=mix(4.,65.,insideT);',
'  float rings=0.;',
'  for(int i=0;i<6;i++){',
'    float fi=float(i);',
'    float r=fract(d*tFreq-uTime*tSpeed+fi*.1667);',
'    float w=mix(.1,.008,insideT);',
'    float ring=smoothstep(w,0.,abs(r-.5));',
'    float av=.65+.35*sin(angle*5.+fi*1.1+uTime*1.2);',
'    rings+=ring*av*(1.-fi*.1);',
'  }',
'  rings*=tunnelI;',
'  float spN=fbm(vec2(angle*4.+uTime*3.+d*12.,d*22.-uTime*9.));',
'  float spiral=spN*rings*.35;',
'  vec3 tWarm=vec3(1.,.62,.1);',
'  vec3 tCool=vec3(.78,.86,1.);',
'  vec3 tCol=mix(tWarm,tCool,insideT*insideT);',
'  col+=tCol*(rings+spiral);',
'  float cR=mix(.18,.015,insideT);',
'  float cGlow=exp(-d/cR)*insideT*(1.-singulT*.6);',
'  cGlow*=.8+.2*sin(uTime*5.);',
'  vec3 cGlowCol=mix(vec3(1.,.82,.35),vec3(1.,.96,.92),insideT);',
'  col+=cGlowCol*cGlow*1.8;',
'  float gridI=smoothstep(.6,.85,uT)*(1.-singulT);',
'  float gAngle=abs(fract(angle*10.+uTime*.3)-.5)*2.;',
'  float gRadial=abs(fract(d*30.-uTime*4.)-.5)*2.;',
'  float grid=smoothstep(.04,0.,min(gAngle,gRadial));',
'  grid*=gridI*smoothstep(.08,.35,d)*smoothstep(1.1,.5,d);',
'  col+=vec3(.68,.48,.15)*grid*.5;',
'  float beamI=smoothstep(.55,.75,uT)*(1.-smoothstep(.9,1.,uT));',
'  float beams=0.;',
'  for(int i=0;i<3;i++){',
'    float fi=float(i);',
'    float bAngle=angle*2.+fi*2.094;',
'    float beam=smoothstep(.03,0.,abs(sin(bAngle)));',
'    beam*=smoothstep(.1,1.,d)*smoothstep(2.,.8,d);',
'    beam*=.5+.5*sin(uTime*3.+fi*2.);',
'    beams+=beam;',
'  }',
'  beams*=beamI*.3;',
'  col+=vec3(1.,.72,.22)*beams;',
'  float c1=fbm(uv*10.+uTime*5.);',
'  float c2=fbm(uv*18.-uTime*6.);',
'  col+=vec3(1.,.78,.38)*c1*c2*singulT*5.;',
'  col+=vec3(1.,.95,.82)*singulT*singulT*.9;',
'  float ca=smoothstep(.35,1.,uT)*.012;',
'  col.r*=1.+ca*d*16.;',
'  col.g*=1.+ca*d*4.;',
'  col.b*=max(0.,1.-ca*d*16.);',
'  float vigR=mix(.3,.003,smoothstep(.3,.93,uT));',
'  col*=1.-smoothstep(vigR,vigR+.9,d*.85);',
'  col=1.-exp(-col*3.);',
'  col*=1.-inHole*(1.-insideT);',
'  col=mix(col,vec3(1.),uFlash);',
'  gl_FragColor=vec4(col,1.);',
'}'
  ].join('\n');

  var bhP=mkP(pVS,bhFS);
  if(!bhP){window.glFailed=true;}

  var bPos,bTime,bTLoc,bAsp,bFlash;
  if(!window.glFailed){
    bPos=gl.getAttribLocation(bhP,'aPos');
    bTime=gl.getUniformLocation(bhP,'uTime');
    bTLoc=gl.getUniformLocation(bhP,'uT');
    bAsp=gl.getUniformLocation(bhP,'uAspect');
    bFlash=gl.getUniformLocation(bhP,'uFlash');
  }

  var N=4000;
  var sd=new Float32Array(N*5);
  function rStar(i){
    var th=Math.random()*Math.PI*2,r=.02+Math.pow(Math.random(),.42);
    sd[i*5]=Math.cos(th)*r;sd[i*5+1]=Math.sin(th)*r;
    sd[i*5+2]=-1+Math.random()*2;
    sd[i*5+3]=.012+Math.random()*.08;
    sd[i*5+4]=Math.random();
  }
  for(var i=0;i<N;i++)rStar(i);

  var vd=new Float32Array(N*8);
  var sBuf=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,sBuf);
  gl.bufferData(gl.ARRAY_BUFFER,vd.byteLength,gl.DYNAMIC_DRAW);

  var sVS=[
'attribute vec2 aPos;attribute float aAlpha;attribute float aTemp;',
'uniform float uBHR;uniform float uAspect;uniform float uStarFade;uniform float uPull;',
'varying float vA;varying float vT;',
'void main(){',
'  vec2 pos=aPos;float d=length(pos);float al=aAlpha*uStarFade;',
'  if(d>.001){',
'    float ls=uBHR*uBHR/(d*d+uBHR*uBHR*.12);',
'    pos+=(pos/d)*ls*.45;',
'    al*=smoothstep(uBHR*.65,uBHR*2.,d);',
'  }',
'  pos-=pos*uPull;',
'  vA=al;vT=aTemp;gl_Position=vec4(pos,0.,1.);',
'}'
  ].join('\n');

  var sFS=[
'precision mediump float;',
'varying float vA;varying float vT;',
'void main(){',
'  float t=clamp(vT,0.,1.);vec3 c;',
'  if(t<.33)c=mix(vec3(.55,.7,1.),vec3(1.),t/.33);',
'  else if(t<.66)c=mix(vec3(1.),vec3(1.,.95,.7),(t-.33)/.33);',
'  else c=mix(vec3(1.,.95,.7),vec3(1.,.5,.2),(t-.66)/.34);',
'  gl_FragColor=vec4(c,vA);',
'}'
  ].join('\n');

  var sP=mkP(sVS,sFS);
  var spPos,spAlp,spTmp,sBHRLoc,sAspLoc,sFadeLoc,sPullLoc;
  if(sP){
    spPos=gl.getAttribLocation(sP,'aPos');
    spAlp=gl.getAttribLocation(sP,'aAlpha');
    spTmp=gl.getAttribLocation(sP,'aTemp');
    sBHRLoc=gl.getUniformLocation(sP,'uBHR');
    sAspLoc=gl.getUniformLocation(sP,'uAspect');
    sFadeLoc=gl.getUniformLocation(sP,'uStarFade');
    sPullLoc=gl.getUniformLocation(sP,'uPull');
  }

  var t0=null;

  function frame(now){
    try{
      frameCount++;
      if(frameCount>MAX_FRAMES){return;}
      if(!t0)t0=now;
      var t=(now-t0)*.001;
      var asp=canvas.width/canvas.height;
      var journey=window.BH.journey;
      var flash=window.BH.flash;
      var bhR=lerp(.04,.28,smoothstepJS(0,.5,journey));
      var starFade=1-smoothstepJS(.6,.95,journey);
      var starPull=Math.max(0,(journey-.55)/.45)*.4;

      gl.blendFunc(gl.ONE,gl.ZERO);
      gl.useProgram(bhP);
      gl.bindBuffer(gl.ARRAY_BUFFER,qBuf);
      gl.enableVertexAttribArray(bPos);
      gl.vertexAttribPointer(bPos,2,gl.FLOAT,false,8,0);
      gl.uniform1f(bTime,t);
      gl.uniform1f(bTLoc,journey);
      gl.uniform1f(bAsp,asp);
      gl.uniform1f(bFlash,flash);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      gl.useProgram(sP);
      if(sBHRLoc)gl.uniform1f(sBHRLoc,bhR);
      if(sAspLoc)gl.uniform1f(sAspLoc,asp);
      if(sFadeLoc)gl.uniform1f(sFadeLoc,starFade);
      if(sPullLoc)gl.uniform1f(sPullLoc,starPull);

      var speed=.03+journey*1.4;
      var sLen=.005+speed*.5+Math.pow(Math.max(0,journey-.5)*2,3)*.4;
      var pull=journey*journey*.08+Math.pow(journey,4)*.18+Math.pow(Math.max(0,journey-.5)*2,3)*.3;
      var insideT=Math.max(0,(journey-.65)/.35);

      for(var i=0;i<N;i++){
        var i5=i*5;
        sd[i5+2]+=(.002+speed*.065+Math.pow(Math.max(0,journey-.5)*2,2)*.08)*sd[i5+3];
        if(sd[i5+2]>1.15)rStar(i);
        var x=sd[i5],y=sd[i5+1],z=sd[i5+2],ct=sd[i5+4];
        var zv=1-z*.5;
        var sx=x/zv,sy=(y/zv)/asp;
        var px=sx-sx*pull,py=sy-sy*pull;
        var zo=1-(z-sLen)*.5;
        var tx=(x/zo)-(x/zo)*pull,ty=((y/zo)/asp)-((y/zo)/asp)*pull;
        var al=Math.min(.12+z*.8,1.)*(1-insideT*.55);
        var b=i*8;
        vd[b]=tx;vd[b+1]=ty;vd[b+2]=al*.04;vd[b+3]=ct;
        vd[b+4]=px;vd[b+5]=py;vd[b+6]=al;vd[b+7]=ct;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER,sBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER,0,vd);
      var stride=16;
      gl.enableVertexAttribArray(spPos);gl.vertexAttribPointer(spPos,2,gl.FLOAT,false,stride,0);
      gl.enableVertexAttribArray(spAlp);gl.vertexAttribPointer(spAlp,1,gl.FLOAT,false,stride,8);
      gl.enableVertexAttribArray(spTmp);gl.vertexAttribPointer(spTmp,1,gl.FLOAT,false,stride,12);
      gl.drawArrays(gl.LINES,0,N*2);

      animFrameId=requestAnimationFrame(frame);
    }catch(e){
      console.error('Black hole frame error:',e);
    }
  }

  window.startBlackhole=function(){
    t0=null;frameCount=0;
    animFrameId=requestAnimationFrame(frame);
  };
  window.stopBlackhole=function(){
    if(animFrameId){cancelAnimationFrame(animFrameId);animFrameId=null;}
  };
  window.startBlackhole();
}else{
  window.glFailed=true;
  window.startBlackhole=function(){};
  window.stopBlackhole=function(){};
}
