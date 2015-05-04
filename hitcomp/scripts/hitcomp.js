(function ($) {
    $(window).load(function () {
        $.hitcomp.analytics.configureAnalytics();
        
        var bodyElem = $("body"), navBarElem = $("nav.navbar", bodyElem), navBarHeaderElem = $("div.navbar-header", navBarElem),
            navBarBrandElem = $("a.navbar-brand", navBarHeaderElem), contentNavTabsElem = $("ul.navbar-nav.nav-tabs", navBarElem),
            contentNavTabLinkElems = $("li a", contentNavTabsElem), contentElem = $("div#content", bodyElem),
            contentTabsElem = $("div#content-tabs", contentElem), homeTabElem = $("div#content-home-tab", contentTabsElem),
            homeDataElem = $("div.content-data", homeTabElem), glossaryTableElem = $("table", homeDataElem);
        
        navBarBrandElem.attr("href", document.location.href.split("#", 2)[0]);
        
        $("div.content-tab:not(#content-home-tab) div.content-data table thead tr th", contentTabsElem).each(
            function (dataTableHeaderIndex, dataTableHeaderElem) {
            var glossaryTableRowElem = $(sprintf("tbody tr[data-field=\"%s\"]", (dataTableHeaderElem = $(dataTableHeaderElem)).attr("data-field")), 
                glossaryTableElem);
            
            if (glossaryTableRowElem.length > 0) {
                dataTableHeaderElem.attr("data-placement", "top").attr("data-toggle", "tooltip").tooltip({
                    "title": $.trim($("td:last span.content-text", glossaryTableRowElem).html())
                });
            }
        });
        
        glossaryTableElem.tablesorter($.extend({}, $.tablesorter.defaults, {
            "initialized": function () {
                homeDataElem.prev("div.content-loading").hide();
                homeDataElem.show();
            },
            "selectorHeaders": "> thead tr th:not(:last-of-type)",
            "sortList": [
                [ 0, 0 ]
            ],
            "textExtraction": function (glossaryDataElem) {
                return $("span.content-text", glossaryDataElem).text();
            }
        }));
        
        contentNavTabLinkElems.on("shown.bs.tab", function (event) {
            if (localStorage) {
                localStorage.setItem($.hitcomp.ui.CONTENT_TAB_ACTIVE_KEY, contentNavTabLinkElems.index(event.target));
            }
        });
        
        var contentNavTabActiveValue = 0;
        
        if (localStorage) {
            var contentNavTabActiveStrValue = localStorage.getItem($.hitcomp.ui.CONTENT_TAB_ACTIVE_KEY);
            
            contentNavTabActiveValue = (contentNavTabActiveStrValue ? (Number(contentNavTabActiveStrValue)) : contentNavTabActiveValue);
        }
        
        contentNavTabLinkElems.eq(contentNavTabActiveValue).tab("show");
        
        contentTabsElem.prev("div.content-loading").hide();
        contentTabsElem.show();
        
        var compsTabElem = $("div#content-comps-tab", contentTabsElem), compsFilterElem = $("div.content-filter", compsTabElem), 
            compsDataElem = $("div.content-data", compsTabElem), compsTableElem = $("table", compsDataElem), compsTableBodyElem = $("tbody", compsTableElem), 
            compsDataSet, comps = [], compRowElems = [], compsExporter, compsFilters = [];
        
        compsDataSet = new $.hitcomp.DataSet("comp", "1267F0p2IXcLz_G1ImRngAmcWEaYS1SXP7wtx0J1sh6c", "All Levels Combined", function (compsDataSet, compsData) {
            var comp;
            
            $.each(compsData, function (compDataObjIndex, compDataObj) {
                comps.push((comp = new $.hitcomp.Competency(compDataObj)));
                compRowElems.push(comp.buildRowElement());
            });
            
            compsTableBodyElem.append(compRowElems);
            
            $("div.input-group-sm div.btn-group button.btn", compsDataElem).tooltip({ "title": "Export Data" });
            
            compsExporter = new $.hitcomp.DataExporter(compsTableElem);
            
            $("div.input-group-sm div.btn-group div.dropdown ul.dropdown-menu li a", compsDataElem).bind("mouseup", {
                "compsExporter": compsExporter
            }, function (event) {
                event.data.compsExporter.export(event, "hitcomp-comps");
            });
            
            compsTableElem.tablesorter($.hitcomp.Competency.buildTableSorter(compsTableElem));
            
            var compFilterType, compFilter;
            
            $("select", compsFilterElem).each(function (compFilterSelectIndex, compFilterSelectElem) {
                compsFilters.push((compFilter = new $.hitcomp.CompetencyFilter(
                    (compFilterType = (compFilterSelectElem = $(compFilterSelectElem)).parent().parent().attr("data-field")), compsTableElem, 
                    compFilterSelectElem)));
                
                compFilterSelectElem.multiselect(compFilter.buildSelect());
                compFilterSelectElem.multiselect("dataprovider", $.fn.multiselect.buildDataProvider($.map(((compFilterType == "level") ? 
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
                    dataFilter.dataFilterSelectElem.multiselect("deselectAllOptions");
                });
            }).tooltip({ "title": "Reset Filters" });
            
            compsFilterElem.prev("div.content-loading").hide();
            compsFilterElem.show();
        });
        
        compsDataSet.load();
        
        var rolesTabElem = $("div#content-roles-tab", contentTabsElem), rolesLocalizeElem = $("div.content-localize", rolesTabElem), 
            rolesLocalizeSelectElem = $("select", rolesLocalizeElem), rolesFilterElem = $("div.content-filter", rolesTabElem), 
            rolesDataElem = $("div.content-data", rolesTabElem), rolesTableElem = $("table", rolesDataElem), rolesTableBodyElem = $("tbody", rolesTableElem), 
            rolesDataSet, roles = [], roleRowElems = [], rolesExporter, rolesFilters = [], rolesLocalize;
        
        rolesDataSet = new $.hitcomp.DataSet("role", "1c-UAVzi-BRfXmunI7DpyM1lp8CG8qsX-IpyvLU1OdH4", "DPC-Clinical Roles", function (rolesDataSet, rolesData) {
            var role;
            
            $.each(rolesData, function (roleDataObjIndex, roleDataObj) {
                roles.push((role = new $.hitcomp.Role(roleDataObj)));
                roleRowElems.push(role.buildRowElement());
            });
            
            rolesTableBodyElem.append(roleRowElems);
            
            $("div.input-group-sm div.btn-group button.btn", rolesDataElem).tooltip({ "title": "Export Data" });
            
            rolesExporter = new $.hitcomp.DataExporter(rolesTableElem);
            
            $("div.input-group-sm div.btn-group div.dropdown ul.dropdown-menu li a", rolesDataElem).bind("mouseup", {
                "rolesExporter": rolesExporter
            }, function (event) {
                event.data.rolesExporter.export(event, "hitcomp-roles");
            });
            
            rolesTableElem.tablesorter($.hitcomp.Role.buildTableSorter(rolesTableElem));
            
            var roleFilterType, roleFilter;
            
            $("select", rolesFilterElem).each(function (roleFilterSelectIndex, roleFilterSelectElem) {
                rolesFilters.push((roleFilter = new $.hitcomp.RoleFilter(
                    (roleFilterType = (roleFilterSelectElem = $(roleFilterSelectElem)).parent().parent().attr("data-field")), rolesTableElem, 
                    roleFilterSelectElem)));
                
                roleFilterSelectElem.multiselect(roleFilter.buildSelect());
                roleFilterSelectElem.multiselect("dataprovider", $.fn.multiselect.buildDataProvider($.map(((roleFilterType == "level") ? 
                    $.grep($.hitcomp.CompetencyLevel.enums, function (compLevel) {
                        return (compLevel.value.order >= 0);
                    }) : $.map(roles, function (role) {
                        return role[roleFilterType];
                    })).sort(function (roleItemValue1, roleItemValue2) {
                        if (roleFilterType == "level") {
                            return roleItemValue1.value.compareTo(roleItemValue2.value);
                        }
                        
                        if (roleFilterType == "roles") {
                            var rolesLocalizeSelectValue = rolesLocalizeSelectElem.val();
                            
                            roleItemValue1 = roleItemValue1[rolesLocalizeSelectValue];
                            roleItemValue2 = roleItemValue2[rolesLocalizeSelectValue];
                        }
                        
                        return $.tablesorter.replaceAccents(roleItemValue1).localeCompare($.tablesorter.replaceAccents(roleItemValue2));
                    }), function (roleItemValue) {
                        switch (roleFilterType) {
                            case "level":
                                return roleItemValue.value.displayName;
                            
                            case "roles":
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
                    dataFilter.dataFilterSelectElem.multiselect("deselectAllOptions");
                });
            }).tooltip({ "title": "Reset Filters" });
            
            (rolesLocalize = new $.hitcomp.RoleLocalization($("div.input-group-sm[data-field=\"roles\"] select", rolesFilterElem), rolesTableElem, 
                rolesLocalizeSelectElem)).determineDefault();
            
            rolesLocalizeSelectElem.selectpicker();
            
            rolesLocalizeSelectElem.bind("change", { "rolesLocalize": rolesLocalize }, function (event) {
                event.data.rolesLocalize.localize(rolesLocalizeSelectElem.val());
            });
            
            $("tr td[data-field=\"level\"] button", compsTableBodyElem).bind("click", {
                "contentNavTabLinkElems": contentNavTabLinkElems,
                "rolesFilterElem": rolesFilterElem
            }, function (event) {
                var roleLevelFilterSelectElem = $("select:eq(2)", event.data.rolesFilterElem), 
                    roleLevelFilter = roleLevelFilterSelectElem.data($.hitcomp.DataFilter.DATA_OBJ_KEY), compDataElem = $(event.target).parent();
                
                roleLevelFilter.dataFilterSelectElem.multiselect("deselectAllOptions");
                
                roleLevelFilterSelectElem.multiselect("select", (compDataElem.is("td") ? compDataElem : compDataElem.parent())
                    .data($.hitcomp.DataItem.DATA_VALUE_KEY), true);
                
                event.data.contentNavTabLinkElems.eq(2).tab("show");
                
                $(document).scrollTop(0);
            });
            
            $("tr td[data-field=\"level\"] button", rolesTableBodyElem).bind("click", {
                "contentNavTabLinkElems": contentNavTabLinkElems,
                "compsFilterElem": compsFilterElem
            }, function (event) {
                var compLevelFilterSelectElem = $("select:eq(2)", event.data.compsFilterElem), 
                    compLevelFilter = compLevelFilterSelectElem.data($.hitcomp.DataFilter.DATA_OBJ_KEY), roleDataElem = $(event.target).parent();
                
                compLevelFilter.dataFilterSelectElem.multiselect("deselectAllOptions");
                
                compLevelFilterSelectElem.multiselect("select", (roleDataElem.is("td") ? roleDataElem : roleDataElem.parent())
                    .data($.hitcomp.DataItem.DATA_VALUE_KEY), true);
                
                event.data.contentNavTabLinkElems.eq(1).tab("show");
                
                $(document).scrollTop(0);
            });
            
            rolesFilterElem.prev("div.content-loading").hide();
            rolesFilterElem.show();
            
            rolesLocalizeElem.prev("div.content-loading").hide();
            rolesLocalizeElem.show();
        });
        
        rolesDataSet.load();
    });
}(jQuery));
