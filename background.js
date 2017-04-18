// chrome.tabs.create({url: 'popup.html'});

chrome.runtime.onMessage.addListener(handleMessage);

function handleMessage(message, sender) {
    console.log('Received message:', message)
    console.log('Sender: ', sender);
    switch (message.action) {
        // TODO: find out how this can be done smarter
        case 'sortByAge':
            sortByAge();
            break;
        case 'sortByUrl':
            sortByUrl();
            break;
        case 'mergeWindows':
            mergeWindows();
            break;
        case 'extractDomain':
            extractDomain();
            break;
        case 'sortByNumDomain':
            sortByNumDomain();
            break;
        case 'splitWindow':
            splitWindow();
            break;
        case 'closeTabsLeft':
            closeTabsLeft();
            break;
        case 'closeTabsRight':
            closeTabsRight();
            break;
        case 'closeAllExceptCurrentTab':
            closeAllExceptCurrentTab();
            break;
        default:
            console.log('Unhandled message:', message);
    }
}

function sortByAge(){
    chrome.tabs.query({currentWindow: true, pinned: false}, function (tabs){
        tabs.sort(function(a, b){
            return a.id - b.id;
        });
        var tabIds = tabs.map(function(tab){
            return tab.id;
        });
        chrome.tabs.move(tabIds, {index: -1});
    }); 
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

// TODO: find a better name
function sortByNumDomain() {
    chrome.tabs.query({ currentWindow: true, pinned: false, windowType: 'normal' }, function (tabs) {
        // TODO: better name
        var domainTabIds = {};
        tabs.forEach(function (tab) {
            tab.domain = getBaseUrl(tab.url);
            domainTabIds[tab.domain] = [];
        });
        
        // How to keep tabId?
        tabs.forEach(function (tab) {
            var tabIds = domainTabIds[tab.domain];
            tabIds.push(tab.id);
        });
        
        let tabIds = [];
        
        let sortedDomains = Object.keys(domainTabIds).sort(function(a, b){
            return domainTabIds[a].length - domainTabIds[b].length;
        });
        
        for(let key in sortedDomains){
            const partTabIds = domainTabIds[sortedDomains[key]];
            
            for(let key in partTabIds){
                tabIds.push(partTabIds[key]); 
            }
        }
        
        chrome.tabs.move(tabIds, { index: -1 });
    });
}

function getBaseUrl(url){
    url = getDomain(url).split('/');
    // example.com
    if (url.length > 1){
        return url[0];
    }
    else {
        return url;
    }
}

/**
* Returns the URL with http(s):// removed
*/
function getDomain(url){
    var splitUrl = url.split('://');
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
    chrome.windows.getCurrent({ populate: false }, function(currentWindow){
        chrome.tabs.query({currentWindow: false, pinned: false}, function(tabs){
            var tabIds = tabs.map(function(tab){ return tab.id; });
            chrome.tabs.move(tabIds, {windowId: currentWindow.id, index: -1});
        });
        
    });
}

function extractDomain() {
    chrome.tabs.query({ active: true }, function (activeTabs) {
        var currentTab = activeTabs[0];
        var baseUrl = getBaseUrl(currentTab.url);
        // TODO: state maximized bad code, rather get from currentWindow
        chrome.windows.create({ tabId: currentTab.id, focused: true, state: "maximized" }, function(newWindow){
            chrome.tabs.query({ currentWindow: false, pinned: false }, function (tabs) {
                tabs.forEach(function(tab){
                    if(baseUrl == getBaseUrl(tab.url)){
                        chrome.tabs.move(tab.id, { windowId: newWindow.id, index: -1 });
                    }
                });
            });
        });
        chrome.tabs.update(currentTab.id, { pinned: currentTab.pinned });
    });
}

// TODO:
function splitWindow(){
    chrome.windows.getCurrent({ populate: true }, function(currentWindow){
        let tabsToMove = [];
        let currentTabId;
        
        // TODO: ugly, but best way?
        for(let i = currentWindow.tabs.length - 1; i > 0; i--){
            if(currentWindow.tabs[i].active){
                currentTabId = currentWindow.tabs[i].id;
                break;
            }
            else {
                tabsToMove.push(currentWindow.tabs[i].id);
            }
        }
        
        // TODO: support updating pinned tabs. 
        // Does chrome really not have a smart way to remember pinned status?
        chrome.windows.create({ tabId: currentTabId, focused: true, state: "maximized" }, function(newWindow){
            chrome.tabs.move(tabsToMove, { windowId: newWindow.id, index: -1 });
        });
    });    
}