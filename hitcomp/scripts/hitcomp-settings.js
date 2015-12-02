(function ($) {
    //====================================================================================================
    // CLASS: SETTINGS
    //====================================================================================================
    $.extend($.hitcomp, {
        "Settings": function (data) {
            this.defaultData = $.extend({}, data);
            
            if (localStorage) {
                var storedDataStr = localStorage.getItem($.hitcomp.Settings.DATA_KEY);
                
                if (storedDataStr) {
                    $.extend(data, JSON.parse(storedDataStr));
                    
                    console.info(sprintf("Merged saved settings data:\n%s", storedDataStr));
                }
            }
            
            this.initialize(data);
            
            console.info(sprintf("Loaded settings data (url=%s):\n%s", $.hitcomp.Settings.DATA_URL, JSON.stringify(data)));
            
            this.save();
        }
    });
    
    $.extend($.hitcomp.Settings, {
        "DATA_KEY": "hitcomp.settings",
        "DATA_URL": "data/hitcomp-settings.json",
        "SHEET_ID_PATTERN": /^[\w\-]{44}/,
        "SHEET_URL_PATTERN": /^https?:\/\/docs\.google\.com\/spreadsheets\/d\/([\w\-]{44})\/?/,
        "SHEET_NAME_PATTERN": /^(?:[\w\-]+|[\w\-][\w\- ]*[\w\-])/,
        
        "validate": function (compsSheetIdSettingInputElem, compsSheetNameSettingInputElem, rolesSheetIdSettingInputElem, rolesSheetNameSettingInputElem,
            settingSubmitButtonElem) {
            if ($.hitcomp.Settings.validateSheetId(compsSheetIdSettingInputElem) && $.hitcomp.Settings.validateSheetName(compsSheetNameSettingInputElem) &&
                $.hitcomp.Settings.validateSheetId(rolesSheetIdSettingInputElem) && $.hitcomp.Settings.validateSheetName(rolesSheetNameSettingInputElem)) {
                settingSubmitButtonElem.removeAttr("disabled");
                
                return true;
            } else {
                settingSubmitButtonElem.attr("disabled", "disabled");
                
                return false;
            }
        },
        
        "validateSheetName": function (sheetNameSettingInputElem) {
            return $.hitcomp.Settings.validateInput(sheetNameSettingInputElem, $.hitcomp.Settings.SHEET_NAME_PATTERN);
        },
        
        "validateSheetId": function (sheetIdSettingInputElem) {
            return $.hitcomp.Settings.validateInput(sheetIdSettingInputElem, $.hitcomp.Settings.SHEET_ID_PATTERN);
        },
        
        "validateInput": function (settingInputElem, settingValuePattern) {
            var settingFormGroupElem = settingInputElem.parents("div.form-group").eq(0).removeClass([ "has-error", "has-success" ]),
                settingHelpBlockElem = settingFormGroupElem.find("div.help-block");
            
            if (settingValuePattern.test(settingInputElem.val())) {
                settingFormGroupElem.addClass("has-success");
                settingHelpBlockElem.hide();
                
                return true;
            } else {
                settingFormGroupElem.addClass("has-error");
                settingHelpBlockElem.show();
                
                return false;
            }
        },
        
        "load": function () {
            $.ajax({
                "dataType": "json",
                "url": $.hitcomp.Settings.DATA_URL
            }).done(function (data, textStatus, xhr) {
                $(document).trigger($.hitcomp.SETTINGS_LOADED_EVENT_NAME, [ new $.hitcomp.Settings(data) ]);
            }).fail(function (xhr, textStatus, error) {
                console.error(sprintf("Unable to load settings data (url=%s, status=%s): %s", $.hitcomp.Settings.DATA_URL, textStatus, error));
            });
        }
    });
    
    $.extend($.hitcomp.Settings.prototype, {
        "defaultData": undefined,
        "analyticsSiteId": undefined,
        "compsSheetId": undefined,
        "compsSheetName": undefined,
        "instructionsDocUrl": undefined,
        "rolesSheetId": undefined,
        "rolesSheetName": undefined,
        
        "reset": function () {
            this.initialize(this.defaultData);
        },
        
        "save": function () {
            if (localStorage) {
                var dataStr = JSON.stringify({
                    "analyticsSiteId": this.analyticsSiteId,
                    "compsSheetId": this.compsSheetId,
                    "compsSheetName": this.compsSheetName,
                    "instructionsDocUrl": this.instructionsDocUrl,
                    "rolesSheetId": this.rolesSheetId,
                    "rolesSheetName": this.rolesSheetName
                });
                
                localStorage.setItem($.hitcomp.Settings.DATA_KEY, dataStr);
                
                console.info(sprintf("Saved settings data (key=%s):\n%s", $.hitcomp.Settings.DATA_KEY, dataStr));
            }
        },
        
        "initialize": function (data) {
            this.analyticsSiteId = data.analyticsSiteId;
            this.compsSheetId = data.compsSheetId;
            this.compsSheetName = data.compsSheetName;
            this.instructionsDocUrl = data.instructionsDocUrl;
            this.rolesSheetId = data.rolesSheetId;
            this.rolesSheetName = data.rolesSheetName;
        }
    });
})(jQuery);
