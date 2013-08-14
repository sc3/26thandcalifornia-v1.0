define([
  'backbone',
  'spin',
],
function(Backbone, Spinner) {
  var SpinnerView = Backbone.View.extend({
    initialize: function() {
      // Spinner view
      var spinner_opts = {
        lines: 12, // The number of lines to draw
        length: 12, // The length of each line
        width: 6, // The line thickness
        radius: 14, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb
        speed: 1.2, // Rounds per second
        trail: 40, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 0, // The z-index (defaults to 2000000000)t
      };
      this.spinner = new Spinner(spinner_opts).spin(this.$el.get(0));
    }
  });
  return SpinnerView;
});
