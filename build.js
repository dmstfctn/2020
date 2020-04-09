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

/* set up our output structure */
fs.mkdirSync( Config.paths.public_data, {recursive: true} );



const relatedMatters = Formatter.createRelatedMatters( Content.related_matters, Content.cv );
const focusGroups = Formatter.createFocusGroups( Content.focus_groups );
const dissemination = Formatter.createDissemination( Content.dissemination );
const infoSection = Formatter.createInfo( Content.bio, Content.cv );

/* the structure for the 'menu' */
const navigation = [
  relatedMatters,
  focusGroups,
  dissemination
];

/* render the template for the navigation, for use in other pages */
const rendered_navigation = Templates.navigation( {navigation: navigation} );
/* render the cv/bio for use on the home page */
const rendered_info = Rendering.renderInfo( infoSection );

/* home page / info page*/
let render = {
  title: 'Home',
  pagetype: 'home',
  navigation: rendered_navigation,
  content: rendered_info  
};
fs.writeFileSync( path.join( Config.paths.public, 'index.html' ), Templates.main( render ) );

/* Related Matters */
const relatedMattersPages = Formatter.createPageList( relatedMatters.contents );
relatedMattersPages.forEach( ( pageData, index ) => {
  Rendering.renderPage( pageData, index, relatedMattersPages, rendered_navigation );
});

/* Focus Groups */
const focusGroupsPages = Formatter.createPageList( focusGroups.contents );
focusGroupsPages.forEach( ( pageData, index ) => {
  Rendering.renderPage( pageData, index, focusGroupsPages, rendered_navigation );
});

/* copy css/js/asset images into public */
fs.copySync('assets', Config.paths.public_assets );

/* save the data to data.json */
fs.writeFileSync( 'data.json', JSON.stringify( Content, false, '  ' ) );