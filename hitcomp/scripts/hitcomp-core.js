(function ($) {
    //====================================================================================================
    // EXTENSIONS: STRING
    //====================================================================================================
    $.extend(String, {
        "EMPTY": ""
    });
    
    $.extend(String.prototype, {
        "normalize": function () {
            return this.replace(/\s+/g, " ");
        },
        
        "printable": function () {
            return this.replace(/[^\s\w\-\.\(\)\[\]\\\/"';:,&]/g, String.EMPTY);
        },
        
        "quote": function (escapedQuote) {
            return ("\"" + this.replace(/"/g, (escapedQuote || "\\\"")) + "\"");
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
    // EXTENSIONS: JQUERY FUNCTIONS
    //====================================================================================================
    $.extend($.fn, {
        "_addClass": $.fn.addClass,
        "_hasClass": $.fn.hasClass,
        "_removeClass": $.fn.removeClass,
        "_toggleClass": $.fn.toggleClass
    });
    
    $.extend($.fn, {
        "addClass": function (classes) {
            if ($.isArray(classes)) {
                $.each(classes, $.proxy(function (classIndex, clazz) {
                    this._addClass(clazz);
                }, this));
                
                return this;
            } else {
                return this._addClass(classes);
            }
        },
        
        "getClass": function () {
            var classes = this.attr("class");
            
            return (classes ? classes.split(/\s+/) : []);
        },
        
        "hasClass": function (classes) {
            if ($.isArray(classes)) {
                var hasClasses = true;
                
                $.each(classes, $.proxy(function (classIndex, clazz) {
                    return (hasClasses = this._hasClass(clazz));
                }, this));
                
                return hasClasses;
            } else {
                return this._hasClass(classes);
            }
        },
        
        "removeClass": function (classes) {
            if ($.isArray(classes)) {
                $.each(classes, $.proxy(function (classIndex, clazz) {
                    this._removeClass(clazz);
                }, this));
                
                return this;
            } else {
                return this._removeClass(classes);
            }
        },
        
        "toggleClass": function (classes) {
            if ($.isArray(classes)) {
                $.each(classes, $.proxy(function (classIndex, clazz) {
                    this._toggleClass(clazz);
                }, this));
                
                return this;
            } else {
                return this._toggleClass(classes);
            }
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
        "TIMESTAMP_FORMAT": "YYYY-MM-DD HH:mm:ss Z",
        "TIMESTAMP_FILE_FORMAT": "YYYY-MM-DD_HHmm_Z"
    });
    
    $.extend(moment.fn, {
        "formatTimestamp": function (forFileName) {
            var timestampPartDelim = (forFileName ? "_" : " "), timestampParts = this.format((forFileName ? moment.TIMESTAMP_FILE_FORMAT : 
                moment.TIMESTAMP_FORMAT)).split(timestampPartDelim, 3);
            
            timestampParts[2] = timestampParts[2].replace(":", String.EMPTY);
            
            return timestampParts.join(timestampPartDelim);
        }
    });
    
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
    // EXTENSIONS: BOOTSTRAP SELECT
    //====================================================================================================
    $.extend($.fn.selectpicker.Constructor.DEFAULTS, {
        "iconBase": String.EMPTY
    });
    
    //====================================================================================================
    // EXTENSIONS: BOOTSTRAP MULTISELECT
    //====================================================================================================
    $.extend($.fn.multiselect.Constructor.prototype.defaults, {
        "buttonClass": "btn btn-default form-control",
        "buttonContainer": '<div class="btn-group btn-group-sm"/>',
        "enableCaseInsensitiveFiltering": true,
        "filterBehavior": "text"
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
    // NAMESPACE: MAIN
    //====================================================================================================
    $.extend($, {
        "hitcomp": {
            "ACTIVE_TAB_KEY": "hitcomp.tab.active"
        }
    });
})(jQuery);
