// chrome.tabs.create({url:"popup.html"})

let currentTabId;
let previousTabId;

/**
 * Returns the URL with http(s):// and www removed
 */
function getDomain(url) {
  return url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
}

function getBaseUrl(url) {
  return getDomain(url).split('/')[0];
}

function sortByAge() {
  chrome.tabs.query(
    { groupId: -1, lastFocusedWindow: true, pinned: false },
    tabs => {
      const sortedTabIds = tabs.sort((a, b) => a.id - b.id).map(tab => tab.id);

      chrome.tabs.move(sortedTabIds, { index: -1 });
    }
  );
}

function sortByUrl() {
  chrome.tabs.query(
    { groupId: -1, lastFocusedWindow: true, pinned: false },
    tabs => {
      tabs.sort((a, b) => {
        if (getDomain(a.url) > getDomain(b.url)) {
          return 1;
        }
        if (getDomain(a.url) < getDomain(b.url)) {
          return -1;
        }
        return 0;
      });
      chrome.tabs.move(
        tabs.map(tab => tab.id),
        { index: -1 }
      );
    }
  );
}

function sortByNumDomain() {
  chrome.tabs.query(
    {
      groupId: -1,
      lastFocusedWindow: true,
      pinned: false,
      windowType: 'normal',
    },
    tabs => {
      const domainTabIds = {};
      tabs.forEach(tab => {
        tab.domain = getBaseUrl(tab.url);
        domainTabIds[tab.domain] = [];
      });

      tabs.forEach(tab => {
        const tabIds = domainTabIds[tab.domain];
        tabIds.push(tab.id);
      });

      const tabIds = [];

      const sortedDomains = Object.keys(domainTabIds).sort(
        (a, b) => domainTabIds[a].length - domainTabIds[b].length
      );

      for (const key in sortedDomains) {
        const partTabIds = domainTabIds[sortedDomains[key]];

        for (const key in partTabIds) {
          tabIds.push(partTabIds[key]);
        }
      }

      chrome.tabs.move(tabIds, { index: -1 });
    }
  );
}

function mergeWindows() {
  chrome.tabs.query({}, allTabs => {
    const currentWindowId = allTabs[0].windowId;
    const tabsToMove = allTabs.filter(tab => tab.windowId != currentWindowId);

    chrome.tabs.move(
      tabsToMove.map(tab => tab.id),
      { windowId: currentWindowId, index: -1 },
      () => {
        repinAndHighlightTabs(tabsToMove);
      }
    );
  });
}

function extractDomain() {
  chrome.tabs.query({ lastFocusedWindow: true }, currentTabs => {
    const currentTab = currentTabs.find(tab => tab.active);
    const baseUrl = getBaseUrl(currentTab.url);

    const tabsToMove = currentTabs.filter(
      tab => baseUrl === getBaseUrl(tab.url)
    );

    chrome.windows.create(
      { tabId: currentTab.id, focused: true, state: 'maximized' },
      newWindow => {
        chrome.tabs.move(
          tabsToMove.map(tab => tab.id),
          { windowId: newWindow.id, index: -1 },
          () => {
            repinAndHighlightTabs(tabsToMove);
          }
        );
      }
    );
  });
}

/**
 *  Splits the window to the right
 */
function splitWindow() {
  chrome.tabs.query({ lastFocusedWindow: true, windowType: 'normal' }, tabs => {
    const currentTab = tabs.find(tab => tab.active);
    const tabsToMove = tabs.filter(tab => tab.index >= currentTab.index);

    console.log(tabsToMove);
    chrome.windows.create(
      { tabId: currentTab.id, focused: true, state: 'maximized' },
      newWindow => {
        chrome.tabs.move(
          tabsToMove.map(tab => tab.id),
          { windowId: newWindow.id, index: -1 },
          () => {
            repinAndHighlightTabs(tabsToMove);
          }
        );
      }
    );
  });
}

function repinAndHighlightTabs(tabs) {
  tabs.forEach(tab =>
    chrome.tabs.update(tab.id, {
      pinned: tab.pinned,
      highlighted: tab.highlighted,
    })
  );
}

function closeTabsLeft() {
  chrome.tabs.query({ groupId: -1, lastFocusedWindow: true }, tabs => {
    const currentTabIndex = tabs.find(tab => tab.active).index;
    const tabIdsToClose = tabs
      .filter(tab => tab.index < currentTabIndex)
      .filter(tab => !tab.pinned)
      .map(tab => tab.id);

    chrome.tabs.remove(tabIdsToClose);
  });
}

function closeTabsRight() {
  chrome.tabs.query({ groupId: -1, lastFocusedWindow: true }, tabs => {
    const currentTabIndex = tabs.find(tab => tab.active).index;
    const tabIdsToClose = tabs
      .filter(tab => tab.index > currentTabIndex)
      .filter(tab => !tab.pinned)
      .map(tab => tab.id);

    chrome.tabs.remove(tabIdsToClose);
  });
}

function closeAllExceptCurrentTab() {
  chrome.tabs.query(
    {
      groupId: -1,
      lastFocusedWindow: true,
      active: false,
      windowType: 'normal',
    },
    tabs => {
      chrome.tabs.remove(tabs.map(tab => tab.id));
    }
  );
}

function togglePinTab() {
  chrome.tabs.query(
    { lastFocusedWindow: true, highlighted: true, windowType: 'normal' },
    tabs => {
      tabs.forEach(tab =>
        chrome.tabs.update(tab.id, { pinned: !tabs[0].pinned })
      );
    }
  );
}

function duplicateTab() {
  chrome.tabs.query(
    { lastFocusedWindow: true, highlighted: true },
    currentTabs => {
      currentTabs.forEach(tab =>
        chrome.tabs.create({
          url: tab.url,
          active: false,
          pinned: tab.pinned,
          index: tab.index + 1,
        })
      );
    }
  );
}

// TODO
function moveSelectedTabsToNextWindow() {
  const query = {
    lastFocusedWindow: true,
    highlighted: true,
    windowType: 'normal',
  };
  chrome.tabs.query(query, tabsToMove => {
    chrome.windows.getAll(
      { populate: false, windowTypes: ['normal'] },
      allWindows => {
        const nextWindow = allWindows.find(window => !window.focused);
        const tabIdsToMove = tabsToMove.map(tab => tab.id);
        chrome.tabs.move(
          tabIdsToMove,
          { windowId: nextWindow.id, index: -1 },
          movedTabs => {
            movedTabs.forEach(tab =>
              chrome.tabs.update(tab.id, { highlighted: true })
            );
            chrome.windows.update(nextWindow.id, { focused: true });
          }
        );
      }
    );
  });
}

function reload() {
  const query = {
    lastFocusedWindow: true,
    highlighted: true,
    windowType: 'normal',
  };
  chrome.tabs.query(query, tabsToReload => {
    tabsToReload.forEach(tab => {
      chrome.tabs.reload(tab.id);
    });
  });
}

function reverseSort() {
  chrome.tabs.query(
    { lastFocusedWindow: true, windowType: 'normal', pinned: false },
    tabs => {
      const reversedTabIds = tabs.map(x => x.id).reverse();
      chrome.tabs.move(reversedTabIds, { index: -1 });
    }
  );
}

// TODO: trim url eg. url.com#header1?
function closeDuplicates() {
  chrome.tabs.query({ lastFocusedWindow: true, windowType: 'normal' }, tabs => {
    const duplicateTabs = tabs.filter((tab, index, inputArray) => {
      return inputArray.map(x => x.url).indexOf(tab.url) !== index;
    });

    duplicateTabs.forEach(tab => {
      const query = {
        message: tab.url,
        type: 'basic',
        title: 'Closed duplicate tab',
      };
      chrome.notifications.create(query);
      chrome.tabs.remove(tab.id);
    });
  });
}

function activatePreviousTab() {
  chrome.tabs.update(previousTabId, { active: true });
}

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
  closeDuplicates,
  activatePreviousTab,
};

function handleMessages(message, sender) {
  console.info('Received message:', message);
  console.info('Sender:', sender);

  if (stringToFunctionMap) {
    stringToFunctionMap[message.action]();
  } else {
    console.error('Unhandled message:', message);
  }
}

function handleCommands(command) {
  console.info('Received command:', command);

  if (stringToFunctionMap) {
    stringToFunctionMap[command]();
  } else {
    console.error('Unhandled message:', command);
  }
}

chrome.runtime.onMessage.addListener(handleMessages);
chrome.commands.onCommand.addListener(handleCommands);

chrome.tabs.onActivated.addListener(activeInfo => {
  console.log('Activated tab:', activeInfo.tabId);
  previousTabId = currentTabId;
  currentTabId = activeInfo.tabId;
});

// chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
//   console.log('Closed tab:', tabId);
// })

// chrome.windows.onFocusChanged.addListener(windowId => {
//   console.log('Changed focus to window:', windowId);

// })

// chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
//   console.log('Removed tab:', tabId);

// })

// chrome.windows.onRemoved
// chrome.tabs.onReplaced()
