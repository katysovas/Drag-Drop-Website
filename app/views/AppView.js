(function ($) {
    'use strict';

    App.AppView = Backbone.View.extend({
        el: '.wrapper',
        defaults:{
            autosave: 30000
        },
        events: {
            "click .js-plus-sign" : "createPage",
            "keyup .js-page-tab-font-new" : "createPageOnEnter"
        },

        initialize: function() {

            App.User = new Models.User({id: "560d69c5e4b0d5afa45748b1"}); //Default user id
            window.visitor = App.User;

            App.bind("deleteItem", this.deletePage, this);
            App.bind("editor:show", this.showEditor, this);
            App.bind("saveDOM", this.saveDOM, this);

            this.tabList = this.$("#templatesList");
            this.editor = this.$(".js-editor-canvas");
            this.titleInput = this.$(".js-page-tab-font-new");

            this.initComponents();
            this.collection = new Models.PageCollection([],{userId: App.User.get("id")});
            this.fetchPages();

        },
        initComponents: function() {
            var settings =  {appendTo: "body", helper: "clone"};

            this.$("#image-element").draggable(settings);
            this.$("#text-element").draggable(settings);
            this.$("#title-element").draggable(settings);
        },
        showEditor: function(page) {
            if (page) {
                var view = new App.EditorView({ model: page });
                this.editor.html(view.render().el);
            } else {
                this.editor.html(" ");
            }
        },
        deletePage: function(model) {
            var self = this;
            model.destroy({success: function() {
                 self.fetchPages();
            }});

            App.trigger("editor:show");

        },
        fetchPages: function() {
            var self = this;
            this.collection.fetch({success: function(){                
                self.renderPages();
                //self.collection.localStorage = new Backbone.LocalStorage("Weebly");
            }});
        },
        renderPages: function() {
            this.tabList.html(' ');
            this.collection.each(this.addPage, this);
        },
        addPage: function (page) {
            var view = new App.PageView({ model: page });
            this.tabList.append(view.render().el);
        },
        saveDOM: function(model,html) {
            model.set("dom",html);
            model.save();

            $('.js-autosave').addClass('active-save');

            var intervalID = setInterval(function(){
                console.log('auto saving');
                model.save();
            }, this.defaults.autosave);

        },
        createPage: function() {            
            var self = this;
            if (this.titleInput.val().length > 0){
                var newPage = new Models.Page({title: this.titleInput.val()});                
                newPage.set("user_id",App.User.get("id"));
                //self.collection.add(newPage);
                newPage.save(null,{success: function(){
                    self.fetchPages();
                }});

                this.titleInput.val("");
            }
            return false;
        },
        createPageOnEnter: function(e){
            if(e.keyCode == 13){    
                this.createPage();
            }
        },
        showLogin: function(){
            debugger
            $('#myModal').modal();
            return false;
        }
    });
})(jQuery);