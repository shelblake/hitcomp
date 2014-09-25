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
            return this.replace(/[^\s\w\-\.\(\)\[\]\\\/"';:,]/g, String.EMPTY);
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
    
    //====================================================================================================
    // NAMESPACE: ANALYTICS
    //====================================================================================================
    $.extend($.hitcomp, {
        "analytics": {
            "ANALYTICS_CONFIG_DATA_URL": "data/hitcomp-analytics.json",
            
            "configureAnalytics": function () {
                if (document.location.protocol.match(/^https?:$/)) {
                    $.ajax({
                        "dataType": "json",
                        "url": $.hitcomp.analytics.ANALYTICS_CONFIG_DATA_URL
                    }).done(function (data, textStatus, xhr) {
                        if (!data.siteId) {
                            console.info(sprintf("Google Analytics configuration does not contain a valid site ID (%s) - skipping ...", 
                                $.hitcomp.analytics.ANALYTICS_CONFIG_DATA_URL, data.siteId));
                            
                            return;
                        }
                        
                        ga("create", data.siteId, "auto");
                        ga("send", "pageview");
                        
                        console.info(sprintf("Configured Google Analytics with data (url=%s, id=%s).", $.hitcomp.analytics.ANALYTICS_CONFIG_DATA_URL, 
                            data.siteId));
                    }).fail(function (xhr, textStatus, error) {
                        console.warn(sprintf("Unable to get Google Analytics configuration data (url=%s, status=%s): %s", 
                            $.hitcomp.analytics.ANALYTICS_CONFIG_DATA_URL, textStatus, error));
                    });
                } else {
                    console.info(sprintf("Document location protocol (%s) is not HTTP(S) - skipping Google Analytics configuration ...", 
                        document.location.protocol));
                }
            }
        }
    });
})(jQuery);
