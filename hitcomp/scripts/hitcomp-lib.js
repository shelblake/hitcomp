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
    // OBJECT: NAMESPACE
    //====================================================================================================
    $.extend($, {
        "hitcomp": {}
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
        "buildTableSorter": function (dataTableElem) {
            return {
                "headerTemplate": "{content}{icon}",
                "initialized": function () {
                    var dataElem = dataTableElem.parent();
                    
                    dataElem.prev("div.content-loading").hide();
                    
                    dataElem.show();
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
        "desc": undefined,
        
        "buildRowElement": function () {
            return $("<tr/>").append(this.buildDataElement("desc", this.desc));
        },
        
        "buildDataElement": function (dataType, dataValue) {
            return $("<td/>", { "datafld": dataType }).text(dataValue);
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
                "buttonClass": "btn btn-default",
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
                this.buildButtonElement("All", "btn-default", "glyphicon-asterisk").bind("click", { "dataFilter": this }, function (event) {
                    event.data.dataFilter.selectAll.call(event.data.dataFilter);
                }),
                this.buildButtonElement("None", "btn-default", "glyphicon-ban-circle").bind("click", { "dataFilter": this }, function (event) {
                    event.data.dataFilter.deselectAll.call(event.data.dataFilter);
                })
            ];
        },
        
        "buildButtonElement": function (content, classes, iconClasses) {
            return $("<button/>", {
                "class": "btn " + classes,
                "type": "button"
            }).append($("<i/>", {
                "class": "glyphicon " + iconClasses
            })).append(content);
        }
    });
    
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
            this.subdomain = dataObj["subdomain"];
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
        "subdomain": undefined,
        "quadrant": undefined,
        "category": undefined,
        "origin": undefined,
        "code": undefined,
        
        "buildRowElement": function () {
            return $.hitcomp.DataItem.prototype.buildRowElement.call(this).prepend($.map({
                "domain": this.domain,
                "subdomain": this.subdomain,
                "level": this.level.value.displayName,
                "quadrant": this.quadrant,
                "category": this.category,
                "origin": this.origin
            }, $.proxy(function (dataValue, dataType) {
                return this.buildDataElement(dataType, dataValue);
            }, this)));
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
    // CLASS: ROLE
    //====================================================================================================
    $.extend($.hitcomp, {
        "Role": function (dataObj) {
            $.hitcomp.DataItem.call(this, dataObj);
            
            this.clinical = dataObj["clinicalnon-clinical"];
            this.type = dataObj["roletype"];
            this.desc = dataObj["definition"];
            this.rolesUs = dataObj["usroles"];
            this.rolesEu = {
                "de": dataObj["eurolesdefin"],
                "en-GB": dataObj["eurolesenglish"],
                "es": dataObj["euroleses"],
                "fr": dataObj["eurolesfr"],
                "it": dataObj["eurolesit"]
            };
        }
    });
    
    $.extend($.hitcomp.Role, $.hitcomp.DataItem, {
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
    
    $.extend($.hitcomp.Role.prototype, $.hitcomp.DataItem.prototype, {
        "clinical": undefined,
        "type": undefined,
        "rolesUs": undefined,
        "rolesEu": undefined,
        
        "buildRowElement": function () {
            return $.hitcomp.DataItem.prototype.buildRowElement.call(this).prepend($.map({
                "clinical": this.clinical,
                "type": this.type,
                "level": this.level.value.displayName,
                "rolesUs": this.rolesUs,
                "rolesEu": this.rolesEu["en-GB"]
            }, $.proxy(function (dataValue, dataType) {
                return this.buildDataElement(dataType, dataValue);
            }, this)));
        }
    });
    
    //====================================================================================================
    // CLASS: ROLE FILTER
    //====================================================================================================
    $.extend($.hitcomp, {
        "RoleFilter": function (type, dataTableElem, dataFilterSelectElem) {
            $.hitcomp.DataFilter.call(this, type, dataTableElem, dataFilterSelectElem);
        }
    });
    
    $.extend($.hitcomp.RoleFilter, $.hitcomp.DataFilter);
    
    $.extend($.hitcomp.RoleFilter.prototype, $.hitcomp.DataFilter.prototype);
    
    //====================================================================================================
    // CLASS: ROLE LOCALIZATION
    //====================================================================================================
    $.extend($.hitcomp, {
        "RoleLocalization": function (roles, dataTableElem, dataLocalizeSelectElem) {
            this.dataTableElem = dataTableElem;
            this.dataLocalizeSelectElem = dataLocalizeSelectElem;
            
            this.rolesMap = {};
            
            $.each(roles, $.proxy(function (roleIndex, role) {
                this.rolesMap[role.rolesUs] = role.rolesEu;
            }, this));
        }
    });
    
    $.extend($.hitcomp.RoleLocalization, {
        "HTTP_HEADER_ACCEPT_LANG_NAME": "Accept-Language",
        "HTTP_HEADERS_API_URL": "http://ajaxhttpheaders.appspot.com"
    });
    
    $.extend($.hitcomp.RoleLocalization.prototype, {
        "dataTableElem": undefined,
        "dataLocalizeSelectElem": undefined,
        "rolesMap": undefined,
        "culture": undefined,
        
        "determineDefault": function () {
            $.ajax({
                "dataType": "jsonp",
                "success": $.proxy(function (httpHeaders) {
                    var acceptLangHttpHeaderValue = httpHeaders[$.hitcomp.RoleLocalization.HTTP_HEADER_ACCEPT_LANG_NAME];
                    
                    if (!acceptLangHttpHeaderValue) {
                        console.info(sprintf("Unable to determine acceptable language HTTP header (name=%s) value.", 
                            $.hitcomp.RoleLocalization.HTTP_HEADER_ACCEPT_LANG_NAME));
                        
                        return;
                    }
                    
                    this.localize((this.culture = Globalize.culture(acceptLangHttpHeaderValue)).language);
                    
                    console.info(sprintf("Determined default localization culture: lang=%s, name=%s", this.culture.language, this.culture.englishName));
                }, this),
                "url": $.hitcomp.RoleLocalization.HTTP_HEADERS_API_URL
            });
        },
        
        "localize": function (dataLocalizeLang) {
            var dataLocalizeLangValue = $.grep($.map($("option", this.dataLocalizeSelectElem), function (dataLocalizeSelectOptElem) {
                return $(dataLocalizeSelectOptElem).val();
            }), function (dataLocalizeLangValue) {
                return (dataLocalizeLangValue.indexOf(dataLocalizeLang) == 0);
            }).first();
            
            if (!dataLocalizeLangValue) {
                return;
            }
            
            if (this.dataLocalizeSelectElem.val() != dataLocalizeLangValue) {
                this.dataLocalizeSelectElem.val(dataLocalizeLangValue);
            }
            
            $("tbody tr td:nth-of-type(5)", this.dataTableElem).each($.proxy(function (dataLocalizeLangDataIndex, dataLocalizeLangDataElem) {
                (dataLocalizeLangDataElem = $(dataLocalizeLangDataElem)).text(this.rolesMap[dataLocalizeLangDataElem.prev().text()][dataLocalizeLangValue]);
            }, this));
        }
    });
})($);
