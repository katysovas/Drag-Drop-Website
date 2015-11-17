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