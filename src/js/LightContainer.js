import * as config from './config.js'
import * as utils from './utils.js';
import {LightImg} from './LightImg.js';

export class LightContainer{

  constructor(el){

      this.el = el;
      this.ratio = this.el.offsetWidth / this.el.offsetHeight;

      this.getInnerContent();
      this.imgs = [];
      this.dataImgs = [];
      this.start = el.offsetTop;
      this.maxErrors = 1000;
      this.minSize = 50;
      this.maxSize = 200;
      this.lastState = 0;
      this.toggleState();

  }

  init(){

      this.startT = Date.now();
      var imgs = [];

      this.getConfig();

      this.initImgContainer();

      // LOAD DOM IMGS FIRST
      var imgsFromDom = this.getFromDom();
      if(imgsFromDom.length){
          imgs = imgs.concat(imgsFromDom);
      }

      // LOAD FROM DATA-PRE
      var preData = this.el.getAttribute('data-src') || '';
      var numData = this.el.getAttribute('data-num') || 0;
      var maxData = this.el.getAttribute('data-max') || 0;
      if(preData){
          var imgsFromData = this.getFromData(preData, numData, maxData);
          imgs = imgs.concat(imgsFromData);
      }

      /* IF MODE ARGS */
      if( this.type.debug || config.DEBUG ) this.doDebug();

      if(this.type.orbit) this.initOrbit();

      if( this.type.toContentBorder ) this.initToContentBorder(imgs);
      else if( this.type.toAroundContent ) this.initToAroundContent(imgs);
      else this.initToFill(imgs);
      /* END MODE IF ARGS */

      // TOGGLE IF VISIBLE
      this.inited = true;
      this.toggleState();
  }
  getInnerContent(){
      var contents = this.el.getElementsByClassName('light-content');
      if(!contents.length) {
          this.innerContent = document.createElement('div');
          this.innerContent.classList.add('light-content');
          this.el.appendChild(this.innerContent);
      }else{
          this.innerContent = contents[0];
      }
  }
  getConfig(){
      var dataAnim = this.el.getAttribute('data-anim') || '';
      this.type = utils.stringToObj(dataAnim);
      this.onload = this.el.getAttribute('data-load') || null;
  }

  initImgContainer(){

      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('light-img-container');
      this.imgContainer = document.createElement('div');
      this.wrapper.appendChild(this.imgContainer);
      this.el.appendChild(this.wrapper);

      if( this.type.fullWidth ){
          // console.log(this.getContainerOffsetLeft());
          this.wrapper.style.left = -this.getContainerOffsetLeft()+'px';

          this.wrapper.style.width = '100vw';

          this.bindFullWidthResize();

      }

  }
  getContainerOffsetLeft(){
    var offsetX = this.el.getBoundingClientRect().left;
    console.log(offsetX);
    return offsetX;

  }

  /* DEBUG MODE */
  doDebug(){
      console.log('LightAnim debug mode :', this);
      this.displayParams();
      // this.displayContentBorders();
  }
  displayParams(){
      var paramsEl = document.createElement('h2');
      var params = this.el.getAttribute('data-anim').replace('debug', '');
      paramsEl.classList.add('light-debug');
      paramsEl.innerHTML = params;
      this.innerContent.appendChild(paramsEl);
  }
  displayContentBorders(){
      this.innerContent.style.border = '1px solid red';
  }

  /* STATES */
  get state(){

      var activationOffsetY = window.innerHeight;

      if(this.lastState) {
          if ( this.top >= window.innerHeight || this.bot < 0 ){
              this.lastState = 0;

          }
      }
      else{
          if( this.contentTop <= activationOffsetY && this.contentBot > -activationOffsetY) {
              this.lastState = 1;

          }
      }
      return this.lastState;
  }
  toggleState(){

      if(this.state && !this.inited) this.init();

      var currentState = this.state;
      if(this.state){
          for (var i = 0; i < this.imgs.length; i++) {
              var img = this.imgs[i];
              img.setActive();
          }
      }else{
          for (var i = 0; i < this.imgs.length; i++) {
              var img = this.imgs[i];
              img.setOff();
          }
      }


      if(this.state && this.type.parallax) {
          var deltaY = this.getDeltaScroll();
          this.doParallax(deltaY);
      }
      if(this.state && this.type.blur){
          var deltaY = this.getDeltaScroll();
          this.doBlur( deltaY );
      }

      this.lastScrollPos = window.scrollY;
  }

  // on scroll
  doBlur(delta){
      for (var i = 0; i < this.imgs.length; i++) {
          var img = this.imgs[i];
          img.doBlur( delta );
      }
  }
  doParallax( delta ){
      for (var i = 0; i < this.imgs.length; i++) {
          var img = this.imgs[i];
          img.doParallax( delta );
      }
  }
  getDeltaScroll(){
      return ( this.contentHalf - this.scrollHalf ) / this.el.offsetHeight;
  }

  /* GET CONTAINER's */
  get top(){
      return this.el.offsetTop - window.scrollY;
  }
  get bot(){
      return this.top + this.el.offsetHeight;
  }
  get half(){
      return this.top + this.el.offsetHeight / 2;
  }

  get contentTop(){
      return this.top + this.innerContent.offsetTop;
  }
  get contentBot(){
      return this.contentTop + this.innerContent.offsetHeight;
  }
  get contentHalf(){
      return this.el.offsetTop + this.innerContent.offsetTop +this.innerContent.offsetHeight / 2;
  }

  get scrollHalf(){
      return window.scrollY + window.innerHeight / 2;
  }

  get delta(){

  }

  /* GET IMAGES */
  getFromDom(){
      return Array.from(this.el.getElementsByClassName('light-img'));
  }
  getFromData(pre, val, max){

      if(val) val = parseInt(val);
      if( !max ) max = val;
      else max = parseInt(max);

      if(this.type.debug) console.log('Loading from data', pre, val, max);

      var imgsEl = [];
      var arrImgsIndex = [];
      for (var i = 0; i < max; i++) {
          arrImgsIndex.push(i);
      }
      for (var i = 0; i < val; i++) {
          var chosenIndex = Math.floor(Math.random()*arrImgsIndex.length);
          var randIndex = arrImgsIndex[chosenIndex];
          var img = new Image();
          var src = pre+randIndex+'.svg';
          arrImgsIndex.splice(chosenIndex, 1);
          img.setAttribute('data-src', src);
          imgsEl.push(img);
      }
      return imgsEl;
  }


  /* MODES */
  //display imgs on a grid
  initGrid(imgs, rows){
      var cols = Math.floor(imgs.length / rows);
      var offX = 100/cols/2;
      var offY = 100/rows/2;
      for (var y = 0; y < rows; y++) {
          for (var x = 0; x < cols; x++) {
              var img = imgs[x+y*cols];
              this.createImg(img, offX+x/cols*100, offY+y/rows*100);
          }
      }
  }

  // display imgs on arcs around x, y
  initSun(imgs, x, y, centerRadius, arcs){

      var props = [];
      var tot = 0;

      for (var i = 0; i < arcs; i++) {
          var currentProp = Math.pow(2, i);
          props.push( currentProp );
          tot += currentProp;
      }

      var arcImgLen = imgs.length / arcs;
      var arcRad = ( 50 - centerRadius ) / ( arcs );
      var lastImage = 0;
      for (var i = 0; i < arcs; i++) {
          arcImgLen = Math.floor( props[i] / tot * imgs.length);
          var arcImgs = imgs.slice(lastImage, lastImage+arcImgLen);
          this.initArc(arcImgs, x, y, centerRadius + arcRad*i);
          lastImage = arcImgLen;
      }

  }

  //display imgs on arc around x, y
  initArc(imgs, x, y, width, height){
      var thOffset = Math.random() * 2 * Math.PI;
      var th = Math.PI / imgs.length;
      for (var i = 0; i < imgs.length; i++) {
          var img = imgs[i];
          var imgx = x + Math.sin( 2*th*i + thOffset ) * width  /2 ;
          var imgy = y + Math.cos( 2*th*i + thOffset ) * height /2 ;
          // if(imgx > 0 && imgx < 100 && imgy > 0 && imgy < 100){
          //    this.createImg(img, imgx, imgy);
          // }
          this.createImg(img, imgx, imgy);
          // this.initImg( img, imgx, imgy, 100, 100);

      }
  }

  initOrbit(){
      this.el.classList.add('light-rotate');
      this.imgContainer.style['animation-name'] = 'infiniteRotate';
      // this.innerContent.style['animation-name'] = 'infiniteCounterRotate';
      this.orbitDuration = window.getComputedStyle(this.el).getPropertyValue('animation-duration');

  }

  //display img to contents border
  initToContentBorder( imgs ){
      var width = this.innerContent.offsetWidth / this.el.offsetWidth * 100;
      var height = this.innerContent.offsetHeight / this.el.offsetHeight * 100;
      this.initArc( imgs, 50, 50, width, height);
  }
  initToAroundContent( imgs ){
      var spaceWidth = (1 - this.innerContent.offsetWidth/ this.el.offsetWidth ) /2 * 100;
      var spaceHeight = (1 - this.innerContent.offsetHeight / this.el.offsetHeight ) /2 * 100;
      var width = this.innerContent.offsetWidth/ this.el.offsetWidth * 100;
      var height = this.innerContent.offsetHeight/ this.el.offsetHeight * 100;

      var size = 0;

      if( width > height ) size = width + spaceWidth ;
      else size = height + spaceHeight ;

      this.initArc( imgs, 50, 50, size, size);
  }

  //display imgs so they fill and avoid touching
  initToFill(imgs){
      this.imgLoads = 0;
      this.imgsToLoad = imgs.length;
      this.loadedImgs = [];
      this.failedFill = [];

      if(this.innerContent) {
        if( this.type.fullWidth ) {

          var obj = {
            offsetLeft: this.getContainerOffsetLeft() + this.innerContent.offsetLeft ,
            offsetTop: this.innerContent.offsetTop,
            width: this.innerContent.offsetWidth,
            height: this.innerContent.offsetHeight
          };

          this.createDataObject( obj );
        } else {
          this.createDataObject(this.innerContent);
        }
      }

      for (var i = 0; i < imgs.length; i++) {
          var img = imgs[i];

          this.loadImgForFill(img);

      }
  }
  loadImgForFill(img){
      var self = this;

      img.style.width = 100+'px';
      img.style.height = 'auto';

      img.addEventListener('load', function(){
          self.imgLoads++;
          this.loaded = true;
          self.loadedImgs.push(this);
          self.createImg( this );
          if( self.imgsToLoad - self.imgLoads <= 0) self.processFill();
      });
      img.src = img.getAttribute('data-src');
  }
  processFill(){
      if(this.type.debug) console.log('Imgs loaded in', Date.now() - this.startT +'ms');

      var startFill =  Date.now();
      var imgs = this.sortImgs(this.imgs);
      for (var i = 0; i < imgs.length; i++) {
          var img = imgs[i];
          this.placeObject(img);
      }

      if(this.type.debug) console.log('Imgs placed in', Date.now() - startFill +'ms', this.failedFill);

      console.log(this.dataImgs);

      this.doLoad();

      this.toggleState();
  }

  /* LightImg management */
  sortImgs(imgs){
      return imgs.sort(compBySizeDesc);
      function compBySizeDesc(a, b){
          var asize = a.width * a.height;
          var bsize = b.width * b.height;
          if( asize > bsize ) return -1;
          else return 1;
      }
  }
  createDataObject(el){
      var obj = {x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth || el.width, height: el.offsetHeight || el.height};
      this.dataImgs.push(obj);
      // if( this.type.debug ) this.appendDataObject(obj);
  }
  appendDataObject(obj){
    var debugEl = document.createElement('div');
    debugEl.classList.add('light-anim-debug-block');

    this.imgContainer.appendChild(debugEl);

    debugEl.style['left'] = obj.x+'px';
    debugEl.style.top = obj.y+'px';
    debugEl.style.width = obj.width+'px';
    debugEl.style.height = obj.height+'px';
  }
  placeObject(img){
      var it = 0;
      var rect = img.img.getBoundingClientRect();

      var ratio = img.img.offsetWidth / img.img.offsetHeight;

      while(1){

          var newWidth = Math.random() * (config.MAX_SIZE - config.MIN_SIZE) + config.MIN_SIZE;
          var newHeight = newWidth / ratio;

          var newPosX = Math.random() * ( this.el.offsetWidth - newWidth ) ;
          var newPosY = Math.random() * ( this.el.offsetHeight - newHeight ) ;
          if( this.type.fullWidth ) newPosX = Math.random() * ( window.innerWidth - newWidth ) ;

          var obj = { x: newPosX, y: newPosY, width: newWidth, height: newHeight } ;
          var checkCollRes = this.checkCollItems(obj, this.dataImgs);

          if(!checkCollRes) {

              var imgActivePos = { offsetLeft: newPosX, offsetTop: newPosY, offsetWidth: newWidth, offsetHeight: newHeight };

              this.initImg(img, newPosX, newPosY, newWidth, newHeight);

              this.createDataObject(imgActivePos);

              it = 0;
              return false;
          }
          if(it >= this.maxErrors){
              this.failedFill.push(img);
              img.img.remove();
              return it;
          }
          it++;
      }
  }
  checkCollItems(obja, items){
      for (var i = 0; i < this.dataImgs.length; i++) {
          var objb = this.dataImgs[i];
          if(this.checkCollAB(obja, objb)) return objb;
      }
      return false;
  }
  checkCollAB(obja, objb){
      if( (
          (obja.x < objb.x && obja.x + obja.width > objb.x) ||
          (objb.x < obja.x && objb.x + objb.width > obja.x) ) && (
          (obja.y < objb.y && obja.y + obja.height > objb.y) ||
          (objb.y < obja.y && objb.y + objb.height > obja.y) ) ){
          return true;
      }
      else{
          return false;
      }
  }

  createImg(img, x, y){

      img.classList.add('light-img');
      var self = this;


      var container = document.createElement('figure');
      container.classList.add('light-figure');

      this.imgContainer.appendChild(container);
      container.appendChild(img);

      // GET ANIM DATAS
      var dataType = img.getAttribute('data-anim') || '';
      var imgAnimData = utils.stringToObj(dataType);
      var dataAnim = {};
      Object.assign(dataAnim, this.type);
      Object.assign(dataAnim, imgAnimData);

      var imgx = x || dataAnim.x || Math.random()*100;
      var imgy = y || dataAnim.y || Math.random()*100;


      var newLightImg  = new LightImg(img, imgx, imgy, dataAnim);

      this.imgs.push(newLightImg);

      if(img.loaded) img.classList.add('loaded');

      if(!img.src) {
          img.addEventListener('load', function(){
              this.loaded = true;
              newLightImg.init();
          });
          img.src = img.getAttribute('data-src');
      }

  }
  initImg(img, newPosX, newPosY, newWidth, newHeight){

      img.container.style.width = newWidth+'px' || 100;
      img.container.style.height = newHeight+'px' || 100;

      if( newPosX ) img.x = newPosX / this.imgContainer.offsetWidth * 100;
      if( newPosY ) img.y = newPosY / this.el.offsetHeight * 100;

      if( newWidth ) img.scale = newWidth / config.MAX_SIZE;

      img.init();
  }

  /* EVENTS */
  bindFullWidthResize(){
    var self = this;

    window.addEventListener('resize', function(){ self.wrapper.style.left = -self.getContainerOffsetLeft()+'px'; });
  }

  /* CUSTOM EVENTS */
  doLoad(){
    if(this.onload) eval(this.onload); //only in processFill -> to move globaly
  }

}
