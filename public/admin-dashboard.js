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

// --- Utility Functions ---

// Debounce function to limit how often a function is called
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

// Helper to display alerts
function showAlert(message, type = 'success') {
  alert(message); // For simplicity, using native alert. Consider a custom toast/modal for better UX.
  // Example for a custom alert:
  // const alertContainer = document.getElementById('alertContainer'); // Add this div in your HTML
  // alertContainer.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
  //   ${message}
  //   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  // </div>`;
  // setTimeout(() => alertContainer.innerHTML = '', 5000);
}


// --- Main Dashboard Logic ---
document.addEventListener('DOMContentLoaded', async () => {
  const dashboardContent = document.getElementById('dashboard-content');
  const navLinks = document.querySelectorAll('.sidebar .nav-link');
  const usernameDisplay = document.getElementById('loggedInUser');
  const adminRegNav = document.getElementById('adminRegNav');
  const adminWelcomeText = document.getElementById('admin-welcome-text');

  // Chart.js instance for attendance report
  let attendanceChartInstance = null;

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
    // Destroy chart instance when navigating away from attendance report
    if (sectionId !== 'member-attendance-report-section' && attendanceChartInstance) {
      attendanceChartInstance.destroy();
      attendanceChartInstance = null;
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
    } else if (section === 'edit-member') {
      adminWelcomeText.textContent = 'Edit Member Details';
      showSection('edit-member-section');
      // Clear search and hide details when navigating to this section
      document.getElementById('editMemberSearch').value = '';
      document.getElementById('editMemberSearchResults').innerHTML = '';
      document.getElementById('editMemberDetails').style.display = 'none';
    } else if (section === 'reset-password') {
      adminWelcomeText.textContent = 'Reset Member Password';
      showSection('reset-password-section');
      // Clear search and hide details
      document.getElementById('resetPasswordSearch').value = '';
      document.getElementById('resetPasswordSearchResults').innerHTML = '';
      document.getElementById('resetPasswordDetails').style.display = 'none';
    } else if (section === 'member-attendance-report') {
      adminWelcomeText.textContent = 'Member Attendance Report';
      showSection('member-attendance-report-section');
      // Clear search and hide details/report
      document.getElementById('attendanceMemberSearch').value = '';
      document.getElementById('attendanceMemberSearchResults').innerHTML = '';
      document.getElementById('attendanceReportOptions').style.display = 'none';
      document.getElementById('attendanceReportDisplay').style.display = 'none';
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
      // New cases handled by the if-else if block above
    }
  }

  // --- Common Member Search Logic ---
  // This function will be reused for edit, reset password, and attendance report
  async function searchMembersAndDisplayResults(searchInputId, resultsContainerId, detailsContainerId, memberIdInputId, memberNameDisplayId, onMemberSelectCallback) {
    const searchInput = document.getElementById(searchInputId);
    const resultsContainer = document.getElementById(resultsContainerId);
    const detailsContainer = document.getElementById(detailsContainerId);

    const performSearch = async () => {
      const query = searchInput.value.trim();
      resultsContainer.innerHTML = ''; // Clear previous results
      detailsContainer.style.display = 'none'; // Hide details until a member is selected

      if (query.length < 2) { // Require at least 2 characters for search
        return;
      }

      try {
        const res = await fetch(`/members/search?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const members = await res.json();

        if (members.length === 0) {
          resultsContainer.innerHTML = '<li class="list-group-item text-muted">No members found.</li>';
          return;
        }

        members.forEach(member => {
          const li = document.createElement('li');
          li.className = 'list-group-item list-group-item-action';
          li.textContent = `${member.first_name} ${member.last_name} (${member.username})`;
          li.dataset.memberId = member.member_id; // Store member ID
          li.dataset.memberName = `${member.first_name} ${member.last_name}`; // Store full name
          // Store all member data for convenience
          li.dataset.memberData = JSON.stringify(member);

          li.addEventListener('click', () => {
            const selectedMember = JSON.parse(li.dataset.memberData);
            document.getElementById(memberIdInputId).value = selectedMember.member_id;
            if (memberNameDisplayId) {
              document.getElementById(memberNameDisplayId).textContent = selectedMember.first_name + ' ' + selectedMember.last_name;
            }
            resultsContainer.innerHTML = ''; // Clear search results
            detailsContainer.style.display = 'block'; // Show the relevant details form
            searchInput.value = selectedMember.first_name + ' ' + selectedMember.last_name; // Populate search box
            onMemberSelectCallback(selectedMember); // Execute callback specific to each section
          });
          resultsContainer.appendChild(li);
        });
      } catch (error) {
        console.error('Error searching members:', error);
        resultsContainer.innerHTML = `<li class="list-group-item text-danger">Search failed: ${error.message}</li>`;
      }
    };

    searchInput.addEventListener('input', debounce(performSearch, 300));
  }


  // --- Edit Member Feature ---
  const editMemberSearch = document.getElementById('editMemberSearch');
  const editMemberSearchResults = document.getElementById('editMemberSearchResults');
  const editMemberDetails = document.getElementById('editMemberDetails');
  const memberIdToEdit = document.getElementById('memberIdToEdit');
  const editMemberfirstName = document.getElementById('editMemberfirstName');
  const editMemberlastName = document.getElementById('editMemberlastName');
  const editMemberEmail = document.getElementById('editMemberEmail');
  const editMemberPhone = document.getElementById('editMemberPhone');
  const editMemberForm = document.getElementById('editMemberForm');

  if (editMemberSearch) {
    searchMembersAndDisplayResults(
      'editMemberSearch',
      'editMemberSearchResults',
      'editMemberDetails',
      'memberIdToEdit',
      null, // No separate name display needed, form fields will be populated
      (member) => {
        // Callback when a member is selected for editing
        editMemberfirstName.value = member.first_name || ''; 
        editMemberlastName.value = member.last_name || '';
        editMemberEmail.value = member.email || '';
        editMemberPhone.value = member.phone_number || '';
      }
    );
  }

  if (editMemberForm) {
    editMemberForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const memberId = memberIdToEdit.value;
      if (!memberId) {
        showAlert('Please select a member to edit.', 'warning');
        return;
      }

      // Assuming your backend expects first_name and last_name separately
     /* const nameParts = editMemberName.value.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';**/

      const updatedData = {
        first_name: editMemberfirstName.value,
        last_name: editMemberlastName.value,
        email: editMemberEmail.value,
        phone_number: editMemberPhone.value
      };

      try {
        const res = await fetch(`/members/${memberId}`, {
          method: 'PUT', // or PATCH
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });
        const data = await res.json();
        if (res.ok) {
          showAlert('Member details updated successfully!', 'success');
          editMemberForm.reset();
          editMemberDetails.style.display = 'none';
          editMemberSearchResults.innerHTML = '';
          editMemberSearch.value = '';
          loadMembers(); // Refresh members list if on that page
        } else {
          showAlert(`Error: ${data.message || 'Failed to update member.'}`, 'danger');
        }
      } catch (err) {
        console.error('Failed to update member:', err);
        showAlert('Failed to update member. Please try again.', 'danger');
      }
    });
  }


  // --- Reset Password Feature ---
  const resetPasswordSearch = document.getElementById('resetPasswordSearch');
  const resetPasswordSearchResults = document.getElementById('resetPasswordSearchResults');
  const resetPasswordDetails = document.getElementById('resetPasswordDetails');
  const memberIdToReset = document.getElementById('memberIdToReset');
  const memberNameToReset = document.getElementById('memberNameToReset');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
  const resetPasswordForm = document.getElementById('resetPasswordForm');

  if (resetPasswordSearch) {
    searchMembersAndDisplayResults(
      'resetPasswordSearch',
      'resetPasswordSearchResults',
      'resetPasswordDetails',
      'memberIdToReset',
      'memberNameToReset',
      (member) => {
        // Callback when a member is selected for password reset
        newPasswordInput.value = ''; // Clear password fields
        confirmNewPasswordInput.value = '';
      }
    );
  }

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const memberId = memberIdToReset.value;
      const newPassword = newPasswordInput.value;
      const confirmNewPassword = confirmNewPasswordInput.value;

      if (!memberId) {
        showAlert('Please select a member to reset password for.', 'warning');
        return;
      }
      if (newPassword.length < 6) { // Example password policy
        showAlert('Password must be at least 6 characters long.', 'warning');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        showAlert('New password and confirm password do not match.', 'warning');
        return;
      }

      try {
        const res = await fetch(`/members/${memberId}/reset-password`, {
          method: 'PUT', // Or POST, depending on your backend
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword })
        });
        const data = await res.json();
        if (res.ok) {
          showAlert('Member password reset successfully!', 'success');
          resetPasswordForm.reset();
          resetPasswordDetails.style.display = 'none';
          resetPasswordSearchResults.innerHTML = '';
          resetPasswordSearch.value = '';
        } else {
          showAlert(`Error: ${data.message || 'Failed to reset password.'}`, 'danger');
        }
      } catch (err) {
        console.error('Failed to reset password:', err);
        showAlert('Failed to reset password. Please try again.', 'danger');
      }
    });
  }


  // --- Member Attendance Report Feature ---
  const attendanceMemberSearch = document.getElementById('attendanceMemberSearch');
  const attendanceMemberSearchResults = document.getElementById('attendanceMemberSearchResults');
  const attendanceReportOptions = document.getElementById('attendanceReportOptions');
  const memberIdForAttendanceReport = document.getElementById('memberIdForAttendanceReport');
  const memberNameForAttendanceReport = document.getElementById('memberNameForAttendanceReport');
  const attendanceReportYear = document.getElementById('attendanceReportYear');
  const generateAttendanceReportBtn = document.getElementById('generateAttendanceReportBtn');
  const attendanceReportDisplay = document.getElementById('attendanceReportDisplay');
  const attendanceSummaryText = document.getElementById('attendanceSummaryText');
  const attendanceChartCanvas = document.getElementById('attendanceChart');

  // Set default year to current year
  if (attendanceReportYear) {
      attendanceReportYear.value = new Date().getFullYear();
  }


  if (attendanceMemberSearch) {
    searchMembersAndDisplayResults(
      'attendanceMemberSearch',
      'attendanceMemberSearchResults',
      'attendanceReportOptions',
      'memberIdForAttendanceReport',
      'memberNameForAttendanceReport',
      (member) => {
        // Callback when a member is selected for attendance report
        attendanceReportDisplay.style.display = 'none'; // Hide previous report
        // Destroy existing chart if it exists
        if (attendanceChartInstance) {
          attendanceChartInstance.destroy();
        }

        attendanceChartInstance = new Chart(attendanceChartCanvas, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: `Services Attended in ${year}`,
              data: data,
              backgroundColor: 'rgba(78, 84, 200, 0.6)',
              borderColor: 'rgba(78, 84, 200, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            // --- MODIFICATIONS HERE ---
            maintainAspectRatio: false, // Keep this as false if you want custom height control
            // aspectRatio: 2, // You could set a custom aspect ratio if maintainAspectRatio is true
            // --- End MODIFICATIONS ---
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Services Attended'
                },
                // Optional: Set a max value for y-axis if data varies widely
                // max: 10, // Example: If attendance rarely exceeds 10 per month
              },
              x: {
                title: {
                  display: true,
                  text: 'Month'
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
              title: {
                display: true,
                text: `${memberNameForAttendanceReport.textContent}'s Attendance in ${year}`
              }
            }
          }
        });

      }
    );
  }

  if (generateAttendanceReportBtn) {
    generateAttendanceReportBtn.addEventListener('click', async () => {
      const memberId = memberIdForAttendanceReport.value;
      const year = attendanceReportYear.value;

      if (!memberId) {
        showAlert('Please select a member to generate the report.', 'warning');
        return;
      }

      try {
        // Fetch attendance data for the member and year
        const res = await fetch(`/attendance/member/${memberId}?year=${year}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const attendanceData = await res.json(); // Expecting an array of attendance records

        attendanceReportDisplay.style.display = 'block';

        // Process data for charting and summary
        const monthlyAttendance = new Array(12).fill(0); // For 12 months
        let totalServicesAttended = 0;
        let totalPossibleServices = 0; // This would ideally come from your backend

        // Placeholder for total possible services:
        // You'll likely need an API endpoint to get total services in a year or month
        // For demonstration, let's assume a fixed number for now or calculate from actual attendance records
        // For a more accurate report, your backend should determine the total possible services for that year/member.

        // For this example, let's just count attended services and assume each month has at least one service
        attendanceData.forEach(record => {
          const date = new Date(record.attendance_date);
          if (date.getFullYear() == year) { // Ensure it's for the selected year
            monthlyAttendance[date.getMonth()]++;
            totalServicesAttended++;
          }
        });

        // Determine total possible services (very basic approximation)
        // A more robust solution involves counting actual services for the year from your services table.
        // For now, let's just assume the number of services attended indicates the total if we don't have other data.
        // Or, if your backend returns `total_possible_services` along with `attendanceData`, use that.
        // For this client-side example, we can make a simple assumption:
        // Let's count unique service_ids for the year to approximate total possible services
        const uniqueServiceIdsForYear = new Set(attendanceData.map(record => {
            const date = new Date(record.attendance_date);
            return date.getFullYear() == year ? record.service_id : null;
        }).filter(id => id !== null));

        totalPossibleServices = uniqueServiceIdsForYear.size > 0 ? uniqueServiceIdsForYear.size : totalServicesAttended; // Fallback


        attendanceSummaryText.innerHTML = `<strong>${memberNameForAttendanceReport.textContent}</strong> attended <strong>${totalServicesAttended}</strong> services in ${year}.`;
        if (totalPossibleServices > 0) {
            attendanceSummaryText.innerHTML += ` (Attendance Rate: ${((totalServicesAttended / totalPossibleServices) * 100).toFixed(2)}%)`;
        }


        // Prepare data for Chart.js
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = monthlyAttendance;

        // Destroy existing chart if it exists
        if (attendanceChartInstance) {
          attendanceChartInstance.destroy();
        }

        attendanceChartInstance = new Chart(attendanceChartCanvas, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: `Services Attended in ${year}`,
              data: data,
              backgroundColor: 'rgba(78, 84, 200, 0.6)',
              borderColor: 'rgba(78, 84, 200, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Services Attended'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Month'
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
              title: {
                display: true,
                text: `${memberNameForAttendanceReport.textContent}'s Attendance in ${year}`
              }
            }
          }
        });

      } catch (error) {
        console.error('Error fetching attendance report:', error);
        attendanceReportDisplay.style.display = 'block';
        attendanceSummaryText.innerHTML = `<p class="text-danger">Failed to load attendance report: ${error.message}</p>`;
        if (attendanceChartInstance) {
          attendanceChartInstance.destroy();
          attendanceChartInstance = null;
        }
      }
    });
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
        showAlert('Service added successfully!', 'success');
        document.getElementById('addServiceForm').reset();
        loadServices(); // Reload services to show the new addition
      } else {
        showAlert(`Error: ${data.message || 'Failed to add service.'}`, 'danger');
      }
    } catch (err) {
      console.error('Failed to add service:', err);
      showAlert('Failed to add service. Please try again.', 'danger');
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
        showAlert('Admin registered successfully!', 'success');
        document.getElementById('admin-registration-form').reset();
      } else {
        showAlert(`Error: ${data.message || 'Failed to register admin.'}`, 'danger');
      }
    } catch (err) {
      console.error('Failed to register admin:', err);
      showAlert('Failed to register admin. Please try again.', 'danger');
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