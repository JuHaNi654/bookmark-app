const ipcRenderer = require('electron').ipcRenderer
const sqlite3 = require('sqlite3').verbose()

ipcRenderer.on('send-received-bookmark-id', (event, value) => {
    fetchSelectedBookMark(value)
})

function fetchSelectedBookMark(bookmarkId) {
    const db = new sqlite3.Database('./database.sqlite3')
    db.get('SELECT * FROM bookmarks where bmId = (?)', [bookmarkId], (err, row) => {
        setBookmarkObject(row)
    })
    db.close()
}

function setBookmarkObject(obj) {
    setText(obj.title, "title")
    setText(obj.savedUrl, "url")
    setText(obj.information, "info")
}

function setText(text, elemId) {
    let node = document.getElementById(elemId)
    node.innerText = text
}

function copyLink() {
    var copyText = document.getElementById("url").textContent
    const input = document.createElement('input');
    input.value = copyText;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
} 
