/// <reference path="typings/globals/chrome/index.d.ts" />

// chrome.tabs.create({url:"popup.html"})


// TODO: clean up a bit
/**
* Returns the URL with http(s):// removed
*/
function getDomain(url) {
  let splitUrl = url.split('://');
  if (splitUrl.length === 2) {
    url = splitUrl[1];
  }
  splitUrl = url.split('www.');
  if (splitUrl.length === 2) {
    url = splitUrl[1];
  }
  return url;
}


// TODO: clean up a bit
function getBaseUrl(url) {
  url = getDomain(url).split('/');
  // example.com
  if (url.length > 1) {
    return url[0];
  }
  return url;
}

function sortByAge() {
  chrome.tabs.query({ lastFocusedWindow: true, pinned: false }, (tabs) => {
    tabs.sort((a, b) => a.id - b.id);

    const tabIds = tabs.map(tab => tab.id);
    chrome.tabs.move(tabIds, { index: -1 });
  });
}

function sortByUrl() {
  chrome.tabs.query({ lastFocusedWindow: true, pinned: false }, (tabs) => {
    tabs.forEach((tab) => {
      tab.url = getDomain(tab.url);
    });
    tabs.sort((a, b) => {
      if (a.url > b.url) {
        return 1;
      }
      if (a.url < b.url) {
        return -1;
      }
      return 0;
    });
    const tabIds = tabs.map(tab => tab.id);
    chrome.tabs.move(tabIds, { index: -1 });
  });
}

function sortByNumDomain() {
  chrome.tabs.query({ lastFocusedWindow: true, pinned: false, windowType: 'normal' }, (tabs) => {
    const domainTabIds = {};
    tabs.forEach((tab) => {
      tab.domain = getBaseUrl(tab.url);
      domainTabIds[tab.domain] = [];
    });

    tabs.forEach((tab) => {
      const tabIds = domainTabIds[tab.domain];
      tabIds.push(tab.id);
    });

    const tabIds = [];

    const sortedDomains = Object.keys(domainTabIds).sort((a, b) => domainTabIds[a].length - domainTabIds[b].length);

    for (const key in sortedDomains) {
      const partTabIds = domainTabIds[sortedDomains[key]];

      for (const key in partTabIds) {
        tabIds.push(partTabIds[key]);
      }
    }

    chrome.tabs.move(tabIds, { index: -1 });
  });
}

const mergeWindows = function mergeWindows() {
  chrome.tabs.query({ lastFocusedWindow: true, active: true }, (currentTabs) => {
    chrome.tabs.query({ lastFocusedWindow: false }, (otherWindowTabs) => {
      const tabIds = otherWindowTabs.map(tab => tab.id);
      chrome.tabs.move(tabIds, { windowId: currentTabs[0].windowId, index: -1 });
    });
  });
};

const extractDomain = function extractDomain() {
  chrome.tabs.query({ lastFocusedWindow: true, active: true }, (currentActiveTabs) => {
    const currentTab = currentActiveTabs[0];
    const baseUrl = getBaseUrl(currentTab.url);
    // TODO: state maximized bad code, rather get from currentWindow state
    chrome.windows.create({ tabId: currentTab.id, focused: true, state: 'maximized' }, (newWindow) => {
      chrome.tabs.query({ currentWindow: false, pinned: false }, (tabs) => {
        tabs.forEach((tab) => {
          if (baseUrl === getBaseUrl(tab.url)) {
            chrome.tabs.move(tab.id, { windowId: newWindow.id, index: -1 });
          }
        });
      });
    });
    chrome.tabs.update(currentTab.id, { pinned: currentTab.pinned });
  });
};

const splitWindow = function splitWindow() {
  chrome.tabs.query({ lastFocusedWindow: true, windowType: 'normal' }, (topWindowTabs) => {
    const tabsToMove = [];
    let currentTabId;

    // TODO: ugly, but best way?
    for (let i = topWindowTabs.length - 1; i > 0; i--) {
      if (topWindowTabs[i].active) {
        currentTabId = topWindowTabs[i].id;
        break;
      } else {
        tabsToMove.push(topWindowTabs[i].id);
      }
    }

    // TODO: support updating pinned tabs.
    // Does chrome really not have a smart way to remember pinned status?
    // How do I make this part wait for the upper part?
    chrome.windows.create({ tabId: currentTabId, focused: true, state: 'maximized' }, (newWindow) => {
      chrome.tabs.move(tabsToMove, { windowId: newWindow.id, index: -1 });
    });
  });
};

// TODO: Consider how to handle pinned tabs
const closeTabsLeft = function closeTabsLeft() {
  chrome.tabs.query({ lastFocusedWindow: true }, (currentWindowTabs) => {
    const tabIdsToClose = [];

    for (let i = 0; i < currentWindowTabs.length; i++) {
      if (currentWindowTabs[i].active) {
        break;
      } else {
        tabIdsToClose.push(currentWindowTabs[i].id);
      }
    }
    chrome.tabs.remove(tabIdsToClose);
  });
};

// TODO: Consider how to handle pinned tabs
const closeTabsRight = function closeTabsRight() {
  chrome.tabs.query({ lastFocusedWindow: true }, (currentWindowTabs) => {
    const tabIdsToClose = [];

    for (let i = currentWindowTabs.length - 1; i > 0; i--) {
      if (currentWindowTabs[i].active) {
        break;
      } else {
        tabIdsToClose.push(currentWindowTabs[i].id);
      }
    }
    chrome.tabs.remove(tabIdsToClose);
  });
};

const closeAllExceptCurrentTab = function closeAllExceptCurrentTab() {
  chrome.tabs.query({ lastFocusedWindow: true, active: false, windowType: 'normal' }, (tabsToClose) => {
    const tabIdsToClose = tabsToClose.map(t => t.id);
    chrome.tabs.remove(tabIdsToClose);
  });
};

const togglePinTab = function togglePinTab() {
  chrome.tabs.query({ lastFocusedWindow: true, highlighted: true, windowType: 'normal' }, (currentTabs) => {
    const newPinnedStatus = !currentTabs[0].pinned;
    currentTabs.forEach(tab => chrome.tabs.update(tab.id, { pinned: newPinnedStatus }));
  });
};

const duplicateTab = function duplicateTab() {
  chrome.tabs.query({ lastFocusedWindow: true, highlighted: true }, (currentTabs) => {
    // TODO: Consider if it's better to use c.t.create, with active: false
    currentTabs.forEach(tab => chrome.tabs.duplicate(tab.id));
  });
};

// TODO: remember pinned - and highlighted?
const extractSelectedTabs = function extractSelectedTabs() {
  chrome.tabs.query({ highlighted: true, lastFocusedWindow: true, windowType: 'normal' }, (tabsToBeExtracted) => {
    chrome.windows.create({ tabId: tabsToBeExtracted[0].id, focused: true, state: 'maximized' }, (newWindow) => {
      // tabsToBeExtracted = tabsToBeExtracted.shift();
      tabsToBeExtracted.splice(0, 1);
      tabsToBeExtracted.forEach((tab) => {
        chrome.tabs.move(tab.id, { windowId: newWindow.id, index: -1 }, () => {
          chrome.tabs.update({ highlighted: tab.highlighted, pinned: tab.pinned });
        });
      });
    });
  });
};

const moveSelectedTabsToNextWindow = function moveSelectedTabsToNextWindow() {
  const query = { lastFocusedWindow: true, highlighted: true, windowType: 'normal' };
  chrome.tabs.query(query, (tabsToMove) => {
    chrome.windows.getAll({ populate: false, windowTypes: ['normal'] }, (allWindows) => {
      const nextWindow = allWindows.find(window => !window.focused);

      const tabIdsToMove = tabsToMove.map(tab => tab.id);
      chrome.tabs.move(tabIdsToMove, { windowId: nextWindow.id, index: -1 }, (movedTabs) => {
        movedTabs.forEach(tab => chrome.tabs.update(tab.id, { highlighted: true }));
        chrome.windows.update(nextWindow.id, { focused: true });
      });
    });
  });
};

const reload = function reload() {
  const query = { lastFocusedWindow: true, highlighted: true, windowType: 'normal' };
  chrome.tabs.query(query, (tabsToReload) => {
    tabsToReload.forEach((tab) => {
      chrome.tabs.reload(tab.id);
    });
  });
};

const reverseSort = function reverseSort() {
  chrome.tabs.query({ lastFocusedWindow: true, windowType: 'normal' }, (tabs) => {
    const tabIds = tabs.map(x => x.id).reverse();
    chrome.tabs.move(tabIds, { index: -1 });
  });
};

// TODO: is this necessary?
const stringToFunctionMap = {
  sortByAge,
  sortByUrl,
  mergeWindows,
  extractDomain,
  sortByNumDomain,
  splitWindow,
  closeTabsLeft,
  closeTabsRight,
  closeAllExceptCurrentTab,
  // Commands
  duplicateTab,
  reload,
  togglePinTab,
  moveSelectedTabsToNextWindow,
  reverseSort,
  extractSelectedTabs,
};

const handleMessages = function handleMessages(message, sender) {
  console.info('Received message:', message);
  console.info('Sender:', sender);

  if (stringToFunctionMap) {
    stringToFunctionMap[message.action]();
  } else {
    console.error('Unhandled message:', message);
  }
};

const handleCommands = function handleCommands(command) {
  console.info('Received command:', command);

  if (stringToFunctionMap) {
    const func = stringToFunctionMap[command];
    func();
  } else {
    console.error('Unhandled message:', command);
  }
};

chrome.runtime.onMessage.addListener(handleMessages);
chrome.commands.onCommand.addListener(handleCommands);
