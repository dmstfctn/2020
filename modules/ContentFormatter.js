const fs = require('fs-extra');
const path = require('path');


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

const createRelatedMatters = ( related_matters, cv ) => {
  let list = [];
  let now = false;
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
    name: 'related matters',
    slug: createSlug('Related Matters'),
    template: 'list_work',
    pagetype: 'relatedmatter',
    contents: list,
    now: now
  };
}

const createFocusGroups = ( focus_groups ) => {
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
    name: 'focus groups',
    slug: createSlug('Focus Groups'),
    pagetype: 'focusgroup',
    template: 'list_work',
    contents: list
  };
};

const createDissemination = ( dissemination ) => {
  let list = [];  
  return {
    name: 'dissemination',
    slug: createSlug('Dissemination'),
    template: 'list_dissemination',
    pagetype: 'dissemination',
    contents: dissemination
  }
};

const structureCV = ( cv ) => {
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
  return {
    name: 'info',
    slug: createSlug( 'Info' ),
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

module.exports = {
  createRelatedMatters, 
  createFocusGroups, 
  createDissemination,
  createInfo,
  createPageList
};