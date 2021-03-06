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