const fs = require('fs-extra');
const path = require('path');
const Config = require('../Config.js');

const createSlug = ( name ) => {
  return name.toLowerCase().replace( /[^\w\d]/g, '-' );
}

const createURLPath = ( name, section ) => {
  const slug = createSlug( name );  
  const section_slug = createSlug( section );
  let url = section_slug + '/' + slug;
  // if( url[0] !== '/' ){
  //   url = '/' + url;
  // }
  return url;
}

/*
  prepareFile( originalPath, destinationPath, src ):
      from a source path, e.g 'content/related matters/1.2019/1.ECHO FX/landscape/1.image.jpg' 
      and a destination path e.g. 'public/related-matters/echo-fx/content/landscape/'
      create: 
        {
          originalPath: 'content/related matters/1.2019/1.ECHO FX/landscape/1.image.jpg',
          newPath: 'public/related-matters/echo-fx/content/landscape/1.image.jpg',
          src: 'content/landscape/1.image.jpg'
        }
    */

const prepareFile = (  original, destinationPath, src ) => {
  const filename = path.basename( original );
  const prepared = {
    originalPath: original,
    newPath: path.join( destinationPath, filename ),
    src: path.join( src, filename ),
    processed: false
  };
  return prepared;
}

/* 
  prepareImage( originalPath, destinationPath, destinationSrc ):
      from a source path, e.g 'content/related matters/1.2019/1.ECHO FX/landscape/1.image.jpg' 
      and a destination path e.g. 'public/related-matters/echo-fx/content/landscape/'
      create: 
        {
          originalPath: 'content/related matters/1.2019/1.ECHO FX/landscape/1.image.jpg',
          newPath: 'public/related-matters/echo-fx/content/landscape/1.image.jpg',
          src: 'content/landscape/1.image.jpg',
          lowPath: 'public/related-matters/echo-fx/content/landscape/tiny.1.image.jpg',
          lowSrc: 'content/landscape/tiny.1.image.jpg'.
          isImage: true,
          processed: false /// set to true once file has been moved, sized, etc
        }
    */
const prepareImage = ( original, destinationPath, src ) => {
  if( typeof original === 'object' ){
    return original;
  }
  const filename = path.basename( original );
  const lowFilename = 'tiny.' + filename;
  const prepared = {
    originalPath: original,
    newPath: path.join( destinationPath, filename ),
    src: path.join( src, filename ),
    lowPath: path.join( destinationPath, lowFilename ),
    lowSrc: path.join( src, lowFilename ),
    isImage: true,
    processed: false
  };
  return prepared;
}

const prepareSlide = ( slide, pageName, slideshowName, section, addSectionToSrc ) => {
  const sectionToSrc = !!addSectionToSrc;
  const destinationPath = path.join( Config.paths.public, section, pageName, 'content', slideshowName );
  
  const src = ( sectionToSrc ) ? 
                path.join( section, 'content', slideshowName ) 
                : path.join( 'content', slideshowName );

  if( slide.type === 'image' ){    
    // move and resize
    slide.content = prepareImage( slide.content, destinationPath, src );
    return slide;
  }
  if( slide.type === 'video' || slide.type === 'audio' ){
    // just move
    slide.content = prepareFile( slide.content, destinationPath, src );
    return slide;
  }      

  return slide;
}

const slideshowNav = ( slideshow ) => {
  let labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  let nav = [];  
  for( let i = 0; i < slideshow.slides.length; i++ ){
    if( i === 0 ){
      nav.push( {
        left: { label: 'info', active: false}, 
        right: { label: labels[i], active: true} 
      } );
    } else if( i === slideshow.slides.length - 1 ){
      nav.push( {
        left: { label: labels[i], active: true}, 
        right: { label: 'end', active: false} 
      } );
    } else {
      if( i % 2 !== 0 ){
        nav.push( {
          left: { label: labels[i], active: true}, 
          right: { label: labels[i+1], active: false} 
        });
      } else {
        nav.push( {
          left: { label: labels[i-1], active: false}, 
          right: { label: labels[i], active: true} 
        });
      }
    }
  }
  return nav;
};

const prepareSlideshow = ( slideshow, pageName, slideshowName, section, addSectionToSrc  ) => {
  let nav = slideshowNav( slideshow );
  for( let i in slideshow.slides ){
    slideshow.slides[i] = prepareSlide( slideshow.slides[i], pageName, slideshowName, section, addSectionToSrc );
    slideshow.slides[i].nav = nav[i];
  }
  return slideshow;
}



const createRelatedMatters = ( related_matters, cv ) => {
  const section_name = 'related matters';
  const section_slug = createSlug('Related Matters');

  let list = [];
  let now = false;
  for( let i in related_matters.contents ){
    let item = related_matters.contents[i];
    let line = {
      name: item.name,
      contents: []
    };
    for( let j in item.contents ){
      let sub_item = item.contents[j];           
      for( slideshowName in sub_item.slideshows ){
        let slideshow = sub_item.slideshows[ slideshowName ];
        sub_item.slideshows[ slideshowName ] = prepareSlideshow( slideshow, createSlug(sub_item.name), createSlug(slideshowName), section_slug  );
      }
      line.contents.push({
        name: sub_item.name,
        date: item.name,
        pagetype: 'relatedmatter',        
        slug: createSlug( sub_item.name ),
        url: (sub_item.data.link) ? sub_item.data.link : createURLPath( sub_item.name, 'related matters' ),
        is_external: !!sub_item.data.link,
        data: sub_item
      });
    }
    list.push( line );
  }

  for( let i = 0; i < cv.entries.length; i++ ){
    if( cv.entries[i].now ){
      now = cv.entries[i];
      break;
    }    
  }

  return {
    name: section_name,
    slug: section_slug,
    template: 'list_work',
    pagetype: 'relatedmatter',
    contents: list,
    now: now
  };
}

const createFocusGroups = ( focus_groups ) => {
  const section_name = 'focus groups';
  const section_slug = createSlug('Focus Groups');

  let list = [];
  for( let i in focus_groups.contents ){
    let item = focus_groups.contents[i];
    for( let j in item.contents ){
      let sub_item = item.contents[j];
      for( slideshowName in sub_item.slideshows ){
        let slideshow = sub_item.slideshows[ slideshowName ];
        sub_item.slideshows[ slideshowName ] = prepareSlideshow( slideshow, createSlug(sub_item.name), createSlug(slideshowName), section_slug  );
      }
      let line = {
        name: item.name,
        contents: [
          {
            name: sub_item.name,
            date: item.name,
            pagetype: 'focusgroup',
            slug: createSlug( sub_item.name ),
            url: (sub_item.data.link) ? sub_item.data.link : createURLPath( sub_item.name, 'focus groups' ),
            is_external: !!sub_item.data.link,
            data: sub_item
          }
        ]
      };
      list.push( line );
    }
  }
  return {
    name: section_name,
    slug: section_slug,
    pagetype: 'focusgroup',
    template: 'list_work',
    contents: list
  };
};

const createDissemination = ( dissemination ) => {
  const section_name = 'dissemination';
  const section_slug =  createSlug( 'Dissemination' );
  const destinationPath = path.join( Config.paths.public, 'info', 'content' );
  const src = path.join( 'info', 'content' );
  for( let i in dissemination ){    
    dissemination[i].image = prepareImage( dissemination[i].image, destinationPath, src );    
  }
  let list = [];  
  return {
    name: section_name,
    slug: section_slug,
    template: 'list_dissemination',
    pagetype: 'dissemination',
    contents: dissemination
  }
};

const structureCV = ( cv ) => {
  /* paths / src for moving images */
  const destinationPath = path.join( Config.paths.public, 'info', 'content' );
  const src =  path.join( 'info', 'content' );

  let structure = [];
  const years = cv.entries
    .map( e => e.year )
    .filter( (year, index, self ) => {
      return self.indexOf(year) === index;
    })
    .sort( (y1, y2) => {
      //order descending
      return parseInt( y2 ) - parseInt( y1 );
    });
  
  years.forEach( ( year ) => {
    const entries = cv.entries.filter( e => e.year === year );
    let contents = {};    
    entries.forEach( (entry) => {      
      if( !contents[entry.type] ){
        contents[entry.type] = {
          type: entry.type,
          contents: []
        };
      }
      if( !!entry.image ){
        entry.image = prepareImage( entry.image, destinationPath, src );    
      }
      contents[entry.type].contents.push( entry );
    });
    structure.push({
      'year': year,
      'contents': contents
    });
  });

  return structure;
}

const createInfo = ( bio, cv ) => {
  const section_name = 'info';
  const section_slug = createSlug( 'Info' );

  return {
    name: section_name,
    slug: section_slug,
    template: 'list_info',
    url: createURLPath( 'Info', '' ),
    contents: {
      bio: bio,
      cv: structureCV( cv )
    }
  };
}

const createPageList = ( from ) => {  
  return from.map( (e) => {
    return e.contents;
  })
  .flat()
  .filter( (p) => {
    return !p.is_external;
  })
  .reverse();
}

const yearNameToNumeric = ( name )=>{
  return name.match( /([0-9]+)/g )
    .map( ( y ) => {
      if( y.length < 4 ){ return parseInt( '20' + y ); }
      return parseInt( y );
    })
    .sort( ( a, b ) => {
      return a - b; // pick lowest - i.e. start year
    })[0];
};

const prepareShowreel = ( showreel ) => {
  for( let i in showreel.slideshows ){
    let orientation = i;
    showreel.slideshows[i] = prepareSlideshow( showreel.slideshows[i], '', orientation, 'showreel', true );
  }
  return showreel;
}

const createSmallSite = ( content ) => {
  let site = {
    pages: [],
    showreel: prepareShowreel( content.showreel )
  };
  for( let i in content.related_matters.contents ){
    let year = content.related_matters.contents[i];
    let yearNumeric = yearNameToNumeric( year.name );
     
    for( let j in year.contents ){
      let item = year.contents[j];
      if( !item.data.link ){
        site.pages.push({
          year: yearNumeric,
          url: Config.url_root + '/' + createURLPath( item.name, 'related matters' ),
          //data: item
        });
      }
    }
  }
  for( let i in  content.focus_groups.contents ){
    let year = content.focus_groups.contents[i];
    let yearNumeric = yearNameToNumeric( year.name );

    for( let j in year.contents ){
      let item = year.contents[j];
      if( !item.data.link ){
        site.pages.push({
          year: yearNumeric,
          url: Config.url_root + '/' + createURLPath( item.name, 'focus groups' ),
          //data: item
        });
      }
    }
  }
  site.pages = site.pages.sort( (a, b) => b.year - a.year );
  return site;
};

module.exports = {
  createRelatedMatters, 
  createFocusGroups, 
  createDissemination,
  createInfo,
  createPageList,
  createSmallSite
};