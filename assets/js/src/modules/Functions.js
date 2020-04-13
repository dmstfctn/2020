const Functions = {
  /* hover items in project page */
  loadSlideImage: function( $slide ){
    const $img = $slide.querySelector('img');
    if( $img ){
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
  trailingSlash: ( on ) => {
    return on.endsWith( '/' ) ? on : on + '/';
  },
  loadPage: ( path ) => {
    let load = ( path.startsWith( '/' ) ) ? path : '/' + path;
    window.location.href = load;
  },
  getPageIndexFor: ( path ) => {
    if( !path.endsWith( '/' ) ){ path += '/'; }
    if( !path.startsWith( '/' ) ){ path = '/' + path; }
    let index = window.DCSMALL.pages
      .findIndex( (item) => { 
        let url = item.url;
        if( !url.endsWith('/') ){ url += '/';}
        if( !url.startsWith( '/' ) ){ url = '/' + url; }
        return url === path;  
      });
    return index;
  }
}

module.exports = Functions;