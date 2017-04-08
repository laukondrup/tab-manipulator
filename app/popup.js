document.getElementById('sortByAge').onclick = sortByAge;

function sortByAge() {
    chrome.tabs.query({currentWindow: true,pinned: false},
        function (tabs) {
            var startIndex = tabs[0].id;

            var mappedTabs = tabs.map(function(tab){
                return tab.id;
            });

            console.log(tabs);
            console.log(mappedTabs);

            tabs.sort(function(a, b){
                return a.id - b.id;
            });

            // tabs.sort(function(a, b){
            //     if(a.id > b.id){
            //         return 1;
            //     }
            //     if(a.id < b.id){
            //         return -1;
            //     }
            //     return 0;
            // });

            mappedTabs = tabs.map(function(tab){
                return tab.id;
            });
            console.log('after sort:');
            console.log(mappedTabs);

            chrome.tabs.move(mappedTabs, {index: -1});
        }
    ); 
}