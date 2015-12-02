(function ($) {
    //====================================================================================================
    // CLASS: ROLE
    //====================================================================================================
    $.extend($.hitcomp, {
        "Role": function (dataObj) {
            $.hitcomp.DataItem.call(this, dataObj);
            
            this.domain = dataObj["clinicalnon-clinical"].tokenize($.hitcomp.DataItem.DATA_VALUE_DELIM);
            this.type = dataObj.roletype;
            this.serviceCategory = dataObj.servicecategory;
            this.roles = {
                "de": dataObj.eurolesdefin,
                "en-GB": dataObj.eurolesenglish,
                "en-US": dataObj.usroles,
                "es": dataObj.euroleses,
                "fr": dataObj.eurolesfr,
                "it": dataObj.eurolesit
            };
            this.desc = dataObj.definition;
        }
    });
    
    $.extend($.hitcomp.Role, $.hitcomp.DataItem, {
        "buildTableSorter": function (dataTableElem) {
            var dataTableSorter = $.hitcomp.DataItem.buildTableSorter.call(undefined, dataTableElem), dataTableSorterFunc = dataTableSorter.textSorter;
            
            return $.extend(dataTableSorter, {
                "sortList": [
                    [ 4, 0 ]
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
        "type": undefined,
        "serviceCategory": undefined,
        "roles": undefined,
        
        "buildRowElement": function () {
            return $.hitcomp.DataItem.prototype.buildRowElement.call(this).prepend($.map({
                "domain": this.domain,
                "type": this.type,
                "level": this.level.value.displayName,
                "serviceCategory": this.serviceCategory,
                "roles": this.roles["en-US"]
            }, $.proxy(function (dataValue, dataType) {
                return this.buildDataElement(dataType, dataValue);
            }, this)));
        },
        
        "buildDataElement": function (dataType, dataValue) {
            var dataElem = $.hitcomp.DataItem.prototype.buildDataElement.call(this, dataType, dataValue);
            
            if (dataType == "level") {
                $("button", dataElem).tooltip({
                    "title": "Apply to Competencies"
                });
            }
            
            return dataElem;
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
        "RoleLocalization": function (dataFilterSelectElem, dataTableElem, dataLocalizeSelectElem) {
            this.dataFilterSelectElem = dataFilterSelectElem;
            this.dataTableElem = dataTableElem;
            this.dataLocalizeSelectElem = dataLocalizeSelectElem;
        }
    });
    
    $.extend($.hitcomp.RoleLocalization, {
        "HTTP_HEADER_ACCEPT_LANG_NAME": "Accept-Language",
        "HTTP_HEADERS_API_URL": "wsgi/http-headers.wsgi"
    });
    
    $.extend($.hitcomp.RoleLocalization.prototype, {
        "dataFilterSelectElem": undefined,
        "dataTableElem": undefined,
        "dataLocalizeSelectElem": undefined,
        "culture": undefined,
        
        "determineDefault": function () {
            $.ajax({
                "dataType": "json",
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
            
            this.dataFilterSelectElem.multiselect("deselectAllOptions");
            
            this.dataFilterSelectElem.multiselect("dataprovider", $.fn.multiselect.buildDataProvider($.map($("tbody tr td[data-field=\"roles\"]", 
                this.dataTableElem), $.proxy(function (dataElem) {
                var dataValue = (dataElem = $(dataElem)).parent().data($.hitcomp.DataItem.DATA_OBJ_KEY).roles[dataLocalizeLangValue];
                
                dataElem.data($.hitcomp.DataItem.DATA_VALUE_KEY, dataValue);
                
                $("span.content-text", dataElem).text(dataValue);
                
                return dataValue;
            }, this)).sort(function (rolesValue1, rolesValue2) {
                return $.tablesorter.replaceAccents(rolesValue1).localeCompare($.tablesorter.replaceAccents(rolesValue2));
            }).unique()));
            
            this.dataTableElem.trigger("update", [
                true,
                $.proxy(function () {
                    var dataLocalizeLabelElems = $(("div.content-filter div.input-group-sm[data-field=\"roles\"] label i.icon.icon-flag, " +
                        "div.content-data table thead tr th[data-field=\"roles\"] i.icon.icon-flag"), this.dataTableElem.parent().parent());
                    
                    dataLocalizeLabelElems.removeClass(dataLocalizeLabelElems.getClass());
                    
                    dataLocalizeLabelElems.addClass([
                        "icon",
                        "icon-flag",
                        ("icon-flag-" + dataLocalizeLangValue.split("-", 2).last().toLowerCase())
                    ]);
                }, this)
            ]);
        }
    });
    
    //====================================================================================================
    // CLASS: ROLE CONTROLLER
    //====================================================================================================
    $.extend($.hitcomp, {
        "RoleController": function (contentNavTabLinkElems, compsController, tabElem) {
            $.hitcomp.DataController.call(this, tabElem);
            
            this.contentNavTabLinkElems = contentNavTabLinkElems;
            this.compsController = compsController;
            this.localizeElem = this.tabElem.find("div.content-localize");
            this.localizeSelectElem = this.localizeElem.find("select");
        }
    });
    
    $.extend($.hitcomp.RoleController, $.hitcomp.DataController);
    
    $.extend($.hitcomp.RoleController.prototype, $.hitcomp.DataController.prototype, {
        "contentNavTabLinkElems": undefined,
        "compsController": undefined,
        "localizeElem": undefined,
        "localizeSelectElem": undefined,
        "localization": undefined,
        
        "load": function (settings) {
            var controller = this, dataSet = new $.hitcomp.DataSet("role", settings.rolesSheetId, settings.rolesSheetName, function (rolesDataSet, rolesData) {
                controller.tableElem.data($.hitcomp.DataSet.DATA_OBJ_KEY, (controller.dataSet = rolesDataSet));
                
                var role;
                
                $.each(rolesData, function (roleDataObjIndex, roleDataObj) {
                    controller.items.push((role = new $.hitcomp.Role(roleDataObj)));
                    controller.rowElems.push(role.buildRowElement());
                });
                
                controller.tableBodyElem.append(controller.rowElems);
                
                $("div.input-group-sm div.btn-group button.btn", controller.dataElem).tooltip({ "title": "Export Data" });
                
                controller.exporter = new $.hitcomp.DataExporter(controller.tableElem);
                
                $("div.input-group-sm div.btn-group div.dropdown ul.dropdown-menu li a", controller.dataElem).bind("mouseup", {
                    "rolesExporter": controller.exporter
                }, function (event) {
                    event.data.rolesExporter.export(event, "hitcomp-roles");
                });
                
                controller.tableElem.tablesorter($.hitcomp.Role.buildTableSorter(controller.tableElem));
                
                var roleFilterType, roleFilter;
                
                $("select", controller.filterElem).each(function (roleFilterSelectIndex, roleFilterSelectElem) {
                    controller.filters.push((roleFilter = new $.hitcomp.RoleFilter(
                        (roleFilterType = (roleFilterSelectElem = $(roleFilterSelectElem)).parent().parent().attr("data-field")), controller.tableElem, 
                        roleFilterSelectElem)));
                    
                    roleFilterSelectElem.multiselect(roleFilter.buildSelect());
                    roleFilterSelectElem.multiselect("dataprovider", $.fn.multiselect.buildDataProvider($.map(((roleFilterType == "level") ? 
                        $.grep($.hitcomp.CompetencyLevel.enums, function (compLevel) {
                            return (compLevel.value.order >= 0);
                        }) : $.map(controller.items, function (role) {
                            return role[roleFilterType];
                        })).sort(function (roleItemValue1, roleItemValue2) {
                            if (roleFilterType == "level") {
                                return roleItemValue1.value.compareTo(roleItemValue2.value);
                            }
                            
                            if (roleFilterType == "roles") {
                                var rolesLocalizeSelectValue = controller.localizeSelectElem.val();
                                
                                roleItemValue1 = roleItemValue1[rolesLocalizeSelectValue];
                                roleItemValue2 = roleItemValue2[rolesLocalizeSelectValue];
                            }
                            
                            return $.tablesorter.replaceAccents(roleItemValue1).localeCompare($.tablesorter.replaceAccents(roleItemValue2));
                        }), function (roleItemValue) {
                            switch (roleFilterType) {
                                case "level":
                                    return roleItemValue.value.displayName;
                                
                                case "roles":
                                    return roleItemValue[controller.localizeSelectElem.val()];
                                
                                default:
                                    return roleItemValue;
                            }
                        }).unique()));
                    
                    roleFilterSelectElem.parent().append(roleFilter.buildSelectControlElements());
                });
                
                $("div.input-group-sm:first-of-type div.btn-group button[type=\"reset\"]", controller.filterElem).bind("click",
                    { "dataFilters": controller.filters }, function (event) {
                    $.each(event.data.dataFilters, function (dataFilterIndex, dataFilter) {
                        dataFilter.dataFilterSelectElem.multiselect("deselectAllOptions");
                    });
                }).tooltip({ "title": "Reset Filters" });
                
                (controller.localization = new $.hitcomp.RoleLocalization($("div.input-group-sm[data-field=\"roles\"] select", controller.filterElem),
                    controller.tableElem, controller.localizeSelectElem)).determineDefault();
                
                controller.localizeSelectElem.selectpicker();
                
                controller.localizeSelectElem.bind("change", { "localization": controller.localization }, function (event) {
                    event.data.localization.localize(controller.localizeSelectElem.val());
                });
                
                $("tr td[data-field=\"level\"] button", controller.compsController.tableBodyElem).bind("click", {
                    "contentNavTabLinkElems": controller.contentNavTabLinkElems,
                    "rolesFilterElem": controller.filterElem
                }, function (event) {
                    var roleLevelFilterSelectElem = $("select", event.data.rolesFilterElem).eq(2), 
                        roleLevelFilter = roleLevelFilterSelectElem.data($.hitcomp.DataFilter.DATA_OBJ_KEY), compDataElem = $(event.target).parent();
                    
                    roleLevelFilter.dataFilterSelectElem.multiselect("deselectAllOptions");
                    
                    roleLevelFilterSelectElem.multiselect("select", (compDataElem.is("td") ? compDataElem : compDataElem.parent())
                        .data($.hitcomp.DataItem.DATA_VALUE_KEY), true);
                    
                    event.data.contentNavTabLinkElems.eq(2).tab("show");
                    
                    $(document).scrollTop(0);
                });
                
                $("tr td[data-field=\"level\"] button", controller.tableBodyElem).bind("click", {
                    "contentNavTabLinkElems": controller.contentNavTabLinkElems,
                    "compsFilterElem": controller.compsController.filterElem
                }, function (event) {
                    var compLevelFilterSelectElem = $("select", event.data.compsFilterElem).eq(1), 
                        compLevelFilter = compLevelFilterSelectElem.data($.hitcomp.DataFilter.DATA_OBJ_KEY), roleDataElem = $(event.target).parent();
                    
                    compLevelFilter.dataFilterSelectElem.multiselect("deselectAllOptions");
                    
                    compLevelFilterSelectElem.multiselect("select", (roleDataElem.is("td") ? roleDataElem : roleDataElem.parent())
                        .data($.hitcomp.DataItem.DATA_VALUE_KEY), true);
                    
                    event.data.contentNavTabLinkElems.eq(1).tab("show");
                    
                    $(document).scrollTop(0);
                });
                
                controller.filterElem.prev("div.content-loading").hide();
                controller.filterElem.show();
                
                controller.localizeElem.prev("div.content-loading").hide();
                controller.localizeElem.show();
            }, function (initial) {
                var numRolesSelected = (initial ? controller.rowElems.length : 0);
                
                if (!initial) {
                    $.each(controller.rowElems, function (roleRowIndex, roleRowElem) {
                        if ((roleRowElem = $(roleRowElem)).is(":not(.disabled)") && (roleRowElem.css("display") != "none")) {
                            numRolesSelected++;
                        }
                    });
                }
                
                controller.selectedNumElem.text(numRolesSelected);
                controller.selectedNumTotalElem.text(controller.rowElems.length);
                
                controller.selectedElem.show();
            });
            
            dataSet.load();
        }
    });
}(jQuery));
