const ScrollQuantiser = function( _$ele, _$line, _speed ){
  this.$ele = _$ele;
  this.$scrollable = this.$ele.querySelector(':first-child');
  this.$line = _$line;
  this.speed = _speed || 1;
  this.scroll = {
    original: 0,
    quantised: 0
  };
  this.height = {
    original: 0,
    quantised: 0
  };

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

    this.$ele.classList.add( 'quantised-scroller' );
    this.$ele.addEventListener( 'wheel', (e) => {
      this._onScroll( e.deltaY );
    }, {passive: true} );

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
    this.height.quantised = Math.floor( (this.height.original - this.lineH) /  this.lineH ) * this.lineH;
    let scrollableQuantised = Math.round(this.$scrollable.getBoundingClientRect().height / this.lineH) * this.lineH;
    //console.log( 'lineH', this.lineH  );
    //console.log('scrollableQuantised', scrollableQuantised, 'from: ',this.$scrollable.getBoundingClientRect().height );
    this.maxScroll =  Math.ceil( scrollableQuantised - this.height.quantised );
    //console.log('maxScroll', this.maxScroll );
  },
  recalculate: function(){
    this._onScroll( 0 );
  }
}


module.exports = ScrollQuantiser;