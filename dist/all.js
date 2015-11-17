var BASE_URL = 'https://api.mongolab.com/api/1/databases/pagedb/collections';
var API_KEY = 'OtIKk5xORSRSn6BatrDeGAqNcfnMLW70';

var App = App || {};
var Models = Models || {};

_.extend(App, Backbone.Events);

$(document).ready(function() {
   	new App.AppView();
});

function onSignIn(googleUser) {
	if(!window.visitor.isRegistered){
		var profile = googleUser.getBasicProfile();
		if (profile)
			App.trigger('updateCookie', profile);
    }
};
// backbone-mongodb 0.1.0
//
// (c) 2013 Vadim Mirgorod
// Licensed under the MIT license.

(function(Backbone) {

  // Define mixing that we will use in our extension.
  var mixin = {

    // Convert MongoDB Extended JSON into regular one.
    parse: function(resp, options) {
      if (_.isObject(resp._id))  {
        resp[this.idAttribute] = resp._id.$oid;
        delete resp._id;
      }

      return resp;
    },

    // Convert regular JSON into MongoDB extended one.
    toExtendedJSON: function() {
      var attrs = this.attributes;

      var attrs = _.omit(attrs, this.idAttribute);
      if (!_.isUndefined(this[this.idAttribute]))  {
        attrs._id = { $oid: this[this.idAttribute] };
      }

      return attrs;
    },

    // Substute toJSON method when performing synchronization.
    sync: function() {
      var toJSON = this.toJSON;
      this.toJSON = this.toExtendedJSON;

      var ret = Backbone.sync.apply(this, arguments);

      this.toJSON = toJSON;

      return ret;
    }
  }

  // Create new MongoModel object.
  Backbone.MongoModel = Backbone.Model.extend(mixin);

  // Provide mixin to extend Backbone.Model.
  Backbone.MongoModel.mixin = mixin;

  // Another way to perform mixin.
  //_.extend(Backbone.Model.prototype, mixin);

}).call(this, Backbone);

(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['editor'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"row page-nav-row\">      \n	<div class=\"text-center page-tab-nav page-tab-nav-active\">\n	"
    + container.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title","hash":{},"data":data}) : helper)))
    + "\n	</div>\n</div>\n<div id=\"elements\"></div>\n";
},"useData":true});
templates['sidebar'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<input class=\"js-tab-title page-tab-fonts\" placeholder=\""
    + container.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title","hash":{},"data":data}) : helper)))
    + "\" maxlength=\"14\" readonly/>\n<span class=\"page-tab-settings-icons js-tab-edit glyphicon glyphicon-pencil\"></span>\n<span class=\"page-tab-settings-icons js-tab-delete glyphicon glyphicon-remove\"></span>";
},"useData":true});
})();

Models.Page = Backbone.MongoModel.extend({
    urlRoot: BASE_URL + "/pages/",
    url: function() {
        var original_url = Backbone.Model.prototype.url.call( this );
        var parsed_url = original_url + ( original_url.charAt( original_url.length - 1 ) == '/' ? '' : '/' );
        parsed_url += "?apiKey="+API_KEY;
        return parsed_url;
    } 
    //localStorage: new Backbone.LocalStorage("Weebly")
});

Models.PageCollection = Backbone.Collection.extend({
    url: function() {
        return BASE_URL + "/pages/?apiKey=" + API_KEY + '&q={"user_id":"'+this.userId+'"}';
    },
    model: Models.Page,
    initialize: function(values,options) {
        this.userId = options.userId;
    } 
    //localStorage: new Backbone.LocalStorage("Weebly")
});
Models.User = Backbone.MongoModel.extend({

    idAttribute: '_ID',

    defaults: {
        isRegistered: false, 
        name: '',
        email: ''
    },

    urlRoot: BASE_URL + '/users/',
    url: function() {
        var original_url = Backbone.Model.prototype.url.call( this );
        var parsed_url = original_url + ( original_url.charAt( original_url.length - 1 ) == '/' ? '' : '/' );
        parsed_url += '?apiKey=' + API_KEY;
        return parsed_url;
    }, 

    initialize: function(){
        window.visitor = {
            isRegistered : this.defaults.isRegistered,
            name : this.defaults.name
        };
        this.readCookie();
    },

    readCookie: function(){
        $.cookie.json = true;
        var currentUser = $.cookie('Weebly');
        if (typeof currentUser != 'undefined' && currentUser.isRegistered){
            this.defaults.name = currentUser.name;
            this.defaults.isRegistered = true;
            window.visitor = currentUser;
        }
    }

});

Models.UserCollection = Backbone.Collection.extend({
    url: function() {
        return BASE_URL + '/users/?apiKey=' + API_KEY + '&q={"user_id":"'+this.userId+'"}';
    },
    model: Models.User,
    initialize: function(values,options) {
        this.userId = options.userId;
    }
});
(function ($) {
    'use strict';

    App.AppView = Backbone.View.extend({
        el: '.wrapper',
        defaults:{
            autosave: 40000, 
            enableLocaleStorage: false
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

            if (!this.defaults.enableLocaleStorage){
                var intervalID = setInterval(function(){
                    console.log('auto saving');
                    model.save();
                }, this.defaults.autosave);
            }

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
App.EditorView = Backbone.View.extend({

    events: {
        "change textarea" : "saveTextareaText",
        "click .js-removeElement" : "removeElement",
        "change input" : "saveTitleText",
        "click .image-placeholder" : "addImage",
        "mouseover .js-removeElement" : "addBorder",
        "mouseout .js-removeElement" : "removeBorder",
        "keyup .title" : "saveTitleOnEnter",
        "focus .js-text-area" : "expandTextArea", 
        "blur .nav" : "makeURL"
    },

    saveTextareaText: function(e) {
        var target = $(e.target);
        target.html(target.val());
        App.trigger("saveDOM",this.model,this.elements.html());
    },

    saveTitleText: function() {
        var target = $(event.target);
        target.attr("value",target.val());
        App.trigger("saveDOM",this.model,this.elements.html());
    },

    saveTitleOnEnter: function(e){
        if(e.keyCode == 13){    
            this.saveTitleText(); 
            $(e.target).blur();
        }
    },

    removeElement: function(e){
        $(e.target).parent().remove();
        App.trigger("saveDOM",this.model,this.elements.html());
    },

    makeURL: function(e){
        var url = $(e.target).val();
        var aTag = $('<a>',{
                    text: url,
                    class: 'nav-url',
                    title: url,
                    href: 'http://' + url,
                    target: "_blank"
                });
        $(e.target).hide();
        $(e.target).parent().append(aTag);
        App.trigger("saveDOM",this.model,this.elements.html());
    },

    addImage: function(e){

        var self = this;
        var imageParent = $(e.target).parent();        
        var imageInput = imageParent.find('input');

        imageInput.click();

        imageInput.change(function(e) {
            for (var i = 0; i < e.originalEvent.srcElement.files.length; i++) {
                
                var file = e.originalEvent.srcElement.files[i];
                
                var img = document.createElement("img");
                var reader = new FileReader();
                reader.onloadend = function() {
                     img.src = reader.result;
                }
                reader.readAsDataURL(file);
                imageParent.find('.image-placeholder').remove();
                imageInput.remove();
                imageParent.find('.text-center').remove();
                imageParent.addClass('image-body-row-has-image');
                imageParent.find('.js-removeElement').after(img);

                setTimeout(function(){ 
                    App.trigger("saveDOM",self.model,self.elements.html());
                }, 
                1000);                
            }
        });

    },

    addBorder: function(e){
        var targetParent = $(e.target).parent();
        targetParent.addClass('red-border');
    },

    removeBorder: function(e){
        var targetParent = $(e.target).parent();
        targetParent.removeClass('red-border');
    },

    expandTextArea: function(){

        $('#elements').on( 'keyup', 'textarea', function (e){
            $(this).css('height', 'auto' );
            $(this).height( this.scrollHeight );
        });
        $('#elements').find('textarea').keyup();

    },

    render: function() {
        var self = this;
        var template = Handlebars.templates['editor'];
        var html = template(this.model.toJSON());
        this.$el.html(html);

        this.$el.css("height","100%");
        this.elements = this.$("#elements");
        if (this.model.has("dom")) {
            this.elements.html(this.model.get("dom"));
        }

        this.expandTextArea();

        this.elements.sortable({
            cancel: "textarea,input",
            placeholder: "sort-highlight",
            stop: function() {
                App.trigger("saveDOM",self.model,self.elements.html());
            }
        });
        this.elements.droppable({
            drop: function(event, ui) {
                var elementDragged = ui.draggable.attr('id');     
                               
                switch(elementDragged) {

                    case "title-element":
                        var countTitle = self.$('.title-row').length;
                        var elementId = self.model.get("id") + "_title_" + countTitle;
                        var titleDOM = '<div id=' + elementId + ' class="title-row"></span><span class="glyphicon glyphicon-remove js-removeElement" aria-hidden="true"></span><input class="title" style="border: none;" placeholder="Add Title Here"></div>';
                        self.elements.append(titleDOM);
                        $('#' + elementId).find('input').focus();
                        break;

                    case "text-element":
                        var countText = self.$('.text-row').length;
                        var elementId = self.model.get("id") + "_text_" + countText;
                        var textDOM = '<div id=' + elementId + ' class="text-row"></span><span class="glyphicon glyphicon-remove js-removeElement" aria-hidden="true"></span><span class="elementCorner"></span><textarea class="js-text-area" placeholder="Enter text here."></textarea></div>';
                        self.elements.append(textDOM);                        
                        
                        self.expandTextArea();
                        $('#' + elementId).find('textarea').focus();
                        break;

                    case "image-element":
                        var countImages = self.$('.image-body-row').length;
                        var elementId = self.model.get("id") + "_images_" + countImages;
                        var imageDOM = '<div id=' + elementId +' class="image-body-row"></span><span class="glyphicon glyphicon-remove js-removeElement" aria-hidden="true"></span><span class="elementCorner"></span><input id="image-upload-' + elementId +'" class="hidden js-uploadImage" type="file"><img class="image-placeholder" src="assets/images/placeholder.png"><div class="text-center"><p class="image-placeholder-text">ADD IMAGE</p><span class="plus-sign glyphicon glyphicon-plus image-plus "</span></div></div>';
                        self.elements.append(imageDOM);
                        break;
                
                    case "nav-element":
                        var countNav = self.$('.nav-row').length;
                        var elementId = self.model.get("id") + "_nav_" + countNav;
                        var navDOM = '<div id=' + elementId + ' class="nav-row"></span><span class="glyphicon glyphicon-remove js-removeElement" aria-hidden="true"></span><input class="nav" style="border: none;" placeholder="Add URL Here"></div>';
                        self.elements.append(navDOM);
                        $('#' + elementId).find('input').focus();
                    default:
                        //do nothing
                } 

                App.trigger("saveDOM",self.model,self.elements.html());            
            }
        });
        return this;
    }
});
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