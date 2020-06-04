const $html = document.querySelector('html');

const Functions = {
  visibilityChangeCompat: function(){
    let hidden, visibilityChange; 
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {

      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }
    return {
      property: hidden,
      eventName: visibilityChange
    }
  },
  /* hover items in project page */
  loadSlideImage: function( $slide ){
    const $img = $slide.querySelector('img');
    if( $img && !$img.classList.contains('loaded') ){
      $img.addEventListener('load', () => {
        $img.classList.add('loaded');
      }, {once: true});
      $img.src = $img.getAttribute( 'data-src' );
    }
  },
  loadSlideImages: function( $slides ){
    $slides.forEach(( $m, mediaIndex ) => {
      Functions.loadSlideImage( $m );
    });
  },
  slashStart: ( str ) => {
    return str.startsWith( '/' ) ? str : '/' + str;
  },
  slashEnd: ( str ) => {
    return str.endsWith( '/' ) ? str : str + '/';
  },
  slashBoth: ( str ) => {
    let result = Functions.slashStart( str );
    result = Functions.slashEnd( result );
    return result;
  },
  loadPage: ( path ) => {
    let load = ( path.startsWith( '/' ) ) ? path : '/' + path;
    window.location.href = load;
  },
  getPageIndexFor: ( path ) => {
    path = Functions.slashBoth( path );  
  
    let index = window.DCSMALL.pages
      .findIndex( (item) => { 
        let url = Functions.slashBoth( item.url );        
        return url === path;  
      });

    return index;
  },
  isHome: () => {
    return $html.getAttribute('data-dc-pagetype') === 'home';
  }
}

module.exports = Functions;