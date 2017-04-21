// chrome.tabs.create({url:"popup.html"})

chrome.runtime.onMessage.addListener(handleMessages);
chrome.commands.onCommand.addListener(handleCommands);

// const stringToFunctionMap = {
// 	'sortByAge': sortByAge,
// 	'sortByUrl': sortByUrl,
// 	'mergeWindows': mergeWindows,
// 	'extractDomain': extractDomain,
// 	'sortByNumDomain': sortByNumDomain,
// 	'splitWindow': splitWindow,
// 	'closeTabsLeft': closeTabsLeft,
// 	'closeTabsRight': closeTabsRight,
// 	'closeAllExceptCurrentTab': closeAllExceptCurrentTab,
// 	// Commands
// 	'duplicateTab': duplicateTab,
// 	'pinTab': togglePinTab,
// 	'moveSelectedTabsToNextWindow': moveSelectedTabsToNextWindow,
// }

function handleMessages(message, sender) {
	console.info('Received message:', message);
	console.info('Sender:', sender);
	
	const messageHandled = functionNameSwitch(message.action);
	
	if (messageHandled === false){
		console.error('Unhandled message:', message);
	}
}

function handleCommands(command){
	console.info('Received command:', command);
	
	const commandHandled = functionNameSwitch(command);
	
	if (commandHandled === false){
		console.error('Unhandled command:', command);
	}
}

// TODO: find a better name
function functionNameSwitch(functionNameAsString){
	switch(functionNameAsString){
		// TODO: Find out how this can be done smarter
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
		// Commands
		case 'duplicateTab':
		duplicateTab();
		break;
		case 'pinTab':
		togglePinTab();
		break;
		case 'moveSelectedTabsToNextWindow':
		moveSelectedTabsToNextWindow();
		break;
		default:
		
		return false;
	}
}

function sortByAge(){
	chrome.tabs.query({lastFocusedWindow: true, pinned: false}, function (tabs){
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
	chrome.tabs.query({lastFocusedWindow: true, pinned: false}, function(tabs){
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

function sortByNumDomain() {
	chrome.tabs.query({ lastFocusedWindow: true, pinned: false, windowType: 'normal' }, function (tabs) {
		var domainTabIds = {};
		tabs.forEach(function (tab) {
			tab.domain = getBaseUrl(tab.url);
			domainTabIds[tab.domain] = [];
		});
		
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

function mergeWindows(){
	chrome.tabs.query({ lastFocusedWindow: true, active: true }, function(currentTabs){
		chrome.tabs.query({lastFocusedWindow: false }, function(otherWindowTabs){
			const tabIds = otherWindowTabs.map(tab => tab.id);
			chrome.tabs.move(tabIds, {windowId: currentTabs[0].windowId, index: -1});
		});
	});
}

function extractDomain() {
	chrome.tabs.query({ lastFocusedWindow: true, active: true }, function (currentActiveTabs) {
		var currentTab = currentActiveTabs[0];
		var baseUrl = getBaseUrl(currentTab.url);
		// TODO: state maximized bad code, rather get from currentWindow state
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

function splitWindow(){
	chrome.tabs.query({ lastFocusedWindow: true, windowType: 'normal' }, function(topWindowTabs){
		let tabsToMove = [];
		let currentTabId;
		
		// TODO: ugly, but best way?
		for(let i = topWindowTabs.length - 1; i > 0; i--){
			if(topWindowTabs[i].active){
				currentTabId = topWindowTabs[i].id;
				break;
			}
			else {
				tabsToMove.push(topWindowTabs[i].id);
			}
		}
		
		// TODO: support updating pinned tabs. 
		// Does chrome really not have a smart way to remember pinned status?
		// How do I make this part wait for the upper part?
		chrome.windows.create({ tabId: currentTabId, focused: true, state: "maximized" }, function(newWindow){
			chrome.tabs.move(tabsToMove, { windowId: newWindow.id, index: -1 });
		});
	});    
}

// TODO: Consider how to handle pinned tabs 
function closeTabsLeft(){
	chrome.tabs.query({ lastFocusedWindow: true }, function(currentWindowTabs){
		let tabIdsToClose = [];
		
		for(let i = 0; i < currentWindowTabs.length; i++){
			if(currentWindowTabs[i].active){
				break;
			}
			else {
				tabIdsToClose.push(currentWindowTabs[i].id);
			}
		}
		chrome.tabs.remove(tabIdsToClose);
	});   
}

// TODO: Consider how to handle pinned tabs
function closeTabsRight(){
	chrome.tabs.query({ lastFocusedWindow: true }, function(currentWindowTabs){
		let tabIdsToClose = [];
		
		for(let i = currentWindowTabs.length - 1; i > 0; i--){
			if(currentWindowTabs[i].active){
				break;
			}
			else {
				tabIdsToClose.push(currentWindowTabs[i].id);
			}
		}
		chrome.tabs.remove(tabIdsToClose);
	});    
}

function closeAllExceptCurrentTab(){
	chrome.tabs.query({ lastFocusedWindow: true }, function(currentWindowTabs){
		let tabIdsToClose = [];
		
		for(let i = 0; i < currentWindowTabs.length; i++){
			if(currentWindowTabs[i].active){
				continue;
			}
			else {
				tabIdsToClose.push(currentWindowTabs[i].id);
			}
		}
		chrome.tabs.remove(tabIdsToClose);
	});    
}

function togglePinTab(){
	chrome.tabs.query({ lastFocusedWindow: true, highlighted: true}, function(currentTabs){
		currentTabs.forEach(tab => chrome.tabs.update(tab.id, { pinned: !tab.pinned })); 
	});
}

function duplicateTab(){
	chrome.tabs.query({ lastFocusedWindow: true, highlighted: true}, function(currentTabs){
		currentTabs.forEach(tab => chrome.tabs.duplicate(tab.id));
	});
}

// TODO: incomplete
function extractSelectedTabs() {
	const query = { lastFocusedWindow: true, highlighted: true, windowType: 'normal' };
	chrome.tabs.query(query, function (tabsToBeExtracted) {
		chrome.windows.create({ tabId: currentTab.id, focused: true, state: "maximized" }, function(newWindow){
			tabs.forEach(function(tab){
				chrome.tabs.move(tab.id, { windowId: newWindow.id, index: -1 });
			});
		});
	});
}

function moveSelectedTabsToNextWindow(){
	const query = { lastFocusedWindow: true, highlighted: true, windowType: 'normal' };
	chrome.tabs.query(query, function (tabsToMove) {
		chrome.windows.getAll({ populate: false, windowTypes: ['normal'] }, function(allWindows){
			const nextWindow = allWindows.find(window => !window.focused);
			
			const tabIdsToMove = tabsToMove.map(tab => tab.id);
			chrome.tabs.move(tabIdsToMove, { windowId: nextWindow.id, index: -1}, function(movedTabs){
				movedTabs.forEach(tab => chrome.tabs.update(tab.id, { highlighted: true, }));
				chrome.windows.update(nextWindow.id, { focused: true })
			});	
		});
	});
}