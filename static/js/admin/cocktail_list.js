// ===============================
// COCKTAIL TILE LOADING SPINNER
// Page complete – Tony, 2/10/2026
// ===============================
document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('cocktail-modal');

        if (!modal.classList.contains('hidden') && e.key === 'Tab') {
            e.preventDefault();
            document.querySelector('.close').focus();
        }
      });


      document.querySelectorAll('.cocktail-card').forEach((card) => {
        card.addEventListener('click', () => {
          // Name
          document.getElementById('modal-name').textContent = card.dataset.name

          // Ingredients (split into list items)
          const ingredients = card.dataset.ingredients.split(', ')
          const ul = document.getElementById('modal-ingredients')
          ul.innerHTML = ''
          ingredients.forEach((ing) => {
            const li = document.createElement('li')
            li.textContent = ing
            ul.appendChild(li)
          })

          // Recipe + History
          document.getElementById('modal-recipe').textContent = card.dataset.recipe
          document.getElementById('modal-history').textContent = card.dataset.history

          // Image
          const modalImg = document.getElementById('modal-image');

          if (card.dataset.image) {
            modalImg.src = `{% static '' %}${card.dataset.image}`;
          } else {
            modalImg.src = `{% static 'cocktails/buttons/no-image.png' %}`;
          }

          // Set alt text dynamically
          modalImg.alt = `${card.dataset.name} image`;

          // Show modal
          const modal = document.getElementById('cocktail-modal');
          modal.classList.remove('hidden');
          // Move keyboard focus to close button
          document.querySelector('.close').focus();

        })
        // Keyboard accessibility handler
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === " ") {
            e.preventDefault();
            card.click();
          }
        });
      })

      // Close modal
      document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('cocktail-modal').classList.add('hidden')
      })

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.getElementById('cocktail-modal').classList.add('hidden')
        }
      })

      document.getElementById('cocktail-modal').addEventListener('click', (e) => {
        if (e.target.id === 'cocktail-modal') {
          e.target.classList.add('hidden')
        }
      })
