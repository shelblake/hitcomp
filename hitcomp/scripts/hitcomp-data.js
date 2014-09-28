(function ($) {
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
            this.id = (dataObj["rowNumber"] - 1);
            this.level = $.hitcomp.CompetencyLevel.valueOf({ "displayName": dataObj["level"] });
        }
    });
    
    $.extend($.hitcomp.DataItem, {
        "DATA_EXPORT_KEY": "hitcomp.data.export",
        "DATA_OBJ_KEY": "hitcomp.data.obj",
        "DATA_VALUE_KEY": "hitcomp.data.value",
        
        "buildTableSorter": function (dataTableElem) {
            return $.extend({}, $.tablesorter.defaults, {
                "initialized": function () {
                    var dataElem = dataTableElem.parent();
                    
                    $("> tbody", dataTableElem).sortable({
                        "axis": "y",
                        "containment": dataTableElem,
                        "helper": function (event, ui) {
                            ui.children().each(function (dataIndex, dataElem) {
                                (dataElem = $(dataElem)).width(dataElem.width());
                            });
                            
                            return ui;
                        },
                        "items": "tr",
                        "opacity": 0.25,
                        "placeholder": "placeholder",
                        "start": function (event, ui) {
                            $($("> td", ui.placeholder)[0]).append($("<i/>", {
                                "class": "fa fa-fw fa-chevron-right"
                            }));
                        },
                        "stop": function (event, ui) {
                            $("> td", ui.item.parent()).removeAttr("style");
                        }
                    });
                    
                    dataElem.prev("div.content-loading").hide();
                    
                    dataElem.show();
                },
                "selectorHeaders": "> thead th:not(:last-of-type)",
                "textExtraction": function (dataElem, dataTableElem, dataElemIndex) {
                    return $(dataElem).data($.hitcomp.DataItem.DATA_VALUE_KEY);
                }
            });
        }
    });
    
    $.extend($.hitcomp.DataItem.prototype, {
        "id": undefined,
        "level": undefined,
        "division": undefined,
        "desc": undefined,
        
        "buildRowElement": function () {
            return $("<tr/>").data($.hitcomp.DataItem.DATA_OBJ_KEY, this).data($.hitcomp.DataItem.DATA_EXPORT_KEY, true)
                .append(this.buildDataElement("desc", this.desc)).append($("<td/>").append($("<button/>", {
                "class": "btn btn-default form-control",
                "data-placement": "top",
                "data-toggle": "tooltip",
                "type": "button"
            }).append($("<i/>", {
                "class": "fa fa-fw fa-eye"
            })).tooltip({
                "title": function () {
                    var dataToggleButtonIconElem = $("i.fa", this);
                    
                    return ((dataToggleButtonIconElem.hasClass("fa-eye") ? "Collapse" : "Expand") + " Row");
                }
            }).click(function (event) {
                var dataToggleButtonElem = $(event.target), dataToggleButtonIconElem = $("i", 
                    (dataToggleButtonElem = (dataToggleButtonElem.is("button") ? dataToggleButtonElem : dataToggleButtonElem.parent()))), 
                    dataControlsElem = dataToggleButtonElem.parent(), dataRowElem = dataControlsElem.parent(), 
                    dataExport = dataRowElem.data($.hitcomp.DataItem.DATA_EXPORT_KEY);
                
                if (dataExport) {
                    $("td[data-field]", dataRowElem).append($("<i/>", {
                        "class": "fa fa-fw fa-ellipsis-h data-disabled-ellipsis"
                    }));
                    
                    dataToggleButtonIconElem.removeClass("fa-eye").addClass("fa-eye-slash");
                } else {
                    $("td[data-field] i.fa.data-disabled-ellipsis", dataRowElem).remove();
                    
                    dataToggleButtonIconElem.removeClass("fa-eye-slash").addClass("fa-eye");
                }
                
                dataRowElem.data($.hitcomp.DataItem.DATA_EXPORT_KEY, !dataExport).toggleClass("disabled");
            })));
        },
        
        "buildDataElement": function (dataType, dataValue) {
            var dataElem = $("<td/>", { "data-field": dataType }).data($.hitcomp.DataItem.DATA_VALUE_KEY, dataValue).append($("<span/>", {
                "class": "content-text"
            }).text(dataValue));
            
            if (dataType == "level") {
                dataElem.append($("<button/>", {
                    "class": "btn btn-default form-control"
                }).append($("<i/>", {
                    "class": "fa fa-fw fa-external-link"
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
            
            this.dataFilterSelectElem.data($.hitcomp.DataFilter.DATA_OBJ_KEY, this);
        }
    });
    
    $.extend($.hitcomp.DataFilter, {
        "DATA_OBJ_KEY": "hitcomp.data.filter"
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
                "onChange": $.proxy(function () {
                    $("tbody tr", this.dataTableElem).show();
                    
                    $("select", this.dataFilterSelectElem.parent().parent().parent()).each($.proxy(function (dataFilterSelectIndex, dataFilterSelectElem) {
                        var dataFilter = (dataFilterSelectElem = $(dataFilterSelectElem)).data($.hitcomp.DataFilter.DATA_OBJ_KEY), dataFilterSelectedOpts = {};
                        
                        $("option", dataFilterSelectElem).each(function (dataFilterSelectOptIndex, dataFilterSelectOptElem) {
                            if ((dataFilterSelectOptElem = $(dataFilterSelectOptElem)).prop("selected")) {
                                dataFilterSelectedOpts[dataFilterSelectOptElem.val()] = true;
                            }
                        });
                        
                        if ($.isEmptyObject(dataFilterSelectedOpts)) {
                            return;
                        }
                        
                        $.each($.grep($("tbody tr td", this.dataTableElem), function (dataElem) {
                            return ($(dataElem).attr("data-field") == dataFilter.type);
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
                this.buildButtonElement("All", "btn btn-default form-control", "fa fa-fw fa-check-square-o").bind("click", { "dataFilter": this }, 
                    function (event) {
                        event.data.dataFilter.selectAll.call(event.data.dataFilter);
                    }).tooltip({
                        "title": "Select All"
                    }),
                this.buildButtonElement("None", "btn btn-default form-control", "fa fa-fw fa-minus-square-o").bind("click", { "dataFilter": this }, 
                    function (event) {
                        event.data.dataFilter.deselectAll.call(event.data.dataFilter);
                    }).tooltip({
                        "title": "Select None"
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
    
    //====================================================================================================
    // CLASS: DATA EXPORT FORMAT ITEM
    //====================================================================================================
    $.extend($.hitcomp, {
        "DataExportFormatItem": function (format, fileMimeType, fileNameExt) {
            this.format = format;
            this.fileMimeType = ((fileMimeType || ("application/" + this.format)) + ";charset=UTF-8");
            this.fileNameExt = (fileNameExt || ("." + this.format));
        }
    });
    
    $.extend($.hitcomp.DataExportFormatItem.prototype, {
        "format": undefined,
        "fileMimeType": undefined,
        "fileNameExt": undefined
    });
    
    //====================================================================================================
    // ENUM: DATA EXPORT FORMAT
    //====================================================================================================
    $.extend($.hitcomp, {
        "DataExportFormat": new Enum({
            "JSON": new $.hitcomp.DataExportFormatItem("json"),
            "XML": new $.hitcomp.DataExportFormatItem("xml"),
            "CSV": new $.hitcomp.DataExportFormatItem("csv")
        })
    });
    
    //====================================================================================================
    // CLASS: DATA EXPORTER
    //====================================================================================================
    $.extend($.hitcomp, {
        "DataExporter": function (dataTableElem) {
            this.dataTableElem = dataTableElem;
        }
    });
    
    $.extend($.hitcomp.DataExporter, {
        "buildDataExportContentItem": function (dataExportItemIndex, dataExportItemElem) {
            this[(dataExportItemElem = $(dataExportItemElem)).attr("data-field")] = $.trim($("span.content-text", dataExportItemElem).text().normalize()
                .printable());
        }
    });
    
    $.extend($.hitcomp.DataExporter.prototype, {
        "dataTableElem": undefined,

        "export": function (dataExportLinkElem, dataExportFileBaseName) {
            var dataExportFormat = $.hitcomp.DataExportFormat.valueOf({
                    "format": (dataExportLinkElem = (dataExportLinkElem.is("a") ? dataExportLinkElem : dataExportLinkElem.parent())).attr("data-export-format")
                }), dataExportContent = this.buildDataExportContent(), dataExportStr, dataExportFileName;
            
            switch (dataExportFormat) {
                case $.hitcomp.DataExportFormat.JSON:
                    dataExportStr = JSON.stringify(dataExportContent, null, 4);
                    break;
                
                case $.hitcomp.DataExportFormat.XML:
                    dataExportStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + $.format($("<container/>").append($("<data/>").append([
                        $("<headings/>").append($.map(dataExportContent.headings, function (dataExportHeadingText, dataExportHeading) {
                            return $(sprintf("<%s/>", dataExportHeading)).text(dataExportHeadingText);
                        })),
                        $("<items/>").append($.map(dataExportContent.items, function (dataExportContentItem) {
                            return $("<item/>").append($.map(dataExportContentItem, function (dataExportContentItemText, dataExportContentItem) {
                                return $(sprintf("<%s/>", dataExportContentItem)).text(dataExportContentItemText);
                            }));
                        }))
                    ])).html(), { "method": "xml" });
                    break;
                
                case $.hitcomp.DataExportFormat.CSV:
                    dataExportStr = ($.map($.values(dataExportContent.headings), function (dataExportHeadingText) {
                        return dataExportHeadingText.quote("\"\"");
                    }).join(",") + "\n" + $.map(dataExportContent.items, function (dataExportContentItem) {
                        return $.map($.values(dataExportContentItem), function (dataExportContentItemText) {
                            return dataExportContentItemText.quote("\"\"");
                        }).join(",");
                    }).join("\n"));
                    break;
            }
            
            var dataExportBlob = new Blob([ dataExportStr ], { "type": dataExportFormat.value.fileMimeType }), dataExportBlobPrevSize = 0, 
                dataExportInterval = setInterval(function () {
                if (dataExportBlob.size && (dataExportBlobPrevSize == dataExportBlob.size)) {
                    clearInterval(dataExportInterval);
                    
                    saveAs(dataExportBlob, (dataExportFileName = sprintf("%s_%s%s", dataExportFileBaseName, moment().formatTimestamp(true), 
                        dataExportFormat.value.fileNameExt)));
                    
                    console.info(sprintf("Exported data file (name=%s, mimeType=%s, size=%d).", dataExportFileName, dataExportFormat.value.fileMimeType, 
                        dataExportBlob.size));
                } else {
                    dataExportBlobPrevSize = dataExportBlob.size;
                }
            }, 500);
        },
        
        "buildDataExportContent": function () {
            var dataExportContent = {
                "headings": {},
                "items": []
            }, dataExportContentItem;
            
            $("thead tr th[data-field]", this.dataTableElem).each($.proxy($.hitcomp.DataExporter.buildDataExportContentItem, dataExportContent.headings));
            
            $("tbody tr:not(.disabled)", this.dataTableElem).each(function (dataExportRowIndex, dataExportRowElem) {
                $("td[data-field]", dataExportRowElem).each($.proxy($.hitcomp.DataExporter.buildDataExportContentItem, (dataExportContentItem = {})));
                
                dataExportContent.items.push(dataExportContentItem);
            });
            
            return dataExportContent;
        }
    });
})(jQuery);
