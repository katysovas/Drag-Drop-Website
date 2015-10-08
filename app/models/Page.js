Models.Page = Backbone.MongoModel.extend({
    urlRoot: BASE_URL + "/pages/",
    url: function() {
        var original_url = Backbone.Model.prototype.url.call( this );
        var parsed_url = original_url + ( original_url.charAt( original_url.length - 1 ) == '/' ? '' : '/' );
        parsed_url += "?apiKey="+API_KEY;

        return parsed_url;
    }
});

Models.PageCollection = Backbone.Collection.extend({
    url: function() {
        return BASE_URL + "/pages/?apiKey=" + API_KEY + '&q={"user_id":"'+this.userId+'"}';
    },
    model: Models.Page,
    initialize: function(values,options) {
        debugger
        this.userId = options.userId;
    }
});