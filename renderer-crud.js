// renderer-crud.js

const logFoodName = document.getElementById('logFoodName');
const logCalories = document.getElementById('logCalories');
const logCategory = document.getElementById('logCategory');
const addLogBtn = document.getElementById('addLogBtn');
const crudTableBody = document.getElementById('crudTableBody');
const crudStatus = document.getElementById('crudStatus');

let editIndex = -1;

function showCrudStatus(msg, type = 'info') {
  if (!crudStatus) return;
  crudStatus.textContent = msg;
  crudStatus.className = `message ${type}`;
  crudStatus.classList.remove('hidden');
  setTimeout(() => crudStatus.classList.add('hidden'), 3000);
}

function getRecords() {
  const records = localStorage.getItem('nutrition_intake_logs');
  return records ? JSON.parse(records) : [];
}

function saveRecords(records) {
  localStorage.setItem('nutrition_intake_logs', JSON.stringify(records));
}

function renderRecords() {
  if (!crudTableBody) return;
  const records = getRecords();
  crudTableBody.innerHTML = '';

  if (records.length === 0) {
    crudTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#8c9ba5;">No records found. Add a meal above!</td></tr>`;
    return;
  }

  records.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.date}</td>
      <td><strong>${item.foodName}</strong></td>
      <td><span class="badge suitable" style="font-size:0.75rem;">${item.category}</span></td>
      <td>${item.calories} kcal</td>
      <td>
        <button onclick="editRecord(${index})" style="padding: 4px 10px; font-size: 0.78rem; background: #63b3ed; margin-right: 4px;">Edit</button>
        <button onclick="deleteRecord(${index})" style="padding: 4px 10px; font-size: 0.78rem; background: #fc8181;">Delete</button>
      </td>
    `;
    crudTableBody.appendChild(row);
  });
}

if (addLogBtn) {
  addLogBtn.addEventListener('click', () => {
    const foodName = logFoodName.value.trim();
    const calories = parseInt(logCalories.value);
    const category = logCategory.value;

    if (!foodName || isNaN(calories) || calories <= 0) {
      showCrudStatus('Please enter a valid food name and calorie amount.', 'error');
      return;
    }

    const records = getRecords();
    const today = new Date().toLocaleDateString('en-GB');

    if (editIndex === -1) {
      records.push({ date: today, foodName, calories, category });
      showCrudStatus('Meal log added successfully!', 'info');
    } else {
      records[editIndex] = { date: today, foodName, calories, category };
      showCrudStatus('Meal log updated successfully!', 'info');
      editIndex = -1;
      addLogBtn.textContent = 'Add to Log';
    }

    saveRecords(records);
    logFoodName.value = '';
    logCalories.value = '';
    renderRecords();
  });
}

window.editRecord = function(index) {
  const records = getRecords();
  const item = records[index];
  if (!item) return;

  logFoodName.value = item.foodName;
  logCalories.value = item.calories;
  logCategory.value = item.category || 'Lunch';
  editIndex = index;
  addLogBtn.textContent = 'Update Log';
};

window.deleteRecord = function(index) {
  if (confirm('Are you sure you want to delete this meal record?')) {
    const records = getRecords();
    records.splice(index, 1);
    saveRecords(records);
    renderRecords();
    showCrudStatus('Meal record deleted.', 'info');
  }
};

document.addEventListener('DOMContentLoaded', renderRecords);