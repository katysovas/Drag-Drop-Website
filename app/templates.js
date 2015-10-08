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
    + "\" maxlength=\"12\" readonly/>\n<span class=\"page-tab-settings-icons js-tab-edit glyphicon glyphicon-pencil\"></span>\n<span class=\"page-tab-settings-icons js-tab-delete glyphicon glyphicon-remove\"></span>";
},"useData":true});
})();
