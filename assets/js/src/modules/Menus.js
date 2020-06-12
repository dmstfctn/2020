const Menus = function(){
  this.INIT_PAGETYPE = document.querySelector('html').getAttribute('data-dc-pagetype');
  this.$links = document.querySelectorAll('.dc-sitenav__main a');
  this.$dropdowns = document.querySelectorAll('.dc-navigation-item, .dc-info');
  this.$links.forEach( ( $link ) => {
    this.setupLink( $link );
  });
}

Menus.prototype = {
  onChange: function( id ){ /* ... override ... */ },
  _onChange: function( id ){
    this.onChange( id );
  },
  showMenuById: function( id ){
    const $link = document.querySelector('.dc-sitenav__main [data-dc-localtarget="#' + id + '"]' );
    const $menu = document.querySelector( '#' + id );
    this.showMenu( $link, $menu );
  },
  showMenu: function( $link, $menu ){
    const pagetype = $menu.getAttribute('data-pagetype');
    const id = $menu.id;    
    this.hideMenus();

    $link.classList.add( 'active' );
    $menu.style.display = 'block';  

    // clear data-dc-homeactive attribute used to show correct menu on load
    document.querySelector('html').setAttribute('data-dc-homeactive', '');
    document.querySelector('html').setAttribute('data-dc-pagetype', pagetype );
    
    this._onChange( id );
  },
  hideMenus: function(){
    this.$links.forEach( ( $link ) => { $link.classList.remove( 'active' ); });
    this.$dropdowns.forEach( ( $dropdown ) => { $dropdown.style.display = 'none'; });
  },
  setupLink: function( $link ){
    $link.addEventListener('click', (e) => {
      e.preventDefault();
      let target = $link.getAttribute('data-dc-localtarget');
      let $menu = document.querySelector( target );          
      
      if( $link.classList.contains('active') ){ return false; }

      this.showMenu( $link, $menu );

      return false;
    });
  }
}

module.exports = Menus;