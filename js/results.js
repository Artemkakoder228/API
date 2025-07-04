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
            lastData = data;

            // --- ДОДАНО: Перевірка на альтернативну структуру (Chemistry and Biology.json) ---
            if (data["секції"] && Array.isArray(data["секції"])) {
                lastSections = data["секції"];
                const allParts = getAllParticipants(lastSections, true);
                lastRegions = allParts.map(p => p.region).filter(Boolean);
                updateRegionFilterOptions(allParts);
                resultsInfo.innerHTML = renderSections(lastSections, true);
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
            lastSections = sections;
            const allParts = getAllParticipants(lastSections, false);
            lastRegions = allParts.map(p => p.region).filter(Boolean);
            updateRegionFilterOptions(allParts);

            if (sections.length === 0) {
                resultsInfo.innerHTML = '<div class="no-participants">Немає учасників</div>';
                return;
            }

            resultsInfo.innerHTML = renderSections(lastSections, false);
        } catch (e) {
            resultsInfo.innerHTML = '<div class="no-participants">Не вдалося завантажити дані</div>';
        }
    });
});

let lastData = null; // Зберігаємо останні завантажені дані
let lastSections = []; // Зберігаємо останні секції (універсально)
let lastRegions = []; // Для динамічного списку областей

function getAllParticipants(sections, altStructure = false) {
    let participants = [];
    if (altStructure) {
        sections.forEach(section => {
            if (section["учасники"]) {
                section["учасники"].forEach(part => {
                    // універсальна область
                    const region = part["Область"] || part["область"] || "";
                    // універсальна місце
                    const place = part["Місце"] || part["місце"];
                    // універсальна збірка ПІБ
                    let pib = "";
                    if (part["Прізвище, ім’я, по батькові"]) {
                        pib = part["Прізвище, ім’я, по батькові"];
                    } else if (part["Прізвище"] || part["Ім’я"] || part["По батькові"]) {
                        pib = [part["Прізвище"], part["Ім’я"], part["По батькові"]].filter(Boolean).join(' ');
                    } else if (part["прізвище"] || part["ім'я"] || part["по батькові"]) {
                        pib = [part["прізвище"], part["ім'я"], part["по батькові"]].filter(Boolean).join(' ');
                    }
                    const total = part["Загальна сума"] || part["загальна сума"] || "";
                    participants.push({
                        pib, region, place, total, section: section["назва"] || ""
                    });
                });
            }
        });
    } else {
        sections.forEach(section => {
            section.participants.forEach(part => {
                participants.push({
                    pib: part.full_name || "",
                    region: part.region || "",
                    place: part.place || "",
                    total: part.total || "",
                    section: section.name || ""
                });
            });
        });
    }
    return participants;
}

function renderSections(sections, altStructure = false, placeFilter = "", regionFilter = "") {
    return sections.map(section => {
        const sectionName = altStructure
            ? (section["назва"] ? section["назва"].charAt(0).toUpperCase() + section["назва"].slice(1) : '')
            : (section.name.charAt(0).toUpperCase() + section.name.slice(1));
        const participants = altStructure
            ? section["учасники"]
            : section.participants;
        const filtered = participants.filter(part => {
            // універсальні ключі
            let place = altStructure ? (part["Місце"] || part["місце"]) : part.place;
            let region = altStructure ? (part["Область"] || part["область"] || "") : (part.region || "");
            let placeOk = !placeFilter || place === placeFilter;
            let regionOk = !regionFilter || region === regionFilter;
            return placeOk && regionOk;
        });
        if (filtered.length === 0) return '';
        return `
            <div class="section-block">
                <div class="section-title">${sectionName}</div>
                <div class="section-participants">
                    ${filtered.map(part => {
                        let placeClass = '';
                        let place = altStructure ? (part["Місце"] || part["місце"]) : part.place;
                        if (place === 'І') placeClass = 'gold';
                        else if (place === 'ІІ') placeClass = 'silver';
                        else if (place === 'ІІІ') placeClass = 'bronze';
                        let pib = "";
                        if (altStructure) {
                            if (part["Прізвище, ім’я, по батькові"]) {
                                pib = part["Прізвище, ім’я, по батькові"];
                            } else if (part["Прізвище"] || part["Ім’я"] || part["По батькові"]) {
                                pib = [part["Прізвище"], part["Ім’я"], part["По батькові"]].filter(Boolean).join(' ');
                            } else if (part["прізвище"] || part["ім'я"] || part["по батькові"]) {
                                pib = [part["прізвище"], part["ім'я"], part["по батькові"]].filter(Boolean).join(' ');
                            }
                        } else {
                            pib = part.full_name || '';
                        }
                        let region = altStructure ? (part["Область"] || part["область"] || "") : (part.region || "");
                        let total = altStructure ? (part["Загальна сума"] || part["загальна сума"] || "") : (part.total || "");
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
}

function updateRegionFilterOptions(participants) {
    const regionFilter = document.getElementById('region-filter');
    const regions = Array.from(new Set(participants.map(p => p.region).filter(Boolean)));
    regionFilter.innerHTML = '<option value="">Всі області</option>' +
        regions.map(r => `<option value="${r}">${r}</option>`).join('');
}

function applyFilters() {
    const placeFilter = document.getElementById('place-filter').value;
    const regionFilter = document.getElementById('region-filter').value;
    const resultsInfo = document.getElementById('results-info');
    if (!lastSections.length) return;
    
    const altStructure = !!(lastData && lastData["секції"] && Array.isArray(lastData["секції"]));
    resultsInfo.innerHTML = renderSections(lastSections, altStructure, placeFilter, regionFilter);
}

function renderFilters() {
  
    document.getElementById('filters-left').innerHTML = `
        <label for="place-filter" class="filter-label">Місце:</label>
        <select id="place-filter">
            <option value="">Всі місця</option>
            <option value="І">І місце</option>
            <option value="ІІ">ІІ місце</option>
            <option value="ІІІ">ІІІ місце</option>
        </select>
    `;
   
    document.getElementById('filters-right').innerHTML = `
        <label for="region-filter" class="filter-label">Область:</label>
        <select id="region-filter">
            <option value="">Всі області</option>
            <!-- області додаються динамічно -->
        </select>
    `;
   
    document.getElementById('place-filter').addEventListener('change', applyFilters);
    document.getElementById('region-filter').addEventListener('change', applyFilters);
}

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
            lastData = data;

   
            if (data["секції"] && Array.isArray(data["секції"])) {
                lastSections = data["секції"];
                const allParts = getAllParticipants(lastSections, true);
                lastRegions = allParts.map(p => p.region).filter(Boolean);
                updateRegionFilterOptions(allParts);
                resultsInfo.innerHTML = renderSections(lastSections, true);
                return;
            }
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
            lastSections = sections;
            const allParts = getAllParticipants(lastSections, false);
            lastRegions = allParts.map(p => p.region).filter(Boolean);
            updateRegionFilterOptions(allParts);

            if (sections.length === 0) {
                resultsInfo.innerHTML = '<div class="no-participants">Немає учасників</div>';
                return;
            }

            resultsInfo.innerHTML = renderSections(lastSections, false);
        } catch (e) {
            resultsInfo.innerHTML = '<div class="no-participants">Не вдалося завантажити дані</div>';
        }
    });
    document.getElementById('subject-label-row').style.display = "flex";
    renderFilters();
});

document.getElementById('place-filter').addEventListener('change', applyFilters);
document.getElementById('region-filter').addEventListener('change', applyFilters);

document.body.addEventListener('click', function(e) {
    const bar = e.target.closest('.participant-bar');
    if (bar && bar.parentElement && bar.parentElement.classList.contains('section-participants')) {
        const pib = bar.querySelector('.participant-name')?.textContent.trim() || '';
        const region = bar.querySelector('.participant-region')?.textContent.trim() || '';
        let found = null, sectionName = '';
        const altStructure = !!(lastData && lastData["секції"] && Array.isArray(lastData["секції"]));
        for (const section of lastSections) {
            const participants = altStructure ? section["учасники"] : section.participants;
            for (const part of participants) {
                let partPib = '';
                if (altStructure) {
                    if (part["Прізвище, ім’я, по батькові"]) partPib = part["Прізвище, ім’я, по батькові"];
                    else if (part["Прізвище"] || part["Ім’я"] || part["По батькові"])
                        partPib = [part["Прізвище"], part["Ім’я"], part["По батькові"]].filter(Boolean).join(' ');
                    else if (part["прізвище"] || part["ім'я"] || part["по батькові"])
                        partPib = [part["прізвище"], part["ім'я"], part["по батькові"]].filter(Boolean).join(' ');
                } else {
                    partPib = part.full_name || '';
                }
                let partRegion = altStructure ? (part["Область"] || part["область"] || "") : (part.region || "");
                if (partPib.trim() === pib && partRegion.trim() === region) {
                    found = part;
                    sectionName = altStructure ? (section["назва"] || section["name"] || '') : (section.name || '');
                    break;
                }
            }
            if (found) break;
        }
        if (!found) return;

        let infoHtml = `<div style="font-size:1.2em;font-weight:600;margin-bottom:8px;">${pib}</div>`;
        infoHtml += `<div><b>Область:</b> ${region}</div>`;
        if (sectionName) infoHtml += `<div><b>Секція:</b> ${sectionName}</div>`;
        infoHtml += `<hr style="margin:10px 0;">`;
        infoHtml += `<div style="margin-bottom:10px;"><b>Всі дані з JSON:</b></div>`;
        infoHtml += `<div style="font-size:1em;">`;
        Object.entries(found).forEach(([key, value]) => {
            infoHtml += `<div><b>${key}:</b> ${value !== null && value !== undefined && value !== "" ? value : "<i>немає</i>"}</div>`;
        });
        infoHtml += `</div>`;

        function getSectionNumber(sectionName) {
            const match = sectionName.match(/^(\d+)[\.\- ]/);
            if (match) return parseInt(match[1], 10);
            return 1;
        }
        function getSectionPosters(sectionNumber, maxPosters = 40) {
            const posters = [];
            for (let i = 1; i <= maxPosters; i++) {
                posters.push(`images/PLAKAT/${sectionNumber}.${i}.jpg`);
            }
            return posters;
        }
        const sectionNumber = getSectionNumber(sectionName);
        const imgNames = getSectionPosters(sectionNumber, 40);
        let postersHtml = imgNames.map(src =>
            `<img src="${src}" alt="Плакат" onerror="this.style.display='none'">`
        ).join('');
        if (!postersHtml) postersHtml = '<div style="color:#888;">Постери відсутні</div>';

        document.getElementById('modal-info').innerHTML = `
          <div class="modal-flex">
            <div class="modal-info-block">
              ${infoHtml}
            </div>
            <div class="modal-posters-block">
              <div style="margin-bottom:8px;"><b>Постери секції:</b></div>
              <div id="modal-posters">${postersHtml}</div>
            </div>
          </div>
        `;

        document.getElementById('participant-modal').style.display = 'flex';
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.style.display = 'flex';
    }
    if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal') || e.target.classList.contains('modal-overlay')) {
        document.getElementById('participant-modal').style.display = 'none';
        document.getElementById('modal-info').innerHTML = '';
        document.getElementById('modal-posters').innerHTML = '';
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.style.display = 'none';
    }
});