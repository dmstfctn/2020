const fs = require('fs-extra');
//const fse = require('fs-extra');
const path = require('path');
const Config = require('./Config.js');
const Templates = require('./modules/Templating.js')();
const Formatter = require('./modules/ContentFormatter.js');
const Rendering = require('./modules/Rendering.js');
/* get the content. ContentCollector collates & formats from the '/content' directory */
const ContentCollector = require('./modules/ContentCollector.js')
const Content = ContentCollector( path.join( __dirname, 'content' ) );

const HTMLO = require('./modules/HtmlOptimise.js');

const Assets = require('./modules/AssetProcessor.js');

const _BUILD_INFO = (new Date()).toString()

/* delete the public directory */
if( 
  Config.paths.public_root.indexOf(__dirname) !== -1 // check that the root is in this dir
  && Config.paths.public_root !== '/' // and that it isn't somehow the root of everything
){
  fs.removeSync( Config.paths.public_root );
}

/* set up our output structure */
fs.mkdirSync( Config.paths.public_data, {recursive: true} );

/* copy css/js/asset images into public */
fs.copySync('assets', Config.paths.public_assets );

Assets.js( 
  path.join( Config.paths.public_assets, 'js', 'src', 'main.js' ), // from
  path.join( Config.paths.public_assets, 'js', 'dist', 'main.js' ) // to
);
Assets.sass(
  path.join( Config.paths.public_assets, 'sass', 'main.scss' ), // from
  path.join( Config.paths.public_assets, 'css', 'main.css' ) // to
);

Assets.svgToTemplate(
  path.join( Config.paths.public_assets, 'svg'), // from
  path.join( __dirname, 'templates', 'partials' ) // to
);

const relatedMatters = Formatter.createRelatedMatters( Content.related_matters, Content.cv );
const focusGroups = Formatter.createFocusGroups( Content.focus_groups );
const infoSection = Formatter.createInfo( Content.bio, Content.cv );

const smallSiteData = Formatter.createSmallSite( Content );

/* the structure for the 'menu' */
const navigation = [
  relatedMatters,
  focusGroups,
];

/* render the template for the navigation, for use in other pages */
const rendered_navigation = Templates.navigation( {navigation: navigation} );
/* render the cv/bio for use on the home page */
const rendered_info = Rendering.renderInfo( infoSection );

/* turn small site into JSON for printing to script ele */
const rendered_small_site = Rendering.renderSmall( smallSiteData ); 


/* home page / info page*/
let homePath = Config.paths.public;
let homeFragP = path.join( homePath, 'fragment' );
let renderHome = {
  title: 'Home',
  pagetype: 'home',
  homeactive: 'related-matters',
  navigation: rendered_navigation,
  content: null,
  info: rendered_info,
  small_site: rendered_small_site,
  _build_info: _BUILD_INFO
};
fs.mkdirSync( homeFragP, {recursive: true });
fs.writeFileSync( 
  path.join( homeFragP, 'index.json' ), 
  JSON.stringify({
    isPage: true,
    title: renderHome.title,
    pagetype: renderHome.pagetype,
    html: '' 
  })
);
fs.writeFileSync( 
  path.join( homePath, 'index.html' ), 
  (Config.minifyHTML) ? HTMLO(Templates.main( renderHome )) : Templates.main( renderHome ) 
);

/* Related Matters */
const relatedMattersPages = Formatter.createPageList( relatedMatters.contents );
relatedMattersPages.forEach( ( pageData, index ) => {
  if( pageData.is_external ){   
    return;
  }
  const rendered = {
    navigation: rendered_navigation,
    small_site: rendered_small_site,
    info: rendered_info
  };

  Rendering.renderPage( pageData, index, relatedMattersPages, rendered );
});

/* Focus Groups */
const focusGroupsPages = Formatter.createPageList( focusGroups.contents );
focusGroupsPages.forEach( ( pageData, index ) => {
  const rendered = {
    navigation: rendered_navigation,
    small_site: rendered_small_site,
    info: rendered_info
  };

  Rendering.renderPage( pageData, index, focusGroupsPages, rendered );
});

/* focus groups 'home' at /mmittee/focus-groups/ */
let focusGroupsPath = path.join( Config.paths.public, focusGroups.slug );
let focusGroupsFragP = path.join( focusGroupsPath, 'fragment' );
let renderHomeFocusGroups = {
  title: 'Home',
  pagetype: 'home',
  homeactive: 'focus-groups',
  navigation: rendered_navigation,
  content: null,
  info: rendered_info,
  small_site: rendered_small_site,
  _build_info: _BUILD_INFO
};
fs.mkdirSync( focusGroupsFragP, {recursive: true });
fs.writeFileSync( 
  path.join( focusGroupsFragP, 'index.json' ), 
  JSON.stringify({
    isPage: true,
    title: renderHomeFocusGroups.title,
    pagetype: renderHomeFocusGroups.pagetype,
    html: '' 
  })
);
fs.writeFileSync( 
  path.join( focusGroupsPath, 'index.html' ),  
  (Config.minifyHTML) ? HTMLO(Templates.main( renderHomeFocusGroups )) : Templates.main( renderHomeFocusGroups )
);

/* Info 'home' at /mmittee/info/ */
let homeInfoPath = path.join( Config.paths.public, infoSection.slug );
let homeInfoFragP = path.join( homeInfoPath, 'fragment' );
let renderHomeInfo = {
  title: 'Home',
  pagetype: 'home',
  homeactive: 'info',
  navigation: rendered_navigation,
  content: null,
  info: rendered_info,
  small_site: rendered_small_site,  
  _build_info: _BUILD_INFO
};
fs.mkdirSync( homeInfoFragP, {recursive: true });
fs.writeFileSync( 
  path.join( homeInfoFragP, 'index.json' ), 
  JSON.stringify({
    isPage: true,
    title: renderHomeInfo.title,
    pagetype: renderHomeInfo.pagetype,
    html: '' 
  })
);
fs.writeFileSync( 
  path.join( homeInfoPath, 'index.html' ),  
  (Config.minifyHTML) ? HTMLO(Templates.main( renderHomeInfo )) : Templates.main( renderHomeInfo )
);

/* move .htaccess into public */
fs.copySync('htaccess', path.join(Config.paths.public_root, '.htaccess') );
/* move the contents of the 'extra' folder into the public directory */
const extra = fs.readdirSync( 'extra' );
extra.forEach( ( item ) => {  
  const src = path.join('extra', item );
  const dest = path.join( Config.paths.public, item )
  fs.copySync( src, dest );
});


/* write an index.html with link to /mmitte (or whatever url_root....) */
fs.writeFileSync( 
  path.join( Config.paths.public_root, 'index.html' ), 
  `<html><head>
    <meta http-equiv="refresh" content="0; url=/${Config.url_root}" />
    <style>html, body, a{ background: #000000; color: #FF0000; font-family: sans-serif;}</style>
  </head><body>
    <a href="${Config.url_root}">VISIT SITE &rarr; /${Config.url_root}</a>
  </body></html>`
);

/* save the data to data.json */
fs.writeFileSync( 'data.json', JSON.stringify( Content, false, '  ' ) );