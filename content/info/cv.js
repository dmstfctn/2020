module.exports = {
  "entries": [
    {
      "now": true,
      "year": "2020",
      "type": "live",                       // solo, group, live, screening, talk, dissemination
      "date": "29.1",
      "title": "CTM Liminal",       
      "situation": "Berghain",        
      "location": "berlin",                 // not used by dissemination
      "url": "https://example.com",         // only used if now is true
      "image": "image-1.jpg",
      "related": "echo-fx"
    },
    {
      "now": true,
      "year": "2019",
      "type": "dissemination",              // solo, group, live, screening, talk, dissemination
      "date": "29.1",
      "title": "Some Dissemination Thing",       
      "situation": "Situation",        
      "location": "location",              // not used by dissemination
      "url": "https://example.com",        // only used if now is true
      "image": "image-1.jpg",
      "related": "echo-fx"
    }
 ] 
};