// JavaScript principal para o Sistema de Gestão de Correspondentes Jurídicos

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips do Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // Inicializar popovers do Bootstrap
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    });

    // Adicionar classe active ao item de menu atual
    const currentLocation = window.location.pathname;
    const menuItems = document.querySelectorAll('.sidebar .nav-link');
    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentLocation) {
            item.classList.add('active');
        }
    });

    // Função para mostrar/esconder senha em campos de formulário
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordField = document.querySelector(this.getAttribute('data-target'));
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            // Alternar ícone
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });

    // Validação de formulários
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Máscaras para campos de formulário
    const phoneMasks = document.querySelectorAll('.phone-mask');
    phoneMasks.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length > 2 && value.length <= 6) {
                value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
            } else if (value.length > 6) {
                value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
            }
            
            e.target.value = value;
        });
    });

    const cpfMasks = document.querySelectorAll('.cpf-mask');
    cpfMasks.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length > 3 && value.length <= 6) {
                value = `${value.substring(0, 3)}.${value.substring(3)}`;
            } else if (value.length > 6 && value.length <= 9) {
                value = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6)}`;
            } else if (value.length > 9) {
                value = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6, 9)}-${value.substring(9)}`;
            }
            
            e.target.value = value;
        });
    });

    const cnpjMasks = document.querySelectorAll('.cnpj-mask');
    cnpjMasks.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 14) value = value.substring(0, 14);
            
            if (value.length > 2 && value.length <= 5) {
                value = `${value.substring(0, 2)}.${value.substring(2)}`;
            } else if (value.length > 5 && value.length <= 8) {
                value = `${value.substring(0, 2)}.${value.substring(2, 5)}.${value.substring(5)}`;
            } else if (value.length > 8 && value.length <= 12) {
                value = `${value.substring(0, 2)}.${value.substring(2, 5)}.${value.substring(5, 8)}/${value.substring(8)}`;
            } else if (value.length > 12) {
                value = `${value.substring(0, 2)}.${value.substring(2, 5)}.${value.substring(5, 8)}/${value.substring(8, 12)}-${value.substring(12)}`;
            }
            
            e.target.value = value;
        });
    });

    // Filtros para tabelas
    const tableFilter = document.getElementById('table-filter');
    if (tableFilter) {
        tableFilter.addEventListener('input', function() {
            const searchText = this.value.toLowerCase();
            const table = document.querySelector(this.getAttribute('data-target'));
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchText) ? '' : 'none';
            });
        });
    }

    // Confirmações para ações destrutivas
    const confirmActions = document.querySelectorAll('[data-confirm]');
    confirmActions.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm(this.getAttribute('data-confirm'))) {
                e.preventDefault();
            }
        });
    });

    // Notificações temporárias
    const flashMessages = document.querySelectorAll('.alert-dismissible');
    flashMessages.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Calendário para visualização de agenda
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const events = JSON.parse(calendarEl.getAttribute('data-events'));
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: events,
            eventClick: function(info) {
                window.location.href = `/service-requests/${info.event.id}`;
            }
        });
        calendar.render();
    }

    // Gráficos para dashboard
    const chartElements = document.querySelectorAll('[data-chart]');
    chartElements.forEach(element => {
        const type = element.getAttribute('data-chart');
        const data = JSON.parse(element.getAttribute('data-values'));
        const labels = JSON.parse(element.getAttribute('data-labels'));
        
        const ctx = element.getContext('2d');
        new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: element.getAttribute('data-title'),
                    data: data,
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.5)',
                        'rgba(46, 204, 113, 0.5)',
                        'rgba(155, 89, 182, 0.5)',
                        'rgba(52, 73, 94, 0.5)',
                        'rgba(241, 196, 15, 0.5)',
                        'rgba(230, 126, 34, 0.5)',
                        'rgba(231, 76, 60, 0.5)'
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(155, 89, 182, 1)',
                        'rgba(52, 73, 94, 1)',
                        'rgba(241, 196, 15, 1)',
                        'rgba(230, 126, 34, 1)',
                        'rgba(231, 76, 60, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    });
});
