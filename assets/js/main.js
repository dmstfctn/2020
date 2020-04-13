const BREAKPOINT = 900;
let $body = document.body;

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
    $sitenav.classList.add('out1');
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

/* hover items in project page */
const loadSlideImage = function( $slide ){
  const $img = $slide.querySelector('img');
  if( $img ){
    $img.addEventListener('load', () => {
      $img.classList.add('loaded');
    }, {once: true});
    $img.src = $img.getAttribute( 'data-src' );
  }
}
const loadSlideImages = function( $slides ){
  $slides.forEach(( $m, mediaIndex ) => {
    loadSlideImage( $m );
  });
}
let $mediaNavMain = document.querySelectorAll('.dc-media__main .dc-media--nav li:not(.dc-media--link)');
let $mediaListMain = document.querySelectorAll('.dc-media__main .dc-media--list li');

let $mediaPlay = document.querySelectorAll('.dc-media__main .dc-media--nav .dc-media--play');

$mediaNavMain.forEach(( $n, index ) => {
  $n.addEventListener( 'mouseover', () => {
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
        loadSlideImage( $m );
        if( $video && $video.muted ){
          $video.play();
        }
        $m.classList.add('active');
      }
    });
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
let $sitenavDropdownLinks = document.querySelectorAll('.dc-sitenav a[href^="#"]');
let $sitenavDropdowns = document.querySelectorAll('.dc-navigation-item');

$sitenavDropdownLinks.forEach( ($link ) => {
  $link.addEventListener('click', (e) => {
    e.preventDefault();
    let target = $link.getAttribute('href');
    let $menu = document.querySelector( target );
    let deactivate = false;
    let pagetype = $menu.getAttribute('data-pagetype');
    if( $link.classList.contains('active') ){
      deactivate = true;
    }
    $link.classList.add( 'active' );
    $sitenavDropdownLinks.forEach( ( $dropdownLink ) => {
      $dropdownLink.classList.remove( 'active' );
    });
    $sitenavDropdowns.forEach( ( $dropdown ) => {
      $dropdown.style.display = 'none';
    });
    if( !deactivate ){
      document.querySelector('html').setAttribute('data-dc-pagetype', pagetype );
      $link.classList.add( 'active' );
      $menu.style.display = 'block';
    } else {
      document.querySelector('html').setAttribute('data-dc-pagetype', INIT_PAGETYPE );
    }
  });
});


const mqPortrait = window.matchMedia( '(orientation: portrait)' );
const mqLandscape = window.matchMedia( '(orientation: landscape)' );
const mqSmall = window.matchMedia( `(max-width: ${BREAKPOINT}px)` );

let DC = {
  env: {
    size: 'large',
    orientation: 'landscape'
  }
};

const trailingSlash = ( on ) => {
  return on.endsWith( '/' ) ? on : on + '/';
}

const loadPage = ( path ) => {
  let load = ( path.startsWith( '/' ) ) ? path : '/' + path;
  window.location.href = load;
}

const getPageIndexFor = ( path ) => {
  if( !path.endsWith( '/' ) ){ path += '/'; }
  if( !path.startsWith( '/' ) ){ path = '/' + path; }
  let index = window.DCSMALL
    .findIndex( (item) => { 
      let url = item.url;
      if( !url.endsWith('/') ){ url += '/';}
      if( !url.startsWith( '/' ) ){ url = '/' + url; }
      return url === path;  
    });
  return index;
}


let dcSmall = {
  $ele: document.querySelector('.dc-mobile-nav'),
  slideIndex: 0,
  pageIndex: getPageIndexFor( window.location.pathname ),
  items: {
    portrait: [...document.querySelectorAll('.dc-item--info, .dc-media__portrait .dc-media--list li')],
    landscape: [...document.querySelectorAll('.dc-item--info, .dc-media__landscape .dc-media--list li')]
  },
  media: {
    portrait: document.querySelectorAll('.dc-media__portrait .dc-media--list li'),
    landscape: document.querySelectorAll('.dc-media__landscape .dc-media--list li')
  },
  showreelActive: (trailingSlash( document.referrer ) !== trailingSlash( window.location.origin ))
};



dcSmall.$ele.addEventListener( 'click', ( e ) => {
  let orientation = 'portrait';
  if( mqLandscape.matches ){
    orientation = 'landscape';
  }
  if( e.pageX >= window.innerWidth / 2 ){
    dcSmall.slideIndex++;
  } else {
    dcSmall.slideIndex--;
  }
  if( dcSmall.slideIndex < 0 ){
    dcSmall.slideIndex = 0;
  }
  if( dcSmall.slideIndex >= dcSmall.items[orientation].length - 1 ){
    let nextPageIndex = dcSmall.pageIndex + 1;
    if( window.DCSMALL[ nextPageIndex ] ){
      loadPage( window.DCSMALL[ nextPageIndex ].url );
    }
  }

  dcSmall.items.portrait
    .concat( dcSmall.items.landscape )
    .forEach( ( item ) => {
      item.classList.remove('active');
    });
  
  dcSmall.items.portrait[ dcSmall.slideIndex ].classList.add('active');
  dcSmall.items.landscape[ dcSmall.slideIndex ].classList.add('active');
  loadSlideImage( dcSmall.items.portrait[ dcSmall.slideIndex ] );
  loadSlideImage( dcSmall.items.landscape[ dcSmall.slideIndex ] );
});


/* image loading */
const mqHandler = function( mq ){
  if( mqLandscape.matches ){
    DC.env.orientation = 'landscape';
  }
  if( mqPortrait.matches ){
    DC.env.orientation = 'portrait';
  }
  if( mqSmall.matches ){
    DC.env.size = 'small';
  } else {
    DC.env.size = 'large';
  }
  if( mq.media === `(max-width: ${BREAKPOINT}px)` ){
    if( mq.matches ){
      loadSlideImages( dcSmall.media.portrait );
      loadSlideImages( dcSmall.media.landscape );
    } else {
      loadSlideImages( $mediaListMain );     
    }
  }
}

mqLandscape.addListener( mqHandler );
mqPortrait.addListener( mqHandler );
mqSmall.addListener( mqHandler );

mqHandler( mqSmall );

/*

load large images if large
  $mediaListMain.forEach(( $m, mediaIndex ) => {
    loadSlideImage( $m );
  });
*/