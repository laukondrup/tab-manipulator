// document.getElementById('sortByAge').onclick = sortByAge;
// document.getElementById('sortByUrl').onclick = sortByUrl;
// document.getElementById('mergeWindows').onclick = mergeWindows;
// document.getElementById('extractDomain').onclick = extractDomain;
// document.getElementById('sortByDomain').onclick = sortByDomain;

function sendMessage(message){
    chrome.runtime.sendMessage({action: message});
}

// var actionElements = document.getElementsByClassName('action');
// for (var actionElement in actionElements){
//     actionElement.onclick = chrome.runtime.sendMessage({action: actionElement.id});
// }

// TODO do better
document.getElementById('sortByAge').onclick = function(){
    sendMessage('sortByAge');

};

document.getElementById('sortByUrl').onclick = function(){
    sendMessage('sortByUrl');
};

document.getElementById('mergeWindows').onclick = function(){
    sendMessage('mergeWindows');
};

document.getElementById('extractDomain').onclick = function(){
    sendMessage('extractDomain');
};

document.getElementById('sortByDomain').onclick = function(){
    sendMessage('sortByDomain');
};

window.onkeyup = function(e){
    if(e.shiftKey || e.ctrlKey){ return; } 
        
    if(e.key === "a"){
        sendMessage('sortByAge');
    }
    else if(e.key === "u"){
        sendMessage('sortByUrl');
    }
};