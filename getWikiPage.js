var request = require("request");
var cheerio = require("cheerio");

var apiUrl = "https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&redirects&page=";


function getWikiPageData(page, callback) {

    request(apiUrl + page, function (error, response, body) {
        
        //If some error occur during request, throw error
        if(error) { 
            callback(error);
            return;
        }
        
        //If status code is different from 200, throw error
        if(response.statusCode != 200) {
            callback("ERROR. STATUS CODE: " + response.statusCode);
            return;
        }
        
        //Treat data
        var dataObj = JSON.parse(body);
        
        //If the payload got an error object, throw error
        if(dataObj.hasOwnProperty("error")) {
            callback(body);
            return;
        }
        
        //Get wikilinks
        var links = [];
        
        //Load it on cheerio (jQuery like module)
        $ = cheerio.load(dataObj['parse']['text']['*']);
        
        //Get all the <a> tags 
        $('a').each(function(i, elem) {
                
            var link = $(this).attr('href');

            //var notAllowedChars

            //Check the link exists and is a wiki link
            //Get only wikipedia links
            //Remove pages that contains a colon (":"). Their offen are special pages. Not sure if there is articles with colon
            if(link 
                && link.indexOf("/wiki/") == 0 
                && link.indexOf(":") == -1
            ) { 
                //We MUST NOT use last index of / to get the path cause some titles like TCP/IP, have bar in the title
                //var lastPathIndex = link.lastIndexOf("/") + 1;
                //We should use the '/wiki/' string length
                var linkName = link.substring(6);

                //Remove hashtag from url if any
                var hashIndex = linkName.indexOf("#");
                if(hashIndex != -1)
                    linkName = linkName.substring(0, hashIndex);

                //If the link is not in the links array, push it 
                //if(links.indexOf(linkName) == -1)
                links.push(linkName);
            }                
        });
        
        callback({
            title: dataObj['parse']['title'],
            pageid: dataObj['parse']['pageid'],
            links: links,
            html: dataObj['parse']['text']['*']            
        })
    });   
}

module.exports = getWikiPage;


//Test routines
if(process.argv[2] == 'test') {
    
    getWikiPage(process.argv[3] || "MQTT", function(error, pageData) {
        if(error){
            console.log(error);
        } else {
            console.log(pageData);
        }
    });   
}



