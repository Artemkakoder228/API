document.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', async function() {
        const subjectName = card.querySelector('.subject-name').textContent;
        const label = document.getElementById('subject-label');
        label.textContent = subjectName.toUpperCase();

        const jsonFile = card.getAttribute('data-json');
        const resultsInfo = document.getElementById('results-info');
        resultsInfo.innerHTML = 'Завантаження...';

        try {
            const response = await fetch('js/' + jsonFile);
            const data = await response.json();

            // --- ДОДАНО: Перевірка на альтернативну структуру (Chemistry and Biology.json) ---
            if (data["секції"] && Array.isArray(data["секції"])) {
                resultsInfo.innerHTML = data["секції"].map(section => {
                    const sectionName = section["назва"]
                        ? section["назва"].charAt(0).toUpperCase() + section["назва"].slice(1)
                        : '';
                    return `
                        <div class="section-block">
                            <div class="section-title">${sectionName}</div>
                            <div class="section-participants">
                                ${section["учасники"].map(part => {
                                    let placeClass = '';
                                    // універсальна перевірка для різних варіантів ключів
                                    const place = part["Місце"] || part["місце"];
                                    if (place === 'І') placeClass = 'gold';
                                    else if (place === 'ІІ') placeClass = 'silver';
                                    else if (place === 'ІІІ') placeClass = 'bronze';

                                    // універсальна збірка ПІБ
                                    let pib = "";
                                    if (part["Прізвище, ім’я, по батькові"]) {
                                        pib = part["Прізвище, ім’я, по батькові"];
                                    } else if (part["Прізвище"] || part["Ім’я"] || part["По батькові"]) {
                                        pib = [part["Прізвище"], part["Ім’я"], part["По батькові"]].filter(Boolean).join(' ');
                                    } else if (part["прізвище"] || part["ім'я"] || part["по батькові"]) {
                                        pib = [part["прізвище"], part["ім'я"], part["по батькові"]].filter(Boolean).join(' ');
                                    }

                                    // універсальна область
                                    const region = part["Область"] || part["область"] || "";

                                    // універсальна сума
                                    const total = part["Загальна сума"] || part["загальна сума"] || "";

                                    return `
                                        <div class="participant-bar ${placeClass}">
                                            <div class="participant-name">${pib}</div>
                                            <div class="participant-region">${region}</div>
                                            <div class="participant-place">${place ? 'Місце: ' + place : ''}</div>
                                            <div class="participant-total">${total ? 'Бали: ' + total : ''}</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('');
                return;
            }
            // --- КІНЕЦЬ ДОДАНОГО ---

            // Далі йде ваш існуючий код для стандартної структури
            let sections = [];
            if (data.competition && data.competition.departments) {
                data.competition.departments.forEach(dep => {
                    if (dep.sections) {
                        dep.sections.forEach(section => {
                            if (section.participants && section.participants.length > 0) {
                                sections.push({
                                    name: section.name,
                                    participants: section.participants
                                });
                            }
                        });
                    }
                });
            }

            if (sections.length === 0) {
                resultsInfo.innerHTML = '<div class="no-participants">Немає учасників</div>';
                return;
            }

            resultsInfo.innerHTML = sections.map(section => {
                const sectionName = section.name.charAt(0).toUpperCase() + section.name.slice(1);
                return `
                    <div class="section-block">
                        <div class="section-title">${sectionName}</div>
                        <div class="section-participants">
                            ${section.participants.map(part => {
                                let placeClass = '';
                                if (part.place === 'І') placeClass = 'gold';
                                else if (part.place === 'ІІ') placeClass = 'silver';
                                else if (part.place === 'ІІІ') placeClass = 'bronze';

                                return `
                                    <div class="participant-bar ${placeClass}">
                                        <div class="participant-name">${part.full_name || ''}</div>
                                        <div class="participant-region">${part.region || ''}</div>
                                        <div class="participant-place">${part.place ? 'Місце: ' + part.place : ''}</div>
                                        <div class="participant-total">${part.total ? 'Бали: ' + part.total : ''}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        } catch (e) {
            resultsInfo.innerHTML = '<div class="no-participants">Не вдалося завантажити дані</div>';
        }
    });
});