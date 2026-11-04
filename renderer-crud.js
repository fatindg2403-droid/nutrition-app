// Local Storage Key
const STORAGE_KEY = 'nutrition_intake_logs';

// DOM Elements
const crudForm = document.getElementById('crudForm');
const foodNameInput = document.getElementById('foodName');
const caloriesInput = document.getElementById('calories');
const mealTypeSelect = document.getElementById('mealType');
const logDateInput = document.getElementById('logDate');
const editIndexInput = document.getElementById('editIndex');
const saveBtn = document.getElementById('saveBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const recordsTableBody = document.getElementById('recordsTableBody');
const trackerStatus = document.getElementById('trackerStatus');

// Set Default Date to Today
logDateInput.valueToDate = new Date();
logDateInput.value = new Date().toISOString().substring(0, 10);

// Helper Functions for Local Storage
function getRecords() {
  const records = localStorage.getItem(STORAGE_KEY);
  return records ? JSON.parse(records) : [];
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// 1. READ: Display records from Local Storage
function renderRecords() {
  const records = getRecords();
  recordsTableBody.innerHTML = '';

  if (records.length === 0) {
    recordsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 15px; color: #777;">No food intake records logged yet. Add your first meal above!</td></tr>`;
    return;
  }

  records.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="padding: 10px; border: 1px solid #ddd;">${item.date}</td>
      <td style="padding: 10px; border: 1px solid #ddd;"><strong>${item.foodName}</strong></td>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.mealType}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.calories} kcal</td>
      <td style="padding: 10px; border: 1px solid #ddd;">
        <button onclick="editRecord(${index})" style="background-color: #007bff; padding: 5px 10px; font-size: 12px; margin-right: 5px;">Edit</button>
        <button onclick="deleteRecord(${index})" style="background-color: #dc3545; padding: 5px 10px; font-size: 12px;">Delete</button>
      </td>
    `;
    recordsTableBody.appendChild(row);
  });
}

// 2. CREATE & 3. UPDATE: Add or Edit Record
crudForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const foodName = foodNameInput.value.trim();
  const calories = parseInt(caloriesInput.value);
  const mealType = mealTypeSelect.value;
  const date = logDateInput.value;
  const editIndex = parseInt(editIndexInput.value);

  // Validation
  if (!foodName || isNaN(calories) || calories < 0 || !date) {
    showTrackerStatus('Please fill in all required fields with valid values.', 'error');
    return;
  }

  const records = getRecords();

  if (editIndex === -1) {
    // CREATE operation
    records.push({ foodName, calories, mealType, date });
    showTrackerStatus('Meal record added successfully!', 'info');
  } else {
    // UPDATE operation
    records[editIndex] = { foodName, calories, mealType, date };
    showTrackerStatus('Meal record updated successfully!', 'info');
    resetFormState();
  }

  saveRecords(records);
  renderRecords();
  crudForm.reset();
  logDateInput.value = new Date().toISOString().substring(0, 10);
});

// 3. UPDATE helper: Populate form for editing
window.editRecord = function(index) {
  const records = getRecords();
  const record = records[index];

  if (record) {
    foodNameInput.value = record.foodName;
    caloriesInput.value = record.calories;
    mealTypeSelect.value = record.mealType;
    logDateInput.value = record.date;
    editIndexInput.value = index;

    saveBtn.textContent = 'Update Record';
    cancelEditBtn.classList.remove('hidden');
  }
};

// 4. DELETE: Remove record from Local Storage
window.deleteRecord = function(index) {
  if (confirm('Are you sure you want to delete this meal record?')) {
    const records = getRecords();
    records.splice(index, 1);
    saveRecords(records);
    renderRecords();
    showTrackerStatus('Meal record deleted.', 'info');
  }
};

// Cancel Edit Mode
cancelEditBtn.addEventListener('click', resetFormState);

function resetFormState() {
  editIndexInput.value = '-1';
  saveBtn.textContent = 'Add Meal Record';
  cancelEditBtn.classList.add('hidden');
  crudForm.reset();
  logDateInput.value = new Date().toISOString().substring(0, 10);
}

function showTrackerStatus(msg, type) {
  trackerStatus.textContent = msg;
  trackerStatus.className = `message ${type}`;
  setTimeout(() => {
    trackerStatus.className = 'message hidden';
  }, 3000);
}

// Initial Load Execution
renderRecords();