App.PageView = Backbone.View.extend({
    className: "page-tab page-tab-title",
    events: {
        "click": "activeTemplate",
        "click .js-tab-delete": "removeItem",
        "click .js-tab-edit": "editTabName", 
        "mouseenter .js-tab-delete" : "addHoverWithDelay",
        "mouseleave .js-tab-delete" : "removeHoverWithDelay",
        "keyup .js-tab-title" : "saveTabNameonEnter"
       
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
    
    editTabName: function() {
        debugger
        this.tabTitle = this.$(".js-tab-title");
        if (this.tabTitle.prop("readOnly")) {
            this.tabTitle.focus();
            this.tabTitle.prop("readOnly",false);
        } else {
            debugger
            if (this.tabTitle.val().length > 0){                
                this.model.set("title",this.tabTitle.val());
                this.model.save();
                this.tabTitle.prop("readOnly",true);  
            }          
        }

    },

    saveTabNameonEnter: function(e){

        if(e.keyCode == 13)          
            this.editTabName();  
           // return false;         
        
    },
    render: function() {
        this.isDeleting = false;
        var template = Handlebars.templates['sidebar'];
        var html = template(this.model.toJSON());
        this.$el.html(html);

        return this;
    }
});