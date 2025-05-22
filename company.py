from flask import Blueprint, render_template, redirect, url_for, request, session, flash, jsonify
from src.models.user import User
from src.models.company import Company
from src.models.service_request import ServiceRequest
from src import db

company_bp = Blueprint('company', __name__)

@company_bp.route('/dashboard')
def dashboard():
    if 'user_id' not in session or session.get('user_role') != 'company':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    company = Company.query.filter_by(user_id=user_id).first()
    
    if not company:
        flash('Perfil de empresa não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    # Obter métricas para o dashboard
    active_requests = ServiceRequest.query.filter_by(company_id=company.id).filter(
        ServiceRequest.status.in_(['approved', 'assigned', 'accepted', 'in_progress'])
    ).count()
    
    completed_requests = ServiceRequest.query.filter_by(
        company_id=company.id, 
        status='completed'
    ).count()
    
    # Obter solicitações recentes
    recent_requests = ServiceRequest.query.filter_by(company_id=company.id).order_by(
        ServiceRequest.created_at.desc()
    ).limit(5).all()
    
    return render_template('company/dashboard.html', 
                          company=company,
                          active_requests=active_requests,
                          completed_requests=completed_requests,
                          recent_requests=recent_requests)

@company_bp.route('/profile')
def profile():
    if 'user_id' not in session or session.get('user_role') != 'company':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    company = Company.query.filter_by(user_id=user_id).first()
    user = User.query.get(user_id)
    
    if not company:
        flash('Perfil de empresa não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    return render_template('company/profile.html', company=company, user=user)

@company_bp.route('/profile/edit', methods=['GET', 'POST'])
def edit_profile():
    if 'user_id' not in session or session.get('user_role') != 'company':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    company = Company.query.filter_by(user_id=user_id).first()
    user = User.query.get(user_id)
    
    if not company:
        flash('Perfil de empresa não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    if request.method == 'POST':
        # Atualizar dados do usuário
        user.name = request.form.get('name')
        user.phone = request.form.get('phone')
        
        # Atualizar dados da empresa
        company.company_name = request.form.get('company_name')
        company.business_type = request.form.get('business_type')
        company.contact_name = request.form.get('contact_name')
        
        db.session.commit()
        
        flash('Perfil atualizado com sucesso!', 'success')
        return redirect(url_for('company.profile'))
    
    return render_template('company/edit_profile.html', company=company, user=user)

@company_bp.route('/service-requests')
def service_requests():
    if 'user_id' not in session or session.get('user_role') != 'company':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    company = Company.query.filter_by(user_id=user_id).first()
    
    if not company:
        flash('Perfil de empresa não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    requests = ServiceRequest.query.filter_by(company_id=company.id).all()
    return render_template('company/service_requests.html', requests=requests)

@company_bp.route('/service-requests/new', methods=['GET', 'POST'])
def new_request():
    if 'user_id' not in session or session.get('user_role') != 'company':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    company = Company.query.filter_by(user_id=user_id).first()
    
    if not company:
        flash('Perfil de empresa não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    if request.method == 'POST':
        service_type = request.form.get('service_type')
        location_city = request.form.get('location_city')
        location_state = request.form.get('location_state')
        date_time = request.form.get('date_time')
        details = request.form.get('details')
        deadline = request.form.get('deadline')
        
        location = {
            'city': location_city,
            'state': location_state
        }
        
        new_request = ServiceRequest(
            company_id=company.id,
            service_type=service_type,
            location=location,
            date_time=date_time,
            details=details,
            deadline=deadline,
            status='pending_approval'
        )
        
        db.session.add(new_request)
        db.session.commit()
        
        flash('Solicitação criada com sucesso! Aguarde a aprovação e definição de valor.', 'success')
        return redirect(url_for('company.service_requests'))
    
    return render_template('company/new_request.html')

@company_bp.route('/service-requests/<int:request_id>')
def request_details(request_id):
    if 'user_id' not in session or session.get('user_role') != 'company':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    company = Company.query.filter_by(user_id=user_id).first()
    
    if not company:
        flash('Perfil de empresa não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    service_request = ServiceRequest.query.get_or_404(request_id)
    
    # Verificar se a solicitação pertence a esta empresa
    if service_request.company_id != company.id:
        flash('Você não tem permissão para acessar esta solicitação.', 'error')
        return redirect(url_for('company.service_requests'))
    
    return render_template('company/request_details.html', request=service_request)

@company_bp.route('/service-requests/<int:request_id>/cancel', methods=['POST'])
def cancel_request(request_id):
    if 'user_id' not in session or session.get('user_role') != 'company':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    company = Company.query.filter_by(user_id=user_id).first()
    
    if not company:
        flash('Perfil de empresa não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    service_request = ServiceRequest.query.get_or_404(request_id)
    
    # Verificar se a solicitação pertence a esta empresa
    if service_request.company_id != company.id:
        flash('Você não tem permissão para cancelar esta solicitação.', 'error')
        return redirect(url_for('company.service_requests'))
    
    # Verificar se a solicitação pode ser cancelada
    if service_request.status not in ['pending_approval', 'approved']:
        flash('Esta solicitação não pode mais ser cancelada.', 'error')
        return redirect(url_for('company.request_details', request_id=request_id))
    
    service_request.status = 'cancelled'
    db.session.commit()
    
    flash('Solicitação cancelada com sucesso!', 'success')
    return redirect(url_for('company.service_requests'))

@company_bp.route('/documents')
def documents():
    if 'user_id' not in session or session.get('user_role') != 'company':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    company = Company.query.filter_by(user_id=user_id).first()
    
    if not company:
        flash('Perfil de empresa não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    # Em um sistema real, buscaríamos documentos do banco de dados
    # Para este protótipo, apenas simulamos
    documents = []
    
    return render_template('company/documents.html', documents=documents)

@company_bp.route('/reports')
def reports():
    if 'user_id' not in session or session.get('user_role') != 'company':
        return redirect(url_for('auth.login'))
    
    user_id = session.get('user_id')
    company = Company.query.filter_by(user_id=user_id).first()
    
    if not company:
        flash('Perfil de empresa não encontrado.', 'error')
        return redirect(url_for('auth.logout'))
    
    return render_template('company/reports.html')
