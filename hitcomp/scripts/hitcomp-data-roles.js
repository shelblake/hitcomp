(function ($) {
    //====================================================================================================
    // CLASS: ROLE
    //====================================================================================================
    $.extend($.hitcomp, {
        "Role": function (dataObj) {
            $.hitcomp.DataItem.call(this, dataObj);
            
            this.division = dataObj["clinicalnon-clinical"];
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
                "division": this.division,
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
        "HTTP_HEADERS_API_URL": "http://ajaxhttpheaders.appspot.com"
    });
    
    $.extend($.hitcomp.RoleLocalization.prototype, {
        "dataFilterSelectElem": undefined,
        "dataTableElem": undefined,
        "dataLocalizeSelectElem": undefined,
        "culture": undefined,
        
        "determineDefault": function () {
            $.ajax({
                "dataType": "jsonp",
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
}(jQuery));
