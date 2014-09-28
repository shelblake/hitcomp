(function ($) {
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
