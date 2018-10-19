var network_options = {
    edges: {
            length: 200
    },
    groups: {
        galaxy: {
            shape: 'box',
            shadow: {
                enabled: true,
                size: 3,
                x:3, y:3
            },
            color: {
                background:'orange',
                border:'black',
                highlight: {
                    border:'red',
                    background:'orange',
                }
            }
        },
        keyMult: {
            shape: 'box',
            shadow: {
                enabled: true,
                size: 3,
                x:3, y:3
            },
            font: { color: 'white' },
            color: {
                background:'#0198E1',
                border:'black',
                highlight: {
                    background:'#0198E1',
                    border:'red'
                }
            }
        },
        cluster: {
            shape: 'box',
            shadow: {
                enabled: true,
                size: 3,
                x:3, y:3
            },
            color: {
                background:'LightGray',
                border:'black',
                highlight: {
                    background:'LightGray',
                    border:'red'
                }
            }
        },
        link: {

        }
    },
    physics: {
        solver: 'barnesHut',
        barnesHut: {
            gravitationalConstant: -5000,
            centralGravity: 0.3,
            springLength: 70,
            springConstant: 0.02,
            damping: 0.19,
            avoidOverlap: 0.6
        },
        repulsion: {
            centralGravity: 0.2,
            springLength: 250,
            springConstant: 0.05,
            nodeDistance: 140,
            damping: 0.09
        },
        forceAtlas2Based: {
            gravitationalConstant: -50,
            centralGravity: 0.01,
            springConstant: 0.08,
            springLength: 130,
            damping: 0.45,
            avoidOverlap: 0.65
        },
    }
};

var typeaheadOption = {
    source: function (query, process) {
    	var typeaheadData = get_typeaheadData_search();
    	process(typeaheadData);
    },
    updater: function(value) {
            var uuid = mapping_name_to_uuid.get(value);
            if (uuid) {
                network.highlight_node(uuid);
                network.visNetwork.focus(uuid, {animation: true, scale: 1});
    	        $("#key-typeahead").blur();
            }
        
    },
    autoSelect: true
}

var typeaheadData_modal;
var typeaheadOption_modal = {
    source: function (query, process) {
         get_typeaheadData_modal_search(process);
    },
    updater: function(selected) {
        //window.location = "/"+selected.fp;
        fetch_and_draw('/get/', selected.uuid);
        $('#modal-add-root').modal('hide');
    },
    autoSelect: true
}
