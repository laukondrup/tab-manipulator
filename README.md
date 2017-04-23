# Tab Manipulator

A Chrome Extension that sorts tabs, manages windows and closes tabs the way most editors do.

![Tab Manipulator](http://imgur.com/xDNF5go.png)

## Features

- [x] **Sort tabs by age**: shortcut `a` while the popup is open
- [x] **Sort tabs by URL**: shortcut `u`while the popup is open
- [x] **Sort by number of domain open**: sorts tabs in ascending order by the number of tabs with the same domain open
- [x] **Merge windows**: combines all chrome windows
- [x] **Extract domain**: moves all tabs with the same domain as the current one to a new window
- [x] **Split window**: moves the current tab and all tabs to the right of it to a new window
- [x] **Close tabs left**
- [x] **Close tabs right** (works well with custom user sort)
- [x] **Close all but this tab**
- [x] **Keyboard shortcuts** for each feature: go to [**extensions**](chrome://extensions/) at the bottom click **Keyboard shortcuts**
  - [x] Also for shortcuts for **pin** and **duplicate** highlighted tabs

## Contributing

## Feature considerations

This is mostly brainstorming. A lot of these probably belong in another extension.

- Extension icon
- Ability to undo previous action (merge, extract)
  - No way to do perfect? How to remember extract window location?
- Omnibar commands?
- Bookmarks folder stacks, think OneTab
  - Workflow: switch device? Create stack that will close and bookmark and tabs into user-defined-folder/date|user-defined-title. Date prefix recommended for sorting purposes
- Vertical tab-layout
  - Drag and drop sort
  - Search tabs (url, title)
  - Close tabs
  - Windows-like selection (ctrl, shift)
  - Easy window management
  - Tree structure (openerId) `option`
- _Synchronize open tabs on different devices_
- __Bookmark features__
  - Sessions
- Open tab groups to pin
- _Launchy/Vimium like interface_
- User-defined sort based on regex matching urls and assigning letters to them, like TabGrouper used to do
- Rename current tab in window (rename or prefix). ie. to indicate [DEV] window or [Study] window etc. (assign string to windowId)
- Move active tab group one group to the left/right
- Custom sort pinned tabs
- Window **tab rules**
  - Assign domain/URL to a **category** (ie. productive)
  - Window allow only 'Productive' or move to other window
- Close duplicates
- Always open tab to the right checkbox



