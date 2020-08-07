const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const DC_INFO_CLASS = 'dc-info';

const ProjectSmall = function( backwards, hasGfx ){
  this.$wrapper = document.querySelector( '.dc-item' );  
  this.items = this.getItems();
  this.minIndex = (hasGfx) ? 0 : 1;
  this.slideIndex = (backwards) ? this.items.length - 1 : this.minIndex;

  this.loadPlaceholderImages();
  this.update();  
  if( backwards && this.items[ this.slideIndex ].ele ){
    F.loadSlideImage( this.items[ this.slideIndex ].ele )
  }
};

ProjectSmall.prototype = {
  _onCantGoBack: function(){
    this.isCurrentlyOnGfxPlaceholder();
    this.onCantGoBack();
  },
  onCantGoBack: function(){ /* ... override ... */ },
  _onEnd: function(){
    this.onEnd();
  },
  onEnd: function(){ /* ... override ... */ },
  _onChange: function(){
    this.isCurrentlyOnGfxPlaceholder();
    this.onChange();
  },
  onChange: function(){ /* ... override ... */ },
  activate: function(){
    this.preloadImages( 2 );
  },
  _onNext: function(){
    this.onNext();
  },
  onNext: function(){ /* ... override ... */ },
  _onPrev: function(){
    this.onPrev();
  },
  onPrev: function(){ /* ... override ... */ },
  deactivate: function(){
    /*noop*/
  },
  _onGfx: function(){
    console.log('ProjectSmall, onGfx()');
    this.onGfx();
  },
  onGfx: function(){ /* ... override ... */ },
  isCurrentlyOnGfxPlaceholder: function(){
    if( this.slideIndex <= 0 && this.minIndex === 0 ){
      this.isOnGfxPlaceholder = true;
      this._onGfx();
    } else {
      this.isOnGfxPlaceholder = false;
    }
    return this.isOnGfxPlaceholder;
  },
  isCurrentlyOnCV: function(){
    if( !this.items[ this.slideIndex ] ){
      return false;
    }
    const current = this.items[ this.slideIndex ];
    const parent = current.parentElement;
    let parentIsInfo = (parent) ? parent.classList.contains( DC_INFO_CLASS ) : false;
    let isInfo = current.classList.contains( DC_INFO_CLASS );      
    return parentIsInfo || isInfo;
  },
  getProjectItems: function(){
    let result = [];
    if( !this.$wrapper ){  
      return result;
    }
    const $info = this.$wrapper.querySelector('.dc-item--info')
    result = [
      {
        type: 'standard',
        ele: $info,
        parent: false
      }
    ];
    result = result.concat(
      [...this.$wrapper.querySelectorAll('.dc-item--info .dc-small-chunk')]
        .map( ($ele) => {
          return {
            type: 'chunk',
            ele: $ele,
            parent: $info
          }
        })
    );
    result = result.concat(
      [...this.$wrapper.querySelectorAll( '.dc-media__small .dc-media--list li' )]
        .map( ($ele) => {
          return {
            type: 'standard',
            ele: $ele,
            parent: false
          }
        })
    );

    return result;
  },
  getCvItems: function(){
    const $dcInfo = document.querySelector( `.${DC_INFO_CLASS}`);
    const $dcInfoSections = document.querySelectorAll( `.${DC_INFO_CLASS} .dc-small-chunk` );
    return [{
      type: 'standard',
      ele: $dcInfo,
      parent: false
    }].concat(
      [... $dcInfoSections]
      .map( ($ele) => {
        return {
          type: 'chunk',
          ele: $ele,
          parent: $dcInfo
        }
      })
    );
  },
  hideCv: function(){
    const items = this.getCvItems();
    items
      .forEach( ( item ) => {
        if( item.type === 'gfx' ) return;
        item.ele.classList.remove( 'active' );
        if( item.type === 'chunk' ) item.parent.classList.remove('active');
      });
  },
  getItems: function(){
    let result = this.getProjectItems();
   
    if( result.length === 0 ){ //there are no project slides, must be cv
      result = this.getCvItems();
    } else {
      this.hideCv();
    }

    //add gfx placeholder at the start
    result = [{
      type: 'gfx',
      ele: false,
      parent: false
    }].concat( result );

    return result;
  },
  loadPlaceholderImages: function(){
    for( let index = 0; index <  this.items.length; index++ ){      
      const slide = this.items[ index ];
      console.log('loadPlaceholderImages() iteration ', index, 'slide: ', slide );
      if( !slide ) continue;
      if( slide.type === 'gfx' ) continue;
      F.loadSlidePlaceholder( slide.ele );
    }
  },
  deactivateAll: function(){
    this.items
      .forEach( ( item ) => {
        if( item.type === 'gfx' ) return;
        item.ele.classList.remove( 'active' );
        if( item.type === 'chunk' ) item.parent.classList.remove('active');
        this.deactivateSlide( item );
      });
  },
  preloadImages: function( _preloadCount ){
    let preloadCount = _preloadCount | 2;  
    for( let i = -preloadCount; i < 1 + preloadCount; i++ ){
      let index = this.slideIndex + i;
      const slide = this.items[ index ];
      if( !slide ) continue;
      if( slide.type === 'gfx' ) continue;
      if( index === this.slideIndex ) continue;
      F.loadSlideImage( slide.ele )
    } 
  },
  next: function(){
    this.slideIndex++;

    // we've gone past the last slide for this part
    if( this.slideIndex >= this.items.length ){
      this._onEnd();
      return;
    }    
    this.update();
    this._onNext();
    this._onChange();    
  },
  prev: function(){
    this.slideIndex--;
    if( this.slideIndex < this.minIndex ){      
      this._onCantGoBack();
      return;
    }

    this.update();
    this._onPrev();
    this._onChange();
  },
  update: function(){
    console.log('update()');
    console.log('slideImdex', this.slideIndex )
    const slide = this.items[ this.slideIndex ]
    this.deactivateAll();
    
    if( slide.type === 'gfx' ){

    } else {
      console.log('ProjectSmall, update(), slideIndex: ', this.slideIndex );
      slide.ele.classList.add( 'active' );
      if( slide.type === 'chunk' ){
        slide.parent.classList.add('active');
      }
      this.activateSlide( this.items[ this.slideIndex ] );
    }
  
    this.preloadImages( 2 );
  },
  deactivateSlide: function( slide ){
    const $slide = slide.ele;
    if( $slide && $slide.classList.contains('dc-media__video') ){
      const $video = $slide.querySelector('video');
      $video.pause();
      $video.currentTime = 0;
    }
  },
  activateSlide: function( slide ){
    const $slide = slide.ele;
    if( $slide && $slide.classList.contains('dc-media__video') ){
      if( window.DC_GFX ) window.DC_GFX.preventAppearance();
      let videoPlay = $slide.querySelector('video').play();
      if( videoPlay ){
        videoPlay.catch( ( e ) => {
          console.log('VIDEO CANT PLAY, go to next' );
          console.log( e );
          this.next();
        });
      }
    } else {
      if( window.DC_GFX ) window.DC_GFX.enableAppearance();
    }
  },
};

module.exports = ProjectSmall;