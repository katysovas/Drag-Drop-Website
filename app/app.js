var App = App || {};
var Models = Models || {};

_.extend(App, Backbone.Events);

$(document).ready(function() {
   new App.AppView();
});
