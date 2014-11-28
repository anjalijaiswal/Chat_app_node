//adding http module
var http = require("http");
//adding url module
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};



// Create HTTP server, using anonymous function to define per-request behaviorServing the application’s HTML, CSS, and client-side JavaScript
var server = http.createServer(function(request, response) {
  var filePath = false;
  if (request.url == '/') 
  {
    //Determine HTML file to be served by default
    filePath = 'public/index.html';
  } 
  else 
  {
    //Translate URL path to relative file path
    filePath = 'public' + request.url;
  }

  var absPath = './' + filePath;
  //Serve static file
  serveStatic(response, cache, absPath);
});

server.listen(3000, function() {
  console.log("Server listening on port 3000.");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);

function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(200,{"content-type": mime.lookup(path.basename(filePath))});
  response.end(fileContents);
}

//Check if file is cached in memory
function serveStatic(response, cache, absPath) {

  if (cache[absPath]) {
    //Serve file from memory
    sendFile(response, absPath, cache[absPath]);
  } 
  else {
    //Check if file exists
    fs.exists(absPath, function(exists){
      
      if (exists) 
      {
         //Read file from disk
         fs.readFile(absPath, function(err, data) {
           
          if (err) {
            send404(response);
          }
          else {
            cache[absPath] = data;
          //Serve file read from disk
          sendFile(response, absPath, data);
        }
      });
       }
       else
       {
        send404(response);
        //Send HTTP 404 response
      }
    });
  }
}


