// Parses the given elements and build global nodes and edges vars
// This is useful because not all edges in the element data should be evaluated nor rendered
// b/c they may include nodes that aren't included
function parseNodesAndEdges(elementData){
    //console.log(data);
    resetNodedata();

    // First Pass, create nodes but also the hashtable of class names to apexId's
    for (let index = 0; (index < elementData.length) && (nodes.length < maxNodes); index++) {
        const element = elementData[index];

        //filter nodes
        // if (element.Name.match(/^Account*/)) {
        //     console.log(element.Name + ' ' + element.ApexClassId);
        //     AddNode(element);
        // }

        // Filter No test classes and no nodes that don't have other references. (for now)
        // if (!element.Name.startsWith("fflib") 
        //     && !element.Name.endsWith("Test") 
        //     && Object.keys(element.ReferencedBy.classes).length > 0) {
        //     //console.log(element.Name + ' ' + element.ApexClassId);
        //     AddNode(element);
        //     mapNameToElement[element.Name] = element;
        //     mapIdToElement[element.ApexClassId] = element;   
        // }
        AddNode(element);
        mapNameToElement[element.Name] = element;
        mapIdToElement[element.ApexClassId] = element;   
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

function resetNodedata(){
    nodes.clear();
    edges.clear();
}

function AddNode(codescan_element) {
    nodes.add({ id: codescan_element.ApexClassId, label: codescan_element.Name });
}

function AddLabelEdge(fromClass, toClass, label) {
    if (fromClass == undefined || toClass == undefined)
        return;
    edges.add({ from: fromClass, to: toClass, arrows: 'to', label: label });
}

function AddEdge(fromClass, toClass) {
    AddLabelEdge(fromClass, toClass, null);
}

function evalCycle(g, index){
    var c = graphlib.alg.findCycles(g)[index];
    // Look through the element map and build a new array of only these elements
    var arrCycleElements = [];
    for (let index = 0; index < c.length; index++){
        arrCycleElements.push(mapIdToElement[c[index]]);
    }
    // then re-evaluate
    parseNodesAndEdges(arrCycleElements);
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

// Build a graph and stats from the given nodes and edges
function evalGraph(){

    var g = new graphlib.Graph();          
    
    nodes.forEach(function(n){
        g.setNode(n.id, n.label);
    });

    edges.forEach(function(e){
        g.setEdge(e.from, e.to);
    });

    console.log("Cycles:");
    console.log(graphlib.alg.findCycles(g));    
    $('#numCycles').html(CyclesToHTMLString(graphlib.alg.findCycles(g), true));

    $( ".cycle" ).click(function() {
        evalCycle(g, $(this).attr('index'));
        displayNetwork();        
    });
                                        
    return g;
}  