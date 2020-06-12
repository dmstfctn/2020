const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const Loader = require('./Loader.js');

const GFX = require( './GFX.js' );

const Menus = require( './Menus.js' );
const Project = require( './Project.js' );
const HoverImg = require( './HoverImg.js' );

const VisualQuantiser = require( './VisualQuantiser.js' );
const ScrollQuantiser = require( './ScrollQuantiser.js' );

/* list page links transition */
// let $sitenav = document.querySelector( '.dc-sitenav' );
// let $dcNow = document.querySelector( '.dc-biglist--now' );
// let $workLinks = document.querySelectorAll('.dc-work--items a');
// let $workDates = document.querySelectorAll('.dc-work--year h2');

// $workLinks.forEach( ( $link, index ) => {
//   const is_external = $link.classList.contains('dc-external-link');
//   if( is_external ){
//     return;
//   }
//   $link.dataset.href = $link.href;
//   $link.href = '';
//   $link.addEventListener('click', (e) => {
//     e.preventDefault();
//     let $thisYear = $link.parentElement.parentElement.querySelector('h2');
//     let $others = [...$workLinks].filter( ($ele, eleIndex) => { return index !== eleIndex } ); 
//     $link.classList.add('transition-target');
//     //$sitenav.classList.add('out1');
//     $others.forEach( ( $other ) => { $other.classList.add('out1') });
//     $workDates.forEach( ( $other ) => { $other.classList.add('out1') });
//     $thisYear.classList.remove('out1');
//     if( $dcNow ){
//       $dcNow.classList.add('out1');
//     }
//     setTimeout(()=>{
//       window.location = $link.dataset.href;
//     }, 600 );
//   });
// });

const Large = function(){
  this.GFX = new GFX();
  this.project = new Project();
  this.menus = new Menus();
  this.loader = new Loader([
    'a[href^="/mmittee/related-matters/"]',
    'a[href^="/mmittee/focus-groups/"]'
  ]);


  this.setupMenus();
  this.setupLoader();
  this.initQuantisers(); 

  document.querySelectorAll( '.dc-list-hoverimg' )
    .forEach( ($hoverImg) => {
      HoverImg( $hoverImg );
   });
};

Large.prototype.setupMenus = function(){
  this.menus.onChange = ( id ) => {
    let p = id;
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

  window.addEventListener('popstate', ( event ) => {
    const state = history.state;
    console.log("HISTORY STATE: ", state );
    if( state.type === 'menu' ){
      this.historyActive = false;
      this.menus.showMenuById( state.id );
      this.historyActive = true;
    } else {
      this.loader.load( state.url, true );
    }
  });

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
}

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
    0.5 //speed
  );
}

Large.prototype.renderPage = function( data ){
  document.title = data.title;
  document.documentElement.setAttribute('data-dc-pagetype', data.pagetype );
  this.$mainContent.innerHTML = data.html;
  this.project.deactivate();
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
  this.GFX.activate();
  this.project.activate();
  this.quantise();
  window.addEventListener('resize', () => {
    this.quantise() 
  });
}
Large.prototype.deactivate = function(){
  this.GFX.deactivate();
  window.removeEventListener('resize', () => {
    this.quantise() 
  });
}

module.exports = new Large();