(function ($) {
    //====================================================================================================
    // EXTENSIONS: JQUERY
    //====================================================================================================
    $.extend($, {
        "isString": function (obj) {
            return ($.type(obj) == "string");
        },
        
        "keys": function (obj) {
            return $.map(obj, function (objPropValue, objPropName) {
                return objPropName;
            });
        },
        
        "values": function (obj) {
            return $.map(obj, function (objPropValue) {
                return objPropValue;
            });
        }
    });
    
    //====================================================================================================
    // EXTENSIONS: ARRAY
    //====================================================================================================
    $.extend(Array.prototype, {
        "first": function () {
            return ((this.length > 0) ? this[0] : undefined);
        },
        
        "last": function () {
            return ((this.length > 0) ? this[(this.length - 1)] : undefined);
        },
        
        "unique": function () {
            var map = {};
            
            $.each(this, function (index, value) {
                map[value] = index;
            });
            
            return $.keys(map);
        }
    });
    
    //====================================================================================================
    // EXTENSIONS: ENUM
    //====================================================================================================
    $.extend(Enum.prototype, {
        "valueOf": function (enumItemProps) {
            var enumItemPropsMatch;
            
            return $.grep(this.enums, function (enumItem) {
                enumItemPropsMatch = true;
                
                $.each(enumItemProps, function (enumItemPropName, enumItemPropValue) {
                    return (enumItemPropsMatch = (enumItem.value[enumItemPropName] == enumItemPropValue));
                });
                
                return enumItemPropsMatch;
            }).first();
        }
    });
    
    //====================================================================================================
    // EXTENSIONS: MOMENT
    //====================================================================================================
    $.extend(moment, {
        "TIMESTAMP_FORMAT": "YYYY-MM-DD HH:mm:ss Z"
    });
    
    $.extend(moment.fn, {
        "formatTimestamp": function () {
            return this.format(moment.TIMESTAMP_FORMAT);
        }
    });
    
    //====================================================================================================
    // EXTENSIONS: TABLESORTER THEME
    //====================================================================================================
    $.extend($.tablesorter.themes.bootstrap, {
        "sortAsc": "fa fa-sort-up",
        "sortDesc": "fa fa-sort-down",
        "sortNone": "fa fa-sort",
        "table": "table table-bordered table-condensed table-hover"
    });
    
    //====================================================================================================
    // OBJECT: NAMESPACE
    //====================================================================================================
    $.extend($, {
        "hitcomp": {
            "ACTIVE_TAB_KEY": "hitcomp.tab.active"
        }
    });
    
    //====================================================================================================
    // CLASS: DATA SET
    //====================================================================================================
    $.extend($.hitcomp, {
        "DataSet": function (name, feedKey, sheetName) {
            this.name = name;
            this.feedKey = feedKey;
            this.sheetName = sheetName;
            
            this.cacheKey = $.hitcomp.DataSet.CACHE_KEY_PREFIX + this.name;
        }
    });
    
    $.extend($.hitcomp.DataSet, {
        "CACHE_DURATION_DEFAULT": (60 * 60 * 1000),
        "CACHE_KEY_PREFIX": "hitcomp.data.set.",
        "CACHE_VALUE_DELIM": "|"
    });
    
    // TODO: implement error handling
    $.extend($.hitcomp.DataSet.prototype, {
        "cacheActive": true,
        "cacheDuration": $.hitcomp.DataSet.CACHE_DURATION_DEFAULT,
        "cacheKey": undefined,
        "feedKey": undefined,
        "sheetName": undefined,
        "name": undefined,
        "onLoad": undefined,
        
        "load": function () {
            var data, dataParts, dataTime;
            
            if (this.cacheActive && localStorage && (data = localStorage.getItem(this.cacheKey)) && 
                (dataParts = data.split($.hitcomp.DataSet.CACHE_VALUE_DELIM, 2)) && (((dataTime = (Number(dataParts[0]))) + this.cacheDuration) > $.now()) && 
                (data = JSON.parse(dataParts[1]))) {
                console.info(sprintf("Data set (name=%s, size=%d) retrieved from Local Storage cache (key=%s, date=%s).", this.name, data.length, 
                    this.cacheKey, moment(dataTime).formatTimestamp()));
                
                this.onLoad(this, data);
            } else {
                Tabletop.init({
                    "callback": function (data) {
                        data = data[this.sheetName].elements;
                        
                        if (this.cacheActive && localStorage) {
                            localStorage.setItem(this.cacheKey, ((dataTime = $.now()) + $.hitcomp.DataSet.CACHE_VALUE_DELIM + JSON.stringify(data)));
                            
                            console.info(sprintf("Data set (name=%s, size=%d) inserted into Local Storage cache (key=%s, date=%s).", this.name, data.length, 
                                this.cacheKey, moment(dataTime).formatTimestamp()));
                        }
                        
                        this.onLoad(this, data);
                    },
                    "callbackContext": this,
                    "key": this.feedKey,
                    "wanted": [ this.sheetName ]
                });
            }
        }
    });
    
    //====================================================================================================
    // CLASS: DATA ITEM
    //====================================================================================================
    $.extend($.hitcomp, {
        "DataItem": function (dataObj) {
            this.id = dataObj["rowNumber"];
            this.level = $.hitcomp.CompetencyLevel.valueOf({ "displayName": dataObj["level"] });
        }
    });
    
    $.extend($.hitcomp.DataItem, {
        "DATA_VALUE_KEY": "hitcomp.data.value",
        
        "buildTableSorter": function (dataTableElem) {
            return {
                "headerTemplate": "{content}{icon}",
                "initialized": function () {
                    var dataElem = dataTableElem.parent();
                    
                    dataElem.prev("div.content-loading").hide();
                    
                    dataElem.show();
                },
                "selectorHeaders": "> thead th:not(:last-of-type)",
                "textExtraction": function (dataElem, dataTableElem, dataElemIndex) {
                    return $(dataElem).data($.hitcomp.DataItem.DATA_VALUE_KEY);
                },
                "textSorter": function (dataValue1, dataValue2, dataColDirection, dataColIndex, dataTableElem) {
                    return dataValue1.localeCompare(dataValue2);
                },
                "theme": "bootstrap",
                "widgetOptions": {
                    "uitheme": "bootstrap"
                },
                "widgets": [
                    "uitheme"
                ]
            };
        }
    });
    
    $.extend($.hitcomp.DataItem.prototype, {
        "id": undefined,
        "level": undefined,
        "division": undefined,
        "desc": undefined,
        
        "buildRowElement": function () {
            return $("<tr/>").append(this.buildDataElement("desc", this.desc));
        },
        
        "buildDataElement": function (dataType, dataValue) {
            var dataElem = $("<td/>", { "datafld": dataType }).text(dataValue).data($.hitcomp.DataItem.DATA_VALUE_KEY, dataValue);
            
            if (dataType == "level") {
                dataElem.append($("<button/>", {
                    "class": "btn btn-default form-control"
                }).append($("<i/>", {
                    "class": "fa fa-external-link"
                })));
            }
            
            return dataElem;
        }
    });
    
    //====================================================================================================
    // CLASS: DATA FILTER
    //====================================================================================================
    $.extend($.hitcomp, {
        "DataFilter": function (type, dataTableElem, dataFilterSelectElem) {
            this.type = type;
            this.dataTableElem = dataTableElem;
            this.dataFilterSelectElem = dataFilterSelectElem;
            
            this.dataFilterSelectElem.data($.hitcomp.DataFilter.DATA_KEY, this);
        }
    });
    
    $.extend($.hitcomp.DataFilter, {
        "DATA_KEY": "hitcomp.data.filter"
    });
    
    $.extend($.hitcomp.DataFilter.prototype, {
        "type": undefined,
        "dataTableElem": undefined,
        "dataFilterSelectElem": undefined,
        
        "deselectAll": function () {
            this.changeAll(false);
        },
        
        "selectAll": function () {
            this.changeAll(true);
        },
        
        "changeAll": function (dataFilterSelectOptState) {
            $("option", this.dataFilterSelectElem).each($.proxy(function (dataFilterSelectOptIndex, dataFilterSelectOptElem) {
                this.dataFilterSelectElem.multiselect((dataFilterSelectOptState ? "select" : "deselect"), $(dataFilterSelectOptElem).val(), true);
            }, this));
        },
        
        "buildSelectDataProvider": function (dataFilterSelectOptValues) {
            return $.map(dataFilterSelectOptValues, function (dataFilterSelectOptValue) {
                return {
                    "label": dataFilterSelectOptValue,
                    "value": dataFilterSelectOptValue
                };
            });
        },
        
        "buildSelect": function () {
            return {
                "buttonClass": "btn btn-default form-control",
                "buttonContainer": '<div class="btn-group btn-group-sm"/>',
                "enableCaseInsensitiveFiltering": true,
                "filterBehavior": "text",
                "onChange": $.proxy(function () {
                    $("tbody tr", this.dataTableElem).show();
                    
                    $("select", this.dataFilterSelectElem.parent().parent().parent()).each($.proxy(function (dataFilterSelectIndex, dataFilterSelectElem) {
                        var dataFilter = (dataFilterSelectElem = $(dataFilterSelectElem)).data($.hitcomp.DataFilter.DATA_KEY), dataFilterSelectedOpts = {};
                        
                        $("option", dataFilterSelectElem).each(function (dataFilterSelectOptIndex, dataFilterSelectOptElem) {
                            if ((dataFilterSelectOptElem = $(dataFilterSelectOptElem)).prop("selected")) {
                                dataFilterSelectedOpts[dataFilterSelectOptElem.val()] = true;
                            }
                        });
                        
                        if ($.isEmptyObject(dataFilterSelectedOpts)) {
                            return;
                        }
                        
                        $.each($.grep($("tbody tr td", this.dataTableElem), function (dataElem) {
                            return ($(dataElem).attr("datafld") == dataFilter.type);
                        }), function (dataElemIndex, dataElem) {
                            if (!dataFilterSelectedOpts[$.trim((dataElem = $(dataElem)).text())]) {
                                dataElem.parent().hide();
                            }
                        });
                    }, this));
                }, this)
            };
        },
        
        "buildSelectControlElements": function () {
            return [
                this.buildButtonElement("All", "btn btn-default form-control", "fa fa-check-square-o").bind("click", { "dataFilter": this }, 
                    function (event) {
                        event.data.dataFilter.selectAll.call(event.data.dataFilter);
                    }).tooltip({
                        "container": "body",
                        "title": function () {
                            return "Select All";
                        }
                    }),
                this.buildButtonElement("None", "btn btn-default form-control", "fa fa-minus-square-o").bind("click", { "dataFilter": this }, 
                    function (event) {
                        event.data.dataFilter.deselectAll.call(event.data.dataFilter);
                    }).tooltip({
                        "container": "body",
                        "title": function () {
                            return "Select None";
                        }
                    })
            ];
        },
        
        "buildButtonElement": function (content, classes, iconClasses) {
            return $("<button/>", {
                "class": classes,
                "data-placement": "top",
                "data-toggle": "tooltip",
                "type": "button"
            }).append($("<i/>", {
                "class": iconClasses
            })).append(content);
        }
    });
})($);
