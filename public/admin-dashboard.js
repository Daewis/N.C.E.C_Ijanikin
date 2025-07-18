// --- Data Definitions (from your original admin-dashboard.js) ---
    const memberHeaders = [
      { label: 'First Name', key: 'first_name' },
      { label: 'Last Name', key: 'last_name' },
      { label: 'Username', key: 'username' },
      { label: 'Gender', key: 'gender' },
      { label: 'Email', key: 'email' },
      { label: 'Phone Number', key: 'phone_number' },
      { label: 'Membership Date', key: 'membership_date' },
      { label: 'Address', key: 'address' }
    ];

    const serviceHeaders = [
      { label: 'Service Name', key: 'service_name' },
      { label: 'Location', key: 'service_location' },
      { label: 'Time of Day', key: 'time_of_day' },
      { label: 'Start Time', key: 'start_time' },
      { label: 'End Time', key: 'end_time' },
      { label: 'Service Date', key: 'service_date' }
    ];

    const attendanceHeaders = [
      { label: 'Member ID', key: 'member_id' },
      { label: 'Service ID', key: 'service_id' },
      { label: 'Specific Time', key: 'specific_time' },
      { label: 'Attendance Date', key: 'attendance_date' }
    ];

    // --- Table Rendering Function (adapted from your original admin-dashboard.js) ---
    function renderTable(targetTableHeadId, targetTableBodyId, headers, rows) {
      const tableHead = document.getElementById(targetTableHeadId);
      const tableBody = document.getElementById(targetTableBodyId);
      tableHead.innerHTML = '';
      tableBody.innerHTML = '';

      // Render header row
      const headerRow = document.createElement('tr');
      headers.forEach(head => {
        const th = document.createElement('th');
        th.textContent = head.label;
        headerRow.appendChild(th);
      });
      tableHead.appendChild(headerRow);

      // Render data rows
      if (!rows || !rows.length) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = headers.length;
        td.className = "text-center text-muted py-3";
        td.textContent = 'No data available.';
        tr.appendChild(td);
        tableBody.appendChild(tr);
        return;
      }

      rows.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(head => {
          const td = document.createElement('td');
          // Special handling for date fields to format them
          if (head.key === 'membership_date' || head.key === 'service_date' || head.key === 'attendance_date') {
            td.textContent = row[head.key] ? new Date(row[head.key]).toLocaleDateString('en-CA') : 'N/A';
          } else {
            td.textContent = row[head.key] || 'N/A'; // Use 'N/A' for missing data
          }
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });
    }

    // --- Main Dashboard Logic (from previous response, updated with original load functions) ---
    document.addEventListener('DOMContentLoaded', async () => {
      const dashboardContent = document.getElementById('dashboard-content');
      const navLinks = document.querySelectorAll('.sidebar .nav-link');
      const usernameDisplay = document.getElementById('loggedInUser');
      const adminRegNav = document.getElementById('adminRegNav');
      const adminWelcomeText = document.getElementById('admin-welcome-text');

      // Function to hide all content sections
      function hideAllSections() {
        document.querySelectorAll('#dashboard-content > div').forEach(section => {
          section.style.display = 'none';
        });
      }

      // Function to display a specific content section
      function showSection(sectionId) {
        hideAllSections();
        const section = document.getElementById(sectionId);
        if (section) {
          section.style.display = 'block';
        }
      }

      // --- API Calls for Data Loading (adapted to use renderTable) ---

      async function loadMembers() {
        showSection('members-section'); // Show the members table section
        try {
          const res = await fetch('/members'); // Original API endpoint from admin-dashboard.js
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          renderTable('membersTableHead', 'membersTableBody', memberHeaders, data);
        } catch (error) {
          console.error('Error loading members:', error);
          const tableBody = document.getElementById('membersTableBody');
          tableBody.innerHTML = `<tr><td colspan="${memberHeaders.length}" class="text-danger">Failed to load members: ${error.message}</td></tr>`;
        }
      }

      async function loadServices() {
        showSection('services-section'); // Show the services table section
        try {
          const res = await fetch('/services'); // Original API endpoint from admin-dashboard.js
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          renderTable('servicesTableHead', 'servicesTableBody', serviceHeaders, data);
        } catch (error) {
          console.error('Error loading services:', error);
          const tableBody = document.getElementById('servicesTableBody');
          tableBody.innerHTML = `<tr><td colspan="${serviceHeaders.length}" class="text-danger">Failed to load services: ${error.message}</td></tr>`;
        }
      }

      async function loadAttendance() {
        showSection('attendance-section'); // Show the attendance table section
        try {
          const res = await fetch('/attendance/all'); // Original API endpoint from admin-dashboard.js
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          renderTable('attendanceTableHead', 'attendanceTableBody', attendanceHeaders, data);
        } catch (error) {
          console.error('Error loading attendance:', error);
          const tableBody = document.getElementById('attendanceTableBody');
          tableBody.innerHTML = `<tr><td colspan="${attendanceHeaders.length}" class="text-danger">Failed to load attendance: ${error.message}</td></tr>`;
        }
      }

      // Main function to load content based on section
      function loadSection(section) {
        // Update welcome text for specific sections
        if (section === 'welcome') {
          adminWelcomeText.textContent = 'Welcome, Admin';
        } else if (section === 'members') {
          adminWelcomeText.textContent = 'Manage Church Members';
        } else if (section === 'services') {
          adminWelcomeText.textContent = 'Manage Church Services';
        } else if (section === 'attendance') {
          adminWelcomeText.textContent = 'View Attendance Records';
        } else if (section === 'add-service') {
          adminWelcomeText.textContent = 'Create New Service';
        } else if (section === 'admin-registration') {
          adminWelcomeText.textContent = 'Register New Admin';
        }

        switch (section) {
          case 'welcome':
            showSection('welcome-section');
            break;
          case 'members':
            loadMembers();
            break;
          case 'services':
            loadServices();
            break;
          case 'attendance':
            loadAttendance();
            break;
          case 'add-service':
            showSection('add-service-section');
            break;
          case 'admin-registration':
            showSection('admin-registration-section');
            break;
          default:
            showSection('welcome-section'); // Default to welcome
            break;
        }
      }

      // --- Event Listeners and Initial Setup ---

      // Sidebar navigation logic
      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          navLinks.forEach(l => l.classList.remove('active'));
          this.classList.add('active');
          loadSection(this.getAttribute('data-section'));
        });
      });

      // Show admin registration nav for superadmin
      try {
        const res = await fetch('/auth/role');
        const data = await res.json();
        if (data?.username) {
          usernameDisplay.textContent = `Logged in: ${data.username} (${data.role})`;
        }
        if (data?.role === 'superadmin') {
          adminRegNav.style.display = 'block';
        }
      } catch (err) {
        console.error('Role check failed:', err);
      }

      // Add Service Form submission
      document.getElementById('addServiceForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const serviceData = {
          service_name: document.getElementById('service_name').value,
          service_location: document.getElementById('service_location').value,
          start_time: document.getElementById('start_time').value,
          end_time: document.getElementById('end_time').value,
          time_of_day: document.getElementById('time_of_day').value,
          service_date: document.getElementById('service_date').value
        };

        try {
          const res = await fetch('/admin/add-service', { // Original API endpoint from admin-dashboard.js
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serviceData)
          });
          const data = await res.json();
          if (res.ok) {
            alert('Service added successfully!');
            document.getElementById('addServiceForm').reset();
            loadServices(); // Reload services to show the new addition
          } else {
            alert(`Error: ${data.message || 'Failed to add service.'}`);
          }
        } catch (err) {
          console.error('Failed to add service:', err);
          alert('Failed to add service. Please try again.');
        }
      });

      // Admin Registration Form submission
      document.getElementById('admin-registration-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('newAdminUsername').value;
        const password = document.getElementById('newAdminPassword').value;

        try {
          const res = await fetch('/superadmin/register-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          if (res.ok) {
            alert('Admin registered successfully!');
            document.getElementById('admin-registration-form').reset();
          } else {
            alert(`Error: ${data.message || 'Failed to register admin.'}`);
          }
        } catch (err) {
          console.error('Failed to register admin:', err);
          alert('Failed to register admin. Please try again.');
        }
      });

      // Logout Button
      document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('/logout');
        window.location.href = '/home.html';
      });

      // Initial load: show the welcome section by default
      loadSection('welcome');
    });
  