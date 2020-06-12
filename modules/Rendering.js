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

  pageData.prev = (index - 1 >= 0 ) ? partnerPages[index-1] : partnerPages[ partnerPages.length + (index-1) ];
  pageData.prev_prev = (index - 2 >= 0 ) ? partnerPages[index-2] : partnerPages[ partnerPages.length + (index-2) ]
  pageData.next = (index + 1 < partnerPages.length ) ? partnerPages[index+1] : partnerPages[ (index+1) - partnerPages.length ];
  pageData.next_next = (index + 2 < partnerPages.length ) ? partnerPages[index+2] : partnerPages[ (index+2) - partnerPages.length ];

  const p = path.join( Config.paths.public, pageData.url );  
  const fragP = path.join( p, 'fragment' );  
  moveSlideshowContent( pageData.data.slideshows );

  const rendered_project = Templates.page( pageData );
  
  let render = {
    title: pageData.name,
    pagetype: pageData.pagetype,
    navigation: rendered.navigation,
    content: rendered_project,
    info: rendered.info,
    small_site: rendered.small_site
  };
  
  fs.mkdirSync( fragP, {recursive: true });
  
  /* write data/html for JS loading */
  fs.writeFileSync( 
    path.join( fragP, 'index.json'), 
    JSON.stringify({
      title: pageData.name,
      pagetype: pageData.pagetype,
      html: rendered_project 
    })
  );

  /* write html for initial loading */
  fs.writeFileSync( path.join( p, 'index.html' ), Templates.main( render ) );
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