(function ($) {
    'use strict';

    App.AppView = Backbone.View.extend({
        el: '.wrapper',

        defaults:{
            autosave: 30000 //30s
        },
        events: {
            "click #plus-sign":"createPage"
            //"mousedown #title-element" : "draggingTitle"
        },
        initialize: function() {
            App.User = new Models.User({id: "560d69c5e4b0d5afa45748b1"}); //Default user id

            App.bind("deleteItem", this.deletePage, this);
            App.bind("editor:show", this.showEditor, this);
            App.bind("saveDOM", this.saveDOM, this);

            this.$list = this.$("#templatesList");
            this.$editor = this.$("#editor-canvas");
            this.titleInput = this.$("#page-tab-font-new");

            this.initComponents();
            this.collection = new Models.PageCollection([],{userId: App.User.get("id")});
            this.reLoadPages();
        },
        initComponents: function() {
            var settings =  {appendTo: "body", helper: "clone"};

            this.$("#image-element").draggable(settings);
            this.$("#text-element").draggable(settings);
            this.$("#title-element").draggable(settings);
        },
        draggingTitle: function(e){
            // hide original item while dragging
        },
        showEditor: function(page) {
            if (page) {
                var view = new App.EditorView({ model: page });
                this.$editor.html(view.render().el);
            } else {
                this.$editor.html(" ");
            }
        },
        deletePage: function(model) {
            var self = this;
            model.destroy({success: function() {
                 self.reLoadPages();
            }});

            App.trigger("editor:show");
        },
        reLoadPages: function() {
            var self = this;
            this.collection.fetch({success: function(){
                self.renderPages();
            }});
        },
        renderPages: function() {
            this.$list.html(' ');
            this.collection.each(this.addPage, this);
        },
        addPage: function (page) {
            var view = new App.PageView({ model: page });
            this.$list.append(view.render().el);
        },
        saveDOM: function(model,html) {
            model.set("dom",html);

            model.save();
            this.saveToLocaleStorage(model, html);

            $('.js-autosave').addClass('active-save');

            var intervalID = setInterval(function(){
                console.log('auto saving every ' + this.defaults.autosave);
                model.save();
            }, this.defaults.autosave);

        },

        saveToLocaleStorage: function(model, html){
            if (typeof localStorage !== "undefined") {
                localStorage.setItem("dom", html);
            }else
                model.save();
        },
        createPage: function() {
            var self = this;
            var newPage = new Models.Page({title: this.titleInput.val()});
            newPage.set("user_id",App.User.get("id"));
            newPage.save(null,{success: function(){
                self.reLoadPages();
            }});

            this.titleInput.val("");
        }
    });
})(jQuery);