App.EditorView = Backbone.View.extend({

    events: {
        "change textarea":"saveTextareaText",
        "click .js-removeElement":"removeElement",
        "change input":"saveTitleText",
        "click .image-placeholder":"addImage",
        "mouseover .js-removeElement": "addBorder",
        "mouseout .js-removeElement": "removeBorder",
        "keyup .title" : "saveTitleOnEnter" 
    },

    saveTextareaText: function(e) {
        var target = $(e.target);
        target.html(target.val());
        App.trigger("savePageDOM",this.model,this.elements.html());
    },
    saveTitleText: function() {
        var target = $(event.target);
        target.attr("value",target.val());
        App.trigger("savePageDOM",this.model,this.elements.html());
    },

    saveTitleOnEnter: function(e){
        if(e.keyCode == 13){    
            this.saveTitleText(); 
            $(e.target).blur();
        }
    },

    removeElement: function(e){
        $(e.target).parent().remove();
        App.trigger("savePageDOM",this.model,this.elements.html());
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

                //TODO: save image to MongoDB
                //App.trigger("savePageDOM",self.model,self.elements.html());
            }
        });

    },

    addBorder: function(e){$(e.target).parent()
        $(e.target).parent().addClass('red-border');
    },

    removeBorder: function(e){
        $(e.target).parent().removeClass('red-border');
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

        this.elements.sortable({
            cancel: "textarea,input",
            placeholder: "sort-highlight",
            stop: function() {
                App.trigger("savePageDOM",self.model,self.elements.html());
            }
        });
        this.elements.droppable({
            drop: function(event, ui) {
                var elementDragged = ui.draggable.attr('id');     
                               
                switch(elementDragged) {
                    case "image-element":
                        var countImages = self.$('.image-body-row').length;
                        var elementId = self.model.get("id")+"_images_"+countImages;
                        var imageDOM = '<div id=' + elementId+' class="image-body-row ui-resizable"><span class="glyphicon glyphicon-move" style="display:none;float: left;" aria-hidden="true"></span><span class="glyphicon glyphicon-remove js-removeElement" aria-hidden="true"></span><input id="image-upload-' + elementId +'" class="hidden js-uploadImage" type="file"><img class="image-placeholder" src="assets/images/placeholder.png"><div class="text-center"><p class="image-placeholder-text">ADD IMAGE</p><span class="plus-sign glyphicon glyphicon-plus image-plus "</span></div></div>';
                        self.elements.append(imageDOM);

                        App.trigger("savePageDOM",self.model,self.elements.html());
                        break;
                    case "text-element":
                        var countText = self.$('.text-row').length;
                        var elementId = self.model.get("id")+"_text_"+countText;
                        var textDOM = '<div id='+elementId+' class="text-row ui-resizable"><span class="glyphicon glyphicon-move" style="display:none;float: left;" aria-hidden="true"></span><span class="glyphicon glyphicon-remove js-removeElement" aria-hidden="true"></span><textarea class="text" placeholder="Enter text here."></textarea></div>';
                        self.elements.append(textDOM).focus();
                        
                        $('#elements').on( 'keyup', 'textarea', function (e){
                            $(this).css('height', 'auto' );
                            $(this).height( this.scrollHeight );
                        });
                        $('#elements').find('textarea').keyup();

                        App.trigger("savePageDOM",self.model,self.elements.html());

                        break;
                    case "title-element":
                        var countTitle = self.$('.title-row').length;
                        var elementId = self.model.get("id")+"_title_"+countTitle;
                        var titleDOM = '<div id='+elementId+' class="title-row"><span class="glyphicon glyphicon-move" style="display:none;float: left;" aria-hidden="true"></span><span class="glyphicon glyphicon-remove js-removeElement" aria-hidden="true"></span><input class="title" style="border: none;" placeholder="Add Title Here"></div>';
                        self.elements.append(titleDOM);
                        App.trigger("savePageDOM",self.model,self.elements.html());
                        $('#' + elementId).find('input').focus();
                        break;
                    default:
                        //do nothing
                }                
            }
        });

        return this;
    }
});