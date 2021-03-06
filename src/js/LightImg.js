import * as config from './config.js'
import * as utils from './utils.js';
/*
  img.data-anim:
    [types ] x:[0-100] y:[0-100]

  types :
    {
    FROM :
      idle: true,
      fromLeft: false,
      fromRight: false,
      fromBoth: false,

    TO:
      toFill: true,
      toContentBorder: false,
      toAroundContent: false,

    ACTIVE ANIMATION:
      wander: false,

    rain: false,
    parallax: false,
    scale: false,
    blur: false,
    rotate: false,
    rotateinf: false,
    transformScale: false,
    reload: false,
    duration: false
    fullWidth: false
  }
*/
export class LightImg{

  constructor(img, x, y, type){

    this.img = img;

    this.x = x;
    this.y = y;
    this.type = type || {  };

    this.frame = this.img.parentNode.parentNode;
    this.container = this.frame.parentNode;
    this.parent = this.container.parentNode;

    this.scale = img.scale || 1;

    //CSS VALUES
    this.baseDuration = this.type.duration || Math.floor((Math.random()*5+5)) ;
    this.containerDuration = this.baseDuration;
    this.containerTransform = '';


    this.off = {};
    this.on = {};
    this.initImg();
    this.initContainer();
  }

  initImg(){
    this.off.img = {};
    this.off.img.transition = 'unset';
    this.off.img.blur = 'blur(0px)';

    this.on.img = {};
    this.on.img.transition = 'opacity 3s ease';
  }
  initContainer(){
    this.off.container = {};
    this.off.container.transition = 'unset';

    this.on.container = {};
  }

  init(){

    this.container.style['animation-duration'] = Math.random()*5+5+'s';

    this.img.style.transition = this.on.img.transition;

    this.containerTransition = 'all '+this.baseDuration+'s ease';

    this.img.style.width = '100%';
    this.img.style.height = 'auto';

    if( !this.container.offsetWidth ) this.container.style.width = 100+'px';
    if( !this.container.offsetHeight ) this.container.style.height = 100+'px';

    // INIT FROM
    if( this.type.fromAround )        this.initAround();
    else if( this.type.fromBoth )     this.initBoth();
    else if( this.type.fromTop )      this.initTop();
    else if( this.type.fromBottom )   this.initBottom();
    else if( this.type.fromLeft )     this.initLeft();
    else if( this.type.fromRight )    this.initRight();
    else if( this.type.fromCenter )   this.initCenter();
    else  this.initIdle();

    if(  this.type.toContentBorder
      || this.type.toAroundContent
      || this.type.fromCenter ) this.containerTransform = 'translate(-50%, -50%)';



    // INIT BEHAVIOUR
    if(this.type.rain) this.initRain();
    if( this.type.blur ) this.initBlur();
    if( this.type.wander ) this.initWander();
    if( this.type.rotate ) this.initRotate();
    if( this.type.rotateinf ) this.initRotateInf();
    if( this.type.parallax ) this.initParallax();
    if( this.type.orbit ) this.initOrbit();
    if( this.type.transformScale ) this.initTransformScale();

    // AFTER POS OFF IS SET (fromX Methods)
    this.container.style.transform = this.containerTransform;
    this.container.style['transition-duration'] = this.containerDuration;

    this.setOff();
    this.initPos();

  }

  get calculatedContainerTransition(){
    var offPos =  { x: this.offX, y: this.offY };
    var max = 100;
    if(this.type.fromBoth) max = 50;
    var modifier = utils.getDist(this, offPos) / max;
    return 'all '+ this.containerDuration * modifier +'s ease-out';
  }

  initIdle(){
    this.offX = this.x;
    this.offY = this.y;
  }
  initTop(){
    this.offY = -utils.pxToPer(this.img.offsetHeight * 2, window.innerHeight);
    this.offX = this.x;
  }
  initBottom(){
    this.offY = 100;
    this.offX = this.x;
  }
  initLeft(){
    this.offX  = -utils.pxToPer(this.img.offsetWidth * 2, window.innerWidth);
    this.offY = this.y;
  }
  initRight(){
    this.offX = 100;
    this.offY = this.y;
  }
  initBoth(){
    this.offY = this.y;
    if( parseInt(this.x) < 50 ) this.offX =  -utils.pxToPer(this.img.offsetWidth, window.innerWidth);
    else this.offX = 100;
  }
  initCenter(){
    this.offX = 50;
    this.offY = 50;
  }
  initRotate(){
    this.containerTransform += 'rotate('+Math.floor(Math.random()*360)+'deg)';
    this.img.style.transition = this.containerTransition;
  }
  initRotateInf(){
    this.container.style['animation-name'] = 'infiniteRotate';
  }
  initTransformScale(){
    this.container.style['transform'] = 'scale(0)';
    this.containerTransform += 'scale(1)';
  }

  initAround(){
    var x = utils.perToRatio(this.x) - 0.5;
    var y = utils.perToRatio(this.y) - 0.5;

    var ratiopos = x / y;

    if(Math.abs(x) > Math.abs(y)){
      this.offX = 50+utils.signOf(x)*100+'%';
      this.offY = y*100*ratiopos+'%';
    }else{
      this.offY = 50+utils.signOf(y)*100+'%';
      this.offX = x*100*ratiopos+'%';
    }

  }

  initRain(){
    var delay = Math.floor( Math.random() * this.scale * this.baseDuration * 10 ) / 10;
    this.rainDelay = delay * 1000;
  }

  initWander(){
    this.frame.style['animation-name'] = 'idleWander';
    this.frame.style['animation-duration'] = Math.floor((Math.random()*5+5)*10)/10+'s';
  }
  initOrbit(){
    var duration = utils.getStyle(this.parent, 'animation-duration');
    var iteration = utils.getStyle(this.parent, 'animation-iteration-count');
    var timingfunc = utils.getStyle(this.parent, 'animation-timing-function');
    this.frame.style['animation-name'] = 'infiniteCounterRotate';
    this.frame.style['animation-duration'] = duration;
    this.frame.style['animation-iteration-count'] = iteration;
    this.frame.style['animation-timing-function'] = timingfunc;
  }


  initParallax(){
    this.parallaxY = 0;
    this.parallax = this.scale*10;
  }
  doParallax(delta){
    this.parallaxY = this.parallax * delta;
    this.applyActivePos();
  }

  initBlur(){
    var blur = 0;
    if( this.scale < 0.5 ) blur = this.scale / 0.5;
    else blur = this.scale - 0.5 ;
    blur = Math.floor(blur*10);
    this.imgBlur = blur;
  }
  doBlur(delta){
    this.frame.style.filter = 'blur('+ this.imgBlur * Math.abs(delta) +'px)';
  }

  setActive(){

    var self = this;
    var activeDelay = this.rainDelay || 0;

    setTimeout(function(){
      self.img.classList.add('active');
      self.container.style.transition = self.containerTransition;
      self.container.style['transform'] = self.containerTransform;
      self.img.style.transition = self.on.img.transition;
      self.applyActivePos();
    }, activeDelay);

  }

  setOff(){
    this.container.style.transition = this.off.container.transition;
    this.img.style.transition = this.off.img.transition;

    if(this.type.reload) this.initPos();
    if(this.type.parallax) this.parallaxY = 0;

    if(this.type.blur) this.img.style.filter = 'blur(0px)';

    this.onOff();

  }

  onActive(){
    this.containerDuration = 0;
    this.container.style.transition = this.containerTransition;
  }
  onOff(){
    this.img.classList.remove('active');
    this.containerDuration = this.baseDuration;
    this.container.style.transition = this.containerTransition;
    this.img.style.transition = this.on.img.transition;
  }

  applyOffPos(){
    this.container.style.left = this.offX+"%";
    this.container.style.top = this.offY+"%";
  }
  applyActivePos(){
    var y = this.y;
    if( this.parallax ) y += this.parallaxY;
    this.container.style.left = this.x+"%";
    this.container.style.top = y+"%";
  }
  addPos(x, y){
    this.container.style.left = this.container.offsetLeft + x;
    this.container.style.top = this.container.offsetTop + y;
  }

  initPos(){
    // how useful
    this.applyOffPos();
  }

}
