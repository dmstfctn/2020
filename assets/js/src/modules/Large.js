const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const Loader = require('./Loader.js');

const Menus = require( './Menus.js' );
const Project = require( './ProjectLarge.js' );
const HoverImg = require( './HoverImg.js' );

const VisualQuantiser = require( './VisualQuantiser.js' );
const ScrollQuantiser = require( './ScrollQuantiser.js' );

const Large = function(){
  this.project = new Project();
  this.menus = new Menus();
  this.loader = new Loader([
    'a[href^="/mmittee/related-matters/"]',
    'a[href^="/mmittee/focus-groups/"]'
  ]);

  this.setupLogo();
  this.setupMenus();  
  this.initQuantisers(); 

  document.querySelectorAll( '.dc-list-hoverimg' )
    .forEach( ($hoverImg) => {
      HoverImg( $hoverImg );
   });
};

Large.prototype.setupLogo = function(){
  const version = Math.floor( Math.random() * 4 );
  document.querySelector('.dc-logo').setAttribute('data-dc-version', version );
}

Large.prototype.setupMenus = function(){
  this.menus.onChange = ( id ) => {
    let p = id;
    document.documentElement.setAttribute('data-dc-menuvisible', id );

    if( id === 'related-matters' ){ p = ''; }    
    if( this.historyActive ){
      history.pushState(
        {
          type: 'menu', 
          url: '/mmittee/' + p, 
          id: id,
        }, 
        null, 
        '/mmittee/' + p 
      );
    }
    //run the 'visual quantiser' 
    if( this.vcList[ p ] ){
      this.vcList[ p ].run();
    }
    if( p === 'info' ){
      this.cvScroller.recalculate();
    }
  }
};

Large.prototype.cancelLoader = function(){
  this.loader.onLoad = () => {};
  window.removeEventListener('popstate', this.popstateHandler );
}

Large.prototype.setupLoader = function(){
  this.loader.initEvents();

  this.historyActive = true;
  this.$mainContent = document.querySelector( '.dc-main-content' );  

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
    //this.menus.hideMenus();
  };

  let popstateFunction = ( event ) => {
    const state = history.state;
    if( state.type === 'menu' ){
      this.historyActive = false;
      this.menus.showMenuById( state.id );
      document.documentElement.setAttribute('data-dc-menuvisible', state.id );
      this.historyActive = true;
    } else {
      this.menus.hideMenus();
      document.documentElement.setAttribute('data-dc-menuvisible', '' );
      this.loader.load( state.url, true );
    }
  };

  this.popstateHandler = popstateFunction.bind( this );
  
  window.addEventListener('popstate', this.popstateHandler );
  
  this.firstHistoryState();
}

Large.prototype.firstHistoryState = function(){
  //first history state:
  const type = ( window.location.pathname.split('/').length > 4 ) ? 'page' : 'menu';
  let initialState = {
    type: type,
    url: window.location.pathname
  };
  if( type === 'menu' ){
    let pathSegments = window.location.pathname.split('/');
    let pathLast = pathSegments.pop() || pathSegments.pop(); 
    initialState.id = ( pathLast === 'mmittee' ) ? 'related-matters' : pathLast;
  }
  history.replaceState( initialState, null, window.location.pathname );
};

Large.prototype.initQuantisers = function(){
  this.vcList = {
    'related-matters': VisualQuantiser( 
      document.querySelector('#related-matters ol'),
      document.querySelectorAll('#related-matters ol li'),
      document.querySelector('#related-matters .dc-biglist--now')
    ),
    'focus-groups': VisualQuantiser( 
      document.querySelector('#focus-groups ol'),
      document.querySelectorAll('#focus-groups ol li'),
      document.querySelector('#focus-groups .dc-biglist--now')
    )
  };
  this.cvScroller = new ScrollQuantiser( 
    document.querySelector('#info .dc-cv'), 
    document.querySelector('#info .dc-cv--entry'),
    0.4, //speed,
    1 // no. of lines to cut off bottom 
  );
}

Large.prototype.renderPage = function( data ){
  document.title = data.title;
  document.documentElement.setAttribute('data-dc-pagetype', data.pagetype );
  document.documentElement.setAttribute('data-dc-menuvisible', '' );
  if( data.pagetype !== 'relatedmatter' && data.pagetype !== 'focusgroup' ){
    return;
  }
  this.project.deactivate();
  this.$mainContent.innerHTML = data.html; 
  this.project = new Project();
  this.project.activate();
  this.loader.initEvents( this.$mainContent );  
};

Large.prototype.quantise = function(){
  for( let i in this.vcList ){
    this.vcList[i].run();
  }
  this.cvScroller.recalculate();
}

Large.prototype.activate = function(){
  this.setupLoader();
  this.project.activate();
  this.quantise();
  this.resizeHandler = this.quantise.bind(this);
  window.addEventListener('resize', this.resizeHandler );
}
Large.prototype.deactivate = function(){
  this.cancelLoader();
  window.removeEventListener('resize', this.resizeHandler );
}

module.exports = new Large();