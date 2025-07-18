document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registration-form');

  // Handle form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
      first_name: document.getElementById('first_name').value,
      last_name: document.getElementById('last_name').value,
      username: document.getElementById('username').value,
      password: document.getElementById('password').value,
      date_of_birth: document.getElementById('date_of_birth').value,
      email: document.getElementById('email').value,
      address: document.getElementById('address').value,
      membership_date: document.getElementById('membership_date').value,
      gender: document.getElementById('gender').value,
      phone_number: document.getElementById('phone_number').value,
    };

    try {
      const response = await fetch('/members/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Member registered successfully!');
        form.reset();
        // Redirect to login.html
        window.location.href = 'login.html';
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error registering member:', err);
      alert('An error occurred while registering the member.');
    }
  });
});