//import * as VimeoPlayer from "@vimeo/player/dist/player.min.js" ;
const VimeoPlayer = require('@vimeo/player');


const Embed = function( $slide ){
  this.$slide = $slide;
  this.$ele = this.$slide.querySelector('.dc-embed');
  this.service = this.$ele.getAttribute('data-embed-service');
  this.url = this.$ele.getAttribute('data-embed-url');
  this.isEmbedded = this.$ele.classList.contains('embedded');
  this.controller = false;  
}

Embed.prototype = {
  createControllerForService: function(){
    if( this.controller ) return this.controller;
    if( this.service === 'vimeo' ){
      if( this.isEmbedded ){
        return new VimeoPlayer( this.$ele.querySelector('iframe') );
      } else {
        return new VimeoPlayer( this.$ele, {
          url: this.url,
          autoplay: false,
          controls: false,
          autopause: true
        })
      }
    }
  },
  prepare: function(){
    this.controller = this.createControllerForService();
  },
  activate: function(){
    if( !this.controller ){
      this.controller = this.createControllerForService();
    }
    if( this.service === 'vimeo' ){
      this.controller.play();
    }
  },
  deactivate: function(){
    if(!this.controller) return;
    if( this.service === 'vimeo' ){
      this.controller.setCurrentTime(0);
      this.controller.pause();
    }
  }
}

module.exports = Embed;