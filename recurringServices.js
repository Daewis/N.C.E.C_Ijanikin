// Example: recurringServices.js
const recurringServices = [
  {
    service_name: 'Sunday Service - Normal Service',
    day_of_week: 0, // Sunday
    start_time: '08:00:00',
    end_time: '12:00:00',
    time_of_day: 'Morning',
    service_location: 'New Creature Ijanikin'
  },
  {
    service_name: 'Sunday Service - Youth Meeting',
    day_of_week: 0, // Sunday
    start_time: '12:30:00',
    end_time: '13:00:00',
    time_of_day: 'Afternoon',
    service_location: 'New Creature Ijanikin'
  },
  {
    service_name: 'Sunday Service - Gospel Women',
    day_of_week: 0, // Sunday
    start_time: '12:30:00',
    end_time: '13:00:00',
    time_of_day: 'Afternoon',
    service_location: 'New Creature Ijanikin'
  },
   {
    // CORRECTED: Removed the extra ' Service' at the end to match DB exactly
    service_name: 'Wednesday Service - Hours of Miracle and Deliverance', // <-- Change this line!
    day_of_week: 3, // Wednesday
    start_time: '10:00:00',
    end_time: '11:00:00',
    time_of_day: 'Morning',
    service_location: 'New Creature Ijanikin'
  },
   {
    // CORRECTED: Removed the extra ' Service' at the end to match DB exactly
    service_name: 'Wednesday Service - Hours of Miracle and Deliverance', // <-- Change this line!
    day_of_week: 3, // Wednesday
    start_time: '17:00:00',
    end_time: '18:00:00',
    time_of_day: 'Evening',
    service_location: 'New Creature Ijanikin'
  },
  {
    service_name: 'Friday Service - Spiritual Clinic',
    day_of_week: 5, // Friday
    start_time: '10:00:00',
    end_time: '11:00:00',
    time_of_day: 'Morning',
    service_location: 'New Creature Ijanikin'
  },
  {
    service_name: 'Friday Service - Spiritual Clinic',
    day_of_week: 5, // Friday
    start_time: '17:00:00',
    end_time: '18:00:00',
    time_of_day: 'Evening',
    service_location: 'New Creature Ijanikin'
  },
   {
    service_name: 'Friday Service - Vigil',
    day_of_week: 5, // Friday
    start_time: '20:00:00',
    end_time: '04:00:00',
    time_of_day: 'Evening',
    service_location: 'New Creature Ijanikin'
  },
  {
    service_name: 'Friday Service - Faith and Miracle Night',
    day_of_week: 5, // Friday
    start_time: '20:00:00',
    end_time: '04:00:00',
    time_of_day: 'Evening',
    service_location: 'Campground'
  },
  {
    // NO CHANGE NEEDED: This now perfectly matches your DB
    service_name: 'Saturday Service -Workers Meeting',
    day_of_week: 6, // Saturday
    start_time: '16:00:00',
    end_time: '17:00:00',
    time_of_day: 'Evening',
    service_location: 'New Creature Ijanikin'
  },
];

export default recurringServices;