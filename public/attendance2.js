document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('attendance-form');
  const serviceSelect = document.getElementById('service_id');
  const logoutBtn = document.getElementById('logout-btn');

  // Fetch services and populate dropdown
  fetch('/services')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      return response.json();
    })
    .then(services => {
      serviceSelect.innerHTML = '<option value="">-- Select a service --</option>';
      services.forEach(service => {
  // Format the date to YYYY-MM-DD
  let formattedDate = service.service_date;
  if (service.service_date instanceof Date) {
    formattedDate = service.service_date.toISOString().slice(0, 10);
  } else if (typeof service.service_date === 'string' && service.service_date.includes('T')) {
    formattedDate = service.service_date.split('T')[0];
  }

  const option = document.createElement('option');
  option.textContent = `${service.service_name} | ${service.service_location} | ${service.time_of_day} | ${service.start_time} - ${service.end_time} | ${formattedDate}`;
  option.setAttribute('data-location', service.service_location);
  option.setAttribute('data-start_time', service.start_time);
  option.setAttribute('data-end_time', service.end_time);
  option.setAttribute('data-name', service.service_name );
  option.setAttribute('data-time_of_day', service.time_of_day);
  option.setAttribute('data-id', service.service_id);
  option.setAttribute('data-date', formattedDate); // Use formattedDate here
  serviceSelect.appendChild(option);
});
    })
    .catch(error => {
      console.error('Error loading services:', error);
      alert('Could not load services. Please try again later.');
    });

  // Handle form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    const serviceLocation = selectedOption.getAttribute('data-location');
    const startTime = selectedOption.getAttribute('data-start_time');
    const endTime = selectedOption.getAttribute('data-end_time');
    const serviceName = selectedOption.getAttribute('data-name');
    const TimeOfDay = selectedOption.getAttribute('data-time_of_day');
    const serviceId = selectedOption.getAttribute('data-id');
    const serviceDate = selectedOption.getAttribute('data-date');

    if (!serviceId || !serviceDate) {
      alert("Please select a valid service.");
      return;
    }

    const body = {
      service_id: serviceId,
      service_location: serviceLocation,
      start_time: startTime,
      end_time: endTime,
      specific_time: `${startTime} - ${endTime}`,
      service_name: serviceName,
      time_of_day: TimeOfDay,
      service_date: serviceDate
    };

    try {
      const response = await fetch('/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Attendance marked successfully!');
        form.reset();
        window.location.href = '/attendance.html'; // Redirect to attendance page
      } else {
        alert(`Failed to mark attendance: ${data.message}`);
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('An error occurred. Please try again.');
    }
  });

  // Handle logout
  logoutBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/logout', { method: 'POST' });
      if (response.ok) {
        window.location.href = '/home.html';
      } else {
        alert('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  });
  });