const fs = require('fs-extra');
const path = require('path');

const Config = require('../Config.js');

const Templates = require('./Templating.js')();

const moveSlideshowContent = ( pagePath, pageData ) => {
  for( let name in pageData.data.slideshows){
    let slideshow = pageData.data.slideshows[ name ];
    slideshow.slides.forEach( (slide) => {
      if( slide.type === 'image' || slide.type === 'video' || slide.type === 'audio' ){
        let originalFilePath = slide.content;
        let filename = path.basename( slide.content );
        let newDirPath = path.join( pagePath, 'images', name ); 
        let newFilePath = path.join( newDirPath, filename );
        let newSrcAttr = path.join( 'images', name, filename );
        /* ensure the new path exists */
        fs.mkdirSync( newDirPath, {recursive: true} );
        /* copy the file */
        fs.copyFileSync( originalFilePath, newFilePath );
        /* update the 'content' -> this becomes the src of the img/audio/video element*/
        slide.content = newSrcAttr;
      }
    });
  }
};

const renderPage = ( pageData, index, partnerPages, rendered_navigation ) => {
  if( pageData.is_external ){
    return false;
  }
  pageData.prev = partnerPages[index-1];
  pageData.next = partnerPages[index+1];
  if( index < 1 ){
    pageData.prev = partnerPages[ partnerPages.length - 1 ];
  }
  if( index >= partnerPages.length - 1 ){
    pageData.next = partnerPages[0];
  }
  let p = path.join( Config.paths.public, pageData.url );  
  moveSlideshowContent( p, pageData );

  let rendered_project = Templates.page( pageData );
  let filePath = path.join( p, 'index.html' );
  
  let render = {
    title: pageData.name,
    pagetype: pageData.pagetype,
    navigation: rendered_navigation,
    content: rendered_project
  };
  fs.mkdirSync( p, {recursive: true});
  fs.writeFileSync( filePath, Templates.main( render ) );
};

module.exports = {
  renderPage
}