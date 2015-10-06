App.PageView = Backbone.View.extend({
    className: "page-tab page-tab-title",
    events: {
        "click":"activeTemplate",
        "click .page-delete":"removeItem",
        "click .page-edit":"editTitle"
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

            //Show the page on the main area
            App.trigger("editor:show",this.model);
        }
    },
    removeItem: function() {
        App.trigger("deleteItem",this.model, this.$el.hasClass("active"));
    },
    toggleClass: function() {
        this.isDeleting = !this.isDeleting;
        this.$el.toggleClass("delete-hover");
    },
    editTitle: function() {
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