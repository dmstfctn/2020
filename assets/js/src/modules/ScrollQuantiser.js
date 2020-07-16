const ScrollQuantiser = function( _$ele, _$line, _speed, _cutBottomLines, _preventInput ){
  this.$ele = _$ele;
  this.$scrollable = this.$ele.querySelector(':first-child');
  this.$line = _$line;
  this.speed = _speed || 1;
  this.cutBottomLines = _cutBottomLines || 0;
  this.preventInput = _preventInput || false;
  this.scroll = {
    original: 0,
    quantised: 0
  };
  this.height = {
    original: 0,
    quantised: 0
  };
  this.hasScrolled = false;
  this.init();
  this.measure();
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
    this.$ele.addEventListener( 'wheel', (e) => {
      this._onScroll( e.deltaY );
    }, {passive: true} );

    this.$ele.addEventListener( 'touchstart', (e) => {
      this.touchID = this.touchID || e.changedTouches[0].identifier;
      this.pTouch = e.changedTouches[0];
    });
    this.$ele.addEventListener( 'touchmove', (e) => {
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
      for( let i = 0; i < e.changedTouches.length; i++ ){
        let touch = e.changedTouches[i];
        if( touch.identifier === this.touchID ){
          let deltaY = this.pTouch.pageY - touch.pageY;
          this._onScroll( deltaY );
          this.pTouch = null;
          this.touchID = null;
        }
      }
    });
    window.addEventListener('keydown', ( e ) => {
      if( e.key === 'ArrowDown' ){
        this._onKey( 1 );
      }
      if( e.key === 'ArrowUp'){
        this._onKey( -1 );
      }
    });
  },
  update: function( deltaY ){
    this.scroll.original += deltaY * this.speed;   
    if( this.scroll.original < 0 ){
      this.scroll.original = 0;
    }
    if( this.scroll.original > this.maxScroll ){
      this.scroll.original = this.maxScroll;
    }
    this.scroll.quantised = Math.floor(this.scroll.original / this.lineH)  * this.lineH;
    
  },
  render: function(){
    if( !this.hasScrolled && this.scroll.quantised > 0 ){
      this.hasScrolled = true;
      this.$ele.classList.add('has-scrolled');
    }
    this.$wrapper.style.height = this.height.quantised + 'px';
    this.$scrollable.style.transform = `translateY(${ -this.scroll.quantised }px)`;
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
    this.height.quantised = Math.floor( (this.height.original - (this.lineH * this.cutBottomLines)) /  this.lineH ) * this.lineH;
    let scrollableQuantised = Math.round(this.$scrollable.getBoundingClientRect().height / this.lineH) * this.lineH;    
    this.maxScroll =  Math.ceil( scrollableQuantised - this.height.quantised );
  },
  recalculate: function(){
    this._onScroll( 0 );
  }
}


module.exports = ScrollQuantiser;