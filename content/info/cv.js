/*

EXAMPLE CV ENTRY:

{
  "now": true,
  "year": "2020",
  "type": "solo / group / live / screening / talk / dissemination",                         
  "date": "23.3–",
  "title": "OFFSHORE MATTERS",       
  "situation": "AKSIOMA",        
  "location": "ljubljana",                 // not used by dissemination
  "url": "https://aksioma.org/",           // only used if now is true
  "image": "offshore-matters.jpg",
  "related": "Offshore Investigation Vehicle" //optionally an array, so -> "related": ["flash", "demons"]
},
*/

// useful headers for the cv sections
// they help to keep it a bit readable

/* ** YEAR ********************** */
/* ** YEAR ** solo ************** */
/* ** YEAR ** group shows ******* */
/* ** YEAR ** screenings ******** */
/* ** YEAR ** live ************** */
/* ** YEAR ** talk ************** */
/* ** YEAR ** dissemination ***** */

module.exports = {
  "entries": [
    /* ********** 2020 ********** */
    /* ** 2020 ** solo ************** */
    {
      "now": true,
      "year": "2020",
      "type": "solo",
      "date": "23.3–",
      "title": "OFFSHORE MATTERS",
      "situation": "AKSIOMA",
      "location": "ljubljana",
      "url": "https://aksioma.org/",
      "image": "offshore-matters.jpg",
      "related": "Offshore Investigation Vehicle"
    },
    /* ** 2020 ** group shows ******* */
    /* ** 2020 ** screenings ******** */
    {
      "now": false,
      "year": "2020",
      "type": "screening",
      "date": "",
      "title": "INTERFACE CHAOS",
      "situation": "FORUM STADTPARK",
      "location": "graz",
      "url": "",
      "image": "",
      "related": "INTERFACE CHAOS"
    },
    /* ** 2020 ** live ************** */
    {
      "now": false,
      "year": "2020",
      "type": "live",
      "date": "29.1",
      "title": "CTM LIMINAL x TRANSMEDIALE 2020",
      "situation": "BERGHAIN",
      "location": "berlin",
      "url": "",
      "image": "echo-fx-berghain.jpg",
      "related": "ECHO FX"
    },
    /* ** 2020 ** talk ************** */
    /* ** 2020 ** dissemination ***** */
    {
      "now": false,
      "year": "2020",
      "type": "dissemination",
      "date": "29.1",
      "title": "INTERFACE CHAOS",
      "situation": "NERO",
      "location": "",
      "url": "https://www.neroeditions.com/docs/interface-chaos/",
      "image": "interface-chaos-nero.jpg",
      "related": "INTERFACE CHAOS"
    },
    /* ** 2019 ********************** */
    /* ** 2019 ** solo ************** */
    {
      "now": false,
      "year": "2019",
      "type": "solo",
      "date": "",
      "title": "NETWORK ENSEMBLE",
      "situation": "GLUQBAR",
      "location": "milan",
      "url": "",
      "image": "",
      "related": "Network Ensemble"
    },
    /* ** 2019 ** group shows ******* */
    {
      "now": false,
      "year": "2019",
      "type": "group shows",
      "date": "",
      "title": "PORTO DESIGN BIENNALE",
      "situation": "TRINDADE",
      "location": "porto",
      "url": "",
      "image": "",
      "related": "INTERFACE CHAOS"
    },
    {
      "now": false,
      "year": "2019",
      "type": "group shows",
      "date": "",
      "title": "A SCHOOL OF SCHOOLS",
      "situation": "C–MINE, genk, LUMA ARLES, arles",
      "location": "",
      "url": "",
      "image": "",
      "related": "OFFSHORE SS18"
    },
    /* ** 2019 ** screenings ******** */    
    {
      "now": false,
      "year": "2019",
      "type": "screenings",
      "date": "",
      "title": "Ø.29",
      "situation": "CORSICA STUDIOS",
      "location": "london",
      "url": "",
      "image": "",
      "related": "ECHO FX"
    },
    {
      "now": false,
      "year": "2019",
      "type": "screenings",
      "date": "",
      "title": "INTERFACE CHAOS",
      "situation": "TRUST",
      "location": "berlin",
      "url": "",
      "image": "",
      "related": "INTERFACE CHAOS"
    },
    {
      "now": false,
      "year": "2019",
      "type": "screenings",
      "date": "",
      "title": "EMERGENCE",
      "situation": "LCC",
      "location": "london",
      "url": "",
      "image": "",
      "related": "INTERFACE CHAOS"
    },
    {
      "now": false,
      "year": "2019",
      "type": "screenings",
      "date": "",
      "title": "ANTIUNIVERSITY NOW",
      "situation": "THE MONTPELIER",
      "location": "london",
      "url": "",
      "image": "",
      "related": "INTERFACE CHAOS"
    },
    /* ** 2019 ** live ************** */
    {
      "now": false,
      "year": "2019",
      "type": "live",
      "date": "",
      "title": "DESIGNING TIME",
      "situation": "DESIGN MUSEUM",
      "location": "london",
      "url": "",
      "image": "",
      "related": ""
    },
    /* ** 2019 ** talk ************** */
    /* ** 2019 ** dissemination ***** */
    {
      "now": false,
      "year": "2019",
      "type": "dissemination",
      "date": "",
      "title": "Flash Demons",
      "situation": "MILLE PLATEAUX",
      "location": "",
      "url": "https://forceincmilleplateaux.bandcamp.com/album/flash-demons",
      "image": "flash-demons.jpg",
      "related": ["FLASH", "Demons"]
    },
    /* ** 2018 ********************** */
    /* ** 2018 ** solo ************** */
    /* ** 2018 ** group shows ******* */
    /* ** 2018 ** screenings ******** */
    /* ** 2018 ** live ************** */
    /* ** 2018 ** talk ************** */
    /* ** 2018 ** dissemination ***** */
    {
      "now": false,
      "year": "2018",
      "type": "dissemination",
      "date": "",
      "title": "BUON PARADISO FISCALE A TUTTI",
      "situation": "NOT",
      "location": "",
      "url": "https://not.neroeditions.com/buon-paradiso-fiscale-tutti/",
      "image": "buon-paradiso-fiscale-a-tutti.jpg",
      "related": "Offshore Investigation Vehicle"
    },
    {
      "now": false,
      "year": "2018",
      "type": "dissemination",
      "date": "",
      "title": "A DAY IN THE LIFE OF",
      "situation": "SCHLOSS-POST",
      "location": "",
      "url": "https://schloss-post.com/a-day-in-the-life-of/",
      "image": "a-day-in-the-life.jpg",
      "related": "Offshore SS18"
    },
    {
      "now": false,
      "year": "2018",
      "type": "dissemination",
      "date": "",
      "title": "THE OFFSHORE ECONOMIST",
      "situation": "RIZOSFERA",
      "location": "",
      "url": "https://demystification.co/mmittee/toe/The_Offshore_Economist.pdf",
      "image": "toe.jpg",
      "related": "Offshore Investigation Vehicle"
    },
    /* ** 2017 ********************** */
    /* ** 2017 ** solo ************** */
    /* ** 2017 ** group shows ******* */
    /* ** 2017 ** screenings ******** */
    /* ** 2017 ** live ************** */
    /* ** 2017 ** talk ************** */
    /* ** 2017 ** dissemination ***** */
    {
      "now": false,
      "year": "2017",
      "type": "dissemination",
      "date": "",
      "title": "SELECTED NETWORK STUDIES",
      "situation": "NUKFM",
      "location": "",
      "url": "https://networkensemble.bandcamp.com/album/selected-network-studies",
      "image": "sns.jpg",
      "related": ["Network Ensemble", "Selected Network Studies"]
    },
    /* ** 2016 ********************** */
    /* ** 2016 ** solo ************** */
    /* ** 2016 ** group shows ******* */
    /* ** 2016 ** screenings ******** */
    /* ** 2016 ** live ************** */
    /* ** 2016 ** talk ************** */
    /* ** 2016 ** dissemination ***** */
    {
      "now": false,
      "year": "2016",
      "type": "dissemination",
      "date": "",
      "title": "CHAOS VARIATION I",
      "situation": "NUKFM",
      "location": "",
      "url": "https://networkensemble.bandcamp.com/album/chaos-variation-i",
      "image": "chaos-variation-i.jpg",
      "related": ["Network Ensemble"]
    },
 ] 
};