fetch('js/jasu2025_data.json')
    .then(response => response.json())
    .then(data => {
        // Фільтруємо тільки ті, у кого є title (це повні записи)
        const cardsData = data.filter(item => item.title);

        // Заповнення фільтрів
        const departmentFilter = document.getElementById('department-filter-cards');
        const regionFilter = document.getElementById('region-filter-cards');
        const searchInput = document.getElementById('search-input-cards');

        // Унікальні відділення та області
        const departments = Array.from(new Set(cardsData.map(i => i.department).filter(Boolean))).sort();
        const regions = Array.from(new Set(cardsData.map(i => i.region).filter(Boolean))).sort();

        departments.forEach(dep => {
            const opt = document.createElement('option');
            opt.value = dep;
            opt.textContent = dep;
            departmentFilter.appendChild(opt);
        });
        regions.forEach(reg => {
            const opt = document.createElement('option');
            opt.value = reg;
            opt.textContent = reg;
            regionFilter.appendChild(opt);
        });

        function renderCards() {
            const depVal = departmentFilter.value;
            const regVal = regionFilter.value;
            const searchVal = searchInput.value.trim().toLowerCase();

            const container = document.getElementById('cards-container');
            container.innerHTML = '';
            cardsData.forEach(item => {
                if (
                    (depVal === '' || item.department === depVal) &&
                    (regVal === '' || item.region === regVal) &&
                    (
                        !searchVal ||
                        (item.title && item.title.toLowerCase().includes(searchVal)) ||
                        (item.number && item.number.toString().toLowerCase().includes(searchVal)) ||
                        (item.department && item.department.toLowerCase().includes(searchVal)) ||
                        (item.region && item.region.toLowerCase().includes(searchVal))
                    )
                ) {
                    const card = document.createElement('div');
                    card.className = 'project-card';
                    card.innerHTML = `
                        <div class="card-number">${item.number || ''}</div>
                        <div class="card-title">${item.title || ''}</div>
                        <div class="card-department">${item.department || ''}</div>
                        <div class="card-region">${item.region || ''}</div>
                        <div class="card-links">
                            ${item.detailsLink ? `<a href="${item.detailsLink}" target="_blank">Деталі</a>` : ''}
                            ${item.posterLink ? `<a href="${item.posterLink}" target="_blank">Постер</a>` : ''}
                        </div>
                    `;
                    container.appendChild(card);
                }
            });
        }

        departmentFilter.addEventListener('change', renderCards);
        regionFilter.addEventListener('change', renderCards);
        searchInput.addEventListener('input', renderCards);

        renderCards();
    });