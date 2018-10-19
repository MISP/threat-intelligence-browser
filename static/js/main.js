var container = document.getElementById('network');
var mapping_name_to_uuid = new Map();
var show_complete_label = $('switch_show').is(':checked');

var network;
var root_id = $('#network').data('rootid');

function init() {
    network = $(container).network({}, network_options);
    register_listener();
    if (root_id == 0) {
        $('#modal-add-root').modal('show');
    } else {
        fetch_and_draw_info(root_id, function() {
            fetch_and_draw_signing(root_id);
        });
    }
    $('.control-panel').draggable({ handle: ".card-header" });
}

function loadAll(callback) {
    $.ajax({
        url: '/galaxy/getAll/',
        dataType: 'json',
        type: 'get',
        contentType: 'application/json',
        processData: false,
        beforeSend: function(XMLHttpRequest) {
            toggleLoading(true, 'Fetching all data', '');
        },
        success: function(data, textStatus, jQxrh) {
            toggleLoading(true, 'Drawing...', '');
            data.nodes.forEach(function(node, i) {
                generic_node_add(node);
            });
            data.links.forEach(function(links) {
                generic_link_add(links);
            });
        },
        error: function(jQxrh, textStatus, errorThrown) {
            console.log(errorThrown);
        },
        complete: function() {
            toggleLoading(false);

            if (callback !== undefined) {
                callback();
            }
        }
    });
}


function fetch_and_draw(url, id, callback) {
    $.ajax({
        url: url+id,
        dataType: 'json',
        type: 'get',
        contentType: 'application/json',
        processData: false,
        beforeSend: function(XMLHttpRequest) {
            toggleLoading(true, 'Fetching info', '');
        },
        success: function(data, textStatus, jQxrh) {
            toggleLoading(true, 'Drawing...', '');
            data.nodes.forEach(function(node, i) {
                generic_node_add(node);
            });
            data.links.forEach(function(links) {
                generic_link_add(links);
            });
        },
        error: function(jQxrh, textStatus, errorThrown) {
            console.log(errorThrown);
        },
        complete: function() {
            toggleLoading(false);

            if (callback !== undefined) {
                callback();
            }
        }
    });
}


function generic_node_construct(config) {
    var node = {
        id: config.uuid,
    }

    node.name = get_node_name(config);
    node.label = generate_node_label(config.uuid, node.name, config.group);

    node = $.extend(node, config);
    return node;
}

// inverse from and to, as we want to see who signed the key
function generic_link_construct(config) {
    var link = {
        id: config.from+':'+config.to,
        from: config.from,
        to: config.to,
        //width: 3,
        //arrows: {
        //    arrowStrikethrough: false,
        //    to: {enabled: true, type:'arrow'}
        //}
    }
    link = $.extend(link, config);
    return link;
}

function generate_node_label(uuid, name, group) {
    return name;
}

function get_node_name(config) {
    var name;
    if (config.group === 'galaxy') {
        name = config.name;
    } else if (config.group === 'cluster') {
        name = config.value;
    } else {
        name = config.name;
    }
    return name;
}

function generic_node_add(nodeConfig) {
    var node = generic_node_construct(nodeConfig);
    var rootUUID = nodeConfig.uuid;
    var addedClusters = nodeConfig.values !== undefined ? nodeConfig.values.length : [];

    if (nodeConfig.group === 'galaxy' && addedClusters > 0) {
        nodeConfig.values.forEach(function(node) {
            generic_node_add(node);
            var link = {
                from: rootUUID,
                to: node.uuid
            }
            generic_link_add(link);
        });
    }

    mapping_name_to_uuid.set(escapehtml(nodeConfig.name), nodeConfig.uuid);
    network.add_nodes([node]);
}

function generic_link_add(config) {
    var link = generic_link_construct(config);
    network.add_links([link]);
}

function toggleLoading(show, text, val) {
    if (show) {
        $('.loadingCustomText').text(text+' '+val);
        $('.loading').show();
        $('.loadingBG').show();
    } else {
        $('.loadingCustomText').text('');
        $('.loading').hide();
        $('.loadingBG').hide();
    }
}

function blur_typeahead() {
        if ($('#key-typeahead').is(":focus")) {
                $('#key-typeahead').blur();
        }
}

function get_typeaheadData_search() {
    var txt = [];
    network.nodes.forEach(function(node) {
        txt.push(escapehtml(node.name));
        txt.push(node.uuid);
    })
    return txt;
}

function get_typeaheadData_modal_search(process) {
    if (typeaheadData_modal === undefined) {
        $.ajax({
            url: '/galaxy/getName/',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify({}),
            processData: false,
            beforeSend: function(XMLHttpRequest) {
                //toggleLoading(true, 'Retreiving info for key', rootID);
            },
            success: function(data, textStatus, jQxrh) {
                //toggleLoading(false);
                typeaheadData_modal = [];
                data.forEach(function(galaxy) {
                    typeaheadData_modal.push({
                        name: escapehtml(galaxy.name),
                        uuid: galaxy.uuid
                    });
                });
                process(typeaheadData_modal);
            },
            error: function(jQxrh, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    } else {
        process(typeaheadData_modal);
    }
}

function show_table_modal(data) {
    var dataset = [];
    for (var k in data) {
        for (var mail of data[k]) {
            dataset.push([k, mail]);
        }
    }

    $('#modal-table-info').modal('show');
    $('#table-choose').DataTable( {
        data: dataset,
        columns: [
            { title: "Fingerprint" },
            { title: "email" }
        ]
    });
}

var entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
};
function escapehtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}

function register_listener() {
    var that = this;

    $('#key-typeahead').typeahead(typeaheadOption);
    $('#modal-key-typeahead').typeahead(typeaheadOption_modal);

    $('#modal-btn-search').click(function() {
        var galaxy = $('#modal-key-typeahead').val();
        var payload = { value: galaxy };
        $.ajax({
            url: '/lookup/',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            processData: false,
            beforeSend: function(XMLHttpRequest) {
                toggleLoading(true, 'Fetching information', '');
            },
            success: function(data, textStatus, jQxrh) {
                toggleLoading(false);

                $('#modal-add-root').modal('hide');
                show_table_modal(data);
                //$('#modal-key-typeahead').val('');
            },
            error: function(jQxrh, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    });

    $('#modal-btn-loadall').click(function() {
        loadAll(function() {
            $('#modal-add-root').modal('hide');
        });
    })

    $('body').keydown(function(evt) {
        if (evt.keyCode == 27) { // <ESC>
            blur_typeahead(evt);
        }

        if ($('#key-typeahead').is(":focus")) {
            return;
        }
        switch(evt.originalEvent.keyCode) {
            case 88: // x
                var selected = that.network.visNetwork.getSelectedNodes()[0];
                fetch_and_draw('/galaxy/getClusters/', selected, function() {
                    network.visNetwork.unselectAll();
                });
                break;

            case 70: // f
                if (evt.shiftKey) {
                    // set focus to search input
                    $('#key-typeahead').focus();
                    $('#key-typeahead').text('');
                    evt.preventDefault(); // avoid writting a 'F' in the input field
                }
                break;

            default:
                break;
        }
    });

    network.visNetwork.on('click', function(evt) {
        blur_typeahead();
    });
    
    $('#switch_show').change(function(evt) {
        var checked = $(this).is(':checked');
        show_complete_label = checked;
        redraw_network();
    });
}

$(document).ready(function() {
    init();
});
