// Utility Functions

// Format currency values
function formatCurrency(value) {
    if (typeof value !== 'number') {
        value = parseFloat(value) || 0;
    }
    
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Parse currency string to number
function parseCurrency(currencyString) {
    if (typeof currencyString === 'number') {
        return currencyString;
    }
    
    return parseFloat(currencyString.replace(/[R$\s.,]/g, '').replace(/(\d{2})$/, '.$1')) || 0;
}

// Format date for display (DD/MM/YYYY)
function formatDate(dateString) {
    if (!dateString) return '--';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        return dateString;
    }
}

// Format date for input (YYYY-MM-DD)
function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    } catch (error) {
        return '';
    }
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// Generate months array in Portuguese
function getMonthsArray() {
    return [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
}

// Get years array from 2020 to current year + 1
function getYearsArray() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear + 1; year >= 2020; year--) {
        years.push(year.toString());
    }
    return years;
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate required fields in a form
function validateRequiredFields(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalidField = null;

    requiredFields.forEach(field => {
        const value = field.value.trim();
        const formGroup = field.closest('.form-group');
        
        if (!value) {
            if (formGroup) {
                formGroup.classList.add('error');
                
                // Add error message if not exists
                let errorMsg = formGroup.querySelector('.form-error');
                if (!errorMsg) {
                    errorMsg = document.createElement('span');
                    errorMsg.className = 'form-error';
                    formGroup.appendChild(errorMsg);
                }
                errorMsg.textContent = 'Este campo é obrigatório';
            }
            
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        } else {
            if (formGroup) {
                formGroup.classList.remove('error');
                const errorMsg = formGroup.querySelector('.form-error');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        }
    });

    if (firstInvalidField) {
        firstInvalidField.focus();
    }

    return isValid;
}

// Clear form validation states
function clearFormValidation(form) {
    const formGroups = form.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        const errorMsg = group.querySelector('.form-error');
        if (errorMsg) {
            errorMsg.remove();
        }
    });
}

// Show/hide loading state on button
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        button.disabled = true;
    } else {
        button.textContent = button.dataset.originalText || button.textContent;
        button.disabled = false;
    }
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Download data as CSV file
function downloadCSV(data, filename) {
    const csvContent = data.map(row => 
        Object.values(row).map(value => 
            `"${String(value).replace(/"/g, '""')}"`
        ).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Get relative time (e.g., "2 minutes ago")
function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? 's' : ''} atrás`;
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    
    return formatDate(dateString);
}

// Set up table sorting
function setupTableSorting(table) {
    const headers = table.querySelectorAll('th[data-sortable]');
    
    headers.forEach(header => {
        header.style.cursor = 'pointer';
        header.style.userSelect = 'none';
        
        header.addEventListener('click', () => {
            const column = header.dataset.sortable;
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            // Determine sort direction
            const currentDir = header.dataset.sortDir || 'asc';
            const newDir = currentDir === 'asc' ? 'desc' : 'asc';
            
            // Clear all sort indicators
            headers.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
                h.dataset.sortDir = '';
            });
            
            // Set current sort indicator
            header.classList.add(`sort-${newDir}`);
            header.dataset.sortDir = newDir;
            
            // Sort rows
            rows.sort((a, b) => {
                const aVal = a.children[parseInt(column)].textContent.trim();
                const bVal = b.children[parseInt(column)].textContent.trim();
                
                const aNum = parseFloat(aVal.replace(/[^\d.-]/g, ''));
                const bNum = parseFloat(bVal.replace(/[^\d.-]/g, ''));
                
                let result = 0;
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    result = aNum - bNum;
                } else {
                    result = aVal.localeCompare(bVal);
                }
                
                return newDir === 'desc' ? -result : result;
            });
            
            // Reorder DOM elements
            rows.forEach(row => tbody.appendChild(row));
        });
    });
}

// Setup responsive table
function setupResponsiveTable(table) {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
}