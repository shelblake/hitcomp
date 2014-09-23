$(document).ready(function () {
    var contentTabsElem = $("div#content-tabs");
    contentTabsElem.tabs();
    
    $("div.content-data table thead tr th", contentTabsElem).each(function (dataHeaderIndex, dataHeaderElem) {
        if ((dataHeaderElem = $(dataHeaderElem)).attr("data-toggle") == "tooltip") {
            dataHeaderElem.tooltip({
                "container": "body",
                "html": true,
                "title": function () {
                    return $.trim($("div.tooltip-content", this).html());
                }
            });
        }
    });
    
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
        
        compsTableElem.tablesorter($.hitcomp.Competency.buildTableSorter(compsTableElem));
        
        var compFilterType, compFilter;
        
        $("select", compsFilterElem).each(function (compFilterSelectIndex, compFilterSelectElem) {
            compsFilters.push((compFilter = new $.hitcomp.CompetencyFilter((compFilterType = (compFilterSelectElem = $(compFilterSelectElem)).attr("datafld")), 
                compsTableElem, compFilterSelectElem)));
            
            compFilterSelectElem.multiselect(compFilter.buildSelect());
            compFilterSelectElem.multiselect("dataprovider", compFilter.buildSelectDataProvider($.map(((compFilterType == "level") ? 
                $.grep($.hitcomp.CompetencyLevel.enums, function (compLevel) {
                    return (compLevel.value.order >= 0);
                }) : $.map(comps, function (comp) {
                    return comp[compFilterType];
                })).sort(function (compItemValue1, compItemValue2) {
                    return ((compFilterType == "level") ? compItemValue1.value.compareTo(compItemValue2.value) : compItemValue1.localeCompare(compItemValue2));
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
        });
        
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
                    return ((roleFilterType == "level") ? roleItemValue.value.displayName : roleItemValue);
                }).unique()));
            
            roleFilterSelectElem.parent().append(roleFilter.buildSelectControlElements());
        });
        
        $("div.input-group-sm:first-of-type div.btn-group button[type=\"reset\"]", rolesFilterElem).bind("click", { "dataFilters": rolesFilters }, 
            function (event) {
            $.each(event.data.dataFilters, function (dataFilterIndex, dataFilter) {
                dataFilter.deselectAll.call(dataFilter);
            });
        });
        
        (rolesLocalize = new $.hitcomp.RoleLocalization(roles, rolesTableElem, rolesLocalizeSelectElem)).determineDefault();
        
        rolesLocalizeSelectElem.bind("change", { "rolesLocalize": rolesLocalize }, function (event) {
            event.data.rolesLocalize.localize.call(event.data.rolesLocalize, rolesLocalizeSelectElem.val());
        });
        
        $("tr td:nth-of-type(3) button", compsTableBodyElem).bind("click", {
            "contentTabsElem": contentTabsElem,
            "rolesFilterElem": rolesFilterElem
        }, function (event) {
            var roleLevelFilterSelectElem = $($("select", event.data.rolesFilterElem)[2]), 
                roleLevelFilter = roleLevelFilterSelectElem.data($.hitcomp.DataFilter.DATA_KEY);
            
            roleLevelFilter.deselectAll.call(roleLevelFilter);
            
            roleLevelFilterSelectElem.multiselect("select", $(event.target).parent().data($.hitcomp.DataItem.DATA_VALUE_KEY), true);
            
            event.data.contentTabsElem.tabs("option", "active", 2);
        });
        
        $("tr td:nth-of-type(3) button", rolesTableBodyElem).bind("click", {
            "contentTabsElem": contentTabsElem,
            "compsFilterElem": compsFilterElem
        }, function (event) {
            var compLevelFilterSelectElem = $($("select", event.data.compsFilterElem)[2]), 
                compLevelFilter = compLevelFilterSelectElem.data($.hitcomp.DataFilter.DATA_KEY);
            
            compLevelFilter.deselectAll.call(compLevelFilter);
            
            compLevelFilterSelectElem.multiselect("select", $(event.target).parent().data($.hitcomp.DataItem.DATA_VALUE_KEY), true);
            
            event.data.contentTabsElem.tabs("option", "active", 1);
        });
        
        rolesFilterElem.prev("div.content-loading").hide();
        rolesFilterElem.show();
        
        rolesLocalizeElem.prev("div.content-loading").hide();
        rolesLocalizeElem.show();
    };
    
    rolesDataSet.load();
});
