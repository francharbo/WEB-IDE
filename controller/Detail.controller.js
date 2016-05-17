/*global location */
sap.ui.define([
	"fr/xwan/aai/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"fr/xwan/aai/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, formatter, MessageBox, MessageToast, Filter, FilterOperator) {
	"use strict";
    var oPersonalizationDialog = null;
	var firstTime = true;
	var articles = null;
	var that = null;
	return BaseController.extend("fr.xwan.aai.controller.Detail", {

		formatter: formatter,

		onInit: function() {
			this._oResourceBundle = this.getResourceBundle();

			this.addRow = sap.ui.xmlfragment("fr.xwan.aai.view.fragment.AddRow", this);
			this.getView().addDependent(this.addRow);

			this.setModel(this.getOwnerComponent().getModel("articles"));
			var model = new sap.ui.model.json.JSONModel();
			model.loadData("/model/articles.json");
			that = this;
			model.attachRequestCompleted(function(){
			    articles = this.oData.articles;
			    that.getView().invalidate();
			});
			this.oTable = this.byId("treeTable");
			//this.oTable.setExpandFirstLevel(true);
			this.oTable.expandToLevel(3);
			this.oTable.attachToggleOpenState(function(){
			    that.getView().invalidate();
			});
			this.oTable.addEventDelegate({
			    onAfterRendering: function(){
			        that.cssRender();                         
			    }
			});
			//this.addEventListener("scroll",this.onAfterRendering);
			//oTable.bindRows("/articles");

		},
		onAfterRendering: function() {
		    //attach scroll event to scroll container
		    document.getElementById(this.byId("scrollTable").sId).onscroll = this.handleScroll;
		    sap.ui.getCore().byId("__xmlview1--treeTable-vsb").attachScroll(function(){
		        setTimeout(that.handleScroll,100);
		    });
		    //sap.ui.core.ScrollBar.prototype.onAfterRendering = this.handleScroll;
		    // put css first
			 if(firstTime && articles != null){
		            this.applyCssFirstTime();
		    }
		    else{
    		        this.cssRender();
		    }
		},

		filterAll: function(oEvent) {
			var sQuery = oEvent.oSource.getValue(); //oEvent.getParameter("query");

			if (sQuery) {
				//var f0 = new Filter("TreeRef", FilterOperator.Contains, sQuery);
				var f1 = new Filter("Reference", FilterOperator.Contains, sQuery);
				var f2 = new Filter("Designation", FilterOperator.Contains, sQuery);
				var f3 = new Filter("Quantite", FilterOperator.Contains, sQuery);
				var f4 = new Filter("TpsUnit", FilterOperator.Contains, sQuery);
				var f5 = new Filter("Temps", FilterOperator.Contains, sQuery);
				var f6 = new Filter("PUMatiere", FilterOperator.Contains, sQuery);
				var f7 = new Filter("PUMatMo", FilterOperator.Contains, sQuery);
				var f8 = new Filter("Matiere", FilterOperator.Contains, sQuery);
				var f9 = new Filter("MatMo", FilterOperator.Contains, sQuery);
				var f10 = new Filter("PUVente", FilterOperator.Contains, sQuery);
				var f11 = new Filter("VMatMo", FilterOperator.Contains, sQuery);
				var f12 = new Filter("C", FilterOperator.Contains, sQuery);
				var f13 = new Filter("A", FilterOperator.Contains, sQuery);
				var f14 = new Filter("Fam", FilterOperator.Contains, sQuery);

				var filters = new Filter([f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14]);
			}

			this.byId("treeTable").getBinding("rows").filter(filters);
		},

		handlePressCreate: function() {
			this.addRow.open();
		},

		handlePressCopy: function() {
			if (this.oTable.getSelectedIndex() === -1) {
				MessageToast.show(this.getI18nValue("messageToast.selectRow"));
			} else {
				MessageBox.information(this.getI18nValue("messageBox.copyPressed"));
			}
		},

		handlePressSave: function() {
			MessageBox.information(this.getI18nValue("messageBox.savePressed"));
		},
		
		handleScroll: function(){
		    that.cssRender();
		},

		closeDialog: function(evt) {
			evt.oSource.oParent.close();
			evt.getSource().close();
		},

		showPos: function() {

			var bCompact = !!this.getView().jQuery().closest(".sapUiSizeCompact").length;
			var selectedRowPos = this.oTable.getSelectedIndex();
			MessageBox.information(
				"Ligne sélectionnée : " + selectedRowPos, {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);

		},

		//ZSHENG
		onLink: function(oEvent) {
		    this.byId("infoPanel").setExpanded(true);
		    this.byId("inputFamille").setValue(oEvent.getSource().getText());
			this.byId("inputLabel").setValue(oEvent.getSource().data("desc"));
		    setTimeout( function(){		    
		        that.byId("detailPage").scrollToElement(that.byId("inputFamille"));
            },300);

		},

		openDialog: function(str) {
			// associate controller with the fragment
			oPersonalizationDialog = sap.ui.xmlfragment("fr.xwan.aai.view.fragment." + str, this);
			this.getView().addDependent(oPersonalizationDialog);
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oPersonalizationDialog);
			oPersonalizationDialog.open();
		},

		LineType: function() {
			this.openDialog("LineTypeDialog");
		},
		CostElement: function() {
			this.openDialog("CostElementDialog");
		},
		PriceDefinition: function() {
			this.openDialog("PriceDefinitionDialog");
		},

        applyCssFirstTime: function(){
            var cpt = 0;
	        var blueArray=[];
		    var rows = this.byId("treeTable").getRows();
		    var temparray = articles;
		    var temparraysup = articles;
		    var Size = 0;
	        var cptOneParent = 0;
	        while(typeof articles[cpt] !== "undefined"){
	            if(typeof articles[cpt].TreeRef !== "undefined"){
		            blueArray[Size] = "cyan";
		            temparray = articles[cpt];
		            var sizeArray = 0;
		            cptOneParent++;
		            var cptOneSubParent = 0;
		            while(typeof temparray[cptOneSubParent] !== "undefined"){
		                if(typeof temparray[cptOneSubParent].TreeRef !== "undefined"){
    		                blueArray[Size + 1] = "cyan";
    		                temparraysup = temparray;
    		                temparray = temparray[0];
        			        while(typeof temparray[sizeArray] !== "undefined"){
            			        if(typeof temparray[sizeArray] === "object"){
        			                sizeArray++;
            			        }
        			        }
        			        Size+=sizeArray  + 1;
        			        temparray=temparraysup;
        			        cptOneSubParent++;
    		            }
    		            else{
    		                cptOneSubParent++;
    		            }
		            }
		            cptOneSubParent++;
		            while(typeof temparray[sizeArray] === "object"){
    			                sizeArray++;
    			        }
			        Size+=sizeArray + 1;
		            cpt++;
		        }
		        else {
		            cpt++;
		        }
	        }
	        cpt =0;
	        rows.forEach(function(element){
	             var row = document.getElementById(element.sId);
	            if(typeof blueArray[cpt] !== "undefined"){
	               
	                row.className += " cyan";
	            }
	            cpt++;	
	            var cells = row.cells;
	            var spanUnit = cells[5].children[0];
				if(spanUnit.textContent === "ENS"){
				    var sHtml="Composant 1";
				    sHtml +="<span class=" +"marge" +">0.5</span>";
				    sHtml +="<span class=" +"marge"+">L</span><br>";
				    sHtml +="Composant 2";
				    sHtml +="<span class=" +"marge" +">1</span>";
				    sHtml +="<span class=" +"marge"+">UO</span>";
				    var oRichTooltip = new sap.ui.commons.RichTooltip({
            		text : sHtml
            	    });
    				cells = element.getCells();
    				var cellRef = cells[1];
    			    cellRef.setTooltip(oRichTooltip);
				}
	        });
	        firstTime = false;
        },
        
        cssRender:function(){
            	var rows = this.byId("treeTable").getRows();
              	rows.forEach(function(element) {
    				var row = document.getElementById(element.sId);

    				var cells = row.cells;
    				var cellRef = null;
    				var span1 = cells[1].children[0].children[0];
    				var span2 = cells[1].children[0].children[1];
    				var spanUnit = cells[5].children[0];
    				if(span1!=null){
    					if(span1.className.indexOf("sapUiTableTreeIcon")>-1 && span2.textContent !== ""){
    					    if(row.className.indexOf(" cyan") === -1){
    						    row.className += " cyan";
    					    }
    					}
    					else{
        				    if(row.className.indexOf(" cyan")>-1){
        				        row.className = row.className.replace(" cyan","");
        				    }
    			    	}
    				}
    				
    				if(spanUnit.textContent === "ENS"){
    				    
    				    var sHtml="Composant 1";
    				    sHtml +="<span class=" +"marge" +">0.5</span>";
    				    sHtml +="<span class=" +"marge"+">L</span><br>";
    				    sHtml +="Composant 2";
    				    sHtml +="<span class=" +"marge" +">1</span>";
    				    sHtml +="<span class=" +"marge"+">UO</span>";
    				    var TitleHtml = "Element";
    				    TitleHtml +="<span class=" +"marge" +">Qté</span>";
    				    TitleHtml +="<span class=" +"marge"+">Unité</span><br>";

    			    var oRichTooltip = new sap.ui.commons.RichTooltip({
                		text : sHtml
                	});
        				cells = element.getCells();
        				cellRef = cells[1];
        			    cellRef.setTooltip(oRichTooltip);
    				}
    				else{
    				    cells = element.getCells();
        				cellRef = cells[1];
        				if(typeof cells[1].getTooltip() !== "undefined"){
        				    cellRef.setTooltip(null);
        				}
    				}
    			});
        }
	});
});