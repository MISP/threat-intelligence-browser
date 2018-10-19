(function(factory) {
        "use strict";
        if (typeof define === 'function' && define.amd) {
            define(['jquery'], factory);
        } else if (window.jQuery && !window.jQuery.fn.Network) {
            factory(window.jQuery);
        }
    }
    (function($) {
        'use strict';

        var Network = function(container, data, options) {
            var that = this;
            this.container = container;
            this._default_options = {
            };
            this.options = $.extend({}, this._default_options, options);
            this.nodes = new vis.DataSet();
            this.links = new vis.DataSet();
            var data = { nodes: this.nodes, edges: this.links };
            this.visNetwork = new vis.Network(container[0], data, this.options);

            var width = container.width();
            var height = container.height();

            this.update();

        }

        Network.prototype = {
            constructor: Network,

            update: function() {

                var that = this;

            },

            add_nodes: function(nodes) {
                var that = this;
                nodes.forEach(function(node) {
                    that.nodes.add(node);
                });
                this.update();
            },

            add_links: function(links) {
                var that = this;
                links.forEach(function(link) {
                    that.links.add(link);
                });
                this.update();
            },

            highlight_node: function(id) {

            },

            nodeClick: function(d) {
            },

            nodeover: function(d) {
            },

            nodeout: function(d) {
            },

            dragstarted: function(d) {
                if (!d3.event.active) this.simulation.alphaTarget(.03).restart();
                d.fx = d.x;
                d.fy = d.y;
            },

            dragged: function(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            },

            dragended: function(d) {
                if (!d3.event.active) this.simulation.alphaTarget(.03);
                d.fx = null;
                d.fy = null;
            },

            util: {

            }
        },

        $.network = Network;
        $.fn.network = function(data, options) {
            var pickerArgs = arguments;
            var network;

            this.each(function() {
                var $this = $(this),
                    inst = $this.data('network'),
                    options = ((typeof option === 'object') ? option : {});
                if ((!inst) && (typeof option !== 'string')) {
                    network = new Network($this, data, options);
                    $this.data('network', network);
                } else {
                    if (typeof option === 'string') {
                        inst[option].apply(inst, Array.prototype.slice.call(pickerArgs, 1));
                    }
                }
            });
            return network;
        }
        $.fn.network.constructor = Network;

    })
);
