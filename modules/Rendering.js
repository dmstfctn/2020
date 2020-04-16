const fs = require('fs-extra');
const path = require('path');

const Jimp = require('jimp');

const Config = require('../Config.js');

const Templates = require('./Templating.js')();

const createLowResAndSave = (imagePath, savePath) => { 
  if( !Config.resizeImages ){
    fs.copyFileSync( imagePath, savePath );
    return;
  } 
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

const moveSlideshowContent = ( slideshows ) => {
  for( let name in slideshows){
    let slideshow = slideshows[ name ];
    slideshow.slides.forEach( (slide) => {
      if( slide.type === 'image' || slide.type === 'video' || slide.type === 'audio' ){
        /* endure the destination exists */
        fs.mkdirSync( path.dirname(slide.content.newPath), {recursive: true} );
        /* copy the file */
        fs.copyFileSync( slide.content.originalPath, slide.content.newPath );
        if( slide.type === 'image' ){         
          createLowResAndSave( slide.content.originalPath, slide.content.lowPath );          
        }        
      }
    });
  }
};

const renderPage = ( pageData, index, partnerPages, rendered ) => {
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
  moveSlideshowContent( pageData.data.slideshows );

  let rendered_project = Templates.page( pageData );
  let filePath = path.join( p, 'index.html' );
  
  let render = {
    title: pageData.name,
    pagetype: pageData.pagetype,
    navigation: rendered.navigation,
    content: rendered_project,
    info: rendered.info,
    small_site: rendered.small_site
  };
  fs.mkdirSync( p, {recursive: true});
  fs.writeFileSync( filePath, Templates.main( render ) );
};

const moveCvContent = ( cv ) => {  
  const cvContentDestination = path.join( Config.paths.public, 'info', 'content' );
  const newSrcPath = path.join( 'info', 'content' );
  /* ensure the destination exists */
  fs.mkdirSync( cvContentDestination, {recursive: true} );
  cv.forEach( ( year ) => {
    for( let i in year.contents ){
      let type = year.contents[i];
      for( j in type.contents ){
        let entry = type.contents[j];
        if( !entry.image ){          
          continue;
        }

        fs.copyFileSync( entry.image.originalPath, entry.image.newPath );
        createLowResAndSave( entry.image.originalPath, entry.image.lowPath );
      }
    }
  });
}

const renderInfo = ( data ) => {
  moveCvContent( data.contents.cv );
  return Templates.info( data );
}

const renderSmall = ( small ) => {
 moveSlideshowContent( small.showreel.slideshows )
  return Templates.small({
    json: JSON.stringify( {pages:small.pages} ),
    showreel: small.showreel
  });
}

module.exports = {
  renderPage,
  renderInfo,
  renderSmall
}