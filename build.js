const fs = require('fs-extra');
//const fse = require('fs-extra');
const path = require('path');

const Handlebars = require('handlebars');

fs.readdirSync( path.join( 'templates', 'partials' ) )
  .forEach( ( f ) => {
    let p = path.join( 'templates', 'partials', f );
    let contents = fs.readFileSync( p ).toString();
    let name = f.replace( '.handlebars','' );
    Handlebars.registerPartial( name, contents );
  });

const Templates = {};
fs.readdirSync( 'templates' )
  .forEach( (f) => {
    if( f !== 'partials' ){
      let p = path.join( 'templates', f );
      let name = f.replace( '.handlebars', '' );
      Templates[name] = Handlebars.compile( fs.readFileSync( p ).toString() );
    }
  });

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

const createRelatedMattersList = ( related_matters ) => {
  let list = [];
  for( i in related_matters.contents ){
    let item = related_matters.contents[i];
    let line = {
      name: item.name,
      contents: []
    };
    for( j in item.contents ){
      let sub_item = item.contents[j];      

      line.contents.push({
        name: sub_item.name,
        date: item.name,
        slug: createSlug( sub_item.name ),
        url: (sub_item.data.link) ? sub_item.data.link : createURLPath( sub_item.name, 'related matters' ),
        is_external: !!sub_item.data.link,
        data: sub_item
      });
    }
    list.push( line );
  }
  return {
    name: 'Related Matters',
    slug: createSlug('Related Matters'),
    template: 'list_work',
    contents: list
  };
}

const createFocusGroupsList = ( focus_groups ) => {
  let list = [];
  for( i in focus_groups.contents ){
    let item = focus_groups.contents[i];
    for( j in item.contents ){
      let sub_item = item.contents[j];
      let line = {
        name: item.name,
        contents: [
          {
            name: sub_item.name,
            date: item.name,
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
    name: 'Focus Groups',
    slug: createSlug('Focus Groups'),
    template: 'list_work',
    contents: list
  };
};

const createDisseminationList = ( dissemination ) => {
  let list = [];  
  return {
    name: 'Dissemination',
    slug: createSlug('Dissemination'),
    template: 'list_dissemination',
    contents: list
  }
};


const F_PUBLIC = path.join( __dirname, 'public' );
const F_PUBLIC_DATA = path.join( __dirname, 'public', 'data' );

/* set up our output structure */
fs.mkdirSync( F_PUBLIC_DATA, {recursive: true});

/* get the content. content.js collates & formats from the '/content' directory */
const Content = require('./content/content.js');
const relatedMattersList = createRelatedMattersList( Content.related_matters );
const focusGroupsList = createFocusGroupsList( Content.focus_groups );
const disseminationList = createDisseminationList( Content.dissemination );

const infoSection = {
  name: 'Info',
  slug: createSlug( 'Info' ),
  template: 'list_info',
  url:  createURLPath( 'Info', '' )
};

const navigation = [
  relatedMattersList,
  focusGroupsList,
  disseminationList,
  infoSection
];

const d = JSON.stringify( Content, false, '  ' );
//const d = JSON.stringify( Content );

//console.log( JSON.stringify( navigation, '', ' ' ) );

let rendered_navigation = Templates.navigation( {navigation: navigation} );

/* home page */
let render = {
  title: 'Home',
  navigation: rendered_navigation,
  content: ''
};
fs.writeFileSync( path.join( F_PUBLIC, 'index.html' ), Templates.main( render ) );

const pages = relatedMattersList.contents.concat( focusGroupsList.contents )
  .map( (e) => {
    return e.contents;
  }).flat();
 
pages.forEach( ( pageData, index ) => {
  if( pageData.is_external ){
    return false;
  }
  pageData.prev = pages[index-1];
  pageData.next = pages[index+1];
  if( index < 1 ){
    pageData.prev = pages[ pages.length - 1 ];
  }
  if( index >= pages.length - 1 ){
    pageData.next = pages[0];
  }
  let p = path.join( F_PUBLIC, pageData.url );
  let filePath = path.join( p, 'index.html' );
  let rendered_project = Templates.project( pageData );
  let render = {
    title: pageData.name,
    navigation: rendered_navigation,
    content: rendered_project
  };
  fs.mkdirSync( p, {recursive: true});
  fs.writeFileSync( filePath, Templates.main( render ) );
});


fs.copySync('assets', 'public/assets');

fs.writeFileSync( 'data.json', d );