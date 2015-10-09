App.PageView = Backbone.View.extend({
    className: "page-tab",
    events: {
        "click": "activeTemplate",
        "click .js-tab-delete": "removeItem",
        "click .js-tab-edit": "editTabName", 
        "mouseenter .js-tab-delete" : "addHoverWithDelay",
        "mouseleave .js-tab-delete" : "removeHoverWithDelay",
        "keyup .js-tab-title" : "saveTabNameonEnter"
    },

    initialize: function(){

        var self = this;
        $('#templatesList').children().removeClass('active');
        this.$el.addClass('active');
        App.trigger("editor:show",self.model);

    },

    activeTemplate: function() {
        this.$el.parent().children().removeClass("active");
        this.$el.addClass("active");
        App.trigger("editor:show",this.model);         
    },

    removeItem: function() {
        App.trigger("deleteItem",this.model, this.$el.hasClass("active"));
    },
    addHoverWithDelay: function(e){
        if (!window.timeoutId) {
            window.timeoutId = window.setTimeout(function() {
                window.timeoutId = null;
                $(e.target).parent().addClass('red-tab');
           }, 500);
        }        
    },
    removeHoverWithDelay: function(e){
        if (window.timeoutId) {
            window.clearTimeout(window.timeoutId);
            window.timeoutId = null;
        }
        else            
            $(e.target).parent().removeClass('red-tab');
    },
    
    editTabName: function() {
        this.tabTitle = this.$(".js-tab-title");
        if (this.tabTitle.prop("readOnly")) {
            this.tabTitle.focus();
            this.tabTitle.prop("readonly",false);
        } else {
            if (this.tabTitle.val().length > 0){                
                this.model.set("title",this.tabTitle.val());
                this.model.save({"title":this.tabTitle.val()});
                this.tabTitle.prop("readonly",true);  
            }          
        }
    },

    saveTabNameonEnter: function(e){
        if(e.keyCode == 13){    
            this.editTabName();  
            App.trigger("editor:show",this.model);
        }
    },
    render: function() {
        var template = Handlebars.templates['sidebar'];
        var html = template(this.model.toJSON());
        this.$el.html(html);

        return this;
    }
});