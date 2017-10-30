function sendMessage (message) {
  chrome.runtime.sendMessage({ action: message }, (response) => {
    console.log('MessageResponse: ', response)
  })
}

const actionElements = document.getElementsByClassName('action')

for (const key in actionElements) {
  const action = actionElements[key]
  action.onclick = () => sendMessage(action.id)
}

window.onkeyup = function (e) {
  if (e.shiftKey || e.ctrlKey) {
    return
  }

  if (e.key === 'a') {
    sendMessage('sortByAge')
  } else if (e.key === 'u') {
    sendMessage('sortByUrl')
  } else if (e.key === 'd') {
    sendMessage('sortByNumDomain')
  } else if (e.key === 'r') {
    sendMessage('reverseSort')
  }
}
