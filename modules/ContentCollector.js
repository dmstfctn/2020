const path = require('path')
const fs = require('fs');

const Config = require( '../Config.js' );
const H = require('./Helpers.js');

const YAML = require('yaml');

const cheerio = require('cheerio');
const frontmatter = require('@github-docs/frontmatter')
const markdown = require( 'markdown-it' )( 'commonmark', {
  html: true,
  breaks: true,
  linkify: true
});

const removeDotFiles = ( f ) => {
  return f.indexOf('.') !== 0;
};
const readJSON = ( path ) => {
  let json = false; 
  try{
    json = fs.readFileSync( path ) 
    json = JSON.parse( json );
  } catch ( e ){
    if( e.errno === -2 ){
      Config.log( 'No json present at ', path );
    } else {
      Config.log( e );
    }
  }
  return json;
}; 

const readYAML = ( path ) => {
  let yaml = false; 
  try{
    yaml = fs.readFileSync( path )   
    yaml = YAML.parse( yaml.toString() );
  } catch ( e ){
    if( e.errno === -2 ){
      Config.log( 'No yaml present at ', path );
    } else {
      Config.log( e );
    }
  }
  return yaml;
}; 

const removeOrderFromFilename = ( filename ) => {
  return filename.replace(/(^[0-9]+\.)/gm, '' );
};

const getProjectCvItems = ( title, cv ) => {
  const slug = H.createSlug( title );
  let relatedCv = cv.entries.filter( function( entry ){
    if( Array.isArray( entry.related ) ){
      for( let i = 0; i < entry.related.length; i++ ){
        if( H.createSlug( entry.related[i] ) === slug ){
          return true;
        }
      }
    } else if( typeof entry.related === 'string' ){
      if( H.createSlug( entry.related ) === slug ){
        return true;
      }
    }
    return false;
  });
  return relatedCv;
}
/* 
  constructSlide( filename, p, captions )
  ------------------
  filename: the name of the file
  p:        the path to the file
  captions: an object containing captions, indexed by filename
  
  e.g:
    H.constructSlide( 
      "a.jpg", 
      "root/folder/", 
      { 
        "a.jpg": "a caption", 
        "b.jpg": "another caption" 
      }
    );

  loads content for text slides, constructs paths for media slides
  returns an object defining the slide:

  {
    caption:  String | false,
    type:     String            "text", "embed", "audio", "video", "image",
    content:  String            either path to file, or html embed/from markdown
  }

*/
const constructSlide = ( filename, p, captions, alts ) => {
  let filePath = path.join( p, filename );
  let ext = path.extname( filename );
  let caption = captions[ filename ] || false;
  let alt = alts[ filename ] || caption || false;
  let type;
  let slide = {
    caption: caption,
    alt: alt
  };
  if( filename === 'captions.yaml' ){
    return;
  } 
  if( ext === '.md' ){
    slide.type = 'text';
    slide.content = markdown.render( fs.readFileSync( filePath ).toString() );
  } else if( ext === '.embed' ){
    // embed code in a text doc with .embed as an extension
    slide.type = 'embed';
    slide.content = fs.readFileSync( filePath ).toString();
  } else if( ext === '.window' ){
    // url in a text doc with .window as an extension
    // will appear in a new pop-out window
    slide.type = 'window';
    slide.content = fs.readFileSync( filePath ).toString();
  } else if( ext ==='.mp3' ){
    slide.type = 'audio';
    slide.content = filePath;
  } else if( ext === '.mp4' ){
    slide.type = 'video'
    slide.content = filePath;
  } else { 
    // assume an image
    slide.type = 'image';
    slide.content = filePath;
  }
  return slide;
};
/* 
  readFolder( path )
  ------------------
  path: path to the folder that should be read

  reads e.g. 'related matters' or 'focus groups' and 
  constucts an object based on the folder structure.

  Each step down the object has: 
    'name': the folder name minus any 1. or 2. style numbering
    'contents': an object containing the folder's children
                the keys are the folder's name
*/
const readFolder = ( folderPath, cv ) => {
  let name = path.basename( folderPath );
  let data = {
    name: removeOrderFromFilename( name ),
    contents: {}
  };
  const root = folderPath; 
  const dir = fs.readdirSync( root ).filter( removeDotFiles );

  dir.forEach( ( year ) => {
    const p = path.join( root, year );
    const projects = fs.readdirSync( p ).filter( removeDotFiles );
    data.contents[year] = {
      name: removeOrderFromFilename( year ),
      contents: {}
    };
    projects.forEach( (project ) => {
      const name = removeOrderFromFilename( project );
      const p = path.join( root, year, project );
      const contents = fs.readdirSync( p ).filter( removeDotFiles );
      const relatedCv = getProjectCvItems( name, cv );
      let projectData = {
        name: name,
        slideshows: {},
        data: {},
        info: '',
        cv: { entries: relatedCv }
      };
      contents.forEach( ( item ) => {
        const itemPath = path.join( p, item );
        if( item === 'info.md' ){
          // the info file for the project
          // contains some config & the description
          let fm = frontmatter( fs.readFileSync( itemPath ));
          projectData.data = fm.data;
          projectData.info = markdown.render( fm.content );
        } else {
          //a folder that contains content 
          const p = path.join( root, year, project, item );
          // find the captions file
          const captions = readYAML( path.join(p, 'captions.yaml') ) || {};
          const alts = readYAML( path.join(p, 'alts.yaml') ) || {};

          let files = fs.readdirSync( p )
                        .filter( removeDotFiles )         
                        .filter( f => f !== 'captions.yaml' && f !== 'alts.yaml' );

          let slideshow = files.map( (item) => {
            return constructSlide( item, p, captions, alts );
          });
          projectData.slideshows[item] = {slides: slideshow};
        }             
      });
      data.contents[year].contents[project] = projectData;
    })
  });

  return data;
};

const readShowreel = ( showreelPath ) => {
  let showreelData = {
    name: 'showreel',
    slideshows: {}
  };
  const contents = fs.readdirSync( showreelPath ).filter( removeDotFiles );
  contents.forEach( ( item ) => {
    //a folder that contains content 
    const p = path.join( showreelPath, item );
    // find the captions file
    const captions = readYAML( path.join(p, 'captions.yaml') ) || {};
    const alts = readYAML( path.join(p, 'alts.yaml') ) || {};

    let files = fs.readdirSync( p )
                  .filter( removeDotFiles )         
                  .filter( f => f !== 'captions.yaml' && f !== 'alts.yaml' );

    let slideshow = files.map( (item) => {
      return constructSlide( item, p, captions, alts );
    });
    showreelData.slideshows[item] = { slides: slideshow };
  });

  return showreelData;

}

const loadCV = ( file ) => {
  const cvYaml = fs.readFileSync( file );
  return {
    entries: YAML.parse( cvYaml.toString() )
  };
}

const renderMarkdownAndProcess = ( md ) => {  
  let rendered = markdown.render( md );

  /* wrap @ symbols like so:
    <span class="dctxt--at">@</span>
  */
  const $ = cheerio.load( rendered )
  $('body *').each(function( i, ele ){
    const $this = $(this);
    if( $this.children().length <= 0 ){
      let text = $this.text();
      let replaced = text.replace( '@', '<span class="dctxt--at">@</span>' );
      $this.html( replaced );
    }
  });
  rendered = $('body').html();

  return rendered;
};

const cvToDissemination = function( cv, contentPath ){
  let dissemination = []
  for( i in cv.entries ){
    let entry = cv.entries[i]
    if( entry.image && entry.image !== "" ){
      entry.image = path.join( contentPath, 'info', 'images', entry.image );
    }
    if( entry.type === 'dissemination' ){
      dissemination.push( entry );
    }
  }
  return dissemination;
};

const ContentCollector = function( contentPath ){
  const cv = loadCV( path.join( contentPath, 'info', 'cv.yaml' ) );
  const dissemination = cvToDissemination( cv, contentPath );
  const showreel = readShowreel( path.join( contentPath, 'showreel' ) );
  return {
    bio: renderMarkdownAndProcess( fs.readFileSync( path.join( contentPath, 'info', 'bio.md' ) ).toString() ),
    showreel: showreel,
    cv: cv,
    dissemination: dissemination,
    related_matters: readFolder( path.join( contentPath, 'related matters'), cv ),
    focus_groups: readFolder( path.join( contentPath, 'focus groups'), cv )
  }
}

module.exports = ContentCollector;