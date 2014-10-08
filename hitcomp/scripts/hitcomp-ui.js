(function ($) {
    //====================================================================================================
    // EXTENSIONS: BOOTSTRAP TOOLTIP
    //====================================================================================================
    $.extend($.fn.tooltip.Constructor.DEFAULTS, {
        "container": "body",
        "html": true,
        "title": function () {
            return $.trim($("div.tooltip-content", this).html());
        }
    });
    
    //====================================================================================================
    // EXTENSIONS: TABLESORTER
    //====================================================================================================
    $.extend($.tablesorter.defaults, {
        "headerTemplate": "{content}{icon}",
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
    });
    
    //====================================================================================================
    // EXTENSIONS: TABLESORTER THEME
    //====================================================================================================
    $.extend($.tablesorter.themes.bootstrap, {
        "sortAsc": "fa fa-fw fa-sort-up",
        "sortDesc": "fa fa-fw fa-sort-down",
        "sortNone": "fa fa-fw fa-sort",
        "table": "table table-bordered table-condensed table-hover"
    });
    
    //====================================================================================================
    // EXTENSIONS: BOOTSTRAP SELECT
    //====================================================================================================
    $.extend($.fn.selectpicker.Constructor.DEFAULTS, {
        "dropupAuto": false,
        "iconBase": String.EMPTY,
        "style": "btn btn-default form-control"
    });
    
    //====================================================================================================
    // EXTENSIONS: BOOTSTRAP MULTISELECT
    //====================================================================================================
    $.extend($.fn.multiselect, {
        "buildDataProvider": function (optValues) {
            return $.map(optValues, function (optValue) {
                return {
                    "label": optValue,
                    "value": optValue
                };
            });
        }
    });
    
    $.extend($.fn.multiselect.Constructor.prototype, {
        "deselectAllOptions": function () {
            this.setAllOptions(false);
        },
        
        "selectAllOptions": function () {
            this.setAllOptions(true);
        },
        
        "setAllOptions": function (optState) {
            $("option", this.$select).each($.proxy(function (optIndex, optElem) {
                $.proxy((optState ? this.select : this.deselect), this)($(optElem).val(), true);
            }, this));
        }
    });
    
    $.extend($.fn.multiselect.Constructor.prototype.defaults, {
        "buttonClass": "btn btn-default form-control",
        "buttonContainer": '<div class="btn-group btn-group-sm"/>',
        "enableCaseInsensitiveFiltering": true,
        "filterBehavior": "text",
        "maxHeight": 400
    });
    
    $.extend($.fn.multiselect.Constructor.prototype.defaults.templates, {
        "filter": ('<div class="input-group"><span class="input-group-addon"><i class="fa fa-search"></i></span>' +
            '<input class="form-control multiselect-search" type="text"/></div>')
    });
    
    //====================================================================================================
    // NAMESPACE: USER INTERFACE
    //====================================================================================================
    $.extend($.hitcomp, {
        "ui": {
            "CONTENT_TAB_ACTIVE_KEY": "hitcomp.ui.content.tab.active",
            
            "buildWellElement": function (classes, iconClasses, content) {
                return $('<div/>').addClass([ "well", "well-sm" ].concat(classes))
                    .append([ $.hitcomp.ui.buildIconElement(iconClasses) ].concat(content));
            },
            
            "buildButtonElement": function (classes, iconClasses, content) {
                return $('<button/>').addClass([ "btn", "btn-default", "form-control" ].concat(classes))
                    .append([ $.hitcomp.ui.buildIconElement(iconClasses) ].concat(content));
            },
            
            "buildIconElement": function (classes) {
                return $('<i/>').addClass([ "fa", "fa-fw" ].concat(classes));
            }
        }
    });
    
    //====================================================================================================
    // FUNCTION NAMESPACE: USER INTERFACE
    //====================================================================================================
    $.extend($.fn.hitcomp, {
        "ui": {}
    });
}(jQuery));
