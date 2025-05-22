from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
import secrets

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USERNAME', 'root')}:{os.getenv('DB_PASSWORD', 'password')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME', 'mydb')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Importar blueprints após a criação da aplicação
from src.routes.auth import auth_bp
from src.routes.admin import admin_bp
from src.routes.company import company_bp
from src.routes.correspondent import correspondent_bp

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(company_bp, url_prefix='/company')
app.register_blueprint(correspondent_bp, url_prefix='/correspondent')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    user_role = session.get('user_role')
    
    if user_role == 'admin':
        return redirect(url_for('admin.dashboard'))
    elif user_role == 'company':
        return redirect(url_for('company.dashboard'))
    elif user_role == 'correspondent':
        return redirect(url_for('correspondent.dashboard'))
    else:
        return redirect(url_for('auth.login'))

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

# Importar render_template, redirect, url_for e session após a criação da aplicação
from flask import render_template, redirect, url_for, session
