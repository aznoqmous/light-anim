import * as config from './config.js'
import * as utils from './utils.js';
import {LightImg} from './LightImg.js';

export class LightContainer{

  constructor(el){
    this.startT = Date.now();
    this.el = el;
    this.ratio = this.el.offsetWidth / this.el.offsetHeight;
    this.innerContent = this.el.getElementsByClassName('light-content')[0];
    this.imgs = [];
    this.dataImgs = [];
    this.start = el.offsetTop;
    this.maxErrors = 1000;
    this.imgsCount = 50; // for random
    this.minSize = 50;
    this.maxSize = 200;
    this.lastState = 0;
    this.toggleState();
  }

  init(){
    var imgs = [];
    var dataAnim = this.el.getAttribute('data-anim') || '';
    this.dataAnim = utils.stringToObj(dataAnim);
    console.log(this.dataAnim);
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


    //TRY TO FILL WITH RANDOM IF EMPTY
    if(!imgs.length){
      imgs = imgs.concat(this.getRandom());
    }

    // this.initRandom(imgs);
    // this.initGrid(imgs, 4);
    // this.initSun(imgs, 50, 80, 20, 4);
    // this.initArc(imgs, 50, 50, 30);
    if( this.dataAnim.toContentBorder ) this.initToContentBorder(imgs);
    else this.initFill(imgs);

    // TOGGLE IF VISIBLE
    this.inited = true;
    this.toggleState();
  }

  get state(){

    var activationOffsetY = window.innerHeight;

    var top = this.el.offsetTop - window.scrollY;
    var bot = this.el.offsetTop + this.el.clientHeight - window.scrollY;

    var topContent = top + this.innerContent.offsetTop;
    var botContent = topContent  + this.innerContent.offsetHeight;

    if(this.lastState) {
      if ( top >= window.innerHeight || bot < 0 ){
        this.lastState = 0;
      }
    }
    else{
      if( topContent <= activationOffsetY && botContent > -activationOffsetY) {
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
  }

  getRandom(){
    var imgsEl = [];
    for (var i = 0; i < this.imgsCount; i++) {
      var img = new Image();
      var randSrc = config.IMG_DIR+Math.floor(Math.random()*config.FILES_COUNT)+'.svg';
      img.setAttribute('data-src', randSrc);
      imgsEl.push(img);
    }
    return imgsEl;
  }
  getFromDom(){
    return Array.from(this.el.getElementsByClassName('light-img'));
  }
  getFromData(pre, val, max){

    if(val) val = parseInt(val);
    if( !max ) max = val;
    else max = parseInt(max);

    console.log(pre, val, max);

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

  //display img randomly
  initRandom(imgs){
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      this.createImg(img);
    }
  }

  //display imgs on a grid
  initGrid(imgs, rows){
    var cols = Math.floor(imgs.length / rows);
    var offX = 100/cols/2;
    var offY = 100/rows/2;
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var img = imgs[x+y*cols];
        this.createImg(img, offX+x/cols*100+'%', offY+y/rows*100+'%');
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
        this.createImg(img, imgx+'%', imgy+'%');
      }

    }
  }

  //display img to contents border
  initToContentBorder( imgs ){
    var width = this.innerContent.offsetWidth / this.el.offsetWidth * 100;
    var height = this.innerContent.offsetHeight / this.el.offsetHeight * 100;
    this.initArc( imgs, 50, 50, width, height);
  }

  //display imgs so they fill and avoid touching
  initFill(imgs){
    this.failedFill = [];
    var imgsLoad = 0;
    if(this.innerContent) this.createDataObject(this.innerContent);
    var self = this;
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      img.src = img.getAttribute('data-src');
      img.addEventListener('load', function(){
        imgsLoad++;
        this.loaded = true;
        var imgRatio = this.naturalWidth / this.naturalHeight;
        var newWidth = (Math.random() * (self.maxSize - self.minSize) + self.minSize);
        var newHeight = newWidth * imgRatio || self.maxSize;
        this.newWidth = newWidth;
        this.newHeight = newHeight;
        if( imgs.length - imgsLoad <= 0) self.processFill(imgs);
      });
    }
  }
  processFill(imgs){
    console.log(Date.now() - this.startT +'ms');
    imgs = this.sortImgs(imgs);
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
    var obj = {x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight};
    this.dataImgs.push(obj);
  }
  placeObject(img){
    var it = 0;

    while(1){
      var newPosX = Math.random() * ( this.el.offsetWidth - img.newWidth ) ;
      var newPosY = Math.random() * ( this.el.offsetHeight - img.newHeight ) ;
      var obj = { x: newPosX, y: newPosY, width: img.newWidth, height: img.newHeight } ;
      var checkCollRes = this.checkCollItems(obj, this.dataImgs);
      if(!checkCollRes) {
        this.createImg(img, newPosX/this.el.offsetWidth*100+'%', newPosY/this.el.offsetHeight*100+'%', img.newWidth, img.newHeight);
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

  createImg(img, x, y, width, height){
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
    Object.assign(dataAnim, this.dataAnim);
    Object.assign(dataAnim, imgAnimData);

    var imgx = x || dataAnim.x+'%' || Math.random()*100+'%';
    var imgy = y || dataAnim.y+'%' || Math.random()*100+'%';


    img.height = height || 100;
    img.width = width || 100;

    var newLightImg  = new LightImg(img, imgx, imgy, dataAnim);

    this.imgs.push(newLightImg);

    if(img.loaded) img.classList.add('loaded');

    // this.createDataObject(newLightImg.container);
    var x = utils.perToRatio(newLightImg.x) * this.el.offsetWidth;
    var y = utils.perToRatio(newLightImg.y) * this.el.offsetHeight;
    var imgActivePos = {offsetLeft: x, offsetTop: y, offsetWidth:  width, offsetHeight: height };
    this.createDataObject(imgActivePos);
  }

}