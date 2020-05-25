const CFG = require('./Config.js' );
const F = require( './Functions.js' );

const VisualQuantiser = require( './VisualQuantiser.js' );
const ScrollQuantiser = require( './ScrollQuantiser.js' );

const INIT_PAGETYPE = document.querySelector('html').getAttribute('data-dc-pagetype');
let prev_pagetype = INIT_PAGETYPE;

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

let $mediaNavMain = document.querySelectorAll('.dc-media__main .dc-media--nav li:not(.dc-media--link)');
let $mediaListMain = document.querySelectorAll('.dc-media__main .dc-media--list li');

let $mediaPlay = document.querySelectorAll('.dc-media__main .dc-media--nav .dc-media--play');

const activateSlide = function( $n, index ){
  if( $n.classList.contains('dc-media--play')){
    return false;
  }
  /* remove active state from all nav elements */
  $mediaNavMain.forEach(($n) => {
    $n.classList.remove('active');  
  })
  /* set the one hovered to active */
  $n.classList.add('active');
  /* loop over all related media items */
  $mediaListMain.forEach(( $m, mediaIndex ) => {
    const $video = $m.querySelector('video');
    const $img = $m.querySelector('img');
    if( mediaIndex !== index ){
      /* if they don't share an index, deactivate them */
      $m.classList.remove('active');
      if( $video ){
        $video.pause();
      }
    } else {
      /* this should be the one that is linked to the hovered item */        
      F.loadSlideImage( $m );
      if( $video && $video.muted ){
        $video.play();
      }
      $m.classList.add('active');
    }
  });
}

$mediaListMain.forEach( ( $m, index ) => {
  if( $m.classList.contains('info') ){ return; }
  $m.addEventListener('click', () => {
    let nextIndex = ( index + 1 < $mediaNavMain.length ) ? index + 1 : 0;
    activateSlide( $mediaNavMain[nextIndex], nextIndex );
  });
});

$mediaNavMain.forEach(( $n, index ) => {
  $n.addEventListener( 'mouseover', () => {
    activateSlide( $n, index );
  });
  if( $n.classList.contains('dc-media--play') ){
    let isPlaying = false;
    $n.addEventListener('click', (e) => { 
      let $audio = $mediaList[index].querySelector('audio');
      if( isPlaying === false ){
        isPlaying = true;
        $n.classList.add('playing');
        $audio.play();
      } else {
        isPlaying = false;
        $n.classList.remove('playing');
        $audio.pause();
      }
    });
  }
});

/* hover items in CV & dissemination */
let $hoverImages = document.querySelectorAll( '.dc-list-hoverimg' );
$hoverImages.forEach( ( $hoverImg ) => {
  $hoverImg.addEventListener( 'mouseover', ( e ) => {
    let $img = $hoverImg.querySelector('img');
    $img.addEventListener('load', () => {
      $img.classList.add('loaded');
    }, {once: true});
    $img.src = $img.getAttribute( 'data-src' );
  });
});

/* top menu 'dropdowns' */
let $sitenavDropdownLinks = document.querySelectorAll('.dc-sitenav a');
let $sitenavDropdowns = document.querySelectorAll('.dc-navigation-item, .dc-info');

$sitenavDropdownLinks.forEach( ($link ) => {
  $link.addEventListener('click', (e) => {
    e.preventDefault();
    let target = $link.getAttribute('data-dc-localtarget');
    let $menu = document.querySelector( target );
    let deactivate = false;
    let pagetype = $menu.getAttribute('data-pagetype');
    let id = $menu.id;    
    let page = (target === '#related-matters') ? '' : target.replace('#','');
    // clear data-dc-homeactive attribute used to show correct menu on load
    document.querySelector('html').setAttribute('data-dc-homeactive', '');

    history.replaceState(null,null,'/mmittee/' + page );

    if( $link.classList.contains('active') ){
      deactivate = true;
      return false;
    }
    $link.classList.add( 'active' );
    $sitenavDropdownLinks.forEach( ( $dropdownLink ) => {
      $dropdownLink.classList.remove( 'active' );
    });
    $sitenavDropdowns.forEach( ( $dropdown ) => {
      $dropdown.style.display = 'none';
    });
    if( deactivate && INIT_PAGETYPE !== 'home') {
      document.querySelector('html').setAttribute('data-dc-pagetype', INIT_PAGETYPE );      
    } else {
      document.querySelector('html').setAttribute('data-dc-pagetype', pagetype );
      $link.classList.add( 'active' );
      $menu.style.display = 'block';
      //run the 'visual quantiser' 
      if( vcList[ id ] ){
        vcList[ id ].run();
      }
      if( id === 'info' ){
        cvScroller.recalculate();
      }
    }
    return false;
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

let vcList = {
  'related-matters': VisualQuantiser( 
    document.querySelector('#related-matters ol'),
    document.querySelectorAll('#related-matters ol li'),
    document.querySelector('#related-matters .dc-biglist--now')
  ),
  'focus-groups': VisualQuantiser( 
    document.querySelector('#focus-groups ol'),
    document.querySelectorAll('#focus-groups ol li'),
    document.querySelector('#focus-groups .dc-biglist--now')
  ),
  'dissemination': VisualQuantiser(
    document.querySelector('#dissemination ol'),
    document.querySelectorAll('#dissemination ol li'),
    document.querySelector('#dissemination .dc-biglist--now')
  )
};

let cvScroller = new ScrollQuantiser( 
  document.querySelector('#info .dc-cv'), 
  document.querySelector('#info .dc-cv--entry'),
  0.5 //speed
);


const Large = function(){
  console.log('new Large()');  
};

Large.prototype.quantise = function(){
  for( i in vcList ){
    vcList[i].run();
  }
  cvScroller.recalculate();
}

Large.prototype.loadImages = function(){
  F.loadSlideImages( $mediaListMain ); 
}

Large.prototype.activate = function(){
  this.loadImages();
  this.quantise();
  window.addEventListener('resize', () => {
    this.quantise() 
  });
}
Large.prototype.deactivate = function(){
  window.removeEventListener('resize', quantise );
}

module.exports = new Large();