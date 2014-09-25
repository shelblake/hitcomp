(function ($) {
    $(window).load(function () {
        $.hitcomp.analytics.configureAnalytics();
        
        var contentTabsElem = $("div#content-tabs").tabs();
        
        $("div.content-data table thead tr th[data-toggle=\"tooltip\"]", contentTabsElem).tooltip();
        
        if (localStorage) {
            var contentTabActive;
            
            if ((contentTabActive = localStorage.getItem($.hitcomp.ACTIVE_TAB_KEY))) {
                contentTabsElem.tabs("option", "active", (contentTabActive = (Number(contentTabActive))));
            }
            
            contentTabsElem.tabs("option", "activate", function (event, ui) {
                localStorage.setItem($.hitcomp.ACTIVE_TAB_KEY, contentTabsElem.tabs("option", "active"));
            });
        }
        
        contentTabsElem.prev("div.content-loading").hide();
        contentTabsElem.show();
        
        var compsDataSet = new $.hitcomp.DataSet("comp", "1267F0p2IXcLz_G1ImRngAmcWEaYS1SXP7wtx0J1sh6c", "All Levels Combined"), 
            compsTabElem = $("div#content-comps-tab", contentTabsElem), compsFilterElem = $("div.content-filter", compsTabElem), 
            compsDataElem = $("div.content-data", compsTabElem), compsTableElem = $("table", compsDataElem), compsTableBodyElem = $("tbody", compsTableElem), 
            comps = [], compsFilters = [];
        
        compsDataSet.onLoad = function (compsDataSet, compsData) {
            var comp;
            
            $.each(compsData, function (compDataObjIndex, compDataObj) {
                comps.push((comp = new $.hitcomp.Competency(compDataObj)));
                
                compsTableBodyElem.append(comp.buildRowElement());
            });
            
            $("div.input-group-sm div.btn-group button.btn", compsDataElem).tooltip({
                "title": "Export Competencies"
            });
            
            $("div.input-group-sm div.btn-group div.dropdown.content-data-dropdown-export ul.dropdown-menu li a", compsDataElem).bind("click", {
                "compsTableElem": compsTableElem
            }, function (event) {
                var compsDataExportLinkElem = $(event.target), compsDataExportType;
                
                switch ((compsDataExportType = $.trim((compsDataExportLinkElem = (compsDataExportLinkElem.is("a") ? compsDataExportLinkElem : 
                    compsDataExportLinkElem.parent())).text()).toLowerCase())) {
                    case "text":
                        compsDataExportType = "txt";
                        break;
                    
                    case "word":
                        compsDataExportType = "doc";
                        break;
                }
                
                var compsDataExportHolder = $("div.content-data-export-holder", event.data.compsTableElem.parent()), 
                    compsDataExportTable = event.data.compsTableElem.clone();
                
                $("tbody tr.disabled", compsDataExportTable).remove();
                
                $("thead tr th, tbody tr td[datafld]", compsDataExportTable).each(function (compsDataExportIndex, compsDataExportElem) {
                    (compsDataExportElem = $(compsDataExportElem)).text($.trim($("span", compsDataExportElem)[0].textContent.normalize().printable()));
                });
                
                compsDataExportHolder.empty().append(compsDataExportTable);
                
                compsDataExportTable.tableExport({
                    "escape": false.toString(),
                    "ignoreColumn": [ 7 ],
                    "pdfFontSize": 10,
                    "pdfLeftMargin": 5,
                    "tableName": "HITCOMP - Competencies",
                    "type": compsDataExportType
                });
            });
            
            compsTableElem.tablesorter($.hitcomp.Competency.buildTableSorter(compsTableElem));
            
            var compFilterType, compFilter;
            
            $("select", compsFilterElem).each(function (compFilterSelectIndex, compFilterSelectElem) {
                compsFilters.push((compFilter = new $.hitcomp.CompetencyFilter(
                    (compFilterType = (compFilterSelectElem = $(compFilterSelectElem)).attr("datafld")), compsTableElem, compFilterSelectElem)));
                
                compFilterSelectElem.multiselect(compFilter.buildSelect());
                compFilterSelectElem.multiselect("dataprovider", compFilter.buildSelectDataProvider($.map(((compFilterType == "level") ? 
                    $.grep($.hitcomp.CompetencyLevel.enums, function (compLevel) {
                        return (compLevel.value.order >= 0);
                    }) : $.map(comps, function (comp) {
                        return comp[compFilterType];
                    })).sort(function (compItemValue1, compItemValue2) {
                        return ((compFilterType == "level") ? compItemValue1.value.compareTo(compItemValue2.value) : 
                            compItemValue1.localeCompare(compItemValue2));
                    }), function (compItemValue) {
                        return ((compFilterType == "level") ? compItemValue.value.displayName : compItemValue);
                    }).unique()));
                
                compFilterSelectElem.parent().append(compFilter.buildSelectControlElements());
            });
            
            $("div.input-group-sm:first-of-type div.btn-group button[type=\"reset\"]", compsFilterElem).bind("click", { "dataFilters": compsFilters }, 
                function (event) {
                $.each(event.data.dataFilters, function (dataFilterIndex, dataFilter) {
                    dataFilter.deselectAll.call(dataFilter);
                });
            }).tooltip();
            
            compsFilterElem.prev("div.content-loading").hide();
            compsFilterElem.show();
        };
        
        compsDataSet.load();
        
        var rolesDataSet = new $.hitcomp.DataSet("role", "1c-UAVzi-BRfXmunI7DpyM1lp8CG8qsX-IpyvLU1OdH4", "DPC-Clinical Roles"), 
            rolesTabElem = $("div#content-roles-tab", contentTabsElem), rolesLocalizeElem = $("div.content-localize", rolesTabElem), 
            rolesLocalizeSelectElem = $("select", rolesLocalizeElem), rolesFilterElem = $("div.content-filter", rolesTabElem), 
            rolesDataElem = $("div.content-data", rolesTabElem), rolesTableElem = $("table", rolesDataElem), rolesTableBodyElem = $("tbody", rolesTableElem), 
            roles = [], rolesFilters = [], rolesLocalize;
        
        rolesDataSet.onLoad = function (rolesDataSet, rolesData) {
            var role;
            
            $.each(rolesData, function (roleDataObjIndex, roleDataObj) {
                roles.push((role = new $.hitcomp.Role(roleDataObj)));
                
                rolesTableBodyElem.append(role.buildRowElement());
            });
            
            rolesTableElem.tablesorter($.hitcomp.Role.buildTableSorter(rolesTableElem));
            
            var roleFilterType, roleFilter;
            
            $("select", rolesFilterElem).each(function (roleFilterSelectIndex, roleFilterSelectElem) {
                rolesFilters.push((roleFilter = new $.hitcomp.RoleFilter((roleFilterType = (roleFilterSelectElem = $(roleFilterSelectElem)).attr("datafld")), 
                    rolesTableElem, roleFilterSelectElem)));
                
                roleFilterSelectElem.multiselect(roleFilter.buildSelect());
                roleFilterSelectElem.multiselect("dataprovider", roleFilter.buildSelectDataProvider($.map(((roleFilterType == "level") ? 
                    $.grep($.hitcomp.CompetencyLevel.enums, function (compLevel) {
                        return (compLevel.value.order >= 0);
                    }) : $.map(roles, function (role) {
                        return role[roleFilterType];
                    })).sort(function (roleItemValue1, roleItemValue2) {
                        if (roleFilterType == "level") {
                            return roleItemValue1.value.compareTo(roleItemValue2.value);
                        } else if (roleFilterType == "rolesEu") {
                            var rolesLocalizeSelectValue = rolesLocalizeSelectElem.val();
                            
                            roleItemValue1 = roleItemValue1[rolesLocalizeSelectValue];
                            roleItemValue2 = roleItemValue2[rolesLocalizeSelectValue];
                        }
                        
                        return roleItemValue1.localeCompare(roleItemValue2);
                    }), function (roleItemValue) {
                        switch (roleFilterType) {
                            case "level":
                                return roleItemValue.value.displayName;
                            
                            case "rolesEu":
                                return roleItemValue[rolesLocalizeSelectElem.val()];
                            
                            default:
                                return roleItemValue;
                        }
                    }).unique()));
                
                roleFilterSelectElem.parent().append(roleFilter.buildSelectControlElements());
            });
            
            $("div.input-group-sm:first-of-type div.btn-group button[type=\"reset\"]", rolesFilterElem).bind("click", { "dataFilters": rolesFilters }, 
                function (event) {
                $.each(event.data.dataFilters, function (dataFilterIndex, dataFilter) {
                    dataFilter.deselectAll.call(dataFilter);
                });
            }).tooltip();
            
            (rolesLocalize = new $.hitcomp.RoleLocalization(roles, rolesTableElem, rolesLocalizeSelectElem)).determineDefault();
            
            rolesLocalizeSelectElem.bind("change", { "rolesLocalize": rolesLocalize }, function (event) {
                event.data.rolesLocalize.localize.call(event.data.rolesLocalize, rolesLocalizeSelectElem.val());
            });
            
            $("tr td[datafld=\"level\"] button", compsTableBodyElem).bind("click", {
                "contentTabsElem": contentTabsElem,
                "rolesFilterElem": rolesFilterElem
            }, function (event) {
                var roleLevelFilterSelectElem = $($("select", event.data.rolesFilterElem)[2]), 
                    roleLevelFilter = roleLevelFilterSelectElem.data($.hitcomp.DataFilter.DATA_KEY), compDataElem = $(event.target).parent();
                
                roleLevelFilter.deselectAll.call(roleLevelFilter);
                
                roleLevelFilterSelectElem.multiselect("select", (compDataElem.is("td") ? compDataElem : compDataElem.parent())
                    .data($.hitcomp.DataItem.DATA_VALUE_KEY), true);
                
                event.data.contentTabsElem.tabs("option", "active", 2);
                
                $(document).scrollTop(0);
            });
            
            $("tr td[datafld=\"level\"] button", rolesTableBodyElem).bind("click", {
                "contentTabsElem": contentTabsElem,
                "compsFilterElem": compsFilterElem
            }, function (event) {
                var compLevelFilterSelectElem = $($("select", event.data.compsFilterElem)[2]), 
                    compLevelFilter = compLevelFilterSelectElem.data($.hitcomp.DataFilter.DATA_KEY), roleDataElem = $(event.target).parent();
                
                compLevelFilter.deselectAll.call(compLevelFilter);
                
                compLevelFilterSelectElem.multiselect("select", (roleDataElem.is("td") ? roleDataElem : roleDataElem.parent())
                    .data($.hitcomp.DataItem.DATA_VALUE_KEY), true);
                
                event.data.contentTabsElem.tabs("option", "active", 1);
                
                $(document).scrollTop(0);
            });
            
            rolesFilterElem.prev("div.content-loading").hide();
            rolesFilterElem.show();
            
            rolesLocalizeElem.prev("div.content-loading").hide();
            rolesLocalizeElem.show();
        };
        
        rolesDataSet.load();
    });
})(jQuery);
