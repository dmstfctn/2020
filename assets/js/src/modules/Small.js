import 'pepjs'

const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const Loader = require('./Loader.js');
const Project = require('./ProjectSmall.js');
const Orientation = require('./Orientation.js');
const SmallAnimations = require('./SmallAnimations.js');

const ScrollQuantiser = require( './ScrollQuantiser.js' );

const Small = function(){
  this.$interactionEle = document.querySelector('.dc-mobile-nav');  
  this.setupInteraction();

  this.$mainContent = document.querySelector( '.dc-main-content' );  

  this.loader = new Loader();
  this.minLoadTime = 800;

  this.orientation = new Orientation();
  this.animations = new SmallAnimations( this.$interactionEle );
  this.data = window.DCSMALL.pages;  
  
  this.remainingPages = this.data.length

  this.pageIndex = this.getPageIndexFor( window.location.pathname );
  this.startPageIndex = this.pageIndex;
  this.completedPageIndices = [];

  this.showreelHasRun = false;
  this.project = new Project( this.shouldShowreel() );

  this.cvScroller = new ScrollQuantiser( 
    document.querySelector('#info .dc-cv'), 
    document.querySelector('#info .dc-cv--entry'),
    0.4, //speed,
    0, //bottom lines to cut
    true // prevent input / interaction being initialised
  );
  this.cvScroller.recalculate();

  this.ended = false;

  this.setupProjectEvents();
};

Small.prototype._onLoadingStart = function(){
  this.loadingStartTime = (new Date()).getTime();
  this.onLoadingStart();
}
Small.prototype.onLoadingStart = function(){ /* ... override ... */ };

Small.prototype._onLoadingComplete = function(){
  this.loadingEndTime = (new Date()).getTime();
  this.loadingTime = this.loadingEndTime -   this.loadingStartTime;
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
  this.orientation.activate();
  this.project.activate();
}

Small.prototype.deactivate = function(){
  this.cancelLoader();
  this.orientation.deactivate();
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
};

Small.prototype.endState = function(){
  console.log('SMALL, start end state');
  this.ended = true;
  document.body.classList.add('dc-small--end-state'); 
}

Small.prototype.projectEnd = function(){  
  this.completedPageIndices.push( this.pageIndex );
  this.remainingPages = this.data.length - this.completedPageIndices.length;  
  this.pageIndex++;
  if( this.pageIndex >= this.data.length ){
    this.pageIndex = 0;    
  }
  
  if( this.completedPageIndices.indexOf( this.pageIndex ) === -1 ){ 
    this.loader.load( F.slashStart( this.data[ this.pageIndex ].url ) );
    this.showLoader();
  } else {
    this.endState();
  }
};

Small.prototype.showLoader = function(){
  this._onLoadingStart();
  document.body.classList.add('dc-loading');  
};
Small.prototype.hideLoader = function( _cb ){
  const cb = _cb || function(){};
  this._onLoadingComplete();
  if( this.loadingTime > this.minLoadTime ){ 
    document.body.classList.remove('dc-loading');  
    cb();
  } else {
    setTimeout( () => {
      document.body.classList.remove('dc-loading');  
      cb();
    }, this.minLoadTime - this.loadingTime );
  }
};


Small.prototype.cancelLoader = function(){
  this.loader.onLoad = () => {};
  window.removeEventListener('popstate', this.popstateHandler );
}

Small.prototype.setupLoader = function(){
  this.historyActive = true; 

  this.loader.onLoad = ( data, url, disableHistory  ) => {
    if( !disableHistory && this.historyActive ){     
      history.pushState(
        {
          type: 'page', 
          url: F.slashEnd( url ) 
        }, 
        null, 
        F.slashEnd( url ) 
      );
    }
    this.hideLoader( () => {
      this.renderPage( data );  
    });
  };

  let popstateFunction = ( event ) => {
    console.log('Small.js -> popstate');
    const state = history.state;    
    this.loader.load( state.url, true );
    this.showLoader();
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
      url: window.location.pathname
    }, 
    null, 
    window.location.pathname 
  );
}

Small.prototype.renderPage = function( data ){  
  document.title = data.title;
  document.documentElement.setAttribute('data-dc-pagetype', data.pagetype );
  if( data.pagetype !== 'relatedmatter' && data.pagetype !== 'focusgroup' ){
    return;
  }
  const addShowreel = (this.remainingPages === 0);
  this.$mainContent.innerHTML = data.html;
  this.project.deactivate();
  this.project = new Project( addShowreel ); 
  this.project.activate();
  this.setupProjectEvents();  
}

Small.prototype.setupProjectEvents = function(){
  this.project.onEnd = () => {
    this.projectEnd();
  };

  this.project.onChange = () => {
    this.animations.cancelForwardHint();
    if( this.project.isCurrentlyOnCV( this.orientation.orientation ) ){
      history.pushState(
        {
          type: 'page', 
          url: '/mmittee/'
        }, 
        null, 
        '/mmittee/'
      );
    }
  }

  this.project.onCantGoBack = () => {
    this.animations.triggerNoFurther();
  };
}
module.exports = new Small();