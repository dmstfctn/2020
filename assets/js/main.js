const BREAKPOINT = 640;
let $body = document.body;

/* list page links transition */
// let $sitenav = document.querySelector( '.dc-sitenav' );
// let $dcNow = document.querySelector( '.dc-now' );
// let $workLinks = document.querySelectorAll('.dc-work--items a');
// let $workDates = document.querySelectorAll('.dc-work--year h2');

// $workLinks.forEach( ( $link, index ) => {
//   $link.dataset.href = $link.href;
//   $link.href = '';
//   $link.addEventListener('click', (e) => {
//     e.preventDefault();
//     let $thisYear = $link.parentElement.parentElement.querySelector('h2');
//     let $others = [...$workLinks].filter( ($ele, eleIndex) => { return index !== eleIndex } ); 
//     $sitenav.classList.add('out1');
//     $others.forEach( ( $other ) => { $other.classList.add('out1') });
//     $workDates.forEach( ( $other ) => { $other.classList.add('out1') });
//     $thisYear.classList.remove('out1');
//     $dcNow.classList.add('out1');
//     setTimeout(()=>{
//       window.location = $link.dataset.href;
//     }, 600 );
//   });
// })


/* hover items in project page */
let $mediaNav = document.querySelectorAll('.dc-media--nav li:not(.dc-media--link)');
let $mediaList = document.querySelectorAll('.dc-media--list li');

let $mediaPlay = document.querySelectorAll('.dc-media--nav .dc-media--play');

$mediaNav.forEach(( $n, index ) => {
  $n.addEventListener( 'mouseover', () => {
    if( $n.classList.contains('dc-media--play')){
      return false;
    }
    /* remove active state from all nav elements */
    $mediaNav.forEach(($n) => {
      $n.classList.remove('active');  
    })
    /* set the one hovered to active */
    $n.classList.add('active');
    /* loop over all related media items */
    $mediaList.forEach(( $m, mediaIndex ) => {
      if( mediaIndex !== index ){
        /* if they don't share an index, deactivate them */
        $m.classList.remove('active');
      } else {
        /* this should be the one that is linked to the hovered item */
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

/* info/cv page */
let unquantisedScroll = 0;
let $cv = document.querySelector('.dc-cv');
let $bio = document.querySelector('.dc-bio');

if( $cv ){
  let $quantisedScroller = $cv;
  let $quantisedScrollable = $quantisedScroller.querySelector(':first-child');
  $quantisedScroller.classList.add( 'quantisedScroller' );
  let $lineheightGiver = document.querySelector('.dc-cv--entry');

  $quantisedScroller.addEventListener('wheel', (e) => {
   onScroll( e.deltaY );
  });

  let $cursor = document.querySelector('.dc-cursor');

  $quantisedScroller.addEventListener('mouseover', () => {
    $body.classList.add('dc-cursor--active');
  });
  $quantisedScroller.addEventListener('mouseout', () => {
    $body.classList.remove('dc-cursor--active');
  });

  window.addEventListener('mousemove', ( e )=>{
    let lineH = $lineheightGiver.offsetHeight;
    //console.log( e );
  // let x = (Math.floor(e.x / 40) * 40) + 20;
    let x = e.x;
    let y = (Math.floor(e.y / lineH) * lineH) + (lineH/2);
    $cursor.style.transform = `translateX(${x}px) translateY(${y}px)`;
  });

  let setQuantisedHeight = function(){
    let lineH = $lineheightGiver.getBoundingClientRect().height;
    let unquantisedHeight = window.innerHeight - $bio.offsetHeight - $sitenav.offsetHeight;    
    let quantisedHeight = Math.floor( (unquantisedHeight - lineH )/ Math.floor(lineH) ) * Math.round(lineH);
    $quantisedScroller.style.height = quantisedHeight;
  }
  
  let onScroll = function( deltaY ){
    let lineH = $lineheightGiver.getBoundingClientRect().height;
    let unquantisedHeight = window.innerHeight - $bio.offsetHeight - $sitenav.offsetHeight;    
    let quantisedHeight = Math.floor( (unquantisedHeight - lineH )/ Math.floor(lineH) ) * Math.round(lineH);
    $quantisedScroller.style.height = quantisedHeight;
    unquantisedScroll += deltaY;    
    if( unquantisedScroll < 0 ){
      unquantisedScroll = 0;
    }
    if( unquantisedScroll > $quantisedScrollable.offsetHeight - window.innerHeight ){
      unquantisedScroll = $quantisedScrollable.offsetHeight - window.innerHeight;
    }    
    let scrollQuantised = Math.floor(unquantisedScroll / lineH) * lineH;
    $quantisedScrollable.style.transform = 'translateY('+ -scrollQuantised +'px)'    
  }  

  setQuantisedHeight();
  onScroll( 0 );

}











let $worknav = document.querySelector('.dc-worknav');
let smallScrNav = function(){
  console.log( '$mediaNav.length', $mediaNav.length );
  for( let index = 0; index < $mediaList.length; index++ ){
    let $m = $mediaList[index];
    if( $m.classList.contains('active') ){
      $m.classList.remove('active');
      if( index + 1 < $mediaList.length ){
        console.log('go to the next media');
        $mediaList[index+1].classList.add('active');
        break;
      } else {
        console.log('go to the next page');
        window.location.href = $worknav.querySelector('a:last-child').href;
      }
    }
  }
}
document.body.addEventListener('pointerdown', ( e ) => {
  console.log( 'pointerdown', e );
  if( window.innerWidth < BREAKPOINT ){
    smallScrNav();
  }
});