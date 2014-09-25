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
            
            this.domain = dataObj["domain"];
            this.division = dataObj["subdomain"];
            this.desc = dataObj["competency"];
            this.category = dataObj["area"];
            this.quadrant = dataObj["competencyquadrant"];
            this.origin = dataObj["siloorigin"];
            this.code = dataObj["code"];
        }
    });
    
    $.extend($.hitcomp.Competency, $.hitcomp.DataItem, {
        "buildTableSorter": function (dataTableElem) {
            var dataTableSorter = $.hitcomp.DataItem.buildTableSorter.call(undefined, dataTableElem), dataTableSorterFunc = dataTableSorter.textSorter;
            
            return $.extend(dataTableSorter, {
                "sortList": [
                    [ 2, 0 ]
                ],
                "textSorter": function (dataValue1, dataValue2, dataColDirection, dataColIndex, dataTableElem) {
                    return ((dataColIndex == 2) ? $.hitcomp.CompetencyLevel.valueOf({ "name": dataValue1 }).value.compareTo(
                        $.hitcomp.CompetencyLevel.valueOf({ "name": dataValue2 }).value) : 
                        dataTableSorterFunc(dataValue1, dataValue2, dataColDirection, dataColIndex, dataTableElem));
                }
            });
        }
    });
    
    $.extend($.hitcomp.Competency.prototype, $.hitcomp.DataItem.prototype, {
        "domain": undefined,
        "quadrant": undefined,
        "category": undefined,
        "origin": undefined,
        "code": undefined,
        
        "buildRowElement": function () {
            return $.hitcomp.DataItem.prototype.buildRowElement.call(this).prepend($.map({
                "domain": this.domain,
                "division": this.division,
                "level": this.level.value.displayName,
                "quadrant": this.quadrant,
                "category": this.category,
                "origin": this.origin
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
})(jQuery);
