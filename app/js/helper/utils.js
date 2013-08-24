//
// Utility programs
//
define([
  ],
  function() {

    var Utils = (function() {
      var daylight_savings_map = {
        1993: ['1993-04-04', '1993-10-31'],
        1994: ['1994-04-03', '1994-10-30'],
        1995: ['1995-04-02', '1995-10-29'],
        1996: ['1996-04-07', '1996-10-27'],
        1997: ['1997-04-06', '1997-10-26'],
        1998: ['1998-04-05', '1998-10-25'],
        1999: ['1999-04-04', '1999-10-31'],
        2000: ['2000-04-02', '2000-10-29'],
        2001: ['2001-04-01', '2001-10-28'],
        2002: ['2002-04-07', '2002-10-27'],
        2003: ['2003-04-06', '2003-10-26'],
        2004: ['2004-04-04', '2004-10-31'],
        2005: ['2005-04-03', '2005-10-30'],
        2006: ['2006-04-02', '2006-10-29'],
        2007: ['2007-03-11', '2007-11-04'],
        2008: ['2008-03-09', '2008-11-02'],
        2009: ['2009-03-08', '2009-11-01'],
        2010: ['2010-03-14', '2010-11-07'],
        2011: ['2011-03-13', '2011-11-06'],
        2012: ['2012-03-11', '2012-11-04'],
        2013: ['2013-03-10', '2013-11-03'],
        2014: ['2014-03-09', '2014-11-02'],
        2015: ['2015-03-08', '2015-11-01']
      };

      // converts dates of the format 'YYYY-MMM-DD' to the Chicago time based date
      function chicago_date (date_to_convert) {
        var timezone = '',
            daylight_savings = daylight_savings_map[date_to_convert.split('-')[0]];
        if (daylight_savings) {
          timezone = (date_to_convert < daylight_savings[0] || date_to_convert >= daylight_savings[1]) ? ' CST' : ' CDT';
        }
        return new Date(date_to_convert + timezone);
      }
      return {chicago_date: chicago_date};
    }());
    return Utils;
  });
