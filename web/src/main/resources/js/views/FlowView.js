define(
        [
         'jquery',
         'backbone',
         'underscore',
         'models/FlowsModel',
         'collections/DevicesCollection',
         'ext/text/text!templates/flow.html'
        ], function($, Backbone, _, FlowsModel, DevicesCollection, FlowTemplate) {
    var FlowView = Backbone.View.extend({
        el: $("#main"),
        initialize: function() {
        },
        render: function() {
            // remove any existing form
            $("#flowFormContainer").remove();
            var self = this;
            var devicesCollection = new DevicesCollection();
            devicesCollection.fetch({
            	success: function(coll, response) {
                    var flowModel = self.flowModel;
                    var flowAction = "Edit";
                    if(!flowModel) {
                    	flowAction = "Create";
                    	flowModel = {
                        	get: function(arg1) {
                        		return "";
                        	}
                        };
                    }
                    var compiledTemplate = _.template(FlowTemplate, 
                    	{
                    		"flowAction": flowAction,
                    		"devices": response.nodeProperties,
                    		"flowModel": flowModel
                    	});
                    $(self.el).append($(compiledTemplate).html());
                }
            });
        },
        events: {
            "click div#flowFormButtonsContainer button": "handleFlowFormButtons"
        },
        handleFlowFormButtons: function(evt) {
            var self = this;
            var $button = $(evt.currentTarget);
            if($button.attr("id") == "saveFlowButton") {
                // create FlowModel and save it.
                var flowModel = new FlowsModel({
                    id: $("#flowName").val(),
                    installInHw: "true",
                    name: $("#flowName").val(),
                    node: {
                        id: $("#nodeId").val(),
                        type: $("#nodeType").val(),
                    },
                    ingressPort: $("#ingressPort").val(),
                    priority: $("#priority").val(),
                    etherType: $("#etherType").val(),
                    nwSrc: $("#nwSrc").val(),
                    actions: [$("#actions").val()]
                });
                flowModel.urlRoot="/controller/nb/v2/flowprogrammer/default/node/";
                flowModel.urlRoot += $("#nodeType").val() + "/";
                flowModel.urlRoot += $("#nodeId").val() + "/";
                flowModel.urlRoot += "staticFlow/";
                flowModel.save(null, {
                    // REST call does not return JSON. so we need this, else 
                    // the success callback wont get called
                    dataType: "text",
                    success: function(model, response) {
                        console.log("Flow Created.");
                        $("#flowFormContainer").remove();
                        self.parentListView.updateView();
                    }
                });

            }
        }
    });
    return FlowView;
});
