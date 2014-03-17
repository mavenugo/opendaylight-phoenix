define(
    [
        'jquery',
        'backbone',
        'underscore',
        'collections/FlowsCollection',
        'models/FlowsModel',
        'views/FlowView',
        'ext/text/text!templates/flows.html'
    ], function($, Backbone, _, FlowsCollection, FlowsModel, FlowView, FlowsTemplate) {
    var FlowsView = Backbone.View.extend({
        el: $("#main"),
        initialize: function() {
            var self = this;
            this.collection = new FlowsCollection();
            this.collection.url = "/controller/nb/v2/flowprogrammer/default";
            this.collection.fetch({
                success: function(coll, response) {
                    console.log("passed collection call to get flows", response);
                    self.render();
                }
            });
        },
        render: function() {
            console.log("FlowsView render called");
            var self = this;
            // populate collection with models
            var flowObjectsArr = self.collection.models[0].get('flowConfig');
            $(flowObjectsArr).each(function(index, flowObject) {
                var flowsModel = new FlowsModel({
                    id: flowObject.name,
                    installInHw: flowObject.installInHw,
                    name: flowObject.name,
                    node: {
                        id: flowObject.node.id,
                        type: flowObject.node.type
                    },
                    priority: flowObject.priority,
                    ingressPort: flowObject.ingressPort,
                    etherPort: flowObject.etherPort,
                    nwSrc: flowObject.nwSrc,
                    actions: flowObject.actions
                });
                self.collection.add(flowsModel);
            });
            var compiledTemplate = _.template(FlowsTemplate, {flows: self.collection.models[0].get('flowConfig')});
            $(this.el).append($(compiledTemplate).html());
        },
        events: {
            "click div#flowsTableButtonsContainer button": "handleFlowCrud",
            "click div#flowsContainer table tbody tr": "tableRowClicked"
        },
        handleFlowCrud: function(evt) {
            var self = this;
            var $button = $(evt.currentTarget);
            console.log("flows crud button clicked - ", $button.attr("id"));
            if($button.attr("id") == "createFlowButton") {
                self.flowView = self.flowView || new FlowView();
                self.flowView.parentListView = self;
                self.flowView.render();
            } else {
                // delete flow
                var id = $("div#flowsContainer tbody tr.selectedrow").attr("data-flowName");
                console.log("flow id to delete = " + id);
                var flowModel = self.collection.get(id);
                flowModel.setUrlRoot();
                flowModel.destroy({
                    dataType: "text",
                    success: function() {
                        console.log("delete succeeded!");
                        self.updateView();
                    },
                    error: function() {
                        console.log("delete error callback called");
                        self.updateView();
                    }
                });
            }
        },
        tableRowClicked: function(evt) {
            $("div#flowsContainer tbody tr.selectedrow").removeClass("selectedrow");
            var $tr = $(evt.currentTarget);
            $tr.addClass("selectedrow");
        },
        updateView: function() {
            $("#flowsContainer").remove();
            this.initialize();
        }
    });
    return FlowsView;
});