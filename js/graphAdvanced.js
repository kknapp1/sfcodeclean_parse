
// Requires graphHelper.js loaded first
var depthlevel = 0;

// in order to find children, we should start with root nodes and then 
// walk down to see what they reference.

// foreach root node (display root)
//  if haschildren increase depth
//   foreach child (display child and )
//  decrease depth
var advancedPath = new vis.DataSet();
function bigStats(){
    parseNodesAndEdges(fileData.classes, true); //setup all the datasets by parsing the full list of classes
    advancedPath.clear();

    var roots = nodes.get({
        filter: function (item) {
          return (mapIdToElement[item.id].IsReferenced == false);
        }
      });

    for (let i = 0; i < roots.length; i++) {
        var rootEl = roots[i];
        divwriteln("root node: " + rootEl.label);

        AddNodeAndChildrenAdvanced(mapIdToElement[rootEl.id], null);
        
        divwriteln("------------------------------------"); //end of root node   
    }

    function AddNodeAndChildrenAdvanced(element, startRoot){
        if (element == undefined)
            return;

        // first time into the function
        if  (startRoot == null)
            startRoot = element;
        else if (element == startRoot){
            // then we have a cycle!
            divwriteln(element.Name + "***");
        }

    
        // if the dataset already contain it, then we're done
        if(DataSetContains(advancedPath,element)){
            depthlevel--;
            return;
        }
        else
            divwriteln(element.Name);
   
        // Otherwise, add the element and its children
        advancedPath.add(element);    
    
        // find all the edges that are from this node
        // the 'to' id's are the children
        var children = edges.get({
            filter: function (item) {
              return (item.from == element.ApexClassId);
            }
          });
    
        for (let index = 0; index < children.length; index++) {
            depthlevel++;
            AddNodeAndChildrenAdvanced(mapIdToElement[children[index].to], startRoot);              
        }
        depthlevel--;
        return;
    }

}

function divwriteln(msg){
    var m = $("#advancedGraph").html();
    for (let d=0; d<depthlevel; d++)
        m += "-";
    m += msg + "<br />";
    $("#advancedGraph").html(m);
}