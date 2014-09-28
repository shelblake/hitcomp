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
            this.roles = {
                "de": dataObj["eurolesdefin"],
                "en-GB": dataObj["eurolesenglish"],
                "en-US": dataObj["usroles"],
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
                    [ 3, 0 ]
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
        "roles": undefined,
        
        "buildRowElement": function () {
            return $.hitcomp.DataItem.prototype.buildRowElement.call(this).prepend($.map({
                "division": this.division,
                "type": this.type,
                "level": this.level.value.displayName,
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
        "RoleLocalization": function (roles, dataFilterSelectElem, dataTableElem, dataLocalizeSelectElem) {
            this.roles = roles;
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
        "roles": undefined,
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
            
            var dataFilter = this.dataFilterSelectElem.data($.hitcomp.DataFilter.DATA_OBJ_KEY);
            
            dataFilter.deselectAll.call(dataFilter);
            
            this.dataFilterSelectElem.multiselect("dataprovider", dataFilter.buildSelectDataProvider($.map(this.roles, $.proxy(function (role) {
                return role.roles[dataLocalizeLangValue];
            }, this)).sort(function (rolesValue1, rolesValue2) {
                return rolesValue1.localeCompare(rolesValue2);
            }).unique()));
            
            $("tbody tr td[data-field=\"roles\"] span.content-text", this.dataTableElem).each($.proxy(
                function (dataLocalizeLangDataIndex, dataLocalizeLangTextElem) {
                $(dataLocalizeLangTextElem).text(this.roles[dataLocalizeLangDataIndex].roles[dataLocalizeLangValue]);
            }, this));
            
            var dataLocalizeLabelElems = $(
                "div.content-filter div.input-group-sm[data-field=\"roles\"] label i.flag, div.content-data table thead tr th[data-field=\"roles\"] i.flag", 
                this.dataTableElem.parent().parent());
            
            dataLocalizeLabelElems.removeClass(dataLocalizeLabelElems.getClass());
            
            dataLocalizeLabelElems.addClass([
                "flag",
                ("flag-" + dataLocalizeLangValue.split("-", 2).last().toLowerCase())
            ]);
        }
    });
})(jQuery);
