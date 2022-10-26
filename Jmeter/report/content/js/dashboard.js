/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 92.3076923076923, "KoPercent": 7.6923076923076925};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7307692307692307, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get Buyer order"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Seller Product id"], "isController": false}, {"data": [0.0, 500, 1500, "Get Buyer Product"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "Get Seller Product id"], "isController": false}, {"data": [1.0, 500, 1500, "Get Buyer ID"], "isController": false}, {"data": [1.0, 500, 1500, "Get Buyer id"], "isController": false}, {"data": [1.0, 500, 1500, "Post Buyer Order"], "isController": false}, {"data": [1.0, 500, 1500, "Get User"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "Register"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "Post Product"], "isController": false}, {"data": [0.0, 500, 1500, "Put Buyer id"], "isController": false}, {"data": [1.0, 500, 1500, "Get Seller Product"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 39, 3, 7.6923076923076925, 1009.1538461538463, 258, 11101, 281.0, 1798.0, 6337.0, 11101.0, 1.9277346646235973, 788.2896394302061, 0.7605515669022787], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Buyer order", 3, 0, 0.0, 274.0, 266, 278, 278.0, 278.0, 278.0, 278.0, 0.36372453928225024, 0.4493276779219205, 0.14492149612027158], "isController": false}, {"data": ["Delete Seller Product id", 3, 0, 0.0, 295.6666666666667, 277, 329, 281.0, 329.0, 329.0, 329.0, 0.8628127696289906, 0.27131417169974115, 0.38422131147540983], "isController": false}, {"data": ["Get Buyer Product", 3, 0, 0.0, 7649.0, 5509, 11101, 6337.0, 11101.0, 11101.0, 11101.0, 0.20977554017201594, 1113.3092473865463, 0.08747476138032305], "isController": false}, {"data": ["Login", 3, 0, 0.0, 348.0, 335, 367, 342.0, 367.0, 367.0, 367.0, 0.6402048655569782, 0.3213528329065301, 0.23945162451984636], "isController": false}, {"data": ["Get Seller Product id", 3, 0, 0.0, 538.3333333333334, 268, 1065, 282.0, 1065.0, 1065.0, 1065.0, 0.8625646923519263, 0.6191260242955722, 0.3655791762507188], "isController": false}, {"data": ["Get Buyer ID", 3, 0, 0.0, 261.6666666666667, 258, 265, 262.0, 265.0, 265.0, 265.0, 0.36487472634395524, 0.40941509821211386, 0.15286255625152032], "isController": false}, {"data": ["Get Buyer id", 3, 0, 0.0, 273.3333333333333, 273, 274, 273.0, 274.0, 274.0, 274.0, 0.3633720930232558, 0.4488922828851744, 0.1451359238735465], "isController": false}, {"data": ["Post Buyer Order", 3, 0, 0.0, 287.6666666666667, 281, 292, 290.0, 292.0, 292.0, 292.0, 0.36354823073194376, 0.2502944361972855, 0.17751378453708191], "isController": false}, {"data": ["Get User", 3, 0, 0.0, 281.6666666666667, 260, 296, 289.0, 296.0, 296.0, 296.0, 0.6551648831622625, 0.3768477697095436, 0.27575787562786636], "isController": false}, {"data": ["Register", 3, 0, 0.0, 1340.3333333333333, 1128, 1627, 1266.0, 1627.0, 1627.0, 1627.0, 0.533997864008544, 0.3097604797080811, 0.25500483935564255], "isController": false}, {"data": ["Post Product", 3, 0, 0.0, 1026.0, 557, 1798, 723.0, 1798.0, 1798.0, 1798.0, 0.5992808629644426, 0.4038123002397123, 0.0], "isController": false}, {"data": ["Put Buyer id", 3, 3, 100.0, 267.6666666666667, 264, 274, 265.0, 274.0, 274.0, 274.0, 0.3637686431429611, 0.16483266642415423, 0.16270120953073844], "isController": false}, {"data": ["Get Seller Product", 3, 0, 0.0, 275.6666666666667, 275, 277, 275.0, 277.0, 277.0, 277.0, 0.860832137733142, 0.6195637553802009, 0.3598009325681492], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["404/Not Found", 3, 100.0, 7.6923076923076925], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 39, 3, "404/Not Found", 3, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Put Buyer id", 3, 3, "404/Not Found", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
