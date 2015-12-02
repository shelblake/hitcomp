(function ($) {
    //====================================================================================================
    // CLASS: COMPETENCY LEVEL ITEM
    //====================================================================================================
    $.extend($.hitcomp, {
        "CompetencyLevelItem": function (order, displayName, name) {
            this.order = order;
            this.displayName = displayName;
            this.name = (name || this.displayName.toLowerCase());
        }
    });
    
    $.extend($.hitcomp.CompetencyLevelItem.prototype, {
        "order": undefined,
        "name": undefined,
        "displayName": undefined,
        
        "compareTo": function (compLevelItem) {
            return ((this.order > compLevelItem.order) ? 1 : ((this.order < compLevelItem.order) ? -1 : 0));
        }
    });
    
    //====================================================================================================
    // ENUM: COMPETENCY LEVEL
    //====================================================================================================
    $.extend($.hitcomp, {
        "CompetencyLevel": new Enum({
            "UNKNOWN": new $.hitcomp.CompetencyLevelItem(-1, "Unknown"),
            "BASELINE": new $.hitcomp.CompetencyLevelItem(0, "Baseline"),
            "BASIC": new $.hitcomp.CompetencyLevelItem(1, "Basic"),
            "INTERMEDIATE": new $.hitcomp.CompetencyLevelItem(2, "Intermediate"),
            "ADVANCED": new $.hitcomp.CompetencyLevelItem(3, "Advanced"),
            "EXPERT": new $.hitcomp.CompetencyLevelItem(4, "Expert")
        })
    });
    
    //====================================================================================================
    // CLASS: COMPETENCY
    //====================================================================================================
    $.extend($.hitcomp, {
        "Competency": function (dataObj) {
            $.hitcomp.DataItem.call(this, dataObj);
            
            this.domain = dataObj.domain.tokenize($.hitcomp.DataItem.DATA_VALUE_DELIM);
            this.desc = dataObj.competencyintegratedwithtaxonomy;
            this.category = dataObj.areaofcompetency;
        }
    });
    
    $.extend($.hitcomp.Competency, $.hitcomp.DataItem, {
        "buildTableSorter": function (dataTableElem) {
            var dataTableSorter = $.hitcomp.DataItem.buildTableSorter.call(undefined, dataTableElem), dataTableSorterFunc = dataTableSorter.textSorter;
            
            return $.extend(dataTableSorter, {
                "sortList": [
                    [ 1, 0 ]
                ],
                "textSorter": function (dataValue1, dataValue2, dataColDirection, dataColIndex, dataTableElem) {
                    return ((dataColIndex == 1) ? $.hitcomp.CompetencyLevel.valueOf({ "name": dataValue1 }).value.compareTo(
                        $.hitcomp.CompetencyLevel.valueOf({ "name": dataValue2 }).value) : 
                        dataTableSorterFunc(dataValue1, dataValue2, dataColDirection, dataColIndex, dataTableElem));
                }
            });
        }
    });
    
    $.extend($.hitcomp.Competency.prototype, $.hitcomp.DataItem.prototype, {
        "category": undefined,
        
        "buildRowElement": function () {
            return $.hitcomp.DataItem.prototype.buildRowElement.call(this).prepend($.map({
                "domain": this.domain,
                "level": this.level.value.displayName,
                "category": this.category
            }, $.proxy(function (dataValue, dataType) {
                return this.buildDataElement(dataType, dataValue);
            }, this)));
        },
        
        "buildDataElement": function (dataType, dataValue) {
            var dataElem = $.hitcomp.DataItem.prototype.buildDataElement.call(this, dataType, dataValue);
            
            if (dataType == "level") {
                $("button", dataElem).tooltip({
                    "title": "Apply to Roles"
                });
            }
            
            return dataElem;
        }
    });
    
    //====================================================================================================
    // CLASS: COMPETENCY FILTER
    //====================================================================================================
    $.extend($.hitcomp, {
        "CompetencyFilter": function (type, dataTableElem, dataFilterSelectElem) {
            $.hitcomp.DataFilter.call(this, type, dataTableElem, dataFilterSelectElem);
        }
    });
    
    $.extend($.hitcomp.CompetencyFilter, $.hitcomp.DataFilter);
    
    $.extend($.hitcomp.CompetencyFilter.prototype, $.hitcomp.DataFilter.prototype);
    
    //====================================================================================================
    // CLASS: COMPETENCY CONTROLLER
    //====================================================================================================
    $.extend($.hitcomp, {
        "CompetencyController": function (tabElem) {
            $.hitcomp.DataController.call(this, tabElem);
        }
    });
    
    $.extend($.hitcomp.CompetencyController, $.hitcomp.DataController);
    
    $.extend($.hitcomp.CompetencyController.prototype, $.hitcomp.DataController.prototype, {
        "load": function (settings) {
            var controller = this, dataSet = new $.hitcomp.DataSet("comp", settings.compsSheetId, settings.compsSheetName, function (compsDataSet, compsData) {
                controller.tableElem.data($.hitcomp.DataSet.DATA_OBJ_KEY, (controller.dataSet = compsDataSet));
                
                var comp;
                
                $.each(compsData, function (compDataObjIndex, compDataObj) {
                    controller.items.push((comp = new $.hitcomp.Competency(compDataObj)));
                    controller.rowElems.push(comp.buildRowElement());
                });
                
                controller.tableBodyElem.append(controller.rowElems);
                
                $("div.input-group-sm div.btn-group button.btn", controller.dataElem).tooltip({ "title": "Export Data" });
                
                controller.exporter = new $.hitcomp.DataExporter(controller.tableElem);
                
                $("div.input-group-sm div.btn-group div.dropdown ul.dropdown-menu li a", controller.dataElem).bind("mouseup", {
                    "compsExporter": controller.exporter
                }, function (event) {
                    event.data.compsExporter.export(event, "hitcomp-comps");
                });
                
                controller.tableElem.tablesorter($.hitcomp.Competency.buildTableSorter(controller.tableElem));
                
                var compFilterType, compFilter;
                
                $("select", controller.filterElem).each(function (compFilterSelectIndex, compFilterSelectElem) {
                    controller.filters.push((compFilter = new $.hitcomp.CompetencyFilter(
                        (compFilterType = (compFilterSelectElem = $(compFilterSelectElem)).parent().parent().attr("data-field")), controller.tableElem, 
                        compFilterSelectElem)));
                    
                    compFilterSelectElem.multiselect(compFilter.buildSelect());
                    compFilterSelectElem.multiselect("dataprovider", $.fn.multiselect.buildDataProvider($.map(((compFilterType == "level") ? 
                        $.grep($.hitcomp.CompetencyLevel.enums, function (compLevel) {
                            return (compLevel.value.order >= 0);
                        }) : $.map(controller.items, function (comp) {
                            return comp[compFilterType];
                        })).sort(function (compItemValue1, compItemValue2) {
                            return ((compFilterType == "level") ? compItemValue1.value.compareTo(compItemValue2.value) : 
                                compItemValue1.localeCompare(compItemValue2));
                        }), function (compItemValue) {
                            return ((compFilterType == "level") ? compItemValue.value.displayName : compItemValue);
                        }).unique()));
                    
                    compFilterSelectElem.parent().append(compFilter.buildSelectControlElements());
                });
                
                $("div.input-group-sm:first-of-type div.btn-group button[type=\"reset\"]", controller.filterElem).bind("click",
                    { "dataFilters": controller.filters }, function (event) {
                    $.each(event.data.dataFilters, function (dataFilterIndex, dataFilter) {
                        dataFilter.dataFilterSelectElem.multiselect("deselectAllOptions");
                    });
                }).tooltip({ "title": "Reset Filters" });
                
                controller.filterElem.prev("div.content-loading").hide();
                controller.filterElem.show();
            }, function (initial) {
                var numCompsSelected = (initial ? controller.rowElems.length : 0);
                
                if (!initial) {
                    $.each(controller.rowElems, function (compRowIndex, compRowElem) {
                        if ((compRowElem = $(compRowElem)).is(":not(.disabled)") && (compRowElem.css("display") != "none")) {
                            numCompsSelected++;
                        }
                    });
                }
                
                controller.selectedNumElem.text(numCompsSelected);
                controller.selectedNumTotalElem.text(controller.rowElems.length);
                
                controller.selectedElem.show();
            });
            
            dataSet.load();
        }
    });
}(jQuery));
