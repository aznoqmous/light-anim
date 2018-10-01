import * as config from './config.js'
import * as utils from './utils.js';
import {LightImg} from './LightImg.js';

export class LightContainer{

  constructor(el){

    this.el = el;
    this.ratio = this.el.offsetWidth / this.el.offsetHeight;
    this.innerContent = this.el.getElementsByClassName('light-content')[0];
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
    var dataAnim = this.el.getAttribute('data-anim') || '';
    this.type = utils.stringToObj(dataAnim);

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
    if( this.type.debug || config.DEBUG ) this.displayParams();

    if(this.type.orbit) this.initOrbit();

    if( this.type.toContentBorder ) this.initToContentBorder(imgs);
    else this.initFill(imgs);
    /* END MODE IF ARGS */

    // TOGGLE IF VISIBLE
    this.inited = true;
    this.toggleState();
  }

  displayParams(){
    var paramsEl = document.createElement('h2');
    var params = this.el.getAttribute('data-anim').replace('debug', '');
    paramsEl.classList.add('light-debug');
    paramsEl.innerHTML = params;
    this.innerContent.appendChild(paramsEl);
  }

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
    for (var i = 0; i < this.imgs.length; i++) {
      var img = this.imgs[i];
      if(this.state && img.setActive) img.setActive();
      else if (img.setOff) img.setOff();
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
    return ( this.contentHalf - this.scrollHalf ) / this.el.offsetHeight ;
  }

  /* GET CONTAINER's */
  get top(){
    return this.el.offsetTop - window.scrollY;
  }
  get bot(){
    return this.el.offsetTop + this.el.clientHeight - window.scrollY;
  }
  get half(){
    return this.top + this.el.innerHeight / 2;
  }

  get contentTop(){
    return this.top + this.innerContent.offsetTop;
  }
  get contentBot(){
    return this.contentTop + this.innerContent.offsetHeight;
  }
  get contentHalf(){
    return this.contentTop + this.innerContent.offsetHeight / 2;
  }

  get scrollHalf(){
    return window.scrollY + window.innerHeight / 2;
  }

  getFromDom(){
    return Array.from(this.el.getElementsByClassName('light-img'));
  }
  getFromData(pre, val, max){

    if(val) val = parseInt(val);
    if( !max ) max = val;
    else max = parseInt(max);

    console.log('Loading from data', pre, val, max);

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
      if(imgx > 0 && imgx < 100 && imgy > 0 && imgy < 100){
        this.createImg(img, imgx, imgy);
      }

    }
  }
  initOrbit(){
    this.el.style['animation-name'] = 'infiniteRotate';
    this.innerContent.style['animation-name'] = 'infiniteCounterRotate';
  }

  //display img to contents border
  initToContentBorder( imgs ){
    var width = this.innerContent.offsetWidth / this.el.offsetWidth * 100;
    var height = this.innerContent.offsetHeight / this.el.offsetHeight * 100;
    this.initArc( imgs, 50, 50, width, height);
  }

  //display imgs so they fill and avoid touching

  initFill(imgs){
    this.imgLoads = 0;
    this.imgsToLoad = imgs.length;
    this.loadedImgs = [];
    this.failedFill = [];

    if(this.innerContent) this.createDataObject(this.innerContent);

    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];

      this.loadImg(img);

    }
  }

  loadImg(img){
    var self = this;

    img.style.width = 100+'px';
    img.style.height = 'auto';

    img.addEventListener('load', function(){
      self.imgLoads++;
      this.loaded = true;
      self.loadedImgs.push(this);
      self.createImg( this, 0, 0 );
      if( self.imgsToLoad - self.imgLoads <= 0) self.processFill();
    });
    img.src = img.getAttribute('data-src');
  }
  processFill(){
    console.log('Place imgs', Date.now() - this.startT +'ms');
    var imgs = this.sortImgs(this.imgs);
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      this.placeObject(img);
    }
    this.toggleState();
  }
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
  }
  placeObject(img){
    var it = 0;
    var rect = img.img.getBoundingClientRect();

    var ratio = img.img.offsetWidth / img.img.offsetHeight;
    console.log(ratio);
    while(1){

      var newWidth = Math.random() * (config.MAX_SIZE - config.MIN_SIZE) + config.MIN_SIZE;
      var newHeight = newWidth * ratio;

      var newPosX = Math.random() * ( this.el.offsetWidth - newWidth ) ;
      var newPosY = Math.random() * ( this.el.offsetHeight - newHeight ) ;

      // console.log(newPosX, newPosY, newWidth, newHeight);

      var obj = { x: newPosX, y: newPosY, width: newWidth, height: newHeight } ;
      var checkCollRes = this.checkCollItems(obj, this.dataImgs);

      if(!checkCollRes) {

        var imgActivePos = {offsetLeft: newPosX, offsetTop: newPosY, offsetWidth:  newWidth, offsetHeight: newHeight };

        img.container.style.width = newWidth+'px';
        img.container.style.height = newHeight+'px';
        img.img.style.width = '100%';
        img.img.style.height = 'auto';
        img.x = newPosX / this.el.offsetWidth * 100;
        img.y = newPosY / this.el.offsetHeight * 100;
        img.scale = newWidth / config.MAX_SIZE;

        img.applyActivePos();
        this.createDataObject(imgActivePos);

        it = 0;
        return false;
      }
      if(it >= this.maxErrors){
        this.failedFill.push(img);
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

    if(!img.src) {
      img.addEventListener('load', function(){
        this.loaded = true;
      });
      img.src = img.getAttribute('data-src');
    }

    var container = document.createElement('figure');
    container.classList.add('light-figure');

    this.el.appendChild(container);
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

  }



}
