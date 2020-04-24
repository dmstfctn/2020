const Functions = {
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
  }
}

module.exports = Functions;