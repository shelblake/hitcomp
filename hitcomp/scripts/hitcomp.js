$(document).ready(function () {
    function CompetencyLevel(order, name, displayName) {
        this.order = order;
        this.name = name;
        this.displayName = displayName;
    }
    
    $.extend(CompetencyLevel.prototype, {
        "order": undefined,
        "name": undefined,
        "displayName": undefined
    });
    
    $.extend(CompetencyLevel, {
        "UNKNOWN": new CompetencyLevel(-1, "unknown", "Unknown"),
        "BASELINE": new CompetencyLevel(0, "baseline", "Baseline"),
        "BASIC": new CompetencyLevel(1, "basic", "Basic"),
        "INTERMEDIATE": new CompetencyLevel(2, "intermediate", "Intermediate"),
        "ADVANCED": new CompetencyLevel(3, "advanced", "Advanced"),
        "EXPERT": new CompetencyLevel(4, "expert", "Expert"),
        
        "valueOf": function (level) {
            switch (level.toLowerCase()) {
                case CompetencyLevel.BASELINE.name:
                    return CompetencyLevel.BASELINE;
                
                case CompetencyLevel.BASIC.name:
                    return CompetencyLevel.BASIC;
                
                case CompetencyLevel.INTERMEDIATE.name:
                    return CompetencyLevel.INTERMEDIATE;
                
                case CompetencyLevel.ADVANCED.name:
                    return CompetencyLevel.ADVANCED;
                
                case CompetencyLevel.EXPERT.name:
                    return CompetencyLevel.EXPERT;
                
                default:
                    return CompetencyLevel.UNKNOWN;
            }
        }
    });
    
    function Competency(obj) {
        this.area = obj["areaofcompetency"];
        this.code = obj["code"];
        this.desc = obj["competency"];
        this.id = obj["rowNumber"];
        this.level = CompetencyLevel.valueOf(obj["level"]);
        this.origin = obj["siloorigin"];
        this.quadrant = obj["competencyquadrant"];
    }
    
    $.extend(Competency.prototype, {
        "area": undefined,
        "code": undefined,
        "desc": undefined,
        "id": undefined,
        "level": CompetencyLevel.UNKNOWN,
        "origin": undefined,
        "quadrant": undefined
    });
    
    var CompetencyFilter = {};
    
    $.extend(CompetencyFilter, {
        "buildButton": function (content, classes, iconClasses) {
            return $("<button/>", {
                "class": "btn " + classes,
                "type": "button"
            }).append($("<i/>", {
                "class": "glyphicon " + iconClasses
            })).append(content);
        }
    });
    
    var DATA_LOCAL_STORAGE_KEY = "hitcomp.data";
    var DATA_LOCAL_STORAGE_VALUE_DELIM = "|";
    var DATA_LOCAL_STORAGE_EVICT_MS = (60 * 60 * 1000);
    var DATA_FEED_KEY = "1267F0p2IXcLz_G1ImRngAmcWEaYS1SXP7wtx0J1sh6c";
    var DATA_SHEET_ALL_LEVELS_NAME = "All Levels Combined";
    
    var comps = [];
    
    function buildInterface(data) {
        var dataSheet = data[DATA_SHEET_ALL_LEVELS_NAME];
        
        // TODO: handle missing sheet
        
        var content = $("div#content"), filterContent = $("div#content-filter", content), dataContent = $("div#content-data", content), 
            compTable = $("table#comp-table", dataContent), compTableBody = $("tbody", compTable), comp, compRow;
        
        $.each(dataSheet["elements"], function (compIndex, compElem) {
            comps.push((comp = new Competency(compElem)));
            
            compRow = $("<tr/>");
            compRow.append($("<td/>", { "class": "comp-data-level" }).text(comp.level.displayName));
            compRow.append($("<td/>", { "class": "comp-data-quadrant" }).text(comp.quadrant));
            compRow.append($("<td/>", { "class": "comp-data-area" }).text(comp.area));
            compRow.append($("<td/>", { "class": "comp-data-origin" }).text(comp.origin));
            compRow.append($("<td/>", { "class": "comp-data-desc" }).text(comp.desc));
            compTableBody.append(compRow);
        });
        
        $.extend($.tablesorter.themes.bootstrap, {
            "sortAsc": "fa fa-sort-up",
            "sortDesc": "fa fa-sort-down",
            "sortNone": "fa fa-sort",
            "table": "table table-bordered table-condensed table-hover"
        });
        
        compTable.tablesorter({
            "headerTemplate": "{content}{icon}",
            "initialized": function (table) {
                $("div#content-data-loading", content).hide();
                dataContent.show();
            },
            "sortList": [
                [ 0, 0 ]
            ],
            "textSorter": function (col1, col2, dir, colIndex, table) {
                if (colIndex != 0) {
                    return col1.localeCompare(col2);
                } else {
                    var compLevel1 = CompetencyLevel.valueOf(col1), compLevel2 = CompetencyLevel.valueOf(col2);
                    
                    return ((compLevel1.order > compLevel2.order) ? 1 : ((compLevel1.order < compLevel2.order) ? -1 : 0));
                }
            },
            "theme": "bootstrap",
            "widgetOptions": {
                "uitheme": "bootstrap"
            },
            "widgets": [
                "uitheme"
            ]
        });
        
        $("button#content-filter-reset", filterContent).click(function (event) {
            $("div.content-filter-group select option", filterContent).each(function (filterSelOptIndex, filterSelOpt) {
                $(filterSelOpt).parent().multiselect("deselect", $(filterSelOpt).val());
            });
        });
        
        $("div.content-filter-group", filterContent).each(function (filterGroupIndex, filterGroup) {
            filterGroup = $(filterGroup);
            
            var filterSel = $("select.multiselect", filterGroup), filterSelGroup = filterSel.parent(), 
                filterSelType = filterSel.attr("id").replace(/^content\-filter\-select\-([^$]+)$/, "$1");
            
            filterSel.multiselect({
                "buttonClass": "btn btn-default",
                "buttonContainer": '<div class="btn-group btn-group-sm"/>',
                "enableCaseInsensitiveFiltering": true,
                "filterBehavior": "text",
                "onChange": function (filterSelOpt, filterSelOptStatus) {
                    var compRows = $("tr", compTableBody);
                    compRows.show();
                    
                    $("select", filterContent).each(function (filterSelIndex, filterSel) {
                        var filterSelOptsActive = [];

                        $("option", (filterSel = $(filterSel))).each(function (filterSelOptIndex, filterSelOpt) {
                            if ((filterSelOpt = $(filterSelOpt)).prop("selected")) {
                                filterSelOptsActive.push(filterSelOpt.val());
                            }
                        });

                        if (filterSelOptsActive.length > 0) {
                            $(("tr td.comp-data-" + filterSel.attr("id").replace(/^content\-filter\-select\-([^$]+)$/, "$1")), compTableBody)
                                .each(function (compDataIndex, compData) {
                                if (filterSelOptsActive.indexOf((compData = $(compData)).text().replace(/^\s*([^$]+)\s*$/, "$1")) == -1) {
                                    compData.parent().hide();
                                }
                            });
                        }
                    });
                }
            });
            
            var filterSelDataMap = {};
            
            $.each(comps, function (compIndex, comp) {
                var compAttrValue = comp[filterSelType];
                
                if (filterSelType == "level") {
                    filterSelDataMap[compAttrValue.displayName] = compAttrValue.displayName;
                } else {
                    filterSelDataMap[compAttrValue] = compAttrValue;
                }
            });
            
            var filterSelData = [];
            
            for (var filterSelDataMapPropName in filterSelDataMap) {
                if (filterSelDataMap.hasOwnProperty(filterSelDataMapPropName)) {
                    filterSelData.push({
                        "label": filterSelDataMapPropName,
                        "value": filterSelDataMap[filterSelDataMapPropName]
                    });
                }
            }
            
            filterSel.multiselect("dataprovider", filterSelData.sort(function (filterSelDataObj1, filterSelDataObj2) {
                var filterSelDataValue1 = filterSelDataObj1.value, filterSelDataValue2 = filterSelDataObj2.value;
                
                if (filterSelType == "level") {
                    filterSelDataValue1 = CompetencyLevel.valueOf(filterSelDataValue1).order.toString();
                    filterSelDataValue2 = CompetencyLevel.valueOf(filterSelDataValue2).order.toString();
                }
                
                return filterSelDataValue1.localeCompare(filterSelDataValue2);
            }));
            
            filterSelGroup.append(CompetencyFilter.buildButton("All", "btn-default", "glyphicon-asterisk").click(function (event) {
                $("option", filterSel).each(function (filterSelOptIndex, filterSelOpt) {
                    filterSel.multiselect("select", $(filterSelOpt).val());
                });
            }));
            
            filterSelGroup.append(CompetencyFilter.buildButton("None", "btn-default", "glyphicon-ban-circle").click(function (event) {
                $("option", filterSel).each(function (filterSelOptIndex, filterSelOpt) {
                    filterSel.multiselect("deselect", $(filterSelOpt).val());
                });
            }));
        });
        
        $("div#content-filter-loading", content).hide();
        filterContent.show();
    }
    
    var data, dataParts;
    
    if (localStorage && (data = localStorage.getItem(DATA_LOCAL_STORAGE_KEY)) && (dataParts = data.split(DATA_LOCAL_STORAGE_VALUE_DELIM, 2)) && 
        (new Date(((Number (dataParts[0])) + DATA_LOCAL_STORAGE_EVICT_MS)) > new Date().getTime())) {
        buildInterface((data = JSON.parse(dataParts[1])));
    } else {
        Tabletop.init({
            "callback": function (data) {
                buildInterface(data);
                
                if (localStorage) {
                    localStorage.setItem(DATA_LOCAL_STORAGE_KEY, (new Date().getTime() + DATA_LOCAL_STORAGE_VALUE_DELIM + JSON.stringify(data)));
                }
            },
            "key": DATA_FEED_KEY
        });
    }
});
