// renderer-search.js

// DOM Elements - Search & API
const foodInput = document.getElementById('foodInput');
const dietGoal = document.getElementById('dietGoal');
const searchBtn = document.getElementById('searchBtn');
const statusMsg = document.getElementById('statusMsg');
const nutritionResult = document.getElementById('nutritionResult');

const resFoodName = document.getElementById('resFoodName');
const resCalories = document.getElementById('resCalories');
const resProtein = document.getElementById('resProtein');
const resCarbs = document.getElementById('resCarbs');
const resFat = document.getElementById('resFat');

const suggestionBadge = document.getElementById('suggestionBadge');
const suggestionText = document.getElementById('suggestionText');

// Helper: Tunjuk mesej status
function showStatus(msg, type = 'info') {
  if (!statusMsg) return;
  statusMsg.textContent = msg;
  statusMsg.className = `message ${type}`;
  statusMsg.classList.remove('hidden');
}

function hideStatus() {
  if (statusMsg) statusMsg.classList.add('hidden');
}

// 1. Integrasi API Open Food Facts & Carian Nutrisi
if (searchBtn) {
  searchBtn.addEventListener('click', async () => {
    const query = foodInput.value.trim();
    const goal = dietGoal ? dietGoal.value : 'weight_loss';

    if (!query) {
      showStatus('Sila masukkan nama makanan (contoh: apple, chicken).', 'error');
      return;
    }

    showStatus('Sedang mengambil maklumat nutrisi dari API...', 'info');

    try {
      const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`);
      const data = await response.json();

      if (!data.products || data.products.length === 0) {
        showStatus('Makanan tidak dijumpai. Cuba nama makanan dalam Bahasa Inggeris.', 'error');
        if (nutritionResult) nutritionResult.classList.add('hidden');
        return;
      }

      hideStatus();
      const product = data.products[0];
      const foodName = product.product_name || query;

      // Ekstrak 5 data nutrisi per 100g
      const calories = Math.round(product.nutriments['energy-kcal_100g'] || 0);
      const protein = parseFloat((product.nutriments['proteins_100g'] || 0).toFixed(1));
      const carbs = parseFloat((product.nutriments['carbohydrates_100g'] || 0).toFixed(1));
      const fat = parseFloat((product.nutriments['fat_100g'] || 0).toFixed(1));

      // Papar Data Teks
      if (resFoodName) resFoodName.textContent = foodName;
      if (resCalories) resCalories.textContent = calories;
      if (resProtein) resProtein.textContent = protein;
      if (resCarbs) resCarbs.textContent = carbs;
      if (resFat) resFat.textContent = fat;

      // Animasi Visual Progress Bar (Cute UI)
      const barCal = document.getElementById('barCalories');
      const barPro = document.getElementById('barProtein');
      const barCarb = document.getElementById('barCarbs');
      const barFat = document.getElementById('barFat');

      if (barCal) barCal.style.width = `${Math.min((calories / 600) * 100, 100)}%`;
      if (barPro) barPro.style.width = `${Math.min((protein / 40) * 100, 100)}%`;
      if (barCarb) barCarb.style.width = `${Math.min((carbs / 80) * 100, 100)}%`;
      if (barFat) barFat.style.width = `${Math.min((fat / 30) * 100, 100)}%`;

      // Logik Cadangan Diet (if/else)
      evaluateDietSuggestion(calories, protein, carbs, goal);

      // Tunjukkan petak hasil
      if (nutritionResult) nutritionResult.classList.remove('hidden');

    } catch (err) {
      showStatus('Gagal menghubungi API. Sila semak sambungan internet.', 'error');
      if (nutritionResult) nutritionResult.classList.add('hidden');
    }
  });
}

// 2. Logik Cadangan Diet Berdasarkan Goal (Control Logic)
function evaluateDietSuggestion(calories, protein, carbs, goal) {
  let badgeClass = '', badgeLabel = '', advice = '';

  if (goal === 'weight_loss') {
    if (calories <= 150 && carbs <= 20) {
      badgeClass = 'suitable';
      badgeLabel = 'Recommended 🥑';
      advice = 'Sangat sesuai untuk sasaran Weight Loss kerana rendah kalori & karbohidrat.';
    } else {
      badgeClass = 'unsuitable';
      badgeLabel = 'High Density ⚠️';
      advice = 'Tinggi kalori. Ambil dalam porsi kecil jika mahu maintain kalori deficit!';
    }
  } else if (goal === 'muscle_gain') {
    if (protein >= 12) {
      badgeClass = 'suitable';
      badgeLabel = 'High Protein 💪';
      advice = 'Pilihan cemerlang untuk pembentukan otot selepas workout!';
    } else {
      badgeClass = 'moderate';
      badgeLabel = 'Low Protein ℹ️';
      advice = 'Protein agak rendah. Boleh tambah telur atau dada ayam sebagai sampingan.';
    }
  } else {
    if (calories <= 400) {
      badgeClass = 'suitable';
      badgeLabel = 'Balanced Meal ✨';
      advice = 'Hidangan seimbang yang bagus untuk diet harian.';
    } else {
      badgeClass = 'moderate';
      badgeLabel = 'Heavy Meal 🍽️';
      advice = 'Portion agak besar. Pastikan imbangkan dengan senaman harian.';
    }
  }

  if (suggestionBadge) {
    suggestionBadge.className = `badge ${badgeClass}`;
    suggestionBadge.textContent = badgeLabel;
  }
  if (suggestionText) {
    suggestionText.textContent = advice;
  }
}

// 3. Logik Kalkulator BMR & TDEE
const calcBtn = document.getElementById('calcBtn');
if (calcBtn) {
  calcBtn.addEventListener('click', () => {
    const gender = document.getElementById('calcGender').value;
    const age = parseInt(document.getElementById('calcAge').value);
    const weight = parseFloat(document.getElementById('calcWeight').value);
    const height = parseFloat(document.getElementById('calcHeight').value);
    const calcResultBox = document.getElementById('calcResultBox');

    if (!age || !weight || !height || age <= 0 || weight <= 0 || height <= 0) {
      alert('Sila masukkan umur, berat, dan tinggi yang sah!');
      return;
    }

    // Formula Mifflin-St Jeor
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const tdee = bmr * 1.375; // Anggaran aktiviti harian

    document.getElementById('resBMR').textContent = `${Math.round(bmr)} kcal/day`;
    document.getElementById('resTDEE').textContent = `${Math.round(tdee)} kcal/day`;
    if (calcResultBox) calcResultBox.classList.remove('hidden');
  });
}