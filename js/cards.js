fetch('js/jasu2025_data.json')
  .then(response => response.json())
  .then(data => {
    const cardsContainer = document.getElementById('cards-container');
    const departmentFilter = document.getElementById('department-filter-cards');
    const regionFilter = document.getElementById('region-filter-cards');
    const searchInput = document.getElementById('search-input-cards');

    // Зібрати унікальні відділення та області
    const departments = Array.from(new Set(data.map(i => i.department).filter(Boolean))).sort();
    const regions = Array.from(new Set(data.map(i => i.region).filter(Boolean))).sort();

    departments.forEach(dep => {
      const option = document.createElement('option');
      option.value = dep;
      option.textContent = dep;
      departmentFilter.appendChild(option);
    });

    regions.forEach(reg => {
      const option = document.createElement('option');
      option.value = reg;
      option.textContent = reg;
      regionFilter.appendChild(option);
    });

    function renderCards() {
      const depVal = departmentFilter.value;
      const regVal = regionFilter.value;
      const searchVal = searchInput.value.trim().toLowerCase();

      cardsContainer.innerHTML = '';
      data.filter(item => {
        if (depVal && item.department !== depVal) return false;
        if (regVal && item.region !== regVal) return false;
        if (searchVal && !(
          (item.title && item.title.toLowerCase().includes(searchVal)) ||
          (item.department && item.department.toLowerCase().includes(searchVal)) ||
          (item.region && item.region.toLowerCase().includes(searchVal))
        )) return false;
        return true;
      }).forEach(item => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
          <div class="card-number"><b>${item.number || ''}</b></div>
          <div class="card-title">${item.title || 'Без назви'}</div>
          <div class="card-department"><b>Відділення:</b> ${item.department || '-'}</div>
          <div class="card-region"><b>Область:</b> ${item.region || '-'}</div>
          <div class="card-links">
            ${item.detailsLink ? `<a href="${item.detailsLink}" target="_blank">Детальніше</a>` : ''}
            ${item.posterLink ? `<a href="${item.posterLink}" target="_blank">Постер</a>` : ''}
          </div>
        `;
        cardsContainer.appendChild(card);
      });
    }

    departmentFilter.addEventListener('change', renderCards);
    regionFilter.addEventListener('change', renderCards);
    searchInput.addEventListener('input', renderCards);

    renderCards();
  });