from flask import Blueprint, render_template, redirect, url_for, request, session, flash, jsonify
from src.models.user import User
from src.models.company import Company
from src.models.service_request import ServiceRequest
from src import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard')
def dashboard():
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    # Obter métricas para o dashboard
    total_companies = Company.query.count()
    pending_companies = Company.query.join(User).filter(User.status == 'pending').count()
    total_requests = ServiceRequest.query.count()
    pending_requests = ServiceRequest.query.filter_by(status='pending_approval').count()
    
    # Obter solicitações recentes
    recent_requests = ServiceRequest.query.order_by(ServiceRequest.created_at.desc()).limit(5).all()
    
    return render_template('admin/dashboard.html', 
                          total_companies=total_companies,
                          pending_companies=pending_companies,
                          total_requests=total_requests,
                          pending_requests=pending_requests,
                          recent_requests=recent_requests)

@admin_bp.route('/companies')
def companies():
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    companies = Company.query.join(User).all()
    return render_template('admin/companies.html', companies=companies)

@admin_bp.route('/companies/pending')
def pending_companies():
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    pending_companies = Company.query.join(User).filter(User.status == 'pending').all()
    return render_template('admin/pending_companies.html', companies=pending_companies)

@admin_bp.route('/companies/<int:company_id>')
def company_details(company_id):
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    company = Company.query.get_or_404(company_id)
    return render_template('admin/company_details.html', company=company)

@admin_bp.route('/companies/<int:company_id>/approve', methods=['POST'])
def approve_company(company_id):
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    company = Company.query.get_or_404(company_id)
    user = User.query.get(company.user_id)
    
    user.status = 'active'
    db.session.commit()
    
    flash(f'Empresa {company.company_name} aprovada com sucesso!', 'success')
    return redirect(url_for('admin.pending_companies'))

@admin_bp.route('/companies/<int:company_id>/reject', methods=['POST'])
def reject_company(company_id):
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    company = Company.query.get_or_404(company_id)
    user = User.query.get(company.user_id)
    
    user.status = 'rejected'
    db.session.commit()
    
    flash(f'Empresa {company.company_name} rejeitada.', 'success')
    return redirect(url_for('admin.pending_companies'))

@admin_bp.route('/correspondents')
def correspondents():
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    from src.models.correspondent import Correspondent
    correspondents = Correspondent.query.join(User).all()
    return render_template('admin/correspondents.html', correspondents=correspondents)

@admin_bp.route('/correspondents/pending')
def pending_correspondents():
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    from src.models.correspondent import Correspondent
    pending_correspondents = Correspondent.query.join(User).filter(User.status == 'pending').all()
    return render_template('admin/pending_correspondents.html', correspondents=pending_correspondents)

@admin_bp.route('/correspondents/<int:correspondent_id>')
def correspondent_details(correspondent_id):
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    from src.models.correspondent import Correspondent
    correspondent = Correspondent.query.get_or_404(correspondent_id)
    return render_template('admin/correspondent_details.html', correspondent=correspondent)

@admin_bp.route('/correspondents/<int:correspondent_id>/approve', methods=['POST'])
def approve_correspondent(correspondent_id):
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    from src.models.correspondent import Correspondent
    correspondent = Correspondent.query.get_or_404(correspondent_id)
    user = User.query.get(correspondent.user_id)
    
    user.status = 'active'
    db.session.commit()
    
    flash(f'Correspondente aprovado com sucesso!', 'success')
    return redirect(url_for('admin.pending_correspondents'))

@admin_bp.route('/service-requests')
def service_requests():
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    requests = ServiceRequest.query.all()
    return render_template('admin/service_requests.html', requests=requests)

@admin_bp.route('/service-requests/pending')
def pending_requests():
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    pending_requests = ServiceRequest.query.filter_by(status='pending_approval').all()
    return render_template('admin/pending_requests.html', requests=pending_requests)

@admin_bp.route('/service-requests/<int:request_id>')
def request_details(request_id):
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    service_request = ServiceRequest.query.get_or_404(request_id)
    return render_template('admin/request_details.html', request=service_request)

@admin_bp.route('/service-requests/<int:request_id>/set-value', methods=['POST'])
def set_request_value(request_id):
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    service_request = ServiceRequest.query.get_or_404(request_id)
    
    if service_request.status != 'pending_approval':
        flash('Apenas solicitações pendentes podem ter valor definido.', 'error')
        return redirect(url_for('admin.request_details', request_id=request_id))
    
    company_value = float(request.form.get('company_value'))
    
    service_request.company_value = company_value
    service_request.status = 'approved'
    db.session.commit()
    
    flash('Valor definido e solicitação aprovada com sucesso!', 'success')
    return redirect(url_for('admin.request_details', request_id=request_id))

@admin_bp.route('/service-requests/<int:request_id>/assign', methods=['GET', 'POST'])
def assign_correspondent(request_id):
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    service_request = ServiceRequest.query.get_or_404(request_id)
    
    if service_request.status != 'approved':
        flash('Apenas solicitações aprovadas podem receber atribuições.', 'error')
        return redirect(url_for('admin.request_details', request_id=request_id))
    
    if request.method == 'POST':
        from src.models.correspondent import Correspondent
        
        correspondent_id = request.form.get('correspondent_id')
        correspondent_value = float(request.form.get('correspondent_value'))
        instructions = request.form.get('instructions')
        
        correspondent = Correspondent.query.get(correspondent_id)
        if not correspondent:
            flash('Correspondente não encontrado.', 'error')
            return redirect(url_for('admin.assign_correspondent', request_id=request_id))
        
        service_request.correspondent_id = correspondent_id
        service_request.correspondent_value = correspondent_value
        service_request.profit_margin = service_request.company_value - correspondent_value
        service_request.instructions = instructions
        service_request.status = 'assigned'
        db.session.commit()
        
        flash('Correspondente atribuído com sucesso!', 'success')
        return redirect(url_for('admin.request_details', request_id=request_id))
    
    from src.models.correspondent import Correspondent
    correspondents = Correspondent.query.join(User).filter(User.status == 'active').all()
    return render_template('admin/assign_correspondent.html', 
                          request=service_request, 
                          correspondents=correspondents)

@admin_bp.route('/reports')
def reports():
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return redirect(url_for('auth.login'))
    
    return render_template('admin/reports.html')
