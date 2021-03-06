import {LightContainer} from './LightContainer.js';
/*
  config : {
    selector: 'light-container'
  }
*/
export class LightAnim{

  constructor(config){

    this.getStyles();

    this.getConfig(config);

    this.containers = [];
    this.init();
    this.bindEvt();

  }

  init(){

    var containers = document.getElementsByClassName(this.selector);
    for (var i = 0; i < containers.length; i++) {
      var container = containers[i];
      this.createContainer(container);
    }

  }

  getStyles(){
    var styles = document.createElement('style');
    styles.innerHTML = '/* LIGHT ANIM STYLES */ ' +
        'body{  overflow-x: hidden;  width: 100vw; } ' +
        '@keyframes idleWander{  ' +
        '   from { transform: translate3d(0px, 0px, 0); }  20%{ transform: translate3d(10px, 5px, 0); }  50%{ transform: translate3d(5px, 20px, 0); } to { transform: translate3d(0px, 0px, 0); } } ' +
        '@keyframes infiniteRotate{  ' +
        '   from { transform: rotate(0deg); } to { transform: rotate(360deg); } } ' +
        '@keyframes infiniteCounterRotate{  ' +
        '   from { transform: rotate(0deg); } to { transform: rotate(-360deg); } } ' +
        '@keyframes infiniteWanderCounterRotate{  ' +
        '   from { transform: rotate(0deg) translate3d(0px, 0px, 0); }  20%{ transform: translate3d(10px, 5px, 0); }  50%{ transform: translate3d(5px, 20px, 0); } to { transform: rotate(-360deg) translate3d(0px, 0px, 0); } }' +
        '.light-container{  position: relative; } ' +
        '.light-container.ready{  opacity: 1; } ' +
        '.light-container > img {  pointer-events: none;  user-select: none;  opacity: 0; } ' +
        '.light-container img { backface-visibility: hidden; -webkit-backface-visibility: hidden } ' +
        '.light-container .light-img-container .light-figure .light-img{  opacity: 0;  transition: all 2s linear; } ' +
        '.light-container .light-img-container .light-figure .light-img.active{  opacity: 1; } ' +
        '.light-container .light-img-container{  position: absolute; pointer-events: none; top: 0;  left: 0;  width: 100%;  height: 100%;  display: block; } ' +
        '.light-container .light-img-container.debug{  border: 1px solid red; } ' +
        '.light-container .light-img-container.debug:after{  position: absolute;  content: "";  left: calc(50% - 5px);  top: calc(50% - 5px);  border-radius: 50%;  background: red;  height: 10px;  width: 10px;  z-index: 100; } ' +
        '.light-container .light-img-container > div{  position: relative;  width: 100%;  height: 100%;  display: block;  transition: all 2s linear;  animation-duration: 20s;  animation-iteration-count: infinite;  animation-timing-function: linear; } ' +
        '.light-figure {  position: absolute; } ' +
        '.light-frame { position: relative; overflow: hidden; animation-iteration-count: infinite; width: 100% } ' +
        '.light-frame-inner { margin-bottom: -6px }' +
        '.light-img {  transition: opacity 3s ease;  animation-duration: 5s;  animation-iteration-count: infinite;  animation-timing-function: ease; } ' +
        '.light-content{  z-index: 100; } ' +
        '.light-container > .light-dodge-container { display: none; opacity: 0; }' +
        '.light-container > .light-img-container .light-dodge-container { display: block; top: 0; left: 0; width: 100%; height: 100%; }' +
        '.light-debug{  font-size: 1rem;  position: absolute;  max-width: 100%; } ' +
        '.light-anim-debug-block { position: absolute; border: 1px solid red }' +
        '.light-container, .light-content{ transition: all 2s linear; animation-duration: 20s; animation-iteration-count: infinite; animation-timing-function: linear; }';
    document.body.appendChild(styles);
  }

  createContainer( el ){
    var config = {
      el: el,
      dodgeBrowser: this.dodgeBrowsers()
    };
    var newContainer = new LightContainer( config );
    this.containers.push(newContainer);
  }

  bindEvt(){
    var self = this;
    window.addEventListener('scroll', function(){
      self.doContainers();
    }, { passive: true });
  }

  doContainers(){
    for (var i = 0; i < this.containers.length; i++) {
      var container = this.containers[i];
      container.toggleState();
    }
  }

  getConfig(config){
    var selector;

    if( typeof(config) == 'string' ) selector = config;
    if( typeof(config) == 'object' ) selector = config.selector;

    this.selector = selector || 'light-container';

  }

  dodgeBrowsers(){
    var ua = navigator.userAgent.toLowerCase();
    if(
        ua.split('mobile').length > 1 ||
        ua.split('tablet').length > 1 ||
        ua.split('ipad').length > 1
    ){
        return true;
    }
    return false;
  }

}

document.addEventListener('DOMContentLoaded', function(){
  new LightAnim();
});
