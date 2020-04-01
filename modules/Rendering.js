const fs = require('fs-extra');
const path = require('path');

const Jimp = require('jimp');

const Config = require('../Config.js');

const Templates = require('./Templating.js')();

const createLowResAndSave = (imagePath, savePath) => {  
  Jimp.read( imagePath).then( img => {
    img
      .scaleToFit(100,100)
      //.blur( 1 )
      //.resize( 200, Jimp.AUTO ) //alt
      .write( savePath );

  })
  .catch( err => {
    Config.log( 'Error Loading Image in CreateLowResAndSave() in Rendering.js ', err );
  })
};

const moveSlideshowContent = ( pagePath, pageData ) => {
  const subdirName = 'content';
  for( let name in pageData.data.slideshows){
    let slideshow = pageData.data.slideshows[ name ];
    slideshow.slides.forEach( (slide) => {
      if( slide.type === 'image' || slide.type === 'video' || slide.type === 'audio' ){
        const originalFilePath = slide.content;
        const filename = path.basename( slide.content );
        const newDirPath = path.join( pagePath, subdirName, name ); 
        const newFilePath = path.join( newDirPath, filename );
        const newSrcAttr = path.join( subdirName, name, filename );
        /* ensure the new path exists */
        fs.mkdirSync( newDirPath, {recursive: true} );
        /* copy the file */
        fs.copyFileSync( originalFilePath, newFilePath );
        /* update the 'content' -> this becomes the src of the img/audio/video element*/
        slide.content = newSrcAttr;
        if( slide.type === 'image' ){
          const lowResFilename = 'tiny.' + filename;
          const lowResPath = path.join( newDirPath, lowResFilename );
          const lowResSrcAttr = path.join( subdirName, name, lowResFilename )
          createLowResAndSave( originalFilePath, lowResPath );
          slide.lowRes = lowResSrcAttr;
          slide.isImage = true;
        }        
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