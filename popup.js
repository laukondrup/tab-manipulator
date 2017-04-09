// document.getElementById('sortByAge').onclick = sortByAge;
// document.getElementById('sortByUrl').onclick = sortByUrl;
// document.getElementById('mergeWindows').onclick = mergeWindows;
// document.getElementById('extractDomain').onclick = extractDomain;
// document.getElementById('sortByDomain').onclick = sortByDomain;

// TODO do better
document.getElementById('sortByAge').onclick = function(){
    chrome.runtime.sendMessage({action: 'sortByAge'});
};

document.getElementById('sortByUrl').onclick = function(){
    chrome.runtime.sendMessage({action: 'sortByUrl'});
};

document.getElementById('mergeWindows').onclick = function(){
    chrome.runtime.sendMessage({action: 'mergeWindows'});
};

document.getElementById('extractDomain').onclick = function(){
    chrome.runtime.sendMessage({action: 'extractDomain'});
};

document.getElementById('sortByDomain').onclick = function(){
    chrome.runtime.sendMessage({action: 'sortByDomain'});
};

window.onkeyup = function(e){
    if(e.shiftKey || e.ctrlKey){ return; } 
        
    if(e.key === "a"){
        sortByAge();
    }
    else if(e.key === "u"){
        sortByUrl();
    }
};