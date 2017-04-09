document.getElementById('sortByAge').onclick = sortByAge;
document.getElementById('sortByUrl').onclick = sortByUrl;
document.getElementById('mergeWindows').onclick = mergeWindows;
document.getElementById('extractDomain').onclick = extractDomain;
// document.getElementById('sortByDomain').onclick = sortByDomain;

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

// function sortByDomain(){
//     chrome.tabs.query({currentWindow: true, pinned: false}, function(tabs){
//         tabs = tabs.forEach(function(tab){
//             var domain = getDomain(tab.url);
//             domain = domain.split('/');
//             if (domain.length > 1){
//                 domain = domain[0];
//             }
//         });

//         tabs.sort()
//     });
// }

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

        chrome.windows.create({focused: true}, function(newWindow){
            // TODO if first extracted tab was pinned, re-pin it OR create window first, 
            // then move, but then harder to focus window and know the active tab
            console.log('Hello World');
        });

    });
}