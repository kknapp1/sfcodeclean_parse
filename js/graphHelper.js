// Parses the given elements and build global nodes and edges vars
// This is useful because not all edges in the element data should be evaluated nor rendered
// b/c they may include nodes that aren't included
function parseNodesAndEdges(elementData, bFilterCommonNodes, bAddReferenceNodes, bResetNodeData){
    //console.log(data);
    //console.log("Include reference nodes? " + bAddReferenceNodes);
    if(bResetNodeData == undefined || bResetNodeData == true)
        resetNodedata();

    // First Pass, create nodes but also the hashtable of class names to apexId's
    for (let index = 0; (index < elementData.length) ; index++) {
        const element = elementData[index];

        if(bFilterCommonNodes){
            //Filter No test classes and no nodes that don't have other references. (for now)
            if (!element.Name.startsWith("fflib") 
                && !element.Name.endsWith("Test") 
                && element.Name != "RP_checkRecursive" ){
                //&& Object.keys(element.ReferencedBy.classes).length > 0){}
                
                //console.log(element.Name + ' ' + element.ApexClassId);
                if(!(element.Name in mapNameToElement)){ //only add if not in the array already
                    AddNode(element);
                    mapNameToElement[element.Name] = element;
                    mapIdToElement[element.ApexClassId] = element;   
                }
            }
        }
        else{
            if(!(element.Name in mapNameToElement)){ //only add if not in the array already
                AddNode(element);
                mapNameToElement[element.Name] = element;
                mapIdToElement[element.ApexClassId] = element;   
            }
    }

        if (bAddReferenceNodes){
            for (var key in element.ReferencedBy.classes) {
                if(!(key in mapNameToElement)){ //only add if not in the array already
                    // When we loop through the classes, we only have class names, not proper objects
                    // so, go find the object element in the original TableData array that matches the name
                    el = fileData.classes.filter(x => x.Name === key);
                    if(el[0].Name == key){ // did we fetch the correct thing? or anything?
                        AddNode(el[0]);
                        mapNameToElement[el[0].Name] = el[0];
                        mapIdToElement[el[0].ApexClassId] = el[0];   
                    }        
                }
            }
        }
    }

    // Second Pass. Create Edges b/c hopefully, all the classes are there.
    for (var el in mapIdToElement) {
        const element = mapIdToElement[el];  
        if(element.ReferencedBy != undefined)                 
            for (var key in element.ReferencedBy.classes) {
                if(key in mapNameToElement) // don't add edges to nodes that aren't here
                    AddEdge(mapNameToElement[key].ApexClassId, element.ApexClassId);                        
            }
    }
}

function resetNodedata(){
    nodes.clear();
    edges.clear();
    flatPath.clear();
    mapNameToElement = [];
    mapIdToElement = [];
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

// basically the same as building a graph, just changing the output format
function exportDataAsCSV(){
    var nodeCSV;
    nodeCSV = "Id;Label\n";
    
    nodes.forEach(function(n){
        nodeCSV += n.id + ";" + n.label + "\n";
    });

    var edgeCSV;       
    edgeCSV = "Source;Target\n"
    edges.forEach(function(e){
        edgeCSV += e.from + ";" + e.to + "\n";
    });

    // setup file downloads
    download(nodeCSV,"nodes.csv","text/plain");
    download(edgeCSV,"edges.csv","text/plain");
}

// basically the same as building a graph, just changing the output format
function exportDataAsDOT(){
    var outFile;
    outFile = "digraph {\n"; //opening line
    
    edges.forEach(function(e){
        outFile += mapIdToElement[e.from].Name + " -> " + mapIdToElement[e.to].Name + "\n";
        
    });

    outFile += "}\n"; //closing line
    download(outFile,"graph.gv","text/plain");
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

function AddNodeAndParents(element){
    var retval = [];
    retval.push(element);
    for (var child in element.ReferencedBy.classes) {
        retval.push(AddNodeAndParents(mapNameToElement[child]));                   
    }
    return retval;
}

var flatPath = new vis.DataSet();
var possibleCycle = new vis.DataSet();
function evalChildren(elementData){
    parseNodesAndEdges(fileData.classes, true); //setup all the datasets by parsing the full list of classes

    // now, figure out just the parent(s) that we need
    for (let index = 0; (index < elementData.length); index++) {
        const element = elementData[index];
        AddNodeAndChildren(element);
    }

    // And rebuild the graph
    var arrParents = [];
    flatPath.forEach(function (item) {
        arrParents.push(item);
    });
    parseNodesAndEdges(arrParents, true);
}

function AddNodeAndChildren(element){
    if (element == undefined)
        return;

    // if the dataset already contain it, then we're done
    if(DataSetContains(flatPath,element)){
        return;
    }
    
    // Otherwise, add the element and its children
    flatPath.add(element);    

    // find all the edges that are from this node
    // the 'to' id's are the children
    var children = edges.get({
        filter: function (item) {
          return (item.from == element.ApexClassId);
        }
      });

    for (let index = 0; index < children.length; index++) {
        AddNodeAndChildren(mapIdToElement[children[index].to]);              
    }
    return;
}

function DataSetContains(ds, el){
    return ds.get({
        filter: function (item) {
          return (item.ApexClassId == el.ApexClassId);
        }
      }).length > 0;
}

