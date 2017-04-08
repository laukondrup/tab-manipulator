document.getElementById('sortByAge').onclick = sortByAge;
document.getElementById('sortByUrl').onclick = sortByUrl;

function sortByAge(){
   
    chrome.tabs.query({currentWindow: true, pinned: false},
        
        function (tabs){
            tabs.sort(function(a, b){
                return a.id - b.id;
            });

            var tabIds = tabs.map(function(tab){
                return tab.id;
            });

            chrome.tabs.move(tabIds, {index: -1});
        }
    ); 
}

function sortByUrl(){
    chrome.tabs.query({currentWindow: true, pinned: false}, function(tabs){

        var consoleTabs = tabs.map(function(tab){
            return {id: tab.id, url: tab.url};
        });

        console.log(JSON.stringify(consoleTabs, null, 2));
        tabs.sort(function(a, b){
            if(a.url > b.url){
                return 1;
            }
            if(a.url < b.url){
                return -1;
            }
            return 0;
        });

        var tabIds = tabs.map(function(tab){
            return tab.id;
        });

        console.log(tabs.map(tab => tab.id));
        chrome.tabs.move(tabIds, {index: -1});
    });
}

function sortByDomain(){
    chrome.tabs.query({currentWindow: true, pinned: false}, function(tabs){
        tabs = tabs.forEach(function(tab){
            tab.url = getDomain(tab.url);

        });
    });
}

function getDomain(url){
    var s = domain.split('.');
return s.slice(-2).join('.');

}