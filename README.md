# tabSorter

My first chrome extension. The goal is to transition into being a full fledged tab/bookmark manager. Yet another tab manager huh.. How is this one any different from the other 1000?

## Implemented features

- [x] Sort tabs by age > <kbd>a</kbd>
- [x] Sort tabs by URL > <kbd>u</kbd>
- [x] Merge windows

## Next features

- List tabs
  - **Drag tab from one window to another**
  - Extract domain

## Future features

- Number of domain open
- Automatically sort based on user-defined sort order
- Bookmarks folder stacks, think OneTab
  - Workflow: switch device? Create stack that will close and bookmark and tabs into user-defined-folder/date|user-defined-title. Date prefix recommended for sorting purposes
- Vertical tab-layout
  - Drag and drop sort
  - Search tabs (url, title)
  - Close tabs
  - Windows-like selection (ctrl, shift)
  - Easy window management
- _Synchronize open tabs on different devices_
- __Bookmark features__
  - Sort bookmarks
    - Age
    - URL
- Open tab groups to pin
- Keyboard shortcuts
  - Toggle pin tab
  - Duplicate tab (open in background)
  - ...
- _Launchy/Vimium like interface_
- User-defined sort based on regex matching urls and assigning letters to them, like TabGrouper used to do
- Rename current tab in window (rename or prefix). ie. to indicate [DEV] window or [Study] window etc. (assign string to windowId)
- Disable ctrl+W for pinned tabs
- Undo last action

### Planned non-functionality

- Find a way to speedup Code -> Reload -> Inspect
- Extension icon
- Icon/images for buttons for faster recognition
- Try popular tools (in branches)
- Setup Chrome Web Store
- Rename project
- Prettier font
- Consider splitting the extension up in modules or seperate extensions
- Polish styling
- Hover question mark that shows keyboard shortcuts
