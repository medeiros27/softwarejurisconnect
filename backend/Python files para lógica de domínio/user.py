from src import db
from datetime import datetime
import json

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, company, correspondent
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, active, rejected, inactive
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relacionamentos
    company = db.relationship('Company', backref='user', uselist=False, cascade="all, delete-orphan")
    correspondent = db.relationship('Correspondent', backref='user', uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<User {self.email}>'
