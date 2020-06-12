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

/*next/prev work links in project page*/
const $nextprevLinks = document.querySelectorAll('.dc-worknav a');
let furtherProjectTimeout;

$nextprevLinks.forEach( ($link) => {
  $link.addEventListener('click', ( e ) => {
    if( $link.classList.contains('dc-external-link') ){
      const next = $link.classList.contains('dc-worknav--link__next');
      const prev = $link.classList.contains('dc-worknav--link__prev');
      clearTimeout(furtherProjectTimeout);
      if( next ){
        furtherProjectTimeout = setTimeout(function(){
          const $nextNext = document.querySelector('.dc-worknav a.dc-worknav--link__next-next');
          window.location.href = $nextNext.getAttribute('href');
        }, 200 );
        return;
      }
      if( prev ){
        furtherProjectTimeout = setTimeout(function(){
          const $prevPrev = document.querySelector('.dc-worknav a.dc-worknav--link__prev-prev');
          window.location.href = $prevPrev.getAttribute('href');
        }, 200 );
        return;
      }
    }
  });
  
});

const Large = function(){
  this.GFX = new GFX();
  this.menus = new Menus();
  this.project = new Project();

  console.log('LARGE: PROJECT: ', this.project );

  this.loader = new Loader([
    'a[href^="/mmittee/related-matters/"]',
    'a[href^="/mmittee/focus-groups/"]'
  ]);
  this.$mainContent = document.querySelector('.dc-main-content');
  
  this.historyActive = true;

  this.loader.onLoad = ( data, url, disableHistory  ) => {
    if( !disableHistory && this.historyActive ){
      console.log('history.pushState(', 'TYPE: page' )
      history.pushState(
        {
          type: 'page', 
          url: F.slashEnd( url ) 
        }, 
        null, 
        F.slashEnd( url ) 
      );
    }

    document.title = data.title;
    document.documentElement.setAttribute('data-dc-pagetype', data.pagetype );
    this.$mainContent.innerHTML = data.html;
    this.project.deactivate();
    this.project = new Project();
    this.project.activate();
    this.loader.initEvents( this.$mainContent );    
    this.menus.hideMenus();
  };
    
  document.querySelectorAll( '.dc-list-hoverimg' )
    .forEach( ($hoverImg) => {
      HoverImg( $hoverImg );
   });

  this.initQuantisers(); 
  
  this.menus.onChange = ( id ) => {
    let p = id;
    if( id === 'related-matters' ){ p = ''; }
    console.log('history.pushState(', 'TYPE: menu' )
    if( this.historyActive ){
      history.pushState(
        {
          type: 'menu', 
          url: '/mmittee/' + p, 
          id: id, 
          path: p 
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
    0.5 //speed
  );
}

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