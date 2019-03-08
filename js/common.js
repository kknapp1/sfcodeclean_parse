    var maxNodes = 10;
    //var maxEdges = 10;

    // create an array with nodes
    nodes = new vis.DataSet();

    // create an array with edges
    var edges = new vis.DataSet();

    // need a map to hold Classes and Id's
    var mapNameToElement = {};
    mapIdToElement = {};

    function parseNodesAndEdges(fileName){
        $.ajax({
            url:fileName, 
            dataType : 'json',
            async : false, // helpful if this is async so we can use the results of it asap
            success : function(data) { 
                //console.log(data);

                // First Pass, create nodes but also the hashtable of class names to apexId's
                for (let index = 0; (index < data.classes.length) && (nodes.length < maxNodes); index++) {
                    const element = data.classes[index];
    
                    //filter nodes
                    // if (element.Name.match(/^Account*/)) {
                    //     console.log(element.Name + ' ' + element.ApexClassId);
                    //     AddNode(element);
                    // }

                    // Filter No test classes and no nodes that don't have other references. (for now)
                    if (!element.Name.startsWith("fflib") 
                        && !element.Name.endsWith("Test") 
                        && Object.keys(element.ReferencedBy.classes).length > 0) {
                        //console.log(element.Name + ' ' + element.ApexClassId);
                        AddNode(element);
                        mapNameToElement[element.Name] = element;
                        mapIdToElement[element.ApexClassId] = element;   
                    }
                    //AddNode(element); // no filter.
                }
    
                // Second Pass. Create Edges b/c hopefully, all the classes are there.
                for (var el in mapIdToElement) {
                    const element = mapIdToElement[el];                   
                    for (var key in element.ReferencedBy.classes) {
                        if(key in mapNameToElement) // don't add edges to nodes that aren't here
                            AddEdge(mapNameToElement[key].ApexClassId, element.ApexClassId);                        
                    }
                }
            }
            });

    }

    function AddNode(codescan_element) {
        nodes.add({ id: codescan_element.ApexClassId, label: codescan_element.Name });
    }

    function AddEdge(fromClass, toClass) {
        if (fromClass == undefined || toClass == undefined)
            return;
        edges.add({ from: fromClass, to: toClass, arrows: 'to' });
    }

    // self-referencing classes are returned as cycles. set param to true to hide those
    function CyclesToHTMLString(cyc, hideSelfReference){
        retval = "";
        for (let index = 0; index < cyc.length; index++) {
            if (!hideSelfReference || cyc[index].length > 1){
                retval += "<div class='cycle' index=" + index + ">";
                for (let j = 0; j < cyc[index].length; j++){
                    retval += mapIdToElement[cyc[index][j]].Name;
                    retval += ",";
                }
                retval += "</div>";
            }
        }
        return retval;
    }

    // graph stuff after this
    function evalGraph(data){

        var g = new graphlib.Graph();          
        
        data.nodes.forEach(function(n){
            g.setNode(n.id, n.label);
        });

        data.edges.forEach(function(e){
            g.setEdge(e.from, e.to);
        });

        console.log("Cycles:");
        console.log(graphlib.alg.findCycles(g));    
        $('#numCycles').html(CyclesToHTMLString(graphlib.alg.findCycles(g), true));
                                         
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
                improvedLayout: true
            },
            physics: {
                enabled: true,
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
    }

$(function() {
    //parseNodesAndEdges("datasets/SF Code Scan -INT.js");
    parseNodesAndEdges("datasets/simpleTest.js");
    //parseNodesAndEdges("datasets/sfcodeclean-kknapp.json");
    $('#numNodes').text(nodes.length);
    $('#numEdges').text(edges.length);


    evalGraph(data);

    $( ".cycle" ).click(function() {
        //$( this ).slideUp();
        displayNetwork();
    });

});