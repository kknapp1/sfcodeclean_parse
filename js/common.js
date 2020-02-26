    
    var fileData;
    
    var maxNodes = 100;
    //var maxEdges = 10;

    // create an array with nodes
    nodes = new vis.DataSet();

    // create an array with edges
    var edges = new vis.DataSet();

    // need a map to hold Classes and Id's
    var mapNameToElement = {};
    mapIdToElement = {};

    // global reference to the graph after it's been generated
    var gGraph;

    $(function() {
        //initFileData("datasets/simpleTest.js");
        //initFileData("datasets/simpleNoCycle.js");
        //initFileData("datasets/sfcodeclean-kknapp.js");
        initFileData("datasets/RPv2DeployClasses.js");
    
        $( "#showGraph" ).click(function() {
            displayNetwork();        
        });
    
    
    });
    
    function initFileData(fileName){
        $.ajax({
            url:fileName, 
            dataType : 'json',
            async : false, // helpful if this is async so we can use the results of it asap
            success : function(data) { 
                fileData = data;
            }
        });
    }

    function displayNetwork() {
        // create a network
        var container = document.getElementById('mynetwork');

        // provide the data in the vis format
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {
            layout: {
                improvedLayout: true,
                hierarchical: false
            },
            physics: {
                enabled: false,
                solver: 'barnesHut',
                stabilization: {
                    enabled: true,
                    iterations: 10,
                    updateInterval: 100,
                    onlyDynamicEdges: false,
                    fit: true
                }
            }
        };
        // initialize your network!
        var network = new vis.Network(container, data, options);
        $( "#tabs" ).tabs( "option", "active", 1 );
    }



// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}