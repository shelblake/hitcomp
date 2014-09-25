(function ($) {
    //====================================================================================================
    // CLASS: ROLE
    //====================================================================================================
    $.extend($.hitcomp, {
        "Role": function (dataObj) {
            $.hitcomp.DataItem.call(this, dataObj);
            
            this.division = dataObj["clinicalnon-clinical"];
            this.type = dataObj["roletype"];
            this.desc = dataObj["definition"];
            this.rolesUs = dataObj["usroles"];
            this.rolesEu = {
                "de": dataObj["eurolesdefin"],
                "en-GB": dataObj["eurolesenglish"],
                "es": dataObj["euroleses"],
                "fr": dataObj["eurolesfr"],
                "it": dataObj["eurolesit"]
            };
        }
    });
    
    $.extend($.hitcomp.Role, $.hitcomp.DataItem, {
        "buildTableSorter": function (dataTableElem) {
            var dataTableSorter = $.hitcomp.DataItem.buildTableSorter.call(undefined, dataTableElem), dataTableSorterFunc = dataTableSorter.textSorter;
            
            return $.extend(dataTableSorter, {
                "sortList": [
                    [ 2, 0 ]
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
        "rolesUs": undefined,
        "rolesEu": undefined,
        
        "buildRowElement": function () {
            return $.hitcomp.DataItem.prototype.buildRowElement.call(this).prepend($.map({
                "division": this.division,
                "type": this.type,
                "level": this.level.value.displayName,
                "rolesUs": this.rolesUs,
                "rolesEu": this.rolesEu["en-GB"]
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
        "RoleLocalization": function (roles, dataTableElem, dataLocalizeSelectElem) {
            this.dataTableElem = dataTableElem;
            this.dataLocalizeSelectElem = dataLocalizeSelectElem;
            
            this.rolesMap = {};
            
            $.each(roles, $.proxy(function (roleIndex, role) {
                this.rolesMap[role.rolesUs] = role.rolesEu;
            }, this));
        }
    });
    
    $.extend($.hitcomp.RoleLocalization, {
        "HTTP_HEADER_ACCEPT_LANG_NAME": "Accept-Language",
        "HTTP_HEADERS_API_URL": "http://ajaxhttpheaders.appspot.com"
    });
    
    $.extend($.hitcomp.RoleLocalization.prototype, {
        "dataTableElem": undefined,
        "dataLocalizeSelectElem": undefined,
        "rolesMap": undefined,
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
            
            $("tbody tr td[datafld=\"rolesEu\"]", this.dataTableElem).each($.proxy(function (dataLocalizeLangDataIndex, dataLocalizeLangDataElem) {
                $("span", (dataLocalizeLangDataElem = $(dataLocalizeLangDataElem)))
                    .text(this.rolesMap[dataLocalizeLangDataElem.prev().text()][dataLocalizeLangValue]);
            }, this));
        }
    });
})($);
