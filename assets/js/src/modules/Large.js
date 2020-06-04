const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const GFX = require( './GFX.js' );

const Menus = require( './Menus.js' );
const Project = require( './Project.js' );
const HoverImg = require( './HoverImg.js' );

const VisualQuantiser = require( './VisualQuantiser.js' );
const ScrollQuantiser = require( './ScrollQuantiser.js' );

/* list page links transition */
let $sitenav = document.querySelector( '.dc-sitenav' );
let $dcNow = document.querySelector( '.dc-biglist--now' );
let $workLinks = document.querySelectorAll('.dc-work--items a');
let $workDates = document.querySelectorAll('.dc-work--year h2');

$workLinks.forEach( ( $link, index ) => {
  const is_external = $link.classList.contains('dc-external-link');
  if( is_external ){
    return;
  }
  $link.dataset.href = $link.href;
  $link.href = '';
  $link.addEventListener('click', (e) => {
    e.preventDefault();
    let $thisYear = $link.parentElement.parentElement.querySelector('h2');
    let $others = [...$workLinks].filter( ($ele, eleIndex) => { return index !== eleIndex } ); 
    $link.classList.add('transition-target');
    //$sitenav.classList.add('out1');
    $others.forEach( ( $other ) => { $other.classList.add('out1') });
    $workDates.forEach( ( $other ) => { $other.classList.add('out1') });
    $thisYear.classList.remove('out1');
    if( $dcNow ){
      $dcNow.classList.add('out1');
    }
    setTimeout(()=>{
      window.location = $link.dataset.href;
    }, 600 );
  });
});

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
  document.querySelectorAll( '.dc-list-hoverimg' )
    .forEach( ($hoverImg) => {
      HoverImg( $hoverImg );
   });

  this.initQuantisers(); 
  
  this.menus.onChange = ( id ) => {
    if( id === 'related-matters' ){ id = ''; }
    history.replaceState(null,null,'/mmittee/' + id );
    //run the 'visual quantiser' 
    if( this.vcList[ id ] ){
      this.vcList[ id ].run();
    }
    if( id === 'info' ){
      this.cvScroller.recalculate();
    }
  }
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
  for( i in this.vcList ){
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