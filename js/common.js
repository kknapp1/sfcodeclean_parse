$(function () {
    var maxNodes = 10;
    //var maxEdges = 10;

    // create an array with nodes
    var nodes = new vis.DataSet();

    // create an array with edges
    var edges = new vis.DataSet();

    // need a map to hold Classes and Id's
    var mapClassId = {};

    function parseNodesAndEdges(fileName){

        $.ajax({
            url:fileName, 
            dataType : 'json',
            async : false, // helpful if this is async so we can use the results of it asap
            success : function(data) { 
                console.log(data);

                // First Pass, create nodes but also the hashtable of class names to apexId's
                for (let index = 0; index < Math.min(maxNodes, data.classes.length); index++) {
                    const element = data.classes[index];
    
                    //filter nodes
                    // if (element.Name.match(/^Account*/)) {
                    //     console.log(element.Name + ' ' + element.ApexClassId);
                    //     AddNode(element);
                    // }
                    if (!element.Name.endsWith("Test")) {
                        console.log(element.Name + ' ' + element.ApexClassId);
                        AddNode(element);
                    }
                    //AddNode(element); // no filter.
                }
    
                // Second Pass. Create Edges b/c hopefully, all the classes are there.
                for (let index = 0; index < Math.min(maxNodes, data.classes.length); index++) {
                    const element = data.classes[index];
                    for (var key in element.ReferencedBy.classes) {
                        AddEdge(mapClassId[key], element.ApexClassId);
                    }
                }
                // data.nodes.forEach(function(n){
                //     for (var key in element.ReferencedBy.classes) {
                //         AddEdge(mapClassId[key], element.ApexClassId);
                //     }
                // AddEdge(mapClassId[key], element.ApexClassId);
                // })
            }
            });
    }

    function AddNode(codescan_element) {
        nodes.add({ id: codescan_element.ApexClassId, label: codescan_element.Name });
        mapClassId[codescan_element.Name] = codescan_element.ApexClassId;
    }

    function AddEdge(fromClass, toClass) {
        if (fromClass == undefined || toClass == undefined)
            return;
        edges.add({ from: fromClass, to: toClass, arrows: 'to' });
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
    }    

    //parseNodesAndEdges("datasets/SF Code Scan -INT.js");
    parseNodesAndEdges("datasets/simpleTest.js");
    $('#numNodes').text(nodes.length);
    $('#numEdges').text(edges.length);

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



    evalGraph(data);

});