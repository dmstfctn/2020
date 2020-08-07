import 'pepjs'

const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const Loader = require('./Loader.js');
const Project = require('./ProjectSmall.js');
const Orientation = require('./Orientation.js');
const ProgressBar = require( './ProgressBar.js' );

const ScrollQuantiser = require( './ScrollQuantiser.js' );

const Small = function( _loops ){
  this.$interactionEle = document.querySelector('.dc-mobile-nav');    
  this.$mainContent = document.querySelector( '.dc-main-content' );  

  this.loader = new Loader();
  this.minLoadTime = 800;
  
  this.orientation = new Orientation();
  this.orientation.onSizeRoot = ( w, h ) => {
    this.project.setSize( w, h, this.orientation.orientation );
    this.cvScroller.recalculate();
  }
  this.setupData();

  this.project = new Project( false, true );
  this.progress = new ProgressBar( this.project.items.length );

  this.cvScroller = new ScrollQuantiser( 
    document.querySelector('#info .dc-cv'), 
    document.querySelectorAll('#info .dc-cv--entry'),
    0.4, //speed,
    0, //bottom lines to cut
    true // prevent input / interaction being initialised
  );
  this.cvScroller.recalculate();

  this.setupProjectEvents();
  this.setupInteraction();
};

Small.prototype.setupData = function(){
  this.data = window.DCSMALL.pages;  
  this.homePath = this.data[0].url;
  this.homeIndex = 0;
  this.pageIndex = this.getPageIndexFor( window.location.pathname );
  if( this.pageIndex !== 0 ){
    this.data.splice( this.pageIndex, 0, this.data.shift() );
    this.pageIndex = this.getPageIndexFor( window.location.pathname );
    this.homeIndex = this.pageIndex + 1;
  }
  this.startPageIndex = this.pageIndex;
}

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

Small.prototype._onReenableFirstGfxHide = function(){
  this.onReenableFirstGfxHide();
}
Small.prototype.onReenableFirstGfxHide = function(){ /* ... override ... */ };


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

/* Activate / Deactivate */
Small.prototype.activate = function(){
  this.setupLoader();
  this.cvScroller.activate();
  this.orientation.activate();
  this.project.activate();  
}

Small.prototype.deactivate = function(){
  this.cancelLoader();
  this.cvScroller.deactivate();
  this.orientation.deactivate();
  this.project.deactivate();
}

/* interaction */
Small.prototype.setupInteraction = function(){
  this.$interactionEle.addEventListener( 'pointerdown', ( e ) => {
    if(e.pageX >= window.innerWidth / 2){
      this.project.next();
    } else {
      this.project.prev();
    }
    if( this.project.isOnGfxPlaceholder ){
      e.stopPropagation();
    }
  });  
  this.$interactionEle.addEventListener('touchmove', function (event) {
    if (event.targetTouches.length === 1) {
      event.preventDefault();
    }
  });
  document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});
};

Small.prototype.projectEnd = function( backwards ){
  if( backwards && this.pageIndex === this.startPageIndex ){
    return;
  }
  this.pageIndex = (backwards) ? this.pageIndex - 1 : this.pageIndex + 1;
  
  if( this.pageIndex >= this.data.length ){
    this.pageIndex = 0;    
  }
  if( this.pageIndex < 0 ){
    this.pageIndex = this.data.length-1;    
  }
  
  this.loader.load( 
    F.slashStart( this.data[ this.pageIndex ].url ), 
    false, 
    { 
      backwards: backwards
    } 
  );
  this.showLoader( backwards );
};

Small.prototype.showLoader = function( backwards ){
  this._onLoadingStart();
  document.body.classList.add('dc-loading');  
  this.progress.startLoadAnim( this.minLoadTime, backwards );  
};
Small.prototype.hideLoader = function( _cb ){
  const cb = _cb || function(){};
  if( this.loadingTime < this.minLoadTime ){ 
    setTimeout( () => {
      this.progress.cancelLoadAnim();
      document.body.classList.remove('dc-loading');
      this._onLoadingComplete();
      cb();
    }, this.minLoadTime - this.loadingTime );
  } else {
    this.progress.cancelLoadAnim();
    document.body.classList.remove('dc-loading');
    this._onLoadingComplete();
    cb();
  }
};


Small.prototype.cancelLoader = function(){
  this.loader.onLoad = () => {};
  this.progress.cancelLoadAnim();
  window.removeEventListener('popstate', this.popstateHandler );
}

Small.prototype.setupLoader = function(){
  this.historyActive = true; 

  this.loader.onLoad = ( data, url, disableHistory, extra ) => {
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
    this.loader.load( state.url, true );    
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

Small.prototype.renderPage = function( data, extra ){  
  const backwards = !!extra.backwards;
  const isFirstOneAgain = this.startPageIndex === this.pageIndex;
  document.title = data.title;
  document.documentElement.setAttribute('data-dc-pagetype', data.pagetype );

  this.$mainContent.innerHTML = data.html;
  this.project.deactivate();
  this.project = new Project( backwards, isFirstOneAgain ); 
  this.project.activate();
  this.progress.init( this.project.slideIndex, this.project.items.length );
  this.setupProjectEvents();  
}

Small.prototype.setupProjectEvents = function(){
  this.project.onEnd = () => {
    this.projectEnd( false );
  }; 
  this.project.onChange = () => {
    this.progress.setProgress( this.project.slideIndex );
    this.progress.render();
  }

  this.project.onGfx = () => {
    this.progress.setProgress( this.project.slideIndex );
    this._onReenableFirstGfxHide();
  }

  this.project.onCantGoBack = () => {
    this.projectEnd( true );
  };
}

Small.prototype.firstGfxHide = function(){
  this.project.next();
}
module.exports = new Small( CFG.SITE_SHOULD_LOOP );