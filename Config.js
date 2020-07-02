const path = require('path');

const url_root = 'mmittee';
const public_root = path.join( __dirname, 'public' );

let Config = {
  dev:{
    local_port: 8080
  },
  debug: false,
  minify: true,
  minifyHTML: true,
  resizeImages: true, 
  url_root: url_root,
  paths: {
    public_root: public_root,
    public: path.join( public_root, url_root ),
    public_data: path.join( public_root, url_root, 'data' ),
    public_assets: path.join( public_root, url_root, 'assets' )
  },
  letterSeparator: ','
};

Config.log = () => {
  if( Config.debug ){
    console.log.apply(null, arguments )
  }
}

module.exports = Config;
