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
