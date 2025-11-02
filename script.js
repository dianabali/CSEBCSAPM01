const search = document.getElementById('search');
const submit = document.getElementById('submit');
const random = document.getElementById('random');
const mealsEl = document.getElementById('meals');
const resultHeading = document.getElementById('result-heading');
const single_mealEl = document.getElementById('single-meal');
const favoritesEl = document.getElementById('favorites');
const categorySelect = document.getElementById('category-select');
const recipeForm = document.getElementById('recipe-form');
const userRecipesList = document.getElementById('user-recipes');

// Search meal and fetch from API
function searchMeal(e) {
    e.preventDefault();

    // Clear single meal
    single_mealEl.innerHTML = '';

    // Get search term
    const term = search.value;
    
    // Check for empty
    if(term.trim()) { 
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`)
        .then(res => res.json())
        .then(data => {
            resultHeading.innerHTML = `<h2>Search results for '${term}':</h2>`;
            
            if(data.meals === null) {
                resultHeading.innerHTML = `<p>No results found for '${term}'.</p>`;
            } else {
                mealsEl.innerHTML = data.meals.map(meal => `
                    <div class="meal">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                        <div class="meal-info" data-mealID="${meal.idMeal}">
                            <h3>${meal.strMeal}</h3>
                        </div>
                    </div>
                `).join('');
            }
        });

        // Clear search text
        search.value = '';
    } else {
        alert('Please enter a search term');
    }

}

// Load meal categories into dropdown
function loadCategories() {
    fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
        .then(res => res.json())
        .then(data => {
            data.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.strCategory;
                option.textContent = cat.strCategory;
                categorySelect.appendChild(option);
            });
        });
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    renderFavorites();
    loadCategories();
});

// Filter meals by category
categorySelect.addEventListener('change', e => {
    const category = e.target.value;
    if(category) {
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
            .then(res => res.json())
            .then(data => {
                single_mealEl.innerHTML = ''; // Clear single meal
                resultHeading.innerHTML = `<h2>${category} Recipes:</h2>`;
                
                mealsEl.innerHTML = data.meals.map(meal => `
                    <div class="meal">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                        <div class="meal-info" data-mealID="${meal.idMeal}">
                            <h3>${meal.strMeal}</h3>
                        </div>
                    </div>
                `).join('');
            });
    }
});

// Fetch random meal from API
function getRandomMeal() {
    // Clear meals and heading
    mealsEl.innerHTML = '';
    resultHeading.innerHTML = '';

    fetch('https://www.themealdb.com/api/json/v1/1/random.php')
    .then(res => res.json())
    .then(data => {
        const meal = data.meals[0];
        addMealToDOM(meal);
    });
}

// Fetch meal by ID
function getMealById(mealID) {
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`)
    .then(res => res.json())
    .then(data => {
        const meal = data.meals[0];

        addMealToDOM(meal);
    });
}

// Add meal to DOM
function addMealToDOM(meal) {
    const ingredients = [];

    for(let i = 1; i <= 20; i++) {
        if(meal[`strIngredient${i}`]) {
            ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`);
        } else {
            break;
        }
}
    single_mealEl.innerHTML = `
        <div class="single-meal">
            <h1>${meal.strMeal}</h1>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">

            <div class="single-meal-info">
                ${meal.strCategory ? `<p>Category: ${meal.strCategory}</p>` : ''}
                ${meal.strArea ? `<p>Area: ${meal.strArea}</p>` : ''}
            </div>

            <div class="main">
                <h2>Instructions</h2>
                <p>${meal.strInstructions}</p>
                <h2>Ingredients</h2>
                <ul>
                    ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                </ul>

                <button id="save-fav">Save to Favorites</button>
            </div>
        </div>
    `;

    // Save to favorites on click
    document.getElementById('save-fav').addEventListener('click', () => {
        addFavorite(meal);
    });

    // Check if meal is already in favorites
    const isFav = getFavorites().some(fav => fav.idMeal === meal.idMeal);

    single_mealEl.innerHTML = `
        <div class="single-meal">
            <h1>${meal.strMeal}</h1>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="single-meal-info">
                ${meal.strCategory ? `<p>Category: ${meal.strCategory}</p>` : ''}
                ${meal.strArea ? `<p>Area: ${meal.strArea}</p>` : ''}
            </div>
            <div class="main">
                <h2>Instructions</h2>
                <p>${meal.strInstructions}</p>
                <h2>Ingredients</h2>
                <ul>
                    ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                </ul>
                <button id="save-fav">${isFav ? 'Saved!' : 'Save to Favorites'}</button>
            </div>
        </div>
    `;

    // Only attach click listener if not already favorite
    if(!isFav) {
        document.getElementById('save-fav').addEventListener('click', () => {
            addFavorite(meal);
            document.getElementById('save-fav').textContent = 'Saved!';
        });
    }
}

// Get favorites from localStorage
function getFavorites() {
    const favs = localStorage.getItem('favorites');
    return favs ? JSON.parse(favs) : [];
}

// Save favorites to localStorage
function saveFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Add meal to favorites
function addFavorite(meal) {
    const favorites = getFavorites();
    // Prevent duplicates
    if(!favorites.some(fav => fav.idMeal === meal.idMeal)) {
        favorites.push(meal);
        saveFavorites(favorites);
        renderFavorites();
    }
}

// Remove meal from favorites
function removeFavorite(idMeal) {
    let favorites = getFavorites();
    favorites = favorites.filter(fav => fav.idMeal !== idMeal);
    saveFavorites(favorites);
    renderFavorites();
}

// Render favorites list
function renderFavorites() {
    const favorites = getFavorites();
    if(favorites.length === 0) {
        favoritesEl.innerHTML = '<p>No favorite recipes yet.</p>';
        return;
    }

    favoritesEl.innerHTML = favorites.map(meal => `
        <div class="meal">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="meal-info" data-mealID="${meal.idMeal}">
                <h3>${meal.strMeal}</h3>
            </div>
            <button class="favorite-btn" data-id="${meal.idMeal}"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

// Remove favorite on click
favoritesEl.addEventListener('click', e => {
    const favBtn = e.target.closest('.favorite-btn');
    if(favBtn) {
        const idMeal = favBtn.getAttribute('data-id');
        removeFavorite(idMeal);
    } else if(e.target.closest('.meal-info')) {
        const mealID = e.target.closest('.meal-info').getAttribute('data-mealid');
        getMealById(mealID);
    }
});

// Render favorites when page loads
document.addEventListener('DOMContentLoaded', () => {
    renderFavorites();
});

// Render user-added recipes
function renderUserRecipes() {
  const recipes = JSON.parse(localStorage.getItem('userRecipes')) || [];
  const container = document.getElementById('user-recipes');

  if (recipes.length === 0) {
    container.innerHTML = '<p>No custom recipes yet.</p>';
    return;
  }

  container.innerHTML = recipes.map((recipe, index) => `
    <div class="meal user-recipe">
      <img src="${recipe.image}" alt="${recipe.name}">
      <div class="meal-info" data-index="${index}">
        <h3>${recipe.name}</h3>
      </div>
      <button class="user-recipe-btn" data-index="${index}">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
}


// Show full recipe when clicked
document.addEventListener('click', e => {
  const userMeal = e.target.closest('.user-meal');
  if (userMeal) {
    const recipes = JSON.parse(localStorage.getItem('userRecipes')) || [];
    const recipe = recipes.find(r => r.name === userMeal.getAttribute('data-name'));
    if (recipe) showUserRecipe(recipe);
  }
});

// Render custom recipes when the page loads
document.addEventListener('DOMContentLoaded', () => {
  renderUserRecipes();
});

// Handle clicks on custom recipes
mealsEl.addEventListener('click', e => {
  const mealInfo = e.target.closest('.meal-info');
  if (!mealInfo) return;

  const userRecipeName = mealInfo.getAttribute('data-user-recipe');
  if (userRecipeName) {
    const recipes = JSON.parse(localStorage.getItem('userRecipes')) || [];
    const recipe = recipes.find(r => r.name === userRecipeName);
    if (recipe) {
      showUserRecipe(recipe);
    }
  } else {
    const mealID = mealInfo.getAttribute('data-mealid');
    if (mealID) getMealById(mealID);
  }
});

// Function to display a custom recipe like the API one
function showUserRecipe(recipe) {
  const ingredientsList = recipe.ingredients.map(i => `<li>${i}</li>`).join('');

  single_mealEl.innerHTML = `
    <div class="single-meal">
      <h1>${recipe.name}</h1>
      <img src="${recipe.image}" alt="${recipe.name}" style="width:300px; height:300px; object-fit:cover; display:block; border:4px solid black; border-radius:5px;">

      <div class="single-meal-info">
        <p><strong>Description:</strong> ${recipe.description}</p>
      </div>

      <div class="main">
        <h2>Ingredients</h2>
        <ul>
          ${ingredientsList}
        </ul>
      </div>
    </div>
  `;
}


// Load custom recipes when the page loads
document.addEventListener('DOMContentLoaded', () => {
  renderFavorites();
  loadCategories();
  renderUserRecipes();
});

// Event listeners
submit.addEventListener('submit', searchMeal);
random.addEventListener('click', getRandomMeal);

// Get meal by ID on click
mealsEl.addEventListener('click', e => {
    const mealInfo = e.composedPath().find(item => {
        if(item.classList) {
            return item.classList.contains('meal-info');
        } else {
            return false;
        }
    });

    if(mealInfo) {
        const mealID = mealInfo.getAttribute('data-mealid');
        getMealById(mealID);
    }
});

// Handle clicks on user-added recipes
userRecipesList.addEventListener('click', e => {
  const mealInfo = e.target.closest('.meal-info');
  const deleteBtn = e.target.closest('.user-recipe-btn');

  let recipes = JSON.parse(localStorage.getItem('userRecipes')) || [];

  if (deleteBtn) {
    const index = deleteBtn.getAttribute('data-index');
    recipes.splice(index, 1);
    localStorage.setItem('userRecipes', JSON.stringify(recipes));
    renderUserRecipes();
    return;
  }

  if (mealInfo) {
    const index = mealInfo.getAttribute('data-index');
    const recipe = recipes[index];
    if (recipe) showUserRecipe(recipe);
  }
});