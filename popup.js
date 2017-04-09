document.getElementById('sortByAge').onclick = sortByAge;
document.getElementById('sortByUrl').onclick = sortByUrl;
document.getElementById('mergeWindows').onclick = mergeWindows;
document.getElementById('extractDomain').onclick = extractDomain;
document.getElementById('sortByDomain').onclick = sortByDomain;

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
        tabs.forEach(function(tab){
            tab.url = getDomain(tab.url);
        });

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

        chrome.tabs.move(tabIds, {index: -1});
    });
}

function sortByDomain(){
    chrome.tabs.query({currentWindow: true, pinned: false}, function(tabs){
        
        var frequency = {};

        tabs.forEach(function(tab){
            tab.domain = getBaseUrl(tab.url);
            frequency[tab.domain] = 0;
        });

        // How to keep tabId?
        tabs.forEach(function(tab){
            frequency[tab.domain]++;
        });

        printJson(frequency);
        // tabs.sort()
    });
}

function getBaseUrl(url){
    url = getDomain(url).split('.');
    // domain = domain;
    // example.com
    if (domain.length === 2){
        return domain[0];
    }
    // help.github.com
    else if (domain.length === 3){
        return domain[1];
    }
    else {
        return domain;
    }
}

/**
 * Returns the URL with http(s):// removed
 */
function getDomain(url){

    var splitUrl = url.split('//');
    if(splitUrl.length === 2){
        url = splitUrl[1];
    } 

    splitUrl = url.split('www.');
    if(splitUrl.length === 2){
        url = splitUrl[1];
    } 

    return url;
}

function printJson(input){
    console.log(JSON.stringify(input, null, 2));
}

function mergeWindows(){
    chrome.tabs.query({active: true}, function(activeTabs){

        chrome.tabs.query({currentWindow: false, pinned: false}, function(tabs){
            tabIds = tabs.map(function(tab){ return tab.id; });
            chrome.tabs.move(tabIds, {windowId: activeTabs[0].windowId, index: -1});
        });

    });
}

function extractDomain(){
    chrome.tabs.query({active: true}, function(activeTabs){
        var currentTab = activeTabs[0];
        var wasTabPinned = currentTab.pinned;
        // TODO focused
        chrome.windows.create({tabId: currentTab.id, focused: false}, function(newWindow){
            // TODO if first extracted tab was pinned, re-pin it OR create window first, 
            // then move, but then harder to focus window and know the active tab
            console.log('Hello World');


            chrome.tabs.update(currentTab.id, {pinned: wasTabPinned});
        });

    });
}

window.onkeyup = function(e){
    if(e.shiftKey || e.ctrlKey){ return; } 
        
    if(e.key === "a"){
        sortByAge();
    }
    else if(e.key === "u"){
        sortByUrl();
    }
};