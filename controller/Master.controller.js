/*global history */
sap.ui.define([
	"fr/xwan/aai/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"fr/xwan/aai/model/formatter",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, Filter, FilterOperator, GroupHeaderListItem, Device, formatter, MessageBox) {
	"use strict";

	return BaseController.extend("fr.xwan.aai.controller.Master", {

		formatter: formatter,
		
		onInit: function() {
			
			this.setModel(this.getOwnerComponent().getModel("devis"));
			var oList = this.byId("list");
			oList.bindElement("/devis");
			
		}

	});
});