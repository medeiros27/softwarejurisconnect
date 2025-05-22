from flask import Blueprint, render_template, redirect, url_for, request, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from src.models.user import User
from src.models.company import Company
from src.models.correspondent import Correspondent
from src import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user_type = request.form.get('user_type')
        
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password_hash, password) and user.role == user_type:
            if user.status != 'active':
                flash('Sua conta está pendente de aprovação ou inativa.', 'error')
                return render_template('auth/login.html')
            
            session['user_id'] = user.id
            session['user_name'] = user.name
            session['user_role'] = user.role
            
            # Atualizar último login
            user.last_login = db.func.now()
            db.session.commit()
            
            return redirect(url_for('dashboard'))
        else:
            flash('Credenciais inválidas. Por favor, tente novamente.', 'error')
    
    return render_template('auth/login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role')
        
        # Verificar se usuário já existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Um usuário com este e-mail já existe.', 'error')
            return render_template('auth/register.html')
        
        # Criar novo usuário
        password_hash = generate_password_hash(password)
        new_user = User(
            name=name,
            email=email,
            password_hash=password_hash,
            role=role,
            status='pending'
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Se for empresa, criar registro de empresa
        if role == 'company':
            document = request.form.get('document')
            company_name = request.form.get('company_name')
            business_type = request.form.get('business_type')
            contact_name = request.form.get('contact_name')
            
            new_company = Company(
                user_id=new_user.id,
                document=document,
                company_name=company_name,
                business_type=business_type,
                contact_name=contact_name
            )
            
            db.session.add(new_company)
            db.session.commit()
        
        # Se for correspondente, criar registro de correspondente
        elif role == 'correspondent':
            document = request.form.get('document')
            oab_number = request.form.get('oab_number')
            specialties = request.form.get('specialties').split(',')
            
            new_correspondent = Correspondent(
                user_id=new_user.id,
                document=document,
                oab_number=oab_number,
                specialties=specialties
            )
            
            db.session.add(new_correspondent)
            db.session.commit()
        
        flash('Cadastro realizado com sucesso! Aguarde a aprovação do administrador.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html')

@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email')
        
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Em um sistema real, enviaríamos um e-mail com instruções
            # Para este protótipo, apenas simulamos o processo
            flash('Instruções de recuperação de senha foram enviadas para seu e-mail.', 'success')
        else:
            flash('E-mail não encontrado.', 'error')
        
        return redirect(url_for('auth.login'))
    
    return render_template('auth/forgot_password.html')

@auth_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    # Em um sistema real, validaríamos o token
    # Para este protótipo, apenas simulamos o processo
    
    if request.method == 'POST':
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if password != confirm_password:
            flash('As senhas não coincidem.', 'error')
            return render_template('auth/reset_password.html', token=token)
        
        flash('Senha redefinida com sucesso! Faça login com sua nova senha.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/reset_password.html', token=token)
