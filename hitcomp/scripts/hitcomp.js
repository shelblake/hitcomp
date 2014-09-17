$(document).ready(function () {
    var contentTabsElem = $("div#content-tabs");
    contentTabsElem.tabs();
    
    $.extend($.tablesorter.themes.bootstrap, {
        "sortAsc": "fa fa-sort-up",
        "sortDesc": "fa fa-sort-down",
        "sortNone": "fa fa-sort",
        "table": "table table-bordered table-condensed table-hover"
    });
    
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
            compFilterSelectElem.multiselect("dataprovider", compFilter.buildSelectDataProvider($.map($.map(comps, function (comp) {
                return comp[compFilterType];
            }).sort(function (compItemValue1, compItemValue2) {
                return (compItemValue1.value ? compItemValue1.value.compareTo(compItemValue2.value) : compItemValue1.localeCompare(compItemValue2));
            }), function (compItemValue) {
                return (compItemValue.value ? compItemValue.value.displayName : compItemValue);
            }).unique()));
            
            compFilterSelectElem.parent().append(compFilter.buildSelectControlElements());
        });
        
        compsFilterElem.prev("div.content-loading").hide();
        
        compsFilterElem.show();
    };
    
    compsDataSet.load();
    
    var rolesDataSet = new $.hitcomp.DataSet("role", "1c-UAVzi-BRfXmunI7DpyM1lp8CG8qsX-IpyvLU1OdH4", "DPC-Clinical Roles"), 
        rolesTabElem = $("div#content-roles-tab", contentTabsElem), rolesFilterElem = $("div.content-filter", rolesTabElem), 
        rolesDataElem = $("div.content-data", rolesTabElem), rolesTableElem = $("table", rolesDataElem), rolesTableBodyElem = $("tbody", rolesTableElem), 
        roles = [], rolesFilters = [];
    
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
            roleFilterSelectElem.multiselect("dataprovider", roleFilter.buildSelectDataProvider($.map($.map(roles, function (role) {
                return role[roleFilterType];
            }).sort(function (roleItemValue1, roleItemValue2) {
                return (roleItemValue1.value ? roleItemValue1.value.compareTo(roleItemValue2.value) : roleItemValue1.localeCompare(roleItemValue2));
            }), function (roleItemValue) {
                return (roleItemValue.value ? roleItemValue.value.displayName : roleItemValue);
            }).unique()));
            
            roleFilterSelectElem.parent().append(roleFilter.buildSelectControlElements());
        });
        
        rolesFilterElem.prev("div.content-loading").hide();
        
        rolesFilterElem.show();
    };
    
    rolesDataSet.load();
});
