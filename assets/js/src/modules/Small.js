import 'pepjs'

const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const Loader = require('./Loader.js');
const Project = require('./ProjectSmall.js');
const Orientation = require('./Orientation.js');
const SmallAnimations = require('./SmallAnimations.js');
const ProgressBar = require( './ProgressBar.js' );

const ScrollQuantiser = require( './ScrollQuantiser.js' );

const Small = function( _loops ){
  this.loops = !!_loops;

  this.$interactionEle = document.querySelector('.dc-mobile-nav');    

  this.$mainContent = document.querySelector( '.dc-main-content' );  

  this.loader = new Loader();
  this.minLoadTime = 800;
  
  this.orientation = new Orientation();
  this.animations = new SmallAnimations( this.$interactionEle );
  this.data = window.DCSMALL.pages;  
  
  this.remainingPages = this.data.length

  this.pageIndex = this.getPageIndexFor( window.location.pathname );

  this.startPageIndex = this.pageIndex;

  this.showreelHasRun = false;
  this.project = new Project( this.shouldShowreel() );  
  const nextProjectTitle = this.getNextProjectTitle( this.shouldShowreel() );
  this.project.setNextProjectTitle( nextProjectTitle );
  
  this.progress = new ProgressBar( this.project.items.length + 1 );

  this.cvScroller = new ScrollQuantiser( 
    document.querySelector('#info .dc-cv'), 
    document.querySelectorAll('#info .dc-cv--entry'),
    0.4, //speed,
    0, //bottom lines to cut
    true // prevent input / interaction being initialised
  );
  this.cvScroller.recalculate();

  this.ended = false;

  this.setupProjectEvents();

  this.setupInteraction();
};

Small.prototype._onLoadingStart = function(){
  this.loadingStartTime = (new Date()).getTime();
  this.onLoadingStart();
}
Small.prototype.onLoadingStart = function(){ /* ... override ... */ };

Small.prototype._onLoadingComplete = function(){
  this.onLoadingComplete( this.loadingTime );
}
Small.prototype.onLoadingComplete = function(){ /* ... override ... */ };

Small.prototype._onEndInteraction = function(){
  this.onEndInteraction();
}
Small.prototype.onEndInteraction = function(){ /* ... override ... */ };

/* Utilities / Data */
Small.prototype.getPageIndexFor = function( _path ){
  const path = F.slashBoth( _path );  
  
  const index = window.DCSMALL.pages
    .findIndex( (item) => { 
      let url = F.slashBoth( item.url );        
      return url === path;  
    });

  return index;
}

Small.prototype.getNextProjectTitle = function( _includesCv ){
  if( !this.data[this.pageIndex+1] || _includesCv ){
    return 'DEMYSTIFICATION COMMITTEE';
  } else {
    return this.data[this.pageIndex+1].title.toUpperCase();
  }
}

Small.prototype.shouldShowreel = function(){
  if( this.showreelHasRun ){ //the showreel has already run once
    return false;
  }
  if( !document.referrer ){ //i.e. entered website directly
    return true;
  }
  const there = F.slashEnd( new URL( document.referrer ).origin );
  const here = F.slashEnd( window.location.origin );
  return there !== here; //if came to the site from a different URL, then true
}

/* Activate / Deactivate */
Small.prototype.activate = function(){
  this.setupLoader();
  this.cvScroller.activate();
  this.orientation.activate();
  this.project.activate();
  this.orientation.onOrientationChange = () => {
    this.project.changeOrientation( this.orientation.orientation );
  };
}

Small.prototype.deactivate = function(){
  this.cancelLoader();
  this.cvScroller.deactivate();
  this.orientation.deactivate();
  this.orientation.onOrientationChange = function(){};
  this.project.deactivate();
  this.animations.clearForwardHintTimeout();
}

/* interaction */
Small.prototype.setupInteraction = function(){
  this.$interactionEle.addEventListener( 'pointerdown', ( e ) => {
    if( this.ended ){
      this._onEndInteraction();
      return;
    }
    if(e.pageX >= window.innerWidth / 2){
      this.project.next( this.orientation.orientation );
    } else {
      this.project.prev( this.orientation.orientation );
    }
  });
  this.$interactionEle.addEventListener('touchmove', function (event) {
    if (event.targetTouches.length === 1) {
      event.preventDefault();
    }
  });
};

Small.prototype.projectEnd = function( backwards ){  
  this.pageIndex = (backwards) ? this.pageIndex - 1 : this.pageIndex + 1;
  
  if( this.pageIndex >= this.data.length ){
    this.pageIndex = 0;    
  }
  if( this.pageIndex < 0 ){
    this.pageIndex = this.data.length-1;    
  }
  
  this.loader.load( F.slashStart( this.data[ this.pageIndex ].url ), false, { backwards: backwards } );
  this.showLoader( backwards );

  console.log('projectEnd() , pageIndex = ', this.pageIndex );
};

Small.prototype.showLoader = function( backwards ){
  console.log('SHOW LOADER!');
  this._onLoadingStart();
  document.body.classList.add('dc-loading');  
  this.progress.startLoadAnim( this.minLoadTime, backwards );  
};
Small.prototype.hideLoader = function( _cb ){
  console.log( 'Small.prototype.hideLoader()',this.loadingTime, '/', this.minLoadTime )
  const cb = _cb || function(){};
  if( this.loadingTime < this.minLoadTime ){ 
    setTimeout( () => {
      console.log( 'HIDE LOADER (timeout)' )
      this.progress.cancelLoadAnim();
      document.body.classList.remove('dc-loading');
      this._onLoadingComplete();
      cb();
    }, this.minLoadTime - this.loadingTime );
  } else {
    console.log( 'HIDE LOADER (direct)' )
    this.progress.cancelLoadAnim();
    document.body.classList.remove('dc-loading');
    this._onLoadingComplete();
    cb();
  }
};


Small.prototype.cancelLoader = function(){
  console.log('Small.prototype.cancelLoader()');
  this.loader.onLoad = () => {};
  this.progress.cancelLoadAnim();
  window.removeEventListener('popstate', this.popstateHandler );
}

Small.prototype.setupLoader = function(){
  this.historyActive = true; 

  this.loader.onLoad = ( data, url, disableHistory, extra ) => {
    console.log('Small.js: this.loader.onLoad() ' );
    if( !disableHistory && this.historyActive ){     
      history.pushState(
        {
          type: 'page', 
          url: F.slashEnd( url ),
          shouldShowreel: this.shouldShowreel()
        }, 
        null, 
        F.slashEnd( url ) 
      );
    }
    this.loadingEndTime = (new Date()).getTime();
    this.loadingTime = this.loadingEndTime - this.loadingStartTime;
    
    this.hideLoader( () => {
      this.renderPage( data, extra );  
    });
  };

  let popstateFunction = ( event ) => {
    const state = history.state;    
    const statePageIndex = this.getPageIndexFor( history.state.url );  
    this.showLoader();
    this.loader.load( state.url, true, {shouldShowreel: state.shouldShowreel} );    
  };

  this.popstateHandler = popstateFunction.bind( this );

  window.addEventListener('popstate', this.popstateHandler );

  //first history state:
  this.firstHistoryState();
}

Small.prototype.firstHistoryState = function(){
  history.replaceState(
    {
      type: 'page',
      url: window.location.pathname,
      shouldShowreel: this.shouldShowreel()
    }, 
    null, 
    window.location.pathname 
  );
}

Small.prototype.renderPage = function( data, extra ){  
  const backwards = !!extra.backwards;
  document.title = data.title;
  document.documentElement.setAttribute('data-dc-pagetype', data.pagetype );
  
  const addShowreel = extra.shouldShowreel || (this.remainingPages === 0 && !this.loops);
  this.$mainContent.innerHTML = data.html;
  this.project.deactivate();
  this.project = new Project( addShowreel, backwards ); 
  this.project.activate();
  this.progress.init( 
    ( backwards ) ? this.project.items.length - 1 : 0, 
    this.project.items.length 
  );
  const nextProjectTitle = this.getNextProjectTitle( addShowreel ); 
  this.project.setNextProjectTitle( nextProjectTitle );
  this.setupProjectEvents();  
}

Small.prototype.setupProjectEvents = function(){
  this.project.onEnd = () => {
    this.projectEnd( false );
  };
  this.project.onNext = () => {
    this.progress.next();
  };
  this.project.onPrev = () => {
    this.progress.prev();
  };
  this.project.onChange = () => {
    this.animations.cancelForwardHint();
    if( this.project.isCurrentlyOnCV( this.orientation.orientation ) ){
      history.pushState(
        {
          type: 'page', 
          url: '/mmittee/',
          shouldShowreel: true
        }, 
        null, 
        '/mmittee/'
      );
    }
  }

  this.project.onCantGoBack = () => {
    this.projectEnd( true );
    //this.animations.triggerNoFurther();
  };
}
module.exports = new Small( CFG.SITE_SHOULD_LOOP );