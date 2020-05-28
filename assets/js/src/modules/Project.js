const CFG = require('./Config.js' );
const F = require( './Functions.js' );

let $mediaNavMain = document.querySelectorAll('.dc-media__main .dc-media--nav li:not(.dc-media--link)');
let $mediaListMain = document.querySelectorAll('.dc-media__main .dc-media--list li');

let $mediaPlay = document.querySelectorAll('.dc-media__main .dc-media--nav .dc-media--play');

const Project = function(){
  this.$media = document.querySelectorAll('.dc-media__main .dc-media--list li');
  this.$nav = document.querySelectorAll('.dc-media__main .dc-media--nav li:not(.dc-media--link)');
  this.index = 0;
  this.isPlaying = false;
};

Project.prototype = {
  activate: function(){
    this.loadImages();
    this.setupEvents();
  },
  deactivate: function(){

  },
  stopAllMedia: function(){
    this.$nav.forEach(($n,index) => {
      if( $n.classList.contains('playing') ){
        this.stopMedia( index );
      }
    });
    this.isPlaying = false;
  },
  stopMedia: function( index ){
    const $nav = this.$nav[index]
    const $slide = this.$media[index];
    let $media = $slide.querySelector('audio') || $slide.querySelector('video');
    $media.pause();
    $nav.classList.remove('playing');
  },
  playMedia: function( index ){    
    const $nav = this.$nav[index]
    const $slide = this.$media[index];
    let $media = $slide.querySelector('audio') || $slide.querySelector('video');    
    $media.play();
    $nav.classList.add('playing');
  },
  toggleMedia: function( index ){
    const $nav = this.$nav[index]
    const $slide = this.$media[index];
    let $media = $slide.querySelector('audio') || $slide.querySelector('video');
    if( this.isPlaying === false ){
      this.stopAllMedia();
      this.playMedia( index );
    } else {
      this.stopMedia( index )
    }
  },
  loadImages: function(){
    F.loadSlideImages( this.$media ); 
  },
  deactivateSlide: function( index ){
    const $slide = this.$media[index];
    const $video = $slide.querySelector('video');
    if( $video ){ $video.pause() }
    $slide.classList.remove( 'active' );
  },
  activateSlide: function( index ){
    const $slide = this.$media[index];
    const $video = $slide.querySelector( 'video' );
    F.loadSlideImage( $slide );
    if( $video && $video.muted ){
      $video.play();
    }
    $slide.classList.add( 'active' );    
  },
  selectSlide: function( _index ){
    this.index = _index;
    if( _index >= this.$nav.length ){ this.index = this.$nav.length - 1; }
    if( _index < 0 ){ _index = 0; } 

    if( this.$nav[ this.index ].classList.contains('dc-media--play') ){ return false; }

    this.$media.forEach(( $m, index ) => {      
      if( index !== this.index ){
        this.deactivateSlide( index );
      } else {
        this.activateSlide( index );
      }
    });
  },
  nextSlide: function(){
    this.selectSlide( this.index + 1 );
  },
  setupEvents: function(){
    /* click to advance */
    this.$media.forEach( ( $m, index ) => {
      if( $m.classList.contains('info') ){ return; }
      $m.addEventListener('click', () => { this.nextSlide() });
    });
    /* hover to select */
    this.$nav.forEach(( $n, index ) => {
      if($n.classList.contains('dc-media__playable')){ 
        $n.addEventListener('click', (e) => {
          this.toggleMedia( index );
        });
      } else {
        $n.addEventListener( 'mouseover', () => {               
          this.selectSlide( index );
        });
      }
    });
  }
};

module.exports = Project;