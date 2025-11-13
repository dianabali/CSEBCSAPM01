// Handle adding a new recipe
document.addEventListener('DOMContentLoaded', () => {
  const recipeForm = document.getElementById('recipe-form');

  // Submit new recipe
  recipeForm.addEventListener('submit', e => {
    e.preventDefault();
    console.log('Form submitted');

    const name = document.getElementById('recipe-name').value.trim();
    const description = document.getElementById('recipe-desc').value.trim();
    const ingredients = document.getElementById('recipe-ingredients').value.split(',').map(i => i.trim());
    const imageInput = document.getElementById('recipe-image');

    if (imageInput.files.length === 0) {
      alert('Please upload an image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      const imageBase64 = event.target.result;

      const newRecipe = { name, description, ingredients, image: imageBase64 };
      const recipes = JSON.parse(localStorage.getItem('userRecipes')) || [];
      recipes.push(newRecipe);
      localStorage.setItem('userRecipes', JSON.stringify(recipes));

      recipeForm.reset();
      window.location.href = 'index.html';
    };

    reader.readAsDataURL(imageInput.files[0]);
  });
});
