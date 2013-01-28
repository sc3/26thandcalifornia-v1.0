define(['collections/CookCountyJailCollection', 'models/InmateModel'], function(CookCountyJailCollection, InmateModel) {

	var InmateCollection = CookCountyJailCollection.extend({
		url: INMATE_URL,
		model: InmateModel,
		sortAscending: true,
		sortByAttributeKey: 'jail_id',

		comparator: function(lhs, rhs) {
			var compare = undefined,
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

		sortByAttribute: function(attribute, ascending) {
			this.sortByAttributeKey = attribute;
			this.sortAscending = ascending;
			this.sort();
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
          if ( (!bucket.max && model.get(field) >= bucket.min) || (model.get(field) >= bucket.min && model.get(field) < bucket.max) ) {
            histogram[index].inmate_count += 1;
          }
        });
      });
      return histogram;
    }
	});

	return InmateCollection;

});
