from src import db
from datetime import datetime
import json

class ServiceRequest(db.Model):
    __tablename__ = 'service_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    correspondent_id = db.Column(db.Integer, db.ForeignKey('correspondents.id'), nullable=True)
    service_type = db.Column(db.String(50), nullable=False)  # audiencia_conciliacao, audiencia_instrucao, copia_processos, protocolo, etc.
    location = db.Column(db.Text, nullable=False)  # JSON object com city, state
    date_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # pending_approval, approved, assigned, accepted, rejected, in_progress, completed, cancelled
    company_value = db.Column(db.Float, nullable=True)  # Valor cobrado da empresa
    correspondent_value = db.Column(db.Float, nullable=True)  # Valor pago ao correspondente
    profit_margin = db.Column(db.Float, nullable=True)  # Margem de lucro
    details = db.Column(db.Text)  # Detalhes da solicitação
    instructions = db.Column(db.Text)  # Instruções para o correspondente
    deadline = db.Column(db.DateTime, nullable=True)  # Prazo para entrega de documentação
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    documents = db.relationship('Document', backref='service_request', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<ServiceRequest {self.id}>'
    
    @property
    def location_dict(self):
        if self.location:
            return json.loads(self.location)
        return {}
    
    @location_dict.setter
    def location_dict(self, value):
        self.location = json.dumps(value)
