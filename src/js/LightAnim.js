import {LightContainer} from './LightContainer.js';
export class LightAnim{

  constructor(selector){

    this.containers = [];
    this.selector = selector || 'light-container';
    this.init();
    this.bindEvt();

  }

  init(){
    this.getStyles();
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
        '.light-container{  position: relative; } ' +
        '.light-container.ready{  opacity: 1; } ' +
        '.light-container > img{  pointer-events: none;  user-select: none;  opacity: 0; } ' +
        '.light-container .light-img-container .light-figure .light-img{  opacity: 0;  transition: all 2s linear; } ' +
        '.light-container .light-img-container .light-figure .light-img.active{  opacity: 1; } ' +
        '.light-container .light-img-container{  position: absolute; pointer-events: none; top: 0;  left: 0;  width: 100%;  height: 100%;  display: block; } ' +
        '.light-container .light-img-container.debug{  border: 1px solid red; } ' +
        '.light-container .light-img-container.debug:after{  position: absolute;  content: "";  left: calc(50% - 5px);  top: calc(50% - 5px);  border-radius: 50%;  background: red;  height: 10px;  width: 10px;  z-index: 100; } ' +
        '.light-container .light-img-container > div{  position: relative;  width: 100%;  height: 100%;  display: block;  transition: all 2s linear;  animation-duration: 20s;  animation-iteration-count: infinite;  animation-timing-function: linear; } ' +
        '.light-figure{  position: absolute;  animation-iteration-count: infinite; } ' +
        '.light-img{  transition: opacity 3s ease;  animation-duration: 5s;  animation-iteration-count: infinite;  animation-timing-function: ease; } ' +
        '.light-content{  z-index: 100; } ' +
        '.light-debug{  font-size: 1rem;  position: absolute;  max-width: 100%; } ' +
        ' .light-container, .light-content{ transition: all 2s linear; animation-duration: 20s; animation-iteration-count: infinite; animation-timing-function: linear; }' +
        '@keyframes idleWander{  from { transform: translate(0px, 0px); }  20%{ transform: translate(10px, 5px); }  50%{ transform: translate(5px, 20px); }  to { transform: translate(0px, 0px); } } ' +
        '@keyframes infiniteRotate{  from { transform: rotate(0deg); }  to { transform: rotate(360deg); } } @keyframes infiniteCounterRotate{  from { transform: rotate(0deg); }  to { transform: rotate(-360deg); } } ' +
        '@keyframes infiniteWanderCounterRotate{  from { transform: rotate(0deg) translate(0px, 0px); }  20%{ transform: translate(10px, 5px); }  50%{ transform: translate(5px, 20px); }  to { transform: rotate(-360deg) translate(0px, 0px); } }';
    document.body.appendChild(styles);
  }

  createContainer(el){
    var newContainer = new LightContainer(el);
    this.containers.push(newContainer);
  }

  bindEvt(){
    var self = this;
    window.addEventListener('scroll', function(){
      self.doContainers();
    });
  }

  doContainers(){
    for (var i = 0; i < this.containers.length; i++) {
      var container = this.containers[i];
      container.toggleState();
    }
  }

}

document.addEventListener('DOMContentLoaded', function(){
  new LightAnim();
});
