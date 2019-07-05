const sqlite3 = require('sqlite3').verbose()
let uniqid = require('uniqid')
const ipcRenderer = require('electron').ipcRenderer
/**
|--------------------------------------------------
| @function fetchData is called on onload method on body, 
| so that folder list will be fetched before rendering
|--------------------------------------------------
*/
function fetchData() {
    const db = new sqlite3.Database('./database.sqlite3')
    db.all("SELECT * FROM bookmarkfolder", [], function (err, rows) {
        setTable(rows)
    });
    db.close();
}

/**
|--------------------------------------------------
| @function saveData will saving giving folder name and its id to the SQLite3 database
| @param id will take given folder id 
| @param name will take folder name as string
|--------------------------------------------------
*/
function saveData(id, name) {
    newTableRow(id, name)
    const db = new sqlite3.Database('./database.sqlite3')
    db.run("INSERT INTO bookmarkfolder (folderId, folderName) values (?, ?)", [id, name])
    db.close();
}

/**
|--------------------------------------------------
| @function removeFromDatavabase function will call sql statement and delete 
| given @param id folder and it will delete first joined data from database
| and then it will remove folder from database 
|--------------------------------------------------
*/
function removeFromDatabase(id) {
    const db = new sqlite3.Database('./database.sqlite3')
    db.serialize(function () {
        db.run("DELETE FROM bookmark WHERE bmFolderid = (?)", [id])
        db.run("DELETE FROM bookmarkfolder WHERE folderId = (?)", [id])
    })
    db.close();
}

/**
|--------------------------------------------------
| @function fetchSavedBookmakrs will fetch all bookmarks which has given @param folderId as
| foreign key and return promise as arraylist of bookmarks or error
|--------------------------------------------------
*/
function fetchSavedBookmarks(folderId) {
    return promise = new Promise(function (resolve, reject) {
        const db = new sqlite3.Database('./database.sqlite3')
        db.all("SELECT * FROM bookmarks where bmFolderId = (?)", [folderId], function (err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        });
        db.close();
    })
}

/**
|--------------------------------------------------
| @function openNewFolderForm function will activate JqueryUi plugin
| and slide open input from where use can insert new folder name and save it
|--------------------------------------------------
*/
function openNewFolderForm() {
    $(document).ready(function () {
        let options = {}
        $("#form").toggle("blind", options, 500)
    });

}

/**
|--------------------------------------------------
| @function changeHeaderButtonText will change given text and onclick function call
| @param text takes string as param
| @param functionCall takes string as param
|--------------------------------------------------
*/
function changeHeaderButtonText(text, functionCall) {
    let button = document.getElementById("header-button")
    button.innerHTML = text
    button.setAttribute("onclick", functionCall)
}

/**
|--------------------------------------------------
| @Function setTable will loop given array and call @function newTablerow
| to create table rows and inserting given data
| @param data will take array as param which are fetched from database
|--------------------------------------------------
*/
function setTable(data) {
    for (let i = 0; i < data.length; i++) {
        newTableRow(data[i].folderId, data[i].folderName)
    }
}

/**
|--------------------------------------------------
| @function onFormSubmit when user insert new folder name on the input field
| and pressed save new folder button. Function fetch given data by getElementByid function
| and then will call @function saveData which pass @function uniqid() generated id and given 
| @param folderName string 
|--------------------------------------------------
*/
function onFormSubmit() {
    let folderName = document.getElementById("folder-name").value;
    if (folderName.length !== 0) {
        saveData(uniqid(), folderName)
    }
}


/**
|--------------------------------------------------
| @function newTableRow will create new row and insert given data to the cells
| @param id takes given string 
| @param title takes given String
|--------------------------------------------------
*/
function newTableRow(id, title) {
    //Fetch Table element by id
    let table = document.getElementById("folder-table")
    // Insert new row at bottom of the table
    let row = table.insertRow(-1)
    // Set given class with value to the new row
    row.setAttribute("class", "folder-row-style")
    // insert first cell to the row
    let tblButton = row.insertCell(0)
    // insert second cell to the row
    let folderName = row.insertCell(1);

    jQuery(folderName).addClass('folder-title-style')
    // Give id attribute with given id string to the second cell
    folderName.setAttribute("id", id)
    // Given onclick attribute to the second cell with given function
    folderName.setAttribute("onclick", "openSubTable(this)")
    // Insert to the first cell custom created delete button
    tblButton.appendChild(createDeleteButton())
    // Set to the second row text of the given title string
    folderName.innerText = title
}

/**
|--------------------------------------------------
| @function createDeleteButton creates delete button and returns it
|--------------------------------------------------
*/
function createDeleteButton() {
    // Create new button element
    let newButton = document.createElement("button");
    // Set button text value
    newButton.innerText = "Delete"

    //Set onclick and class attributes to the button element
    newButton.setAttribute("onclick", "deleteRow(this)")
    newButton.setAttribute("class", "delete-button")
    newButton.setAttribute("id", "delete-button")
    return newButton
}

/**
|--------------------------------------------------
| @function deleteRow will delete folder from database 
| and row from table
| @param x take onclicked button element
|--------------------------------------------------
*/
function deleteRow(x) {
    // Takes button element parent cell element to the variable
    let cell = x.parentNode
    // Takes cell element its paren element to the variable
    let rowValue = cell.parentNode
    // Will get index position from row element
    let index = rowValue.rowIndex
    // Will get row element id and save it to the variable
    let folderId = rowValue.getElementsByTagName("td")[1].id
    // delete row from table by given index
    document.getElementById("folder-table").deleteRow(index)
    // call function and pass given folderid so, that function can delete it from database
    removeFromDatabase(folderId)
}

/**
|--------------------------------------------------
| When click row title cell it will call @function openSubTable
| and hide other listed folder rows from the table.
| And will be inserting second row so we can create table on it And listed saved bookmarks on it
| @param value will take clicked title element
|--------------------------------------------------
*/
function openSubTable(value) {
    // Will get called function parent element and save it to the variable
    let parentElement = value.parentElement
    // Get selected folder row index position and save it to the variable
    let rowPosition = parentElement.rowIndex

    let delButton = document.getElementById("delete-button")
    delButton.style.visibility = "hidden"
    //Set attribute to the selcted row, so it will be easier on the animations and other 
    // specified styles on selected row
    parentElement.setAttribute("id", "selected")

    let rowHeight = parentElement.offsetHeight

    // Will disable folder table rows, so that it will be not creating 
    // more than 1 row tables on the showcase
    jQuery(parentElement).addClass('selected disable-click-event')
    // disabled onclick event, so other rows cannot be clicked while selected folder animation is executed
    // and set non-selected folders visibility to the hidden
    jQuery("tr:not(#selected)").addClass('not-selected disable-click-event')

    // Call function, so that selected folder row can be moved to the top of the table
    moveTableRow(rowPosition, rowHeight, "selected")

    setTimeout( function() {
        //Set little timeout on subtable creating function, so that other folder are full hidden
        createSubTableRow(rowPosition, rowHeight, value.id)
    }, 1000)
    modifySelectedFolderTitle(parentElement)
}
function modifySelectedFolderTitle(x) {
    let selectedFolderTextStyle = x.childNodes[1]
    jQuery(selectedFolderTextStyle).addClass('folder-text-style')
}


/**
|--------------------------------------------------
| @function createSubTableRow will create second row under selected folder row
| and creates second table on it, so that user can see selected folder bookmarks
| @param value = int, takes selected folder row index position
| @param folderHeight = int, takes folder row height
| @param folderId = string, selected folder id value
|--------------------------------------------------
*/
function createSubTableRow(value, folderHeight, folderId) {
    //Takes folder table and save it to the variable
    let table = document.getElementById("folder-table")
    // Create new row under selected folder row, so
    // we can insert subtable with bookmark data on it
    let row = table.insertRow(value + 1)
    // insert 1 cell, so that only bookmark tile is showcased on it
    let bookmarkTable = row.insertCell(0)

    // Give subtable row id attribute
    row.setAttribute("id", "subTable")
    // Give subtable row styles
    bookmarkTable.setAttribute("class", "sub-table-style")
    // Compine cells so that bookmark title text will be nicely centered
    bookmarkTable.setAttribute("colspan", "2")
    // Fetch bookmark from database and then create rows from bookmarks and 
    // append to the subtable
    fetchSavedBookmarks(folderId)
        .then(function (result) {
            bookmarkTable.appendChild(constructBookmarkData(result))
        })
        .catch(function (err) {
            throw new Error(err)
        })
        .finally(function () {
            //Change header button text and onclick function, so that we can close selected folder 
            changeHeaderButtonText("Close Folder", "closeOpenFolder()")
            document.getElementById("header").appendChild(createNewBmButton())
        })
    //title.appendChild(createDummyData())
    moveTableRow(value, folderHeight, "subTable")
}

function createNewBmButton() {
    // Create new button element
    let newButton = document.createElement("button");
    // Set button text value
    newButton.innerText = "Create new bookmark"

    //Set onclick and class attributes to the button element
    newButton.setAttribute("onclick", "")
    newButton.setAttribute("id", "new-bm-button")
    newButton.setAttribute("class", "Header-Button")
    return newButton
}

/**
|--------------------------------------------------
| @function closeOpenFolder will remove given saved style 
| and set header button to the create new folder function
|--------------------------------------------------
*/
function closeOpenFolder() {
    let selected = document.getElementById("selected")
    let delButton = document.getElementById("delete-button")

    selected.removeAttribute("style")
    jQuery("#subTable").remove()
    jQuery("#new-bm-button").remove()
    jQuery("tr").removeClass('not-selected ')

    setTimeout(function () {
        jQuery(selected).removeClass('selected disable-click-event')
        jQuery("tr").removeClass('disable-click-event')
        delButton.removeAttribute('style')
        selected.removeAttribute("id")

    }, 1000)

    changeHeaderButtonText("+ New Folder", "openNewFolderForm()")
}

/**
|--------------------------------------------------
| @function moveTableRow will takes 3 different parameter,
| which then will move selected folder to the top of the table.
| Table height is based rows height and how many rows is in the table (rows height * rows = table height),
| So to move selected row to the top will take selected row height and multiply its index position
| then its need to change to the negative value by calling @conconvertToNegative it will convert
| and then it will be set to the translateY()
| @param rowIndex selected row index which will be multiply 
| @param rowHeight single given row height
| @param elemId selected row id which will be rising to the top
|--------------------------------------------------
*/
function moveTableRow(rowIndex, rowheight, elemId) {
    let value = convertToNegative(rowheight) * rowIndex
    let selected = document.getElementById(elemId)
    selected.style.transform = `translateY(${value}px)`
}

/**
|--------------------------------------------------
| @function convertToNegative will convert given integer value to the its negative value
| and return it
| @param value takes integer value
|--------------------------------------------------
*/
function convertToNegative(value) {
    return -Math.abs(value)
}

/**
|--------------------------------------------------
| @function constructBookmarkData will create table with 
| bookmark object datas on it 
| @param list will take array bookmark objects
|--------------------------------------------------
*/
function constructBookmarkData(list) {
    let table = document.createElement("table")
    for (let i = 0; i < list.length; i++) {
        let row = table.insertRow(i)
        row.setAttribute("id", list[i].bmId)
        let cell = row.insertCell(0)
        cell.setAttribute("class", "subTable-title")
        cell.setAttribute("onclick", "openBookMarkWindow(this)")
        cell.innerText = list[i].title
    }
    return table
}

//Dummy data, which tested will subtable work
/*
function createDummyData() {
    let table = document.createElement("table");
    for (let i = 0 ; i < 25; i++) {
        let row = table.insertRow(i)
        let cell = row.insertCell(0)
        cell.innerText = i
    }
    return table
}*/

function openBookMarkWindow(x) {
    let selectedBookmarkId = x.parentElement.id
    ipcRenderer.send('receive-and-send-bookmark-id', selectedBookmarkId)
}