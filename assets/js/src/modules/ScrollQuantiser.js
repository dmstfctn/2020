const ScrollQuantiser = function( _$ele, _$line ){
  this.$ele = _$ele;
  this.$scrollable = this.$ele.querySelector(':first-child');
  this.$line = _$line;

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
    });
  },
  update: function( deltaY ){
    this.scroll.original += deltaY;
    if( this.scroll.original < 0 ){
      this.scroll.original = 0;
    }
    if( this.scroll.original > this.maxScroll ){
      this.scroll.original = this.maxScroll;
    }    
    this.scroll.quantised = Math.floor( this.scroll.original / this.lineH ) * this.lineH;
    
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
  measure: function(){    
    this.lineH = this.$line.getBoundingClientRect().height;
    this.height.original = this.$ele.getBoundingClientRect().height;
    this.height.quantised = Math.floor( (this.height.original - this.lineH) /  this.lineH ) * this.lineH;
    this.maxScroll = this.$scrollable.getBoundingClientRect().height - this.height.quantised;
  },
  recalculate: function(){
    this._onScroll( 0 );
  }
}


module.exports = ScrollQuantiser;