const PopOutWindow = function( title, contents, _config ){
  this.config = this.configure( _config );
  this.title = title;  
  this.html = this.createHTML( title, contents );
  this.url = this.createURL( this.html );
};

PopOutWindow.prototype = {
  configure: function( userConfig ){
    const defaultConfig = {
      width: 640,
      height: 480
    };
    let config = {};
    for( let prop in defaultConfig ){
      config[prop] = userConfig[prop] || defaultConfig[prop]
    }
    return config;
  },
  open: function(){
    const w = Math.round(this.config.width);
    const h = Math.round(this.config.height);
    const x = Math.round( (window.screen.availWidth - w) / 2 );
    const y = Math.round( (window.screen.availHeight - h) / 2 );
    //console.log('OPEN WINDOW WITH THIS CFG');
    // console.log(
    //   this.url,
    //   this.title,      
    //   `width=${w},height=${h},screenX=${x},screenY=${y}`
    // );
    this.window = window.open(       
      this.url,
      this.title,      
      `width=${w},height=${h},screenX=${x},screenY=${y}`
    );
  },
  close: function(){
    this.window.close();    
  },
  destroy: function(){
    this.close();
    URL.revokeObjectURL( this.url );
  },
  createURL: function( html ){
    //console.log( 'createURL', html );
    return URL.createObjectURL(
      new Blob( [this.html], { type: "text/html" } )
    );
  },
  createHTML: function( title, contents ){
    return `<!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            html, body, iframe{
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background: #000000;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          ${contents}
        </body>
      </html>
    `;
  }
};

module.exports = PopOutWindow;