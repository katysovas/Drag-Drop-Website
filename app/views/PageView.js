App.PageView = Backbone.View.extend({
    className: "page-tab page-tab-title",
    events: {
        "click": "activeTemplate",
        "click .js-tab-delete": "removeItem",
        "click .js-tab-edit": "editPageName", 
        "mouseenter .js-tab-delete" : "addHoverWithDelay",
        "mouseleave .js-tab-delete" : "removeHoverWithDelay"
    },

    initialize: function(){

        $('#templatesList').children().removeClass('active');
        this.$el.addClass('active');
        App.trigger("editor:show",this.model);
    },

    activeTemplate: function() {
        if (!this.isDeleting) {
            this.$el.parent().children().removeClass("active");
            this.$el.addClass("active");
            App.trigger("editor:show",this.model);
        }
    },
    removeItem: function() {
        App.trigger("deleteItem",this.model, this.$el.hasClass("active"));
    },
    addHoverWithDelay: function(e){
        //window.timeoutId;
        var target = $(e.target);
        if (!window.timeoutId) {
            window.timeoutId = window.setTimeout(function() {
                window.timeoutId = null;

                target.parent().addClass('red-tab');
           }, 500);
        }        
    },
    removeHoverWithDelay: function(e){

        if (window.timeoutId) {
            window.clearTimeout(window.timeoutId);
            window.timeoutId = null;
        }
        else {
            var target = $(e.target);
            target.parent().removeClass('red-tab');
        }
    },
    toggleClass: function() {
        this.isDeleting = !this.isDeleting;
        this.$el.toggleClass("delete-hover");
    },
    editPageName: function() {
        this.pageTitle = this.$("#page-title");
        if (this.pageTitle.prop("readOnly")) {
            this.pageTitle.focus();
            this.pageTitle.prop("readOnly",false);
        } else {
            this.model.set("title",this.pageTitle.val());
            this.model.save();
            this.pageTitle.prop("readOnly",true);
        }
    },
    render: function() {
        this.isDeleting = false;
        var template = Handlebars.templates['sidebar'];
        var html = template(this.model.toJSON());
        this.$el.html(html);

        return this;
    }
});