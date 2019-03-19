$( function() {
    // DataTables setup
    var table = $('#classTable').DataTable( {
        data: fileData.classes,
        columns: [
            { data: "ApexClassId", visible:false },
            { title: "Name", data: "Name" },
            { title: "IsReferenced", data: "IsReferenced"}
        ]
    } );
    $('#classTable tbody').on( 'click', 'tr', function () {
        $(this).toggleClass('selected');
    } );

    // Send the Button Click to the Eval Function
    $('#evalNodes').click( function () {
        //alert( table.rows('.selected').data().length +' row(s) selected' );
        console.log(table.rows('.selected').data());
        if (table.rows('.selected').data().length > 0){
            parseNodesAndEdges(table.rows('.selected').data());
            $('#numNodes').text(nodes.length);
            $('#numEdges').text(edges.length);
            gGraph = evalGraph(nodes,edges);
            $('#showGraph').removeAttr('disabled');
        }

    } );
    // end DataTables stuff    
} );    
