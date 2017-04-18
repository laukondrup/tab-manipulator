# tabSorter

My first chrome extension. The goal is to transition into being a full fledged tab/bookmark manager. Yet another tab manager huh.. How is this one any different from the other 1000?

## Implemented features

- [x] Sort tabs by age > `a`
- [x] Sort tabs by URL > `u`
- [x] Merge windows
- [x] Extract domain
- [x] Number of domain open
- [x] Split window
- [x] Close tabs left
- [x] Close tabs right (works well with custom user sort)
- [x] Close all but this


## Next features

- Ability to undo previous action (merge, extract)
  - No way to do perfect? How to remember extract window location?


## Future features

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
- Keyboard shortcuts
  - Toggle pin tab
  - Duplicate tab (open in background)
  - ...
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

### Planned non-functionality

- Consider project name prefix
- Rename ~ Tab Manipulator
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
- Figure out how to get Chrome IntelliSense in VSCode (intellisense file)
- Make README user-friendly with pretty badges and stuff :-)
- License?
- JavaScript whitespace convention?
- Git commit message (prefix) convention?
- GIF of the extension
- Big project logo

## Issues

- Weird highlighted button on MacOS (sortByAge)

## Commit message prefix

[Taken from Angular contributing file.](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit)


Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
- semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation