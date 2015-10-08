(function ($) {
    'use strict';

    App.AppView = Backbone.View.extend({
        el: '.wrapper',

        defaults:{
            autosave: 30000 //30s
        },
        events: {
            "click #plus-sign" : "createPage",
            //"mousedown #title-element" : "draggingTitle"
        },

        initialize: function() {
            App.User = new Models.User({id: "560d69c5e4b0d5afa45748b1"}); //Default user id

            App.bind("deleteItem", this.deletePage, this);
            App.bind("editor:show", this.showEditor, this);
            App.bind("saveDOM", this.saveDOM, this);

            App.bind("saveOnExit", this.saveOnExit, this);

            this.$list = this.$("#templatesList");
            this.$editor = this.$("#editor-canvas");
            this.titleInput = this.$("#page-tab-font-new");

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
        }
    });
})(jQuery);