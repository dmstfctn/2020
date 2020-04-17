const path = require('path');

const url_root = 'mmittee';

let Config = {
  dev:{
    local_port: 8080
  },
  debug: false,
  minify: false,
  resizeImages: false, 
  url_root: url_root,
  paths: {
    public: path.join( __dirname, 'public', url_root ),
    public_data: path.join( __dirname, 'public', url_root, 'data' ),
    public_assets: path.join( __dirname, 'public', url_root, 'assets' )
  }  
};

Config.log = () => {
  if( Config.debug ){
    console.log.apply(null, arguments )
  }
}

module.exports = Config;
