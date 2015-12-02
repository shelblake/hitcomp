(function ($) {
    //====================================================================================================
    // CLASS: ANALYTICS
    //====================================================================================================
    $.extend($.hitcomp, {
        "Analytics": {
            "configure": function (siteId) {
                if (!siteId) {
                    console.info(sprintf("Google Analytics configuration does not contain a valid site ID (%s) - skipping ...", siteId));
                    
                    return;
                }
                
                ga("create", siteId, "auto");
                ga("send", "pageview");
                
                console.info(sprintf("Configured Google Analytics for site (id=%s).", siteId));
            }
        }
    });
})(jQuery);
