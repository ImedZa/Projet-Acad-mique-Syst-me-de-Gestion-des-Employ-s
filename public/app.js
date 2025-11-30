const API_URL = 'http://localhost:3000/api';

let currentEmployees = [];
let editingEmployeeId = null;


const CREDENTIALS = {
    username: 'admin',
    password: '*admin159!!'
};


document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const curtain = document.getElementById('curtain');
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const loginForm = document.getElementById('loginForm');


    welcomeScreen.addEventListener('click', () => {
        welcomeScreen.classList.add('fade-out');
        
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            curtain.classList.add('open');
            
            setTimeout(() => {
                loginScreen.classList.remove('hidden');
            }, 500);
        }, 500);
    });

    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
            
            loginScreen.classList.add('fade-out');
            
            setTimeout(() => {
                loginScreen.style.display = 'none';
                mainApp.classList.remove('hidden');
                
                
                loadStats();
                getAllEmployees();
                
                
                setTimeout(() => {
                    applyScrollAnimations();
                }, 500);
            }, 300);
        } else {
            
            errorDiv.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
            errorDiv.classList.remove('hidden');
            
            
            loginForm.style.animation = 'shake 0.5s';
            setTimeout(() => {
                loginForm.style.animation = '';
            }, 500);
        }
    });
});


function logout() {
    document.getElementById('logoutModal').style.display = 'block';
}

function closeLogoutModal() {
    document.getElementById('logoutModal').style.display = 'none';
}

function confirmLogout() {
    const mainApp = document.getElementById('mainApp');
    const loginScreen = document.getElementById('loginScreen');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const curtain = document.getElementById('curtain');
    
    closeLogoutModal();
    
    mainApp.classList.add('hidden');
    
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').classList.add('hidden');
    
    loginScreen.classList.remove('hidden', 'fade-out');
    loginScreen.style.display = 'flex';
    
    welcomeScreen.classList.remove('fade-out');
    welcomeScreen.style.display = 'none';
    curtain.classList.remove('open');
}


function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    
    document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale').forEach(el => {
        observer.observe(el);
    });
}


function applyScrollAnimations() {
    
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.classList.add('scroll-animate-scale');
    });

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach((btn, index) => {
        if (index % 2 === 0) {
            btn.classList.add('scroll-animate-left');
        } else {
            btn.classList.add('scroll-animate-right');
        }
    });

    const employeeCards = document.querySelectorAll('.employee-card');
    employeeCards.forEach(card => {
        card.classList.add('scroll-animate');
    });

    const mapreduceResults = document.querySelectorAll('.mapreduce-result');
    mapreduceResults.forEach(result => {
        result.classList.add('scroll-animate');
    });

    
    initScrollAnimations();
}

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur API:', error);
        showAlert('Erreur de connexion au serveur', 'error');
        return { success: false, error: error.message };
    }
}

function showLoading() {
    document.getElementById('resultsContainer').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
    scrollToResults();
}

function scrollToResults() {
    const resultsSection = document.getElementById('resultsContainer');
    if (resultsSection) {
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
        });
    }
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.content-area');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => alertDiv.remove(), 4000);
}

function updateResultsCount(count) {
    document.getElementById('resultsCount').textContent = `${count} résultat(s)`;
}

function setResultsTitle(title) {
    document.getElementById('resultsTitle').textContent = title;
}


async function loadStats() {
    const data = await apiCall('/stats');
    if (data.success) {
        document.getElementById('totalEmployees').textContent = data.stats.totalEmployees;
        document.getElementById('withPrime').textContent = data.stats.employeesWithPrime;
        document.getElementById('avgPrime').textContent = Math.round(data.stats.averagePrime) + '€';
        document.getElementById('avgAnciennete').textContent = data.stats.averageAnciennete.toFixed(1) + ' ans';
    }
}


function displayEmployees(employees, title = 'Tous les Employés') {
    currentEmployees = employees;
    setResultsTitle(title);
    updateResultsCount(employees.length);
    
    if (employees.length === 0) {
        document.getElementById('resultsContainer').innerHTML = `
            <div class="empty-state">
                <p>Aucun employé trouvé</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <div class="employee-grid">
            ${employees.map(emp => createEmployeeCard(emp)).join('')}
        </div>
    `;
    
    document.getElementById('resultsContainer').innerHTML = html;
    
    
    setTimeout(() => {
        const employeeCards = document.querySelectorAll('.employee-card');
        employeeCards.forEach(card => {
            if (!card.classList.contains('scroll-animate')) {
                card.classList.add('scroll-animate');
            }
        });
        initScrollAnimations();
    }, 100);
}

function createEmployeeCard(emp) {
    const primeHtml = emp.prime !== undefined ? 
        `<span class="badge badge-prime">Prime: ${emp.prime}€</span>` : '';
    const ancienneteHtml = emp.anciennete !== undefined ? 
        `<span class="badge badge-anciennete">Ancienneté: ${emp.anciennete} ans</span>` : '';
    
    const adresseHtml = emp.adresse ? `
        <div class="info-row">
            <span class="info-label">📍 Adresse:</span>
            <span class="info-value">
                ${emp.adresse.rue || ''} ${emp.adresse.ville || ''} ${emp.adresse.codePostal || ''}
            </span>
        </div>
    ` : '';
    
    return `
        <div class="employee-card">
            <div class="employee-header">
                <div class="employee-name">${emp.nom} ${emp.prenom}</div>
                <div class="employee-actions">
                    <button class="icon-btn edit-btn" onclick='editEmployee(${JSON.stringify(emp)})' title="Modifier">✏️</button>
                    <button class="icon-btn delete-btn" onclick="deleteEmployee('${emp._id}')" title="Supprimer">🗑️</button>
                </div>
            </div>
            <div class="employee-info">
                ${adresseHtml}
            </div>
            <div>
                ${primeHtml}
                ${ancienneteHtml}
            </div>
        </div>
    `;
}

function displayTable(data, columns, title) {
    setResultsTitle(title);
    updateResultsCount(data.length);
    
    if (data.length === 0) {
        document.getElementById('resultsContainer').innerHTML = `
            <div class="empty-state"><p>Aucun résultat</p></div>
        `;
        return;
    }
    
    const headers = columns.map(col => `<th>${col.label}</th>`).join('');
    const rows = data.map(row => {
        const cells = columns.map(col => {
            const value = col.getValue ? col.getValue(row) : row[col.key];
            return `<td>${value !== undefined ? value : '-'}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');
    
    document.getElementById('resultsContainer').innerHTML = `
        <div class="table-container">
            <table>
                <thead><tr>${headers}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

async function getAllEmployees() {
    showLoading();
    const data = await apiCall('/employees');
    if (data.success) {
        displayEmployees(data.data, 'Tous les Employés');
    }
}

async function getCollections() {
    showLoading();
    const data = await apiCall('/collections');
    if (data.success) {
        displayTable(data.data, [
            { label: 'Nom', key: 'name' },
            { label: 'Type', key: 'type' }
        ], 'Collections de la Base');
    }
}

async function getCount() {
    const data = await apiCall('/employees/count');
    if (data.success) {
        showAlert(`Total: ${data.count} employés dans la collection`, 'success');
    }
}

async function getPrenomStartsD() {
    showLoading();
    const data = await apiCall('/employees/prenom-starts-d');
    if (data.success) {
        displayEmployees(data.data, 'Prénoms commençant par D');
    }
}

async function getPrenomDStartOrEnd() {
    showLoading();
    const data = await apiCall('/employees/prenom-d-start-or-end');
    if (data.success) {
        displayEmployees(data.data, 'Prénoms commençant ou finissant par D');
    }
}

async function getPrenomD6Chars() {
    showLoading();
    const data = await apiCall('/employees/prenom-d-6chars');
    if (data.success) {
        displayEmployees(data.data, 'Prénoms: D + 6 caractères');
    }
}

async function getAncienneteGt10() {
    showLoading();
    const data = await apiCall('/employees/anciennete-gt-10');
    if (data.success) {
        displayEmployees(data.data, 'Ancienneté > 10 ans');
    }
}

async function getWithRue() {
    showLoading();
    const data = await apiCall('/employees/with-rue');
    if (data.success) {
        displayEmployees(data.data, 'Employés avec rue dans adresse');
    }
}

async function getTop10Anciens() {
    showLoading();
    const data = await apiCall('/employees/top-10-anciens');
    if (data.success) {
        displayEmployees(data.data, '10 Employés les plus anciens');
    }
}

async function getVilleToulouse() {
    showLoading();
    const data = await apiCall('/employees/ville-toulouse');
    if (data.success) {
        displayEmployees(data.data, 'Employés de Toulouse');
    }
}

async function getPrenomMVilleBdxParis() {
    showLoading();
    const data = await apiCall('/employees/prenom-m-ville-bordeaux-paris');
    if (data.success) {
        displayEmployees(data.data, 'Prénom M + Bordeaux/Paris');
    }
}


function incrementPrime() {
    document.getElementById('incrementPrimeModal').style.display = 'block';
    document.getElementById('primeAmount').value = '';
    document.getElementById('primeAmount').focus();
}

function closeIncrementPrimeModal() {
    document.getElementById('incrementPrimeModal').style.display = 'none';
}

async function submitIncrementPrime(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('primeAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
        showAlert('Veuillez entrer un montant valide', 'error');
        return;
    }
    
    closeIncrementPrimeModal();
    showLoading();
    
    const data = await apiCall('/employees/increment-prime', { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    });
    
    if (data.success) {
        showAlert(`✓ ${data.modifiedCount} primes ont été incrémentées de ${amount}€`, 'success');
        loadStats();
        getAllEmployees();
    }
}

async function getEmployeesByCity() {
    showLoading();
    const data = await apiCall('/mapreduce/employees-by-city');
    if (data.success) {
        const html = data.data.map(item => `
            <div class="mapreduce-result">
                <h4>🏙️ ${item._id || 'Ville non renseignée'}</h4>
                <div class="mapreduce-stats">
                    <div class="mapreduce-stat">
                        <span class="mapreduce-stat-label">Nombre d'employés</span>
                        <span class="mapreduce-stat-value">${item.count}</span>
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 0.9rem;">
                    ${item.employees.slice(0, 5).map(e => `${e.nom} ${e.prenom}`).join(', ')}
                    ${item.employees.length > 5 ? '...' : ''}
                </div>
            </div>
        `).join('');
        
        setResultsTitle('MapReduce: Employés par Ville');
        updateResultsCount(data.data.length);
        document.getElementById('resultsContainer').innerHTML = html;
        
        
        setTimeout(() => {
            const results = document.querySelectorAll('.mapreduce-result');
            results.forEach(r => r.classList.add('scroll-animate'));
            initScrollAnimations();
        }, 100);
    }
}

async function getAvgPrimeByCity() {
    showLoading();
    const data = await apiCall('/mapreduce/average-prime-by-city');
    if (data.success) {
        const html = data.data.map(item => `
            <div class="mapreduce-result">
                <h4>🏙️ ${item._id || 'Ville non renseignée'}</h4>
                <div class="mapreduce-stats">
                    <div class="mapreduce-stat">
                        <span class="mapreduce-stat-label">Prime moyenne</span>
                        <span class="mapreduce-stat-value">${Math.round(item.averagePrime)}€</span>
                    </div>
                    <div class="mapreduce-stat">
                        <span class="mapreduce-stat-label">Prime totale</span>
                        <span class="mapreduce-stat-value">${item.totalPrime}€</span>
                    </div>
                    <div class="mapreduce-stat">
                        <span class="mapreduce-stat-label">Employés</span>
                        <span class="mapreduce-stat-value">${item.count}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        setResultsTitle('MapReduce: Prime Moyenne par Ville');
        updateResultsCount(data.data.length);
        document.getElementById('resultsContainer').innerHTML = html;
        
        
        setTimeout(() => {
            const results = document.querySelectorAll('.mapreduce-result');
            results.forEach(r => r.classList.add('scroll-animate'));
            initScrollAnimations();
        }, 100);
    }
}

async function getAvgAncienneteByCity() {
    showLoading();
    const data = await apiCall('/mapreduce/average-anciennete-by-city');
    if (data.success) {
        const html = data.data.map(item => `
            <div class="mapreduce-result">
                <h4>🏙️ ${item._id || 'Ville non renseignée'}</h4>
                <div class="mapreduce-stats">
                    <div class="mapreduce-stat">
                        <span class="mapreduce-stat-label">Ancienneté moyenne</span>
                        <span class="mapreduce-stat-value">${item.averageAnciennete.toFixed(1)} ans</span>
                    </div>
                    <div class="mapreduce-stat">
                        <span class="mapreduce-stat-label">Maximum</span>
                        <span class="mapreduce-stat-value">${item.maxAnciennete} ans</span>
                    </div>
                    <div class="mapreduce-stat">
                        <span class="mapreduce-stat-label">Minimum</span>
                        <span class="mapreduce-stat-value">${item.minAnciennete} ans</span>
                    </div>
                    <div class="mapreduce-stat">
                        <span class="mapreduce-stat-label">Employés</span>
                        <span class="mapreduce-stat-value">${item.count}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        setResultsTitle('MapReduce: Ancienneté Moyenne par Ville');
        updateResultsCount(data.data.length);
        document.getElementById('resultsContainer').innerHTML = html;
        
        
        setTimeout(() => {
            const results = document.querySelectorAll('.mapreduce-result');
            results.forEach(r => r.classList.add('scroll-animate'));
            initScrollAnimations();
        }, 100);
    }
}

async function searchEmployees() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (!searchTerm) {
        getAllEmployees();
        return;
    }
    
    showLoading();
    const filter = {
        $or: [
            { nom: { $regex: searchTerm, $options: 'i' } },
            { prenom: { $regex: searchTerm, $options: 'i' } }
        ]
    };
    
    const data = await apiCall('/employees/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter })
    });
    
    if (data.success) {
        displayEmployees(data.data, `Recherche: "${searchTerm}"`);
    }
}

async function applySorting() {
    const field = document.getElementById('sortField').value;
    const order = parseInt(document.getElementById('sortOrder').value);
    
    showLoading();
    const sort = { [field]: order };
    
    const data = await apiCall('/employees/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: {}, sort })
    });
    
    if (data.success) {
        displayEmployees(data.data, `Tri par ${field}`);
    }
}


function showAddEmployeeForm() {
    editingEmployeeId = null;
    document.getElementById('modalTitle').textContent = 'Ajouter un Employé';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    document.getElementById('employeeModal').style.display = 'block';
}

function editEmployee(employee) {
    editingEmployeeId = employee._id;
    document.getElementById('modalTitle').textContent = 'Modifier un Employé';
    document.getElementById('employeeId').value = employee._id;
    document.getElementById('nom').value = employee.nom || '';
    document.getElementById('prenom').value = employee.prenom || '';
    document.getElementById('prime').value = employee.prime || '';
    document.getElementById('anciennete').value = employee.anciennete || '';
    document.getElementById('rue').value = employee.adresse?.rue || '';
    document.getElementById('ville').value = employee.adresse?.ville || '';
    document.getElementById('codePostal').value = employee.adresse?.codePostal || '';
    document.getElementById('pays').value = employee.adresse?.pays || 'France';
    document.getElementById('employeeModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('employeeModal').style.display = 'none';
}

async function submitEmployee(event) {
    event.preventDefault();
    
    const employeeData = {
        nom: document.getElementById('nom').value,
        prenom: document.getElementById('prenom').value
    };
    
    const prime = document.getElementById('prime').value;
    const anciennete = document.getElementById('anciennete').value;
    
    if (prime) employeeData.prime = parseFloat(prime);
    if (anciennete) employeeData.anciennete = parseInt(anciennete);
    
    const rue = document.getElementById('rue').value;
    const ville = document.getElementById('ville').value;
    const codePostal = document.getElementById('codePostal').value;
    const pays = document.getElementById('pays').value;
    
    if (rue || ville || codePostal || pays) {
        employeeData.adresse = {};
        if (rue) employeeData.adresse.rue = rue;
        if (ville) employeeData.adresse.ville = ville;
        if (codePostal) employeeData.adresse.codePostal = codePostal;
        if (pays) employeeData.adresse.pays = pays;
    }
    
    let data;
    if (editingEmployeeId) {
        data = await apiCall(`/employees/${editingEmployeeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        });
        if (data.success) {
            showAlert('Employé modifié avec succès', 'success');
        }
    } else {
        data = await apiCall('/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        });
        if (data.success) {
            showAlert('Employé ajouté avec succès', 'success');
        }
    }
    
    if (data.success) {
        closeModal();
        loadStats();
        getAllEmployees();
    }
}

async function deleteEmployee(id) {
    if (!confirm('Voulez-vous vraiment supprimer cet employé ?')) return;
    
    const data = await apiCall(`/employees/${id}`, { method: 'DELETE' });
    if (data.success) {
        showAlert('Employé supprimé avec succès', 'success');
        loadStats();
        getAllEmployees();
    }
}


window.onclick = function(event) {
    const modal = document.getElementById('employeeModal');
    if (event.target === modal) {
        closeModal();
    }
}

document.getElementById('searchInput')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchEmployees();
    }
});


function showCustomMapReduce() {
    document.getElementById('customMapReduceModal').style.display = 'block';
}

function closeCustomMapReduce() {
    document.getElementById('customMapReduceModal').style.display = 'none';
}

async function executeCustomMapReduce() {
    const groupBy = document.getElementById('customGroupBy').value;
    const valueField = document.getElementById('customValueField').value;
    const sortBy = document.getElementById('customSortBy').value;
    const sortOrder = parseInt(document.getElementById('customSortOrder').value);
    
    
    const operations = [];
    if (document.getElementById('op_count').checked) operations.push('count');
    if (document.getElementById('op_sum').checked) operations.push('sum');
    if (document.getElementById('op_avg').checked) operations.push('avg');
    if (document.getElementById('op_min').checked) operations.push('min');
    if (document.getElementById('op_max').checked) operations.push('max');
    
    if (operations.length === 0) {
        showAlert('Veuillez sélectionner au moins une opération', 'error');
        return;
    }
    
    
    const needsValueField = ['sum', 'avg', 'min', 'max'];
    const hasValueOperation = operations.some(op => needsValueField.includes(op));
    
    if (hasValueOperation && !valueField) {
        showAlert('Veuillez sélectionner un champ de calcul', 'error');
        return;
    }
    
    const data = await apiCall('/mapreduce/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupBy, operations, valueField, sortBy, sortOrder })
    });
    
    if (data.success) {
        closeCustomMapReduce();
        displayCustomMapReduceResults(data.data, groupBy, operations, valueField);
    }
}

function displayCustomMapReduceResults(results, groupBy, operations, valueField) {
    const groupLabel = {
        'adresse.ville': 'Ville',
        'adresse.pays': 'Pays',
        'nom': 'Nom',
        'prenom': 'Prénom'
    }[groupBy] || groupBy;
    
    const title = `MapReduce Personnalisé - Groupé par ${groupLabel}`;
    setResultsTitle(title);
    updateResultsCount(results.length);
    
    const html = results.map(item => {
        let statsHtml = '';
        
        if (operations.includes('count')) {
            statsHtml += `
                <div class="mapreduce-stat">
                    <span class="mapreduce-stat-label">Nombre</span>
                    <span class="mapreduce-stat-value">${item.count || 0}</span>
                </div>`;
        }
        
        if (operations.includes('sum')) {
            const label = valueField === 'prime' ? 'Somme primes' : 'Somme ancienneté';
            const suffix = valueField === 'prime' ? '€' : ' ans';
            statsHtml += `
                <div class="mapreduce-stat">
                    <span class="mapreduce-stat-label">${label}</span>
                    <span class="mapreduce-stat-value">${Math.round(item.sum || 0)}${suffix}</span>
                </div>`;
        }
        
        if (operations.includes('avg')) {
            const label = valueField === 'prime' ? 'Moyenne primes' : 'Ancienneté moyenne';
            const suffix = valueField === 'prime' ? '€' : ' ans';
            statsHtml += `
                <div class="mapreduce-stat">
                    <span class="mapreduce-stat-label">${label}</span>
                    <span class="mapreduce-stat-value">${Math.round(item.avg || 0)}${suffix}</span>
                </div>`;
        }
        
        if (operations.includes('min')) {
            const label = valueField === 'prime' ? 'Prime min' : 'Ancienneté min';
            const suffix = valueField === 'prime' ? '€' : ' ans';
            statsHtml += `
                <div class="mapreduce-stat">
                    <span class="mapreduce-stat-label">${label}</span>
                    <span class="mapreduce-stat-value">${Math.round(item.min || 0)}${suffix}</span>
                </div>`;
        }
        
        if (operations.includes('max')) {
            const label = valueField === 'prime' ? 'Prime max' : 'Ancienneté max';
            const suffix = valueField === 'prime' ? '€' : ' ans';
            statsHtml += `
                <div class="mapreduce-stat">
                    <span class="mapreduce-stat-label">${label}</span>
                    <span class="mapreduce-stat-value">${Math.round(item.max || 0)}${suffix}</span>
                </div>`;
        }
        
        return `
            <div class="mapreduce-result">
                <h4>🎯 ${item._id || 'Non défini'}</h4>
                <div class="mapreduce-stats">
                    ${statsHtml}
                </div>
            </div>`;
    }).join('');
    
    document.getElementById('resultsContainer').innerHTML = html;
    
    
    setTimeout(() => {
        const results = document.querySelectorAll('.mapreduce-result');
        results.forEach(r => r.classList.add('scroll-animate'));
        initScrollAnimations();
    }, 100);
}


window.addEventListener('click', (event) => {
    const customMapReduceModal = document.getElementById('customMapReduceModal');
    const incrementPrimeModal = document.getElementById('incrementPrimeModal');
    const logoutModal = document.getElementById('logoutModal');
    
    if (event.target === customMapReduceModal) {
        closeCustomMapReduce();
    }
    if (event.target === incrementPrimeModal) {
        closeIncrementPrimeModal();
    }
    if (event.target === logoutModal) {
        closeLogoutModal();
    }
});
