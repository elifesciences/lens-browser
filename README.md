Lens Browser
============

Lens Browser is a simple to use interface for discovering research. 

![](https://d262ilb51hltx0.cloudfront.net/max/2000/1*ZoIcqdy-O9dbe8R-MBMTMQ.png)


See [this article](https://medium.com/@_mql/self-host-a-scientific-journal-with-elife-lens-f420afb678aa) for more background information.

## Installation

1. Download the latest distribution [here](https://github.com/elifesciences/lens-browser/releases) and extract its contents
2. Adjust index.html to point to the desired backend.
   
   ```js
     var app = new window.LensBrowser({
     api_url: "https://elife-lens-indexer.herokuapp.com"
     });
   ```