const path = require('path')
const fs = require('fs');

const Config = require('../Config.js');

const frontmatter = require('@github-docs/frontmatter')
const markdown = require( 'markdown-it' )( 'commonmark', {
  html: true,
  breaks: true,
  linkify: true
});



const H = {
  removeDotFiles: ( f ) => {
    return f.indexOf('.') !== 0;
  },
  readJSON: ( path ) => {
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
  },
  removeOrderFromFilename: ( filename ) => {
    return filename.replace(/(^[0-9]+\.)/gm, '' );
  },
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
  constructSlide: ( filename, p, captions ) => {
    let filePath = path.join( p, filename );
    let ext = path.extname( filename );
    let caption = captions[ filename ] || false;
    let type;
    let slide = {
      caption: caption
    };
    if( filename === 'captions.json' ){
      return;
    } 
    if( ext === '.md' ){
      slide.type = 'text';
      slide.content = markdown.render( fs.readFileSync( filePath ).toString() );
    } else if( ext === '.embed' ){
      // embed code in a text doc with .embed as an extension
      slide.type = 'embed';
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
  },
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
  readFolder: ( folderPath ) => {
    let name = path.basename( folderPath );
    let data = {
      name: H.removeOrderFromFilename( name ),
      contents: {}
    };
    const root = path.join( __dirname, folderPath );    
    const dir = fs.readdirSync( root ).filter( H.removeDotFiles );

    dir.forEach( ( year ) => {
      const p = path.join( root, year );
      const projects = fs.readdirSync( p ).filter( H.removeDotFiles );
      data.contents[year] = {
        name: H.removeOrderFromFilename( year ),
        contents: {}
      };
      projects.forEach( (project ) => {
        const p = path.join( root, year, project );
        const contents = fs.readdirSync( p ).filter( H.removeDotFiles );
        let projectData = {
          name: H.removeOrderFromFilename( project ),
          slideshows: {},
          data: {},
          info: '',
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
            const captions = H.readJSON( path.join(p, 'captions.json') ) || {};

            let files = fs.readdirSync( p )
                          .filter( H.removeDotFiles )         
                          .filter( f => f !== 'captions.json' );

            let slideshow = files.map( (item) => {
              return H.constructSlide( item, p, captions );
            });
            projectData.slideshows[item] = {slides: slideshow};
          }             
        });
        data.contents[year].contents[project] = projectData;
      })
    });

    return data;
  }
}

const renderMarkdownAndProcess = ( md ) => {  
  let rendered = markdown.render( md );
  
  /* TODO: need to wrap @ symbols like so:
    
      <span class="dctxt--at">@</span>

    But avoid the ones in mailto: links for example
    (i.e. only wrap ones that shoud appear in the text)
    May need a DOM parser for this?

    Maybe can use a plugin for markdown-it? 
    https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md
  */
  return rendered;
};


const cv = require('./info/cv.js');
let dissemination = []
for( i in cv.entries ){
  let entry = cv.entries[i]
  if( entry.image && entry.image !== "" ){
    entry.image = path.join( __dirname, 'info', 'images', entry.image );
  }
  if( entry.type === 'dissemination' ){
    dissemination.push( entry );
  }
}

module.exports = {
  bio: renderMarkdownAndProcess( fs.readFileSync( path.join( __dirname, 'info', 'bio.md') ).toString() ),
  cv: cv,
  dissemination: dissemination,
  related_matters: H.readFolder( './related matters' ),
  focus_groups: H.readFolder( './focus groups' )
};