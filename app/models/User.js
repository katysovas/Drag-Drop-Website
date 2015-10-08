Models.User = Backbone.MongoModel.extend({
    urlRoot: BASE_URL + "/users/",
    url: function() {
        var original_url = Backbone.Model.prototype.url.call( this );
        var parsed_url = original_url + ( original_url.charAt( original_url.length - 1 ) == '/' ? '' : '/' );
        parsed_url += "?apiKey="+API_KEY;
        return parsed_url;
    }
});

Models.UserCollection = Backbone.Collection.extend({
    url: function() {
    	debugger
        return BASE_URL + "/users/?apiKey=" + API_KEY + '&q={"user_id":"'+this.userId+'"}';
    },
    model: Models.User,
    initialize: function(values,options) {
        debugger
        this.userId = options.userId;
    }
});