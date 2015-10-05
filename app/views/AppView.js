(function ($) {
    'use strict';

    App.AppView = Backbone.View.extend({
        el: '.wrapper',
        events: {
            "click #plus-sign":"createPage"
        },

        createPage: function(){
            alert('hey');
        }        
    });
})(jQuery);
