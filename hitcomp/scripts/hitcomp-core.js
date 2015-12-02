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
            return this.replace(/[^a-z0-9\ \t\n\r\-\.\(\)\[\]\\\/"';:,&]/gi, String.EMPTY);
        },
        
        "quote": function (escapedQuote) {
            return ("\"" + this.replace(/"/g, (escapedQuote || "\\\"")) + "\"");
        },
        
        "tokenize": function (delims) {
            return $.map(this.split(delims), function (token, tokenIndex) {
                return $.trim(token);
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
            }
            
            return this._addClass(classes);
        },
        
        "getClass": function () {
            var classes = this.attr("class");
            
            return (classes ? classes.split(/\s+/) : []);
        },
        
        "hasClass": function (classes) {
            if ($.isArray(classes)) {
                var hasClasses = true;
                
                $.each(classes, $.proxy(function (classIndex, clazz) {
                    // noinspection JSLint
                    return (hasClasses = this._hasClass(clazz));
                }, this));
                
                return hasClasses;
            }
            
            return this._hasClass(classes);
        },
        
        "removeClass": function (classes) {
            if ($.isArray(classes)) {
                $.each(classes, $.proxy(function (classIndex, clazz) {
                    this._removeClass(clazz);
                }, this));
                
                return this;
            }
            
            return this._removeClass(classes);
        },
        
        "toggleClass": function (classes) {
            if ($.isArray(classes)) {
                $.each(classes, $.proxy(function (classIndex, clazz) {
                    this._toggleClass(clazz);
                }, this));
                
                return this;
            }
            
            return this._toggleClass(classes);
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
                    // noinspection JSLint
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
    // NAMESPACE: MAIN
    //====================================================================================================
    $.extend($, {
        "hitcomp": {
            "SETTINGS_LOADED_EVENT_NAME": "hitcompSettingsLoaded"
        }
    });
    
    //====================================================================================================
    // FUNCTION NAMESPACE: MAIN
    //====================================================================================================
    $.extend($.fn, {
        "hitcomp": {}
    });
}(jQuery));
