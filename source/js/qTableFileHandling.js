function exportQTable(data) {
    var csvContent = Object.keys(data).map(function(k){
        return k + "," + data[k].join(',');
    }).join('\n');
    makeDownloadLink(csvContent);
}

function makeDownloadLink(csvContent) {
    var encodedUri = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
    var link = document.getElementById("download-link");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", deathCount + ".csv");
    link.click();
}

function importQTableFromFile(filename) {
    var file = filename[0];
    var reader = new FileReader();
    var importedQTable = {};
    reader.onload = function(progressEvent){
        var lines = this.result.split(/\r\n|\n/);
        for (var line = 0; line < lines.length; line++) {
            var qRow = lines[line].split(',');
            importedQTable[qRow[0]] = qRow.slice(1, qRow.length);
        }
    };
    reader.readAsText(file);
    // TODO:  Not sure if this might cause errors due to concurrency between this code and gameAgent
    qTable = importedQTable;
}


