(function ($) {
    'use strict';

    App.AppView = Backbone.View.extend({
        el: '.wrapper',
        defaults:{
            autosave: 40000, 
            enableLocaleStorage: true
        },
        events: {
            "click .js-plus-sign" : "createPage",
            "keyup .js-page-tab-font-new" : "createPageOnEnter"
        },

        initialize: function() {

            App.User = new Models.User({id: "560d69c5e4b0d5afa45748b1"}); //for testing

            App.bind("deleteItem", this.deletePage, this);
            App.bind("editor:show", this.showEditor, this);
            App.bind("saveDOM", this.saveDOM, this);
            App.bind("showLogin", this.showLogin, this);
            App.bind("updateCookie", this.updateCookie, this);

            this.tabList = this.$("#templatesList");
            this.editor = this.$(".js-editor-canvas");
            this.titleInput = this.$(".js-page-tab-font-new");

            this.initComponents();
            this.collection = new Models.PageCollection([],{userId: App.User.get("id")});
            if (window.visitor.isRegistered)
                this.fetchPages();

        },
        initComponents: function() {

            var self = this;

            $('.js-login').on('click', function(){
                self.showLogin();
                return false;
            });

            if (window.visitor.isRegistered)
                $('.js-login').html('Hi, ' + window.visitor.name);

            var settings =  {appendTo: "body", helper: "clone"};
            this.$("#image-element").draggable(settings);
            this.$("#text-element").draggable(settings);
            this.$("#title-element").draggable(settings);
            this.$("#nav-element").draggable(settings);
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

            if (self.defaults.enableLocaleStorage)
                    self.collection.localStorage = new Backbone.LocalStorage("Weebly");
            this.collection.fetch({success: function(){                
                self.renderPages();                
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
                self.collection.add(newPage);
                newPage.save(null,{success: function(){
                    self.fetchPages();
                }});
                this.titleInput.val("");
                debugger
                newPage.sync();
            }
            return false;
        },
        createPageOnEnter: function(e){
            if(e.keyCode == 13){    
                this.createPage();
            }
        },
        showLogin: function(){
            if (!window.visitor.isRegistered)
                $('#myModal').modal();
            return false;
        },
        updateCookie: function(profile){
            $.cookie.json = true;        
            var visitor = {
                'name' : profile.getName(),
                'isRegistered' : true, 
                "id" : '560d69c5e4b0d5afa45748b1',
                "email" : profile.getEmail()
            }
            $.cookie("Weebly", visitor);
            window.location.reload();
        }
    });
})(jQuery);