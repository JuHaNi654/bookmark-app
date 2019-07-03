const sqlite3 = require('sqlite3')
//Opens database
const db = new sqlite3.Database('./database.sqlite3')

db.serialize(function () {
    // Create 2 tables
    db.run("CREATE TABLE IF NOT EXISTS bookmarkfolder (folderId varchar PRIMARY KEY, folderName TEXT not null)");
    db.run("CREATE TABLE IF NOT EXISTS bookmarks (bmId varchar PRIMARY KEY, title TEXT, savedUrl TEXT, information TEXT, bmFolderId varchar not null, FOREIGN KEY (bmFolderId) REFERENCES bookmarkfolder(folderId))")
  
    // Insert Dummy data
    /*
    db.run("INSERT INTO bookmarkfolder (folderId, folderName) values (?, ?)", [1, "TestiTitle"])
    db.run("INSERT INTO bookmarkfolder (folderId, folderName) values (?, ?)", [2, "TestiTitle osa. 2"])
    db.run("INSERT INTO bookmarks (bmId, title, savedUrl, information, bmFolderId) values (?, ?, ?, ?, ?)", [1, "url", "www.testi.fi", "tallennus verkkosivusta", 1])
    db.run("INSERT INTO bookmarks (bmId, title, savedUrl, information, bmFolderId) values (?, ?, ?, ?, ?)", [2, "url osa 2", "www.testaus.fi", "toinen tallennus", 1])
    db.run("INSERT INTO bookmarks (bmId, title, savedUrl, information, bmFolderId) values (?, ?, ?, ?, ?)", [3, "muistutus", "", "jotain muuta", 2])
    */

    //Check on the console if data is found from database
    db.each("SELECT * FROM bookmarkfolder", function (err, row) {
        console.log(row);
    });
    db.each("SELECT * FROM bookmarks", function (err, row) {
        console.log(row);
    });
});

//Closes database
db.close();
