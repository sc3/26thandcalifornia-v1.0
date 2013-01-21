define(['collections/CookCountyJailCollection', 'models/InmateModel'], function(CookCountyJailCollection, InmateModel) {

	var InmateCollection = CookCountyJailCollection.extend({
		url: INMATE_URL,
		model: InmateModel,
		sortAscending: true,
		sortByAttributeKey: 'jail_id',

		comparator: function(model) {
			var val = model.get(this.sortByAttributeKey);
			return this.sortAscending ? val : -val;
		},

		sortByAttribute: function(attribute, ascending) {
			this.sortByAttributeKey = attribute;
			this.sortAscending = ascending;
			this.sort();
		}
	});

	return InmateCollection;

});