const ScrollQuantiser = function( _$ele, _$lines, _speed, _cutBottomLines, _preventInput ){
  this.$ele = _$ele;
  this.$scrollable = this.$ele.querySelector(':first-child');
  this.$lines = _$lines;
  this.$line = this.$lines[0]; 
  this.speed = _speed || 1;
  this.cutBottomLines = _cutBottomLines || 0;
  this.preventInput = _preventInput || false;
  this.preventInputInit = this.preventInput;
  this.scroll = {
    original: 0,
    quantised: 0
  };
  this.pScroll = {
    original: 0,
    quantised: 0
  };
  this.height = {
    original: 0,
    quantised: 0
  };
  this.firstVisibleLineIndex = 0;
  this.visibleLineCount = 0;
  this.minVisLine = 0;
  this.maxVisLine = this.$lines.length;
  this.hasScrolled = false;
  this.init();
  this.measure();
  this.render();
}

ScrollQuantiser.prototype = {
  init: function(){
    this.$wrapper = this.$ele.querySelector('.quantised-scroller--wrapper');
    if( !this.$wrapper ){     
      this.$wrapper = document.createElement('div');
      this.$wrapper.classList.add('quantised-scroller--wrapper');
      this.$ele.appendChild( this.$wrapper );
      this.$wrapper.appendChild( this.$scrollable );
    }
    if( this.preventInput ){
      return;
    }
    this.$ele.classList.add( 'quantised-scroller' );
    this.$furtherhint = document.createElement('div');
    this.$furtherhint.classList.add('further-hint')
    this.$ele.appendChild( this.$furtherhint );

    this.$ele.addEventListener( 'wheel', (e) => {
      if( this.preventInput ){ return; }
      this._onScroll( e.deltaY );
    }, {passive: true} );

    this.$ele.addEventListener( 'touchstart', (e) => {
      if( this.preventInput ){ return; }
      this.touchID = this.touchID || e.changedTouches[0].identifier;
      this.pTouch = e.changedTouches[0];
    }, {passive: true} );
    this.$ele.addEventListener( 'touchmove', (e) => {
      if( this.preventInput ){ return; }
      for( let i = 0; i < e.changedTouches.length; i++ ){
        let touch = e.changedTouches[i];
        if( touch.identifier === this.touchID ){          
          let deltaY = this.pTouch.pageY - touch.pageY;
          this._onScroll( deltaY );
          this.pTouch = touch;
        }
      }
    }, {passive: true} );
    this.$ele.addEventListener( 'touchend', (e) => {
      if( this.preventInput ){ return; }
      for( let i = 0; i < e.changedTouches.length; i++ ){
        let touch = e.changedTouches[i];
        if( touch.identifier === this.touchID ){
          let deltaY = this.pTouch.pageY - touch.pageY;
          this._onScroll( deltaY );
          this.pTouch = null;
          this.touchID = null;
        }
      }
    }, {passive: true} );
    window.addEventListener('keydown', ( e ) => {
      if( this.preventInput ){ return; }
      if( e.key === 'ArrowDown' ){
        this._onKey( 1 );
      }
      if( e.key === 'ArrowUp'){
        this._onKey( -1 );
      }
    });
  },
  update: function( deltaY ){
    this.pScroll.original = this.scroll.original;
    this.pScroll.quantised = this.scroll.quantised;
    this.scroll.original += deltaY * this.speed;   
    if( this.scroll.original < 0 ){
      this.scroll.original = 0;
    }
    if( this.scroll.original > this.maxScroll ){
      this.scroll.original = this.maxScroll;
    }
    this.firstVisibleLineIndex = Math.floor(this.scroll.original / this.lineH);
    this.scroll.quantised = this.firstVisibleLineIndex * this.lineH;

    this.minVisLine = this.firstVisibleLineIndex;
    this.maxVisLine = this.firstVisibleLineIndex + this.visibleLineCount;
    
  },
  render: function(){
    if( this.scroll.quantised === this.pScroll.quantised && this.hasScrolled ){
      return;
    }
    if( !this.hasScrolled && this.scroll.quantised > 0 ){
      this.hasScrolled = true;
      this.$ele.classList.add('has-scrolled');
    }
    this.$wrapper.style.height = this.height.quantised + 'px';
    this.$scrollable.style.transform = `translateY(${ -this.scroll.quantised }px)`;   
    this.$lines.forEach( ( $ele, index ) => {
      if( index < this.minVisLine || index > this.maxVisLine ){
        $ele.classList.add('quantised-scroller--hidden');
      } else {
        $ele.classList.remove('quantised-scroller--hidden');
      }
    });
  },
  onScroll: function(){ /* ... override ... */ },
  _onScroll: function( deltaY ){
    this.measure();
    this.update( deltaY );
    this.render();
    
    this.onScroll();
  },
  _onKey: function( direction ){
    this.measure();
    this.update( (this.lineH * direction) * (1/this.speed) );
    this.render();
    
    this.onScroll();
  },
  measure: function(){    
    this.lineH = Math.round(this.$line.getBoundingClientRect().height * 100) / 100;
    this.height.original = this.$ele.getBoundingClientRect().height;    
    this.visibleLineCount = Math.floor( (this.height.original - (this.lineH * this.cutBottomLines)) /  this.lineH );
    console.log('CV CUT: visibleLineCount = ', this.visibleLineCount );
    this.height.quantised = this.visibleLineCount * this.lineH;
    let scrollableQuantised = Math.round(this.$scrollable.getBoundingClientRect().height / this.lineH) * this.lineH;    
    this.maxScroll =  Math.ceil( scrollableQuantised - this.height.quantised );
  },
  recalculate: function(){
    this._onScroll( 0 );
  },
  deactivate: function(){
    this.preventInput = false;
  },
  activate: function(){
    this.preventInput = this.preventInputInit;
  }
}


module.exports = ScrollQuantiser;