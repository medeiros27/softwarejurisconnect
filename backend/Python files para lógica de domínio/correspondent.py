from flask import Blueprint, render_template, redirect, url_for, request, session, flash, jsonify
from src.models.user import User
from src.models.correspondent import Correspondent
from src.models.service_request import ServiceRequest
from src import db

correspondent_bp = Blueprint('correspondent', __name__)

@correspondent_bp.route('/dashboard')
def dashboard():
    if 'user_id' not in session or session.get('user_role') != 'correspondent':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    correspondent = Correspondent.query.filter_by(user_id=user_id).first()
    
    if not correspondent:
        flash('Perfil de correspondente não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    # Obter métricas para o dashboard
    pending_assignments = ServiceRequest.query.filter_by(
        correspondent_id=correspondent.id, 
        status='assigned'
    ).count()
    
    scheduled_services = ServiceRequest.query.filter_by(
        correspondent_id=correspondent.id, 
        status='accepted'
    ).count()
    
    # Obter próximos serviços
    upcoming_services = ServiceRequest.query.filter_by(
        correspondent_id=correspondent.id
    ).filter(
        ServiceRequest.status.in_(['assigned', 'accepted'])
    ).order_by(
        ServiceRequest.date_time
    ).limit(5).all()
    
    return render_template('correspondent/dashboard.html', 
                          correspondent=correspondent,
                          pending_assignments=pending_assignments,
                          scheduled_services=scheduled_services,
                          upcoming_services=upcoming_services)

@correspondent_bp.route('/profile')
def profile():
    if 'user_id' not in session or session.get('user_role') != 'correspondent':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    correspondent = Correspondent.query.filter_by(user_id=user_id).first()
    user = User.query.get(user_id)
    
    if not correspondent:
        flash('Perfil de correspondente não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    return render_template('correspondent/profile.html', correspondent=correspondent, user=user)

@correspondent_bp.route('/profile/edit', methods=['GET', 'POST'])
def edit_profile():
    if 'user_id' not in session or session.get('user_role') != 'correspondent':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    correspondent = Correspondent.query.filter_by(user_id=user_id).first()
    user = User.query.get(user_id)
    
    if not correspondent:
        flash('Perfil de correspondente não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    if request.method == 'POST':
        # Atualizar dados do usuário
        user.name = request.form.get('name')
        user.phone = request.form.get('phone')
        
        # Atualizar dados do correspondente
        specialties = request.form.getlist('specialties')
        correspondent.specialties = specialties
        
        # Atualizar taxas
        rates = {
            'audiencia_conciliacao': float(request.form.get('rate_audiencia_conciliacao', 0)),
            'audiencia_instrucao': float(request.form.get('rate_audiencia_instrucao', 0)),
            'copia_processos': float(request.form.get('rate_copia_processos', 0)),
            'protocolo': float(request.form.get('rate_protocolo', 0))
        }
        correspondent.rates = rates
        
        # Atualizar dados bancários
        bank_info = {
            'bank': request.form.get('bank'),
            'agency': request.form.get('agency'),
            'account': request.form.get('account'),
            'account_type': request.form.get('account_type'),
            'document': request.form.get('bank_document')
        }
        correspondent.bank_info = bank_info
        
        db.session.commit()
        
        flash('Perfil atualizado com sucesso!', 'success')
        return redirect(url_for('correspondent.profile'))
    
    return render_template('correspondent/edit_profile.html', correspondent=correspondent, user=user)

@correspondent_bp.route('/assignments')
def assignments():
    if 'user_id' not in session or session.get('user_role') != 'correspondent':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    correspondent = Correspondent.query.filter_by(user_id=user_id).first()
    
    if not correspondent:
        flash('Perfil de correspondente não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    # Obter atribuições pendentes
    pending_assignments = ServiceRequest.query.filter_by(
        correspondent_id=correspondent.id, 
        status='assigned'
    ).all()
    
    return render_template('correspondent/assignments.html', assignments=pending_assignments)

@correspondent_bp.route('/assignments/<int:request_id>/accept', methods=['POST'])
def accept_assignment(request_id):
    if 'user_id' not in session or session.get('user_role') != 'correspondent':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    correspondent = Correspondent.query.filter_by(user_id=user_id).first()
    
    if not correspondent:
        flash('Perfil de correspondente não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    service_request = ServiceRequest.query.get_or_404(request_id)
    
    # Verificar se a solicitação está atribuída a este correspondente
    if service_request.correspondent_id != correspondent.id:
        flash('Você não tem permissão para aceitar esta atribuição.', 'error')
        return redirect(url_for('correspondent.assignments'))
    
    # Verificar se a solicitação está no status correto
    if service_request.status != 'assigned':
        flash('Esta atribuição não pode ser aceita.', 'error')
        return redirect(url_for('correspondent.assignments'))
    
    service_request.status = 'accepted'
    db.session.commit()
    
    flash('Atribuição aceita com sucesso!', 'success')
    return redirect(url_for('correspondent.scheduled_services'))

@correspondent_bp.route('/assignments/<int:request_id>/reject', methods=['POST'])
def reject_assignment(request_id):
    if 'user_id' not in session or session.get('user_role') != 'correspondent':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    correspondent = Correspondent.query.filter_by(user_id=user_id).first()
    
    if not correspondent:
        flash('Perfil de correspondente não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    service_request = ServiceRequest.query.get_or_404(request_id)
    
    # Verificar se a solicitação está atribuída a este correspondente
    if service_request.correspondent_id != correspondent.id:
        flash('Você não tem permissão para rejeitar esta atribuição.', 'error')
        return redirect(url_for('correspondent.assignments'))
    
    # Verificar se a solicitação está no status correto
    if service_request.status != 'assigned':
        flash('Esta atribuição não pode ser rejeitada.', 'error')
        return redirect(url_for('correspondent.assignments'))
    
    service_request.status = 'rejected'
    service_request.correspondent_id = None
    db.session.commit()
    
    flash('Atribuição rejeitada.', 'success')
    return redirect(url_for('correspondent.assignments'))

@correspondent_bp.route('/scheduled-services')
def scheduled_services():
    if 'user_id' not in session or session.get('user_role') != 'correspondent':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    correspondent = Correspondent.query.filter_by(user_id=user_id).first()
    
    if not correspondent:
        flash('Perfil de correspondente não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    # Obter serviços agendados
    scheduled_services = ServiceRequest.query.filter_by(
        correspondent_id=correspondent.id, 
        status='accepted'
    ).order_by(
        ServiceRequest.date_time
    ).all()
    
    return render_template('correspondent/scheduled_services.html', services=scheduled_services)

@correspondent_bp.route('/service-requests/<int:request_id>')
def request_details(request_id):
    if 'user_id' not in session or session.get('user_role') != 'correspondent':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    correspondent = Correspondent.query.filter_by(user_id=user_id).first()
    
    if not correspondent:
        flash('Perfil de correspondente não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    service_request = ServiceRequest.query.get_or_404(request_id)
    
    # Verificar se a solicitação está atribuída a este correspondente
    if service_request.correspondent_id != correspondent.id:
        flash('Você não tem permissão para acessar esta solicitação.', 'error')
        return redirect(url_for('correspondent.assignments'))
    
    return render_template('correspondent/request_details.html', request=service_request)

@correspondent_bp.route('/service-requests/<int:request_id>/confirm-presence', methods=['POST'])
def confirm_presence(request_id):
    if 'user_id' not in session or session.get('user_role') != 'correspondent':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    correspondent = Correspondent.query.filter_by(user_id=user_id).first()
    
    if not correspondent:
        flash('Perfil de correspondente não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    service_request = ServiceRequest.query.get_or_404(request_id)
    
    # Verificar se a solicitação está atribuída a este correspondente
    if service_request.correspondent_id != correspondent.id:
        flash('Você não tem permissão para confirmar presença nesta solicitação.', 'error')
        return redirect(url_for('correspondent.scheduled_services'))
    
    # Verificar se a solicitação está no status correto
    if service_request.status != 'accepted':
        flash('Não é possível confirmar presença nesta solicitação.', 'error')
        return redirect(url_for('correspondent.request_details', request_id=request_id))
    
    service_request.status = 'in_progress'
    db.session.commit()
    
    flash('Presença confirmada com sucesso!', 'success')
    return redirect(url_for('correspondent.request_details', request_id=request_id))

@correspondent_bp.route('/service-requests/<int:request_id>/submit-documentation', methods=['GET', 'POST'])
def submit_documentation(request_id):
    if 'user_id' not in session or session.get('user_role') != 'correspondent':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    correspondent = Correspondent.query.filter_by(user_id=user_id).first()
    
    if not correspondent:
        flash('Perfil de correspondente não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    service_request = ServiceRequest.query.get_or_404(request_id)
    
    # Verificar se a solicitação está atribuída a este correspondente
    if service_request.correspondent_id != correspondent.id:
        flash('Você não tem permissão para enviar documentação para esta solicitação.', 'error')
        return redirect(url_for('correspondent.scheduled_services'))
    
    # Verificar se a solicitação está no status correto
    if service_request.status != 'in_progress':
        flash('Não é possível enviar documentação para esta solicitação.', 'error')
        return redirect(url_for('correspondent.request_details', request_id=request_id))
    
    if request.method == 'POST':
        report = request.form.get('report')
        
        # Em um sistema real, processaríamos o upload de arquivos
        # Para este protótipo, apenas simulamos
        
        service_request.status = 'completed'
        db.session.commit()
        
        flash('Documentação enviada com sucesso!', 'success')
        return redirect(url_for('correspondent.request_details', request_id=request_id))
    
    return render_template('correspondent/submit_documentation.html', request=service_request)

@correspondent_bp.route('/history')
def history():
    if 'user_id' not in session or session.get('user_role') != 'correspondent':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    correspondent = Correspondent.query.filter_by(user_id=user_id).first()
    
    if not correspondent:
        flash('Perfil de correspondente não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    # Obter histórico de serviços
    completed_services = ServiceRequest.query.filter_by(
        correspondent_id=correspondent.id, 
        status='completed'
    ).order_by(
        ServiceRequest.date_time.desc()
    ).all()
    
    return render_template('correspondent/history.html', services=completed_services)

@correspondent_bp.route('/payments')
def payments():
    if 'user_id' not in session or session.get('user_role') != 'correspondent':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    correspondent = Correspondent.query.filter_by(user_id=user_id).first()
    
    if not correspondent:
        flash('Perfil de correspondente não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    # Em um sistema real, buscaríamos pagamentos do banco de dados
    # Para este protótipo, apenas simulamos
    pending_payments = []
    received_payments = []
    
    return render_template('correspondent/payments.html', 
                          pending_payments=pending_payments,
                          received_payments=received_payments)
