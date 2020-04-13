const path = require('path');

let Config = {
  debug: false,
  minify: true, 
  paths: {
    public: path.join( __dirname, 'public' ),
    public_data: path.join( __dirname, 'public', 'data' ),
    public_assets: path.join( __dirname, 'public', 'assets' )
  }  
};

Config.log = () => {
  if( Config.debug ){
    console.log.apply(null, arguments )
  }
}

module.exports = Config;
