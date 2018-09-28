import {LightContainer} from './LightContainer.js';
export class LightAnim{

  constructor(selector){

    this.containers = [];
    this.selector = selector || 'light-container';
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

new LightAnim();
