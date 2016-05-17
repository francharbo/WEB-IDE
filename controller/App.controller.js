sap.ui.define([
	"fr/xwan/aai/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, MessageBox, MessageToast, Filter, FilterOperator) {
	"use strict";
var that;
var counter;
var copy;
var mod;
var Level;
	return BaseController.extend("fr.xwan.aai.controller.App", {

		onInit: function() {
			
			this.setModel(this.getOwnerComponent().getModel("devis"));
			var oList = this.byId("list");
			oList.bindElement("/devis");
			
			this.actionSheet = sap.ui.xmlfragment("fr.xwan.aai.view.fragment.ActionSheet", this);
			this.getView().addDependent(this.actionSheet);
			
			var oViewModel,
				fnSetAppNotBusy,
				oListSelector = this.getOwnerComponent().oListSelector,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0,
				itemToSelect: null,
				addEnabled: false

			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			this.getOwnerComponent().getModel().metadataLoaded()
				.then(fnSetAppNotBusy);

			// Makes sure that master view is hidden in split app
			// after a new list entry has been selected.
			oListSelector.attachListSelectionChange(function() {
				this.byId("idAppControl").hideMaster();
			}, this);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			that = this;
			this.i18n = this.getResourceBundle();

			this.addRow = sap.ui.xmlfragment("fr.ar.aai.view.fragment.AddRow", this);
			this.getView().addDependent(this.addRow);

			this.rowType = sap.ui.xmlfragment("fr.ar.aai.view.fragment.RowType", this);
			this.getView().addDependent(this.rowType);

			this.costElement = sap.ui.xmlfragment("fr.ar.aai.view.fragment.CostElement", this);
			this.getView().addDependent(this.costElement);

			this.priceDefinition = sap.ui.xmlfragment("fr.ar.aai.view.fragment.PriceDefinition", this);
			this.getView().addDependent(this.priceDefinition);

			this.inputDialog = sap.ui.xmlfragment("fr.ar.aai.view.fragment.InputDialog", this);
			this.getView().addDependent(this.inputDialog);

			this.getView().setModel(this.getOwnerComponent().getModel("articles"));
			this.oTable = this.byId("tab");

			var model = new sap.ui.model.json.JSONModel();
			model.loadData("/webapp/model/articles.json");
			that = this;
			model.attachRequestCompleted(function() {
				that.getView().invalidate();
			});
			this.oTable.attachToggleOpenState(function() {
				that.oTable.invalidate();
			});
			this.oTable.addEventDelegate({
				onAfterRendering: function() {
					that.cssRender();
				}
			});
			this.oObjectPageLayout = this.getView().byId("ObjectPageLayout");
		},
		
		handlePressConfiguration: function(oEvent) {
			var oItem = oEvent.getSource();
			var oShell = this.getView().byId("shellHome");
			var bState = oShell.getShowPane();
			oShell.setShowPane(!bState);
			oItem.setShowMarker(!bState);
			oItem.setSelected(!bState);
		},
		
		handlePressUser: function(oEvent) {
			var oButton = oEvent.getSource();
			this.actionSheet.openBy(oButton);
		},
		
		_filterAll: function(oEvent) {
			var sQuery = oEvent.oSource.getValue(); //oEvent.getParameter("query");

			if (sQuery) {
				//var f0 = new Filter("TreeRef", FilterOperator.Contains, sQuery);
				var f1 = new Filter("Reference", FilterOperator.Contains, sQuery);
				var f2 = new Filter("Designation", FilterOperator.Contains, sQuery);
				var f3 = new Filter("Quantite", FilterOperator.Contains, sQuery);
				var f4 = new Filter("UniteQte", FilterOperator.Contains, sQuery);
				var f5 = new Filter("CoutUnitaire", FilterOperator.Contains, sQuery);
				var f6 = new Filter("CoutTotal", FilterOperator.Contains, sQuery);
				var f7 = new Filter("PrixVente", FilterOperator.Contains, sQuery);
				var f8 = new Filter("Manuel", FilterOperator.Contains, sQuery);

				var filters = new Filter([f1, f2, f3, f4, f5, f6, f7, f8]);
			}

			this.oTable.getBinding("rows").filter(filters);
			this.cssRender();
		},

		handlePressExpandAll: function() {
			this.oTable.expandToLevel(2);
			this.oTable.invalidate();
		},

		handlePressCollapseAll: function() {
			this.oTable.collapseAll();
			this.oTable.invalidate();
		},

		handlePressCreate: function() {
			this.addRow.open();
		},

		handlePressCopy: function() {
			//if (this.oTable.getSelectedItem() == null) {
			if (this.oTable.getSelectedIndex() === -1) {
				MessageToast.show(this.i18n.getText("messageToast.selectRow"));
			} else {
				//get data selected
				var row = that.oTable.getRows()[that.oTable.getSelectedIndex()];
				row = document.getElementById(row.sId);
				var cells = row.cells;
				var text = cells[1].children[0].children[1].textContent;
				var modSelect = that.oTable.getModel().getProperty("/ListeArticles");
				if (text !== "") {
					var numSection = parseInt(text.substring(0, 1), 10) - 1;
					if (text.indexOf('.') === -1) {
						copy = modSelect[numSection];
					}
					else {
					    var numSousSection = parseInt(text.substring(2,3),10) - 1;
					    copy = modSelect[numSection].SousCategories[numSousSection];
					}
				} else {
					var index = that.oTable.getSelectedIndex() - 1;
					var supRow = that.oTable.getRows()[index];
					supRow = document.getElementById(supRow.sId);
					var supcells = supRow.cells;
					var suptext = supcells[1].children[0].children[1].textContent;
					while (suptext === "") {
						supRow = that.oTable.getRows()[--index];
						supRow = document.getElementById(supRow.sId);
						supcells = supRow.cells;
						suptext = supcells[1].children[0].children[1].textContent;
					}
					var supSectionNum = parseInt(suptext.substring(0, 1), 10) - 1;
					copy = modSelect[supSectionNum].Lignes[that.oTable.getSelectedIndex() - 1];
				}

			}
		},
		handlePressPaste: function() {
			var model = that.oTable.getModel().getProperty("/ListeArticles");
			var paste = jQuery.extend(true,{}, copy);
			if (that.oTable.getSelectedIndex() === -1) {
				//create new chapter
				var numNewSection = model.length + 1;
				var line = numNewSection - 1;
				paste.Id = paste.Id.replace(copy.Id.substring(0, 1), numNewSection.toString());
				if (typeof paste.SousCategories !== "undefined") {
					for (var i = 0; i < paste.SousCategories.length; i++) {
						paste.SousCategories[i].Id = paste.SousCategories[i].Id.replace(copy.Id.substring(0, 1), numNewSection.toString());
					}
				}
				model[model.length] = paste;
				that.oTable.getModel().setProperty("/ListeArticles/", model);
			} else {

				//paste a line
				var lineSelected = that.oTable.getRows()[that.oTable.getSelectedIndex()];
				lineSelected = document.getElementById(lineSelected.sId);
				var text = lineSelected.cells[1].children[0].children[1].textContent;
				var numSection = parseInt(text.substring(0, 1), 10) - 1;
				if (typeof paste.Id === "undefined") {
					var property = "/ListeArticles/" + numSection + "/Lignes";
					var modDest = that.oTable.getModel().getProperty(property);
					if (typeof modDest === "undefined") {
						//either subsection or section with subsection
						if (isNaN(parseInt(text.substring(2, 3), 10))) {
							MessageToast.show(this.i18n.getText("messageToast.selectSectionLine"));
						} else {
							var numSousSection = parseInt(text.substring(2, 3), 10) - 1;
							property = "/ListeArticles/" + numSection + "/SousCategories/" + numSousSection + "/Lignes";
							modDest = that.oTable.getModel().getProperty(property);
						}
					}

					
				} else {
					//paste a service
					modDest = that.oTable.getModel().getProperty("/ListeArticles/" + numSection + "/SousCategories");
					if(typeof modDest === "undefined"){
					    MessageToast.show(this.i18n.getText("messageToast.selectSection"));
					    return;
					}
					var numNewSubSection = modDest.length + 1;
					property = "/ListeArticles/" + numSection + "/SousCategories";
					numSection += 1;
					if(isNaN(parseInt(paste.Id.substring(2,3),10)))
					{
					    var name = paste.Id.substring(2);
					    var num = numSection  + "." + numNewSubSection;
					    paste.Id = num + " " + name;
					    if(typeof paste.SousCategories !== "undefined"){
					        MessageToast.show(this.i18n.getText("messageToast.tooDeep"));
					        return;
					        /*var cpt = 0;
					        for(var p in paste.SousCategories){
					            name = paste.SousCategories[cpt].Id.substring(4);
					            num = cpt + 1;
        					    paste.SousCategories[cpt].Id = numSection + "." + numNewSubSection + "." + num + " " + name;
        					    
					        }*/
					    }
					}else{
					    paste.Id = paste.Id.replace(paste.Id.substring(0, 3),numSection  + "." + numNewSubSection);
					}
					
					
				}
				modDest[modDest.length] = paste;

			    that.oTable.getModel().setProperty(property, modDest);
			}
			that.oTable.invalidate();
		},
		handlePressTypeLigne: function() {
			if (this.oTable.getSelectedIndex() === -1) {
				MessageToast.show(this.i18n.getText("messageToast.selectRow"));
				//} else if (Array.isArray(this.oTable.getSelectedIndex())) {
				//	MessageToast.show(this.getI18nValue("messageToast.selectOneRow"));
			} else {
				this.rowType.open();
			}
		},

		handlePressCout: function() {
			if (this.oTable.getSelectedIndex() === -1) {
				MessageToast.show(this.i18n.getText("messageToast.selectRow"));
			} else {
				this.costElement.open();
			}
		},

		handlePressPrix: function() {
			if (this.oTable.getSelectedIndex() === -1) {
				MessageToast.show(this.i18n.getText("messageToast.selectRow"));
			} else {
				this.priceDefinition.open();
			}
		},

		handlePressDelete: function() {
			if (this.oTable.getSelectedIndex() === -1) {
				MessageToast.show(this.i18n.getText("messageToast.selectRow"));
			} else {
				MessageBox.information(this.i18n.getText("messageBox.deletePressed"));
			}
		},

		handlePressSave: function() {
			MessageBox.information(this.i18n.getText("messageBox.savePressed"));
		},
		addLine: function() {
			that.oTable.invalidate();
			if (this.oTable.getSelectedIndex() !== -1) {
				var row = this.oTable.getRows()[this.oTable.getSelectedIndex()];
				row = document.getElementById(row.sId);
				var cells = row.cells;
				var text = cells[1].children[0].children[1].textContent;
				mod = that.oTable.getModel().getProperty("/ListeArticles");
				// row select is a section? => text != ""
				if (text !== "") {

					var label = sap.ui.getCore().byId("labelPart");
					var index = that.oTable.getSelectedIndex();
					var numSection = parseInt(text.substring(0, 1), 10) - 1;
					//check if it is a subsection => 1.1 => . present
					if (text.indexOf('.') === -1) {
						//no . => highest level
						//Highestlevel avec souscategories ou lignes?
						if (typeof mod[numSection].SousCategories !== "undefined") {
							//creation of section
							label.setText("Nouvelle Section");
							that.inputDialog.open();
						} else {
							mod = mod[numSection].Lignes;
							that.pushModel(index, numSection, "", "/Lignes");
						}
						/*} else if (index === 2 && index <= mod[1].Lignes.length + mod[0].Lignes.length) {
							mod = mod[2].SousCategories;
							label.setText("Nouvelle Section");
							that.inputDialog.open();
						}*/
					} else {
						//section
						var numSousSection = parseInt(text.substring(2, 3), 10) - 1;
						mod = mod[numSection].SousCategories[numSousSection].Lignes;
						that.pushModel(index, numSection, "", "/SousCategories/" + "/Lignes");
					}

				} else {
					MessageBox.information("Sélection invalide");
				}

			} else {
				label.setText("Nouveau Chapitre");
				that.inputDialog.open();
			}
		},
		pushModel: function(index, modindex, Id, property, numSousSection) {
			this.oTable.expand(this.oTable.getSelectedIndex());

			jQuery.sap.delayedCall(500, null, function() {
				if (Id === "") {
					mod.push({
						Ty: 'E',
						Reference: '',
						Designation: '',
						Quantite: '1',
						UniteQte: '',
						CoutUnitaire: '',
						CoutTotal: '',
						PrixVente: '',
						Manuel: ''
					});
				} else {
					var numsection = modindex + 1;
					mod.push({
						Id: numsection.toString() + "." + numSousSection.toString() + " " + Id,
						Designation: '',
						CoutTotal: '',
						PrixVente: '',
						Manuel: '',
						Lignes: []
					});
				}
				that.oTable.getModel().setProperty("/ListeArticles/" + modindex.toString() + property, mod);
				var newLineIndex = mod.length + index;
				if (mod.length + index >= 10) {
					that.oTable._scrollPageDown();
					newLineIndex = 9;
				}
				var newline = that.oTable.getRows()[newLineIndex];
				var oCells = newline.getCells();
				for (var i = 0; i < oCells.length; i++) {
					try {
						newline.getCells()[i].setEditable(true);
					} catch (e) {

					}
				}

			});
		},
		handleScroll: function() {
			that.cssRender();
		},

		closeDialog: function(evt) {
			evt.getSource().getParent().close();
		},
		addSection: function(evt) {
			var Id = sap.ui.getCore().byId("inputPart").getValue();
			sap.ui.getCore().byId("inputPart").setValue('');

			evt.getSource().getParent().close();
			//var model = that.getOwnerComponent().getModel("articles").getProperty("/ListeArticles");
			//get index and numSection
			var row = this.oTable.getRows()[this.oTable.getSelectedIndex()];
			row = document.getElementById(row.sId);
			var cells = row.cells;
			var text = cells[1].children[0].children[1].textContent;
			var index = that.oTable.getSelectedIndex();
			var numSection = parseInt(text.substring(0, 1), 10) - 1;
			var numNewSousSection = mod.length;
			//create section for mod[numSection]
			mod = mod[numSection];
			//count number of point => level
			var lastIndex = 0;
			while (lastIndex !== -1) {
				//Get level
				lastIndex = text.indexOf(".", lastIndex);
				mod = mod.SousCategories;
				if (lastIndex !== -1) {
					Level++;
					lastIndex++;
					//search for ID text
				}
			}
			var numNewSousSection = mod.length + 1;
			that.pushModel(index, numSection, Id, "/SousCategories", numNewSousSection);

			/*var model = this.getModel();  
					    var data=model.getData();
					    data.Id= '';*/
			/*var visiblerowcount = that.oTable.getVisibleRowCount();
	        model.push({
                        				Id: Id,
                        				Reference: '',
                        				Designation: '',
                        				Quantite: '',
                        				UniteQte: '',
                        				CoutUnitaire: '',
                        				CoutTotal: '',
                        				PrixVente: '',
                        				Manuel: ''
                        			});
                    that.oTable.getModel().setProperty("/ListeArticles", model);
			//model.setData(data);
			jQuery.sap.delayedCall(500, null, function() {
				that.oTable._scrollPageDown();
				var oNewItem = that.oTable.getRows()[Math.min(visiblerowcount - 1, counter)];
				var oCells = oNewItem.getCells();
				for (var i = 0; i < oCells.length; i++) {
					try {
						oNewItem.getCells()[i].setEditable(true);
					} catch (e) {

					}
				}
			});*/
		},
		onLink: function(oEvent) {
			//this.byId("infoPanel").setExpanded(true);
			this.byId("inputFamille").setValue(oEvent.getSource().getText());
			this.byId("inputLabel").setValue(oEvent.getSource().data("desc"));
			this.oTargetSubSection = this.getView().byId("info");
			this.oObjectPageLayout.scrollToSection(this.oTargetSubSection.sId);
		},

		onAfterRendering: function() {
			//attach scroll event to scroll container
			// document.getElementById(this.byId("scrollTable").sId).onscroll = this.handleScroll;
			sap.ui.getCore().byId("application-AAIMaquette-display-component---detail--tab-vsb").attachScroll(function() {
				setTimeout(that.handleScroll, 100);
			});
			document.getElementById("application-AAIMaquette-display-component---detail--ObjectPageLayout-anchorBar").onclick = this.handleAnchorBarClick;
			//sap.ui.core.ScrollBar.prototype.onAfterRendering = this.handleScroll;
			// put css first
			this.cssRender();
		},
		handleAnchorBarClick: function() {
			setTimeout(that.cssRender(), 300);
		},
		cssRender: function() {
			var rows = that.byId("tab").getRows();
			counter = 0;
			rows.forEach(function(element) {
				var row = document.getElementById(element.sId);

				var cells = row.cells;
				var cellRef = null;
				var span1 = cells[1].children[0].children[0];
				var span2 = cells[1].children[0].children[1];
				var spanUnit = cells[6].children[0].children[0];
				var spanDes = cells[4].children[0].children[0];
				if (span1 != null) {
					if (span1.className.indexOf("sapUiTableTreeIcon") > -1 && span2.textContent !== "") {
						if (row.className.indexOf(" cyan") === -1) {
							row.className += " cyan";
						}
					} else {
						if (row.className.indexOf(" cyan") > -1) {
							row.className = row.className.replace(" cyan", "");
						}
					}
				}
				if (spanDes.value !== "") {
					counter++;
				}

				if (spanUnit.value.toUpperCase() === "ENS") {

					var sHtml = "Composant 1";
					sHtml += "<span class=" + "marge" + ">0.5</span>";
					sHtml += "<span class=" + "marge" + ">L</span><br>";
					sHtml += "Composant 2";
					sHtml += "<span class=" + "marge" + ">1</span>";
					sHtml += "<span class=" + "marge" + ">UO</span>";
					var TitleHtml = "Element";
					TitleHtml += "<span class=" + "marge" + ">Qté</span>";
					TitleHtml += "<span class=" + "marge" + ">Unité</span><br>";

					var oRichTooltip = new sap.ui.commons.RichTooltip({
						text: sHtml
					});
					cells = element.getCells();
					cellRef = cells[2];
					cellRef.setTooltip(oRichTooltip);
				} else {
					cells = element.getCells();
					cellRef = cells[2];
					if (typeof cells[2].getTooltip() !== "undefined") {
						cellRef.setTooltip(null);
					}

				}
			});
		},
		Nav:function(){
		    this.byId("idAppControl").toDetail("synthese");
		}
		
	
	});

});