// chrome.tabs.create({url:"popup.html"})

// TODO: clean up a bit, by finding a way to avoid all this nesting

/**
* Returns the URL with http(s):// and www removed
*/
function getDomain (url) {
  let splitUrl = url.split('://')
  if (splitUrl.length === 2) {
    url = splitUrl[1]
  }
  splitUrl = url.split('www.')
  if (splitUrl.length === 2) {
    url = splitUrl[1]
  }
  return url
}

// TODO: clean up a bit
function getBaseUrl (url) {
  const baseUrl = getDomain(url).split('/')
  // example.com
  if (baseUrl.length > 1) {
    return baseUrl[0]
  }
  return baseUrl
}

function sortByAge () {
  chrome.tabs.query({ lastFocusedWindow: true, pinned: false }, (tabs) => {
    tabs.sort((a, b) => a.id - b.id)

    const tabIds = tabs.map(tab => tab.id)
    chrome.tabs.move(tabIds, { index: -1 })
  })
}

function sortByUrl () {
  chrome.tabs.query({ lastFocusedWindow: true, pinned: false }, (tabs) => {
    tabs.forEach((tab) => {
      tab.url = getDomain(tab.url)
    })
    tabs.sort((a, b) => {
      if (a.url > b.url) {
        return 1
      }
      if (a.url < b.url) {
        return -1
      }
      return 0
    })
    const tabIds = tabs.map(tab => tab.id)
    chrome.tabs.move(tabIds, { index: -1 })
  })
}

function sortByNumDomain () {
  chrome.tabs.query({ lastFocusedWindow: true, pinned: false, windowType: 'normal' }, (tabs) => {
    const domainTabIds = {}
    tabs.forEach((tab) => {
      tab.domain = getBaseUrl(tab.url)
      domainTabIds[tab.domain] = []
    })

    tabs.forEach((tab) => {
      const tabIds = domainTabIds[tab.domain]
      tabIds.push(tab.id)
    })

    const tabIds = []

    const sortedDomains = Object.keys(domainTabIds).sort((a, b) => domainTabIds[a].length - domainTabIds[b].length)

    for (const key in sortedDomains) {
      const partTabIds = domainTabIds[sortedDomains[key]]

      for (const key in partTabIds) {
        tabIds.push(partTabIds[key])
      }
    }

    chrome.tabs.move(tabIds, { index: -1 })
  })
}

function mergeWindows () {
  chrome.tabs.query({}, allTabs => {
      const currentWindowId = allTabs[0].windowId
      const tabsToMove = allTabs
        .filter(tab => tab.windowId != currentWindowId)

      chrome.tabs.move(tabsToMove.map(tab => tab.id), { windowId: currentWindowId, index: -1 }, x => {
        tabsToMove
          .filter(tab => tab.pinned)
          .forEach(tab => chrome.tabs.update(tab.id, { pinned: true}))
      })
  })
}

function extractDomain () {
  chrome.tabs.query({ lastFocusedWindow: true }, (currentTabs) => {
    const currentTab = currentTabs.find(tab => tab.active)
    const baseUrl = getBaseUrl(currentTab.url)

    const tabsToMove = currentTabs
          .filter(tab => baseUrl === getBaseUrl(tab.url))

    chrome.windows.create({ tabId: currentTab.id, focused: true, state: 'maximized' }, (newWindow) => {
        chrome.tabs.move(tabsToMove.map(tab => tab.id), { windowId: newWindow.id, index: -1 }, x => {
          tabsToMove
            .filter(tab => tab.pinned)
            .forEach(tab => chrome.tabs.update(tab.id, { pinned: true }))
        })
      })
  })
}

function splitWindow () {
  chrome.tabs.query({ lastFocusedWindow: true, windowType: 'normal' }, (topWindowTabs) => {
    const tabsToMove = []
    let currentTabId

    // TODO: ugly, but best way?
    for (let i = topWindowTabs.length - 1; i > 0; i--) {
      if (topWindowTabs[i].active) {
        currentTabId = topWindowTabs[i].id
        break
      } else {
        tabsToMove.push(topWindowTabs[i].id)
      }
    }

    // TODO: support updating pinned tabs.
    // Does chrome really not have a smart way to remember pinned status?
    // How do I make this part wait for the upper part?
    chrome.windows.create({ tabId: currentTabId, focused: true, state: 'maximized' }, (newWindow) => {
      chrome.tabs.move(tabsToMove, { windowId: newWindow.id, index: -1 })
    })
  })
}

// TODO: Consider how to handle pinned tabs
function closeTabsLeft () {
  chrome.tabs.query({ lastFocusedWindow: true }, (currentWindowTabs) => {
    const tabIdsToClose = []

    for (let i = 0; i < currentWindowTabs.length; i++) {
      if (currentWindowTabs[i].active) {
        break
      } else {
        tabIdsToClose.push(currentWindowTabs[i].id)
      }
    }
    chrome.tabs.remove(tabIdsToClose)
  })
}

// TODO: Consider how to handle pinned tabs
function closeTabsRight () {
  chrome.tabs.query({ lastFocusedWindow: true }, (currentWindowTabs) => {
    const tabIdsToClose = []

    for (let i = currentWindowTabs.length - 1; i > 0; i--) {
      if (currentWindowTabs[i].active) {
        break
      } else {
        tabIdsToClose.push(currentWindowTabs[i].id)
      }
    }
    chrome.tabs.remove(tabIdsToClose)
  })
}

function closeAllExceptCurrentTab () {
  chrome.tabs.query({ lastFocusedWindow: true, active: false, windowType: 'normal' }, (tabsToClose) => {
    const tabIdsToClose = tabsToClose.map(t => t.id)
    chrome.tabs.remove(tabIdsToClose)
  })
}

function togglePinTab () {
  chrome.tabs.query({ lastFocusedWindow: true, highlighted: true, windowType: 'normal' }, (currentTabs) => {
    const newPinnedStatus = !currentTabs[0].pinned
    currentTabs.forEach(tab => chrome.tabs.update(tab.id, { pinned: newPinnedStatus }))
  })
}

function duplicateTab () {
  chrome.tabs.query({ lastFocusedWindow: true, highlighted: true }, (currentTabs) => {
    // TODO: Consider if it's better to use c.t.create, with active: false
    currentTabs.forEach(tab => chrome.tabs.create({ url: tab.url, active: false, pinned: tab.pinned, index: tab.index + 1 }))
  })
}

// TODO: remember pinned - and highlighted?
function extractSelectedTabs () {
  chrome.tabs.query({ highlighted: true, lastFocusedWindow: true, windowType: 'normal' }, (tabsToBeExtracted) => {
    chrome.windows.create({ tabId: tabsToBeExtracted[0].id, focused: true, state: 'maximized' }, (newWindow) => {
      // tabsToBeExtracted = tabsToBeExtracted.shift();
      tabsToBeExtracted.splice(0, 1)
      tabsToBeExtracted.forEach((tab) => {
        chrome.tabs.move(tab.id, { windowId: newWindow.id, index: -1 }, () => {
          chrome.tabs.update({ highlighted: tab.highlighted, pinned: tab.pinned })
        })
      })
    })
  })
}

function moveSelectedTabsToNextWindow () {
  const query = { lastFocusedWindow: true, highlighted: true, windowType: 'normal' }
  chrome.tabs.query(query, (tabsToMove) => {
    chrome.windows.getAll({ populate: false, windowTypes: ['normal'] }, (allWindows) => {
      const nextWindow = allWindows.find(window => !window.focused)
      const tabIdsToMove = tabsToMove.map(tab => tab.id)
      chrome.tabs.move(tabIdsToMove, { windowId: nextWindow.id, index: -1 }, (movedTabs) => {
        movedTabs.forEach(tab => chrome.tabs.update(tab.id, { highlighted: true }))
        chrome.windows.update(nextWindow.id, { focused: true })
      })
    })
  })
}

function reload () {
  const query = { lastFocusedWindow: true, highlighted: true, windowType: 'normal' }
  chrome.tabs.query(query, (tabsToReload) => {
    tabsToReload.forEach((tab) => {
      chrome.tabs.reload(tab.id)
    })
  })
}

function reverseSort () {
  chrome.tabs.query({ lastFocusedWindow: true, windowType: 'normal' }, (tabs) => {
    const tabIds = tabs.map(x => x.id).reverse()
    chrome.tabs.move(tabIds, { index: -1 })
  })
}

// TODO: trim url eg. url.com#header1?
function closeDuplicates () {
  chrome.tabs.query({ lastFocusedWindow: true, windowType: 'normal' }, (tabs) => {
    const duplicateTabs = tabs.filter((tab, index, inputArray) => {
      return inputArray.map(x => x.url).indexOf(tab.url) !== index
    })

    duplicateTabs.forEach((tab) => {
      const notiQuery = { message: tab.url, type: 'basic', title: 'Closed duplicate tab' }
      chrome.notifications.create(notiQuery)
      chrome.tabs.remove(tab.id)
    })
  })
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
  extractSelectedTabs,
  closeDuplicates
}

function handleMessages (message, sender) {
  console.info('Received message:', message)
  console.info('Sender:', sender)

  if (stringToFunctionMap) {
    stringToFunctionMap[message.action]()
  } else {
    console.error('Unhandled message:', message)
  }
}

function handleCommands (command) {
  console.info('Received command:', command)

  if (stringToFunctionMap) {
    stringToFunctionMap[command]()
  } else {
    console.error('Unhandled message:', command)
  }
}

chrome.runtime.onMessage.addListener(handleMessages)
chrome.commands.onCommand.addListener(handleCommands)
