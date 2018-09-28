import * as config from './config.js'
import * as utils from './utils.js';
/*
  img.data-anim:
    [types ] x:[0-100] y:[0-100]

  types :
    {
    idle: false,
    scroll: false,
    fromLeft: false,
    fromRight: false,
    fromBoth: false,
    toContentBorder: false,
    parallax: false,
    scale: false,
    blur: false,
    rotate: false,
    rotateinf: false,
    reload: false,
    duration:
  }
*/
export class LightImg{
  constructor(img, x, y, type){
    this.img = img;
    this.x = x;
    this.y = y;
    this.type = type || {  };

    this.parent = this.img.parentNode.parentNode;
    this.container = this.img.parentNode;

    this.scale = img.scale;

    //CSS VALUES
    this.baseDuration = this.type.duration || Math.floor((Math.random()*5+5)) ;
    this.containerDuration = this.baseDuration;
    this.containerTransform = '';

    this.imgBlur = 'blur(0px)';

    this.init();
  }

  init(){


    this.container.style['animation-duration'] = Math.random()*5+5+'s';

    this.img.style['animation-duration'] = Math.random()*5+5+'s';

    this.img.style.width = this.img.width;
    this.img.style.height = this.img.height;



    // MOVE TYPES
    if( this.type.fromAround )      this.initAround();
    else if( this.type.fromBoth )   this.initBoth();
    else if( this.type.fromLeft )   this.initLeft();
    else if( this.type.fromRight )  this.initRight();
    else if( this.type.fromCenter ) this.initCenter();
    else  this.initIdle();

    if( this.type.parallax ) this.initParallax();

    if(this.type.toContentBorder) this.containerTransform = 'translate(-50%, -50%)';

    if( this.type.blur ) this.initBlur();
    if( this.type.rotate ) this.initRotate();
    if( this.type.rotateinf ) this.initRotateInf();

    this.container.style.transform = this.containerTransform;
    this.container.style.transition = this.containerTransition;

    this.setOff();
    this.initPos();

  }

  get containerTransition(){
    return 'all '+ this.containerDuration +'s ease-out';
  }

  initIdle(){
    this.offX = this.x;
    this.offY = this.y;
  }
  initLeft(){
    this.offX  = 'calc(0% - '+this.img.width+'px)';
    this.offY = this.y;
  }
  initRight(){
    this.offX = '100%';
    this.offY = this.y;
  }
  initCenter(){
    this.offX = '50%';
    this.offY = '50%';
  }
  initRotate(){
    this.containerTransform += 'rotate('+Math.floor(Math.random()*360)+'deg)';
  }
  initRotateInf(){
    this.container.style['animation-name'] = 'infiniteRotate';
  }
  initBoth(){
    this.offY = this.y;
    if( parseInt(this.x) < 50 ) this.offX = 'calc(0% - '+this.img.width+'px)';
    else this.offX = '100%';
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
  initBlur(){
    var maxBlur = 5;
    var blur = maxBlur * ( 1 - this.scale / config.MAX_SCALE );
    var zindex = (maxBlur - blur)*10 ;
    this.img.style['z-index'] = Math.floor(zindex);
    this.imgBlur = 'blur('+Math.floor(blur)+'px)';
  }

  initParallax(){
    this.parallaxY = 0;
    this.parallax = this.scale*10;
  }
  doParallax(delta){
    // console.log(delta, this.y, this.parallax);
    this.parallaxY = this.parallax * delta;
    this.applyActivePos();
  }

  setActive(){
    this.container.style.transition = this.containerTransition;

    this.applyActivePos();

    if(this.type.blur) this.img.style.filter = this.imgBlur;
    this.img.classList.add('active');

    var self = this;
    setTimeout(function(){
      self.containerDuration = 0;
      self.container.style.transition = self.containerTransition;
    }, this.containerDuration*1000);
  }

  setOff(){
    this.container.style.transition = 'unset';

    if(this.type.reload) this.initPos();
    if(this.type.parallax) this.parallaxY = 0;

    if(this.type.blur) this.img.style.filter = 'blur(0px)';
    this.img.classList.remove('active');

    var self = this;
    setTimeout(function(){
      self.containerDuration = self.baseDuration;
      self.container.style.transition = self.containerTransition;
    }, this.containerDuration*1000);
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
    this.container.style.left = this.offX;
    this.container.style.top = this.offY;
  }
}
