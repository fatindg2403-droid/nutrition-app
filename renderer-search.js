// --- DOM Elements Navigation & Selection ---
const foodInput = document.getElementById('foodInput');
const dietGoalSelect = document.getElementById('dietGoal');
const searchBtn = document.getElementById('searchBtn');
const statusMessage = document.getElementById('statusMessage');
const nutritionResult = document.getElementById('nutritionResult');

// Nutrition Output Elements
const resFoodName = document.getElementById('resFoodName');
const resCalories = document.getElementById('resCalories');
const resProtein = document.getElementById('resProtein');
const resCarbs = document.getElementById('resCarbs');
const resFat = document.getElementById('resFat');
const resFiber = document.getElementById('resFiber');
const suggestionBadge = document.getElementById('suggestionBadge');
const suggestionText = document.getElementById('suggestionText');

// Calculator Elements
const calcForm = document.getElementById('calcForm');
const calcGender = document.getElementById('calcGender');
const calcAge = document.getElementById('calcAge');
const calcWeight = document.getElementById('calcWeight');
const calcHeight = document.getElementById('calcHeight');
const calcResult = document.getElementById('calcResult');
const resBmr = document.getElementById('resBmr');
const resTdee = document.getElementById('resTdee');

// --- Event Listener 1: API Search Button ---
searchBtn.addEventListener('click', async () => {
  const query = foodInput.value.trim();
  const goal = dietGoalSelect.value;

  // Error Handling 1: Empty Input Check
  if (!query) {
    showStatus('Please enter a food name to search.', 'error');
    nutritionResult.classList.add('hidden');
    return;
  }

  showStatus('Fetching nutrition data from API...', 'info');

  try {
    // Task 2: Fetch External API (Open Food Facts API)
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`);
    
    // Error Handling 2: Failed API Request
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // Error Handling 3: Empty API Results
    if (!data.products || data.products.length === 0) {
      showStatus(`No nutritional records found for "${query}". Try another food item.`, 'error');
      nutritionResult.classList.add('hidden');
      return;
    }

    // Process JSON Response
    const product = data.products[0];
    const nutriments = product.nutriments || {};

    // 5 Extracted API Data Points
    const foodName = product.product_name || query;
    const calories = Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0);
    const protein = parseFloat((nutriments['proteins_100g'] || 0).toFixed(1));
    const carbs = parseFloat((nutriments['carbohydrates_100g'] || 0).toFixed(1));
    const fat = parseFloat((nutriments['fat_100g'] || 0).toFixed(1));
    const fiber = parseFloat((nutriments['fiber_100g'] || 0).toFixed(1));

    // DOM Manipulations to Display Data
    resFoodName.textContent = foodName;
    resCalories.textContent = calories;
    resProtein.textContent = protein;
    resCarbs.textContent = carbs;
    resFat.textContent = fat;
    resFiber.textContent = fiber;

    // Task 3: Execute Student-Written Suggestion Logic
    evaluateDietSuggestion(calories, protein, carbs, goal);

    hideStatus();
    nutritionResult.classList.remove('hidden');

  } catch (error) {
    showStatus('Error fetching API data. Please check your internet connection.', 'error');
    nutritionResult.classList.add('hidden');
  }
});

// --- Task 3: Student-Written Control Statements (Suggestion Logic) ---
function evaluateDietSuggestion(calories, protein, carbs, goal) {
  let badgeClass = '';
  let badgeLabel = '';
  let advice = '';

  if (goal === 'weight_loss') {
    if (calories <= 150 && carbs <= 20) {
      badgeClass = 'suitable';
      badgeLabel = 'Highly Recommended';
      advice = 'Great choice for weight loss! Low calories and low carbs help maintain a calorie deficit.';
    } else if (calories <= 300) {
      badgeClass = 'moderate';
      badgeLabel = 'Consume in Moderation';
      advice = 'Moderate calorie content. Fits within a weight loss plan if portion size is controlled.';
    } else {
      badgeClass = 'unsuitable';
      badgeLabel = 'Not Ideal for Weight Loss';
      advice = 'High calorie density. Consider smaller portions or lower-calorie alternatives.';
    }
  } else if (goal === 'muscle_gain') {
    if (protein >= 12) {
      badgeClass = 'suitable';
      badgeLabel = 'Excellent Protein Source';
      advice = 'High protein content supports muscle repair and growth. Great post-workout choice!';
    } else if (protein >= 5) {
      badgeClass = 'moderate';
      badgeLabel = 'Moderate Protein';
      advice = 'Provides reasonable protein. Pair with additional protein sources to hit daily targets.';
    } else {
      badgeClass = 'unsuitable';
      badgeLabel = 'Low Protein Content';
      advice = 'Low in protein. You may need extra protein items to support muscle recovery.';
    }
  } else { // Balanced Diet
    if (calories > 0 && calories <= 400) {
      badgeClass = 'suitable';
      badgeLabel = 'Balanced Option';
      advice = 'Provides well-rounded nutrition suitable for daily maintenance.';
    } else {
      badgeClass = 'moderate';
      badgeLabel = 'Watch Portions';
      advice = 'Calorie dense item. Pair with fresh vegetables for nutritional balance.';
    }
  }

  // DOM Updates
  suggestionBadge.className = `badge ${badgeClass}`;
  suggestionBadge.textContent = badgeLabel;
  suggestionText.textContent = advice;
}

// --- Task 4: Meaningful Calculation Logic (BMR & TDEE) ---
calcForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const gender = calcGender.value;
  const age = parseInt(calcAge.value);
  const weight = parseFloat(calcWeight.value);
  const height = parseFloat(calcHeight.value);

  // Validation
  if (isNaN(age) || isNaN(weight) || isNaN(height) || age <= 0 || weight <= 0 || height <= 0) {
    alert('Please enter valid positive numbers for Age, Weight, and Height.');
    return;
  }

  // BMR Formula (Mifflin-St Jeor Equation)
  let bmr = 0;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }

  // TDEE Baseline calculation (Multiplier for light daily activity: 1.375)
  const tdee = bmr * 1.375;

  // DOM Manipulation to Display Calculations with Clear Units
  resBmr.textContent = Math.round(bmr);
  resTdee.textContent = Math.round(tdee);
  calcResult.classList.remove('hidden');
});

// Helper Functions for Status Handling
function showStatus(msg, type) {
  statusMessage.textContent = msg;
  statusMessage.className = `message ${type}`;
}

function hideStatus() {
  statusMessage.className = 'message hidden';
}