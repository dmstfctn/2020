import 'pepjs'

const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const Loader = require('./Loader.js');
const Project = require('./ProjectSmall.js');
const Orientation = require('./Orientation.js');
const SmallAnimations = require('./SmallAnimations.js');

const Small = function(){
  this.$interactionEle = document.querySelector('.dc-mobile-nav');  
  this.setupInteraction();

  this.$mainContent = document.querySelector( '.dc-main-content' );  

  this.loader = new Loader();
  this.orientation = new Orientation();
  this.animations = new SmallAnimations( this.$interactionEle );
  this.data = window.DCSMALL.pages;  
  
  this.remainingPages = this.data.length

  this.pageIndex = this.getPageIndexFor( window.location.pathname );
  this.startPageIndex = this.pageIndex;
  this.completedPageIndices = [];

  this.showreelHasRun = false;
  this.project = new Project( this.shouldShowreel() );

  this.ended = false;

  this.setupProjectEvents();
  this.setupLoader();
};

Small.prototype._onLoadingStart = function(){
  this.onLoadingStart();
}
Small.prototype.onLoadingStart = function(){ /* ... override ... */ };

Small.prototype._onLoadingComplete = function(){
  this.onLoadingComplete();
}
Small.prototype.onLoadingComplete = function(){ /* ... override ... */ };


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
  this.orientation.activate();  
  this.animations.readyForwardHint();
  this.project.activate();
}

Small.prototype.deactivate = function(){
  this.orientation.deactivate();
  this.project.deactivate();
  this.animations.clearForwardHintTimeout();
}

/* interaction */
Small.prototype.setupInteraction = function(){
  this.$interactionEle.addEventListener( 'pointerdown', ( e ) => {
    if( this.ended ){
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
  this.ended = true;
  alert('END OF SITE');
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
Small.prototype.hideLoader = function(){
  document.body.classList.remove('dc-loading');
  this._onLoadingComplete();
};


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
    this.renderPage( data );
    this.hideLoader();
  };

  window.addEventListener('popstate', ( event ) => {
    const state = history.state;    
    this.loader.load( state.url, true );
    this.showLoader();
  });

  //first history state:
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
  const addShowreel = (this.remainingPages === 0);
  document.title = data.title;
  document.documentElement.setAttribute('data-dc-pagetype', data.pagetype );
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
  }

  this.project.onCantGoBack = () => {
    this.animations.triggerNoFurther();
  };
}
module.exports = new Small();