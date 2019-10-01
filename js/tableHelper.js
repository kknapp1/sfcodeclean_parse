$( function() {
    // DataTables setup
    var table = $('#classTable').DataTable( {
        paging : true,
        data: fileData.classes,
        columns: [
            { data: null , defaultContent: '', orderable: false, className: 'select-checkbox' },
            { data: "ApexClassId", visible:false, orderable: false },
            { title: "Name", data: "Name" },
            { title: "IsReferenced", data: "IsReferenced"}
        ],
        order: [[ 2, "asc" ]],
        lengthMenu: [[10, 50, 100, -1], [10, 50, 100, "All"]],        
        select: {
            style:    'os',
            selector: 'td:first-child'
        },
        buttons: [
            'selectAll',
            'selectNone'
        ],
        language: {
            buttons: {
                selectAll: "Select all items",
                selectNone: "Select none"
            }
        },
        initComplete: function () {
            this.api().columns().every( function () {
                var column = this;
                var select = $('<select><option value=""></option></select>')
                    .appendTo( $(column.footer()).empty() )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );
 
                        column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                    } );
 
                column.data().unique().sort().each( function ( d, j ) {
                    select.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            } );
        }        
    } );
    // $('#classTable tbody').on( 'click', 'tr', function () {
    //     $(this).toggleClass('selected');
    // } );

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
    $('#evalChildren').click( function () {
        //alert( table.rows('.selected').data().length +' row(s) selected' );
        console.log(table.rows('.selected').data());
        if (table.rows('.selected').data().length > 0){
            evalChildren(table.rows('.selected').data());            
            $('#numNodes').text(nodes.length);
            $('#numEdges').text(edges.length);
            gGraph = evalGraph(nodes,edges);
            $('#showGraph').removeAttr('disabled');
        }
    } );
    $('#exportToCSV').click( function () {
        console.log(table.rows('.selected').data());
        if (table.rows('.selected').data().length > 0){
            parseNodesAndEdges(table.rows('.selected').data());
            exportDataAsCSV();
            $('#showGraph').removeAttr('disabled');
        }
    } );

    // end DataTables stuff    
} );    
