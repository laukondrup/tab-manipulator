document.getElementById('sortByAge').onclick = sortByAge;
document.getElementById('sortByUrl').onclick = sortByUrl;
document.getElementById('mergeWindows').onclick = mergeWindows;
document.getElementById('extractDomain').onclick = extractDomain;
document.getElementById('sortByDomain').onclick = sortByDomain;

window.onkeyup = function(e){
    if(e.shiftKey || e.ctrlKey){ return; } 
        
    if(e.key === "a"){
        sortByAge();
    }
    else if(e.key === "u"){
        sortByUrl();
    }
};