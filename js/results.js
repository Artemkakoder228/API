document.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', async function () {
        const jsonFile = this.getAttribute('data-json');
        const infoDiv = document.getElementById('results-info');
        infoDiv.innerHTML = 'Завантаження...';

        // Якщо це Mathematics.json — підключаємо maths.css
        if (jsonFile === 'Mathematics.json') {
            if (!document.getElementById('maths-css')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'css/maths.css';
                link.id = 'maths-css';
                document.head.appendChild(link);
            }
        }

        // Завантаження JSON
        let data;
        try {
            const res = await fetch('js/paragraphe/' + jsonFile);
            data = await res.json();
        } catch (e) {
            infoDiv.innerHTML = 'Не вдалося завантажити дані.';
            return;
        }

        // Кнопка вибору секції
        let sectionSelect = document.createElement('select');
        sectionSelect.style.margin = '10px 0';
        data['секції'].forEach((s, i) => {
            let opt = document.createElement('option');
            opt.value = i;
            opt.textContent = s['назва'];
            sectionSelect.appendChild(opt);
        });

        let sectionBtn = document.createElement('button');
        sectionBtn.textContent = 'Показати секцію';
        sectionBtn.style.marginLeft = '10px';

        let tableDiv = document.createElement('div');

        function renderTable(sectionIdx) {
            const section = data['секції'][sectionIdx];
            let html = `<h3>${section['назва']}</h3>`;
            html += `<table class="results-table"><thead><tr>
                <th>№</th>
                <th>ПІБ</th>
                <th>Область</th>
                <th>Клас</th>
                <th>Заочне оцінювання</th>
                <th>Постерний захист</th>
                <th>Наукова конференція</th>
                <th>Загальна сума</th>
                <th>Місце</th>
            </tr></thead><tbody>`;
            section['учасники'].forEach(u => {
                let placeClass = '';
                if (u['Місце'] === 'І') placeClass = 'place-gold';
                else if (u['Місце'] === 'ІІ') placeClass = 'place-silver';
                else if (u['Місце'] === 'ІІІ') placeClass = 'place-bronze';
                html += `<tr class="${placeClass}">
                    <td>${u['№'] ?? ''}</td>
                    <td>${u['Прізвище, ім’я, по батькові'] ?? ''}</td>
                    <td>${u['Область'] ?? ''}</td>
                    <td>${u['Клас'] ?? ''}</td>
                    <td>${u['Заочне оцінювання']?.['балів'] ?? ''}</td>
                    <td>${u['Постерний захист']?.['балів'] ?? ''}</td>
                    <td>${u['Наукова конференція']?.['балів'] ?? ''}</td>
                    <td>${u['Загальна сума'] ?? ''}</td>
                    <td>${u['Місце'] ?? ''}</td>
                </tr>`;
            });
            html += '</tbody></table>';
            tableDiv.innerHTML = html;
        }

        sectionBtn.onclick = () => renderTable(sectionSelect.value);
        sectionSelect.onchange = () => renderTable(sectionSelect.value);

        infoDiv.innerHTML = '';
        infoDiv.appendChild(sectionSelect);
        infoDiv.appendChild(sectionBtn);
        infoDiv.appendChild(tableDiv);

        renderTable(0);
    });
});