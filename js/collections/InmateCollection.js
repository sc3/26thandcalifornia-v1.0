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
		}
	});

	return InmateCollection;

});