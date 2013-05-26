define(['collections/CookCountyJailCollection', 'models/InmateModel'], function(CookCountyJailCollection, InmateModel) {

	var InmateCollection = CookCountyJailCollection.extend({
		url: INMATE_URL,
		model: InmateModel,
		sortAscending: true,
		sortByAttributeKey: 'jail_id',
    memoized: {},

		comparator: function(lhs, rhs) {
			var compare = null,
			val_lhs = lhs.get(this.sortByAttributeKey),
			val_rhs = rhs.get(this.sortByAttributeKey);
			switch(typeof(val_lhs)){
				case "string":
				compare = val_lhs.localeCompare(val_rhs);
				break;

				case "number":
				compare =  val_lhs - val_rhs;
				break;
			}
			return this.sortAscending ? compare : -compare;
		},

    females: function() {
      return this.memoize('female_inmates');
    },

    female_inmates_fn: function() {
      return this.filter(function(prisoner) { return prisoner.get('gender') === 'F'; });
    },

    histogram: function(field, buckets) {
      var histogram = [];
      var buckets_length = buckets.length;

      // Generate structure to store histogram
      _.each(buckets, function(min, index) {
        if (index < buckets_length - 1) {
          var max = buckets[index + 1];
          histogram.push({
            min: min,
            max: max,
            stay: max,
            inmate_count: 0
          });
        }
        else {
          histogram.push({
            min: min,
            stay: min + '+',
            inmate_count: 0
          });
        }
      });

      // Loop over models
      this.each(function(model) {
        _.each(histogram, function(bucket, index, list) {
          var field_value = model.get(field);
          if ( (!bucket.max && field_value >= bucket.min) || (field_value >= bucket.min && field_value < bucket.max) ) {
            histogram[index].inmate_count += 1;
          }
        });
      });
      return histogram;
    },

    males: function() {
      return this.memoize('male_inmates');
    },

    male_inmates_fn: function() {
      return this.filter(function(prisoner) { return prisoner.get('gender') === 'M'; });
    },

    // memoize - returns cached value, if value does not exists, creates it, inspired by famous lisp function intern
    // requires a function to exist whose name is the cached value name plus'_fn' and this function takes no arguments
    // an example is the cache value, female_inmates, its builder function is, female_inmates_fn.
    memoize: function(value_name) {
      var value = this.memoized[value_name];
      if (!value) {
        value = this[value_name + '_fn']();
        this.memoized[value_name] = value;
      }
      return value;
    },

    prisoners_booked_since_collection_start_filter: function() {
      var stats_start_date = this.stats_start_date;
      return function(prisoner) { return prisoner.get('booking_date') >= stats_start_date; };
    },

    sortByAttribute: function(attribute, ascending) {
      this.sortByAttributeKey = attribute;
      this.sortAscending = ascending;
      this.sort();
    },

    // Added this so memoized values get cleared when content is updated
    sync: function(method, model, options) {
      this.memoized = {};
      return CookCountyJailCollection.prototype.sync.apply(this, arguments);
    }
	});

	return InmateCollection;

});
