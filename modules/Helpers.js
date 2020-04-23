const createSlug = ( name ) => {
  return name.toLowerCase().replace( /[^\w\d]/g, '-' );
}

module.exports = {
  createSlug
};