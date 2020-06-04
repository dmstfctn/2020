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
  showMenu: function( $link, $menu ){
    const pagetype = $menu.getAttribute('data-pagetype');
    const id = $menu.id;    
    this.$dropdowns.forEach( ( $dropdown ) => { $dropdown.style.display = 'none'; });
    this.$links.forEach( ( $link ) => { $link.classList.remove( 'active' ); });

    $link.classList.add( 'active' );
    $menu.style.display = 'block';  

    // clear data-dc-homeactive attribute used to show correct menu on load
    document.querySelector('html').setAttribute('data-dc-homeactive', '');
    document.querySelector('html').setAttribute('data-dc-pagetype', pagetype );
    
    this._onChange( id );
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