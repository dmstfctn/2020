const createSlug = ( name ) => {
  return name.toLowerCase()
          .replace( /[^\w\d]/g, '-' )
          .replace( /-+/g, '-' )
          .replace( /^-|-$/, '' );
}

module.exports = {
  createSlug
};