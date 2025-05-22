from src import db
import json
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from src.models.user import User
from src.models.company import Company
from src.models.correspondent import Correspondent
from src.models.service_request import ServiceRequest
from src.models.document import Document

def seed_database():
    """
    Função para popular o banco de dados com dados iniciais para teste
    """
    # Limpar dados existentes
    Document.query.delete()
    ServiceRequest.query.delete()
    Correspondent.query.delete()
    Company.query.delete()
    User.query.delete()
    
    # Criar usuário administrador
    admin_user = User(
        name='Administrador',
        email='admin@jurisconnect.com.br',
        password_hash=generate_password_hash('admin123'),
        role='admin',
        status='active',
        phone='(11) 99999-9999'
    )
    db.session.add(admin_user)
    db.session.commit()
    
    # Criar empresas de exemplo
    company_user1 = User(
        name='Empresa Exemplo 1',
        email='empresa1@exemplo.com',
        password_hash=generate_password_hash('empresa123'),
        role='company',
        status='active',
        phone='(11) 98888-8888'
    )
    db.session.add(company_user1)
    db.session.commit()
    
    company1 = Company(
        user_id=company_user1.id,
        document='12.345.678/0001-90',
        company_name='Empresa Jurídica Exemplo Ltda',
        business_type='law_firm',
        contact_name='João Silva',
        monthly_volume='above_10',
        locations=json.dumps([
            {'city': 'São Paulo', 'state': 'SP'},
            {'city': 'Rio de Janeiro', 'state': 'RJ'}
        ]),
        products_of_interest=json.dumps(['audiências', 'diligências', 'protocolos'])
    )
    db.session.add(company1)
    
    company_user2 = User(
        name='Empresa Exemplo 2',
        email='empresa2@exemplo.com',
        password_hash=generate_password_hash('empresa123'),
        role='company',
        status='active',
        phone='(21) 97777-7777'
    )
    db.session.add(company_user2)
    db.session.commit()
    
    company2 = Company(
        user_id=company_user2.id,
        document='98.765.432/0001-10',
        company_name='Advocacia Corporativa S/A',
        business_type='law_firm',
        contact_name='Maria Oliveira',
        monthly_volume='1_to_10',
        locations=json.dumps([
            {'city': 'Belo Horizonte', 'state': 'MG'},
            {'city': 'Brasília', 'state': 'DF'}
        ]),
        products_of_interest=json.dumps(['audiências', 'cópias'])
    )
    db.session.add(company2)
    
    # Criar correspondentes de exemplo
    correspondent_user1 = User(
        name='Correspondente Exemplo 1',
        email='correspondente1@exemplo.com',
        password_hash=generate_password_hash('corresp123'),
        role='correspondent',
        status='active',
        phone='(11) 96666-6666'
    )
    db.session.add(correspondent_user1)
    db.session.commit()
    
    correspondent1 = Correspondent(
        user_id=correspondent_user1.id,
        document='123.456.789-00',
        oab_number='SP123456',
        specialties=json.dumps(['cível', 'trabalhista']),
        locations=json.dumps([
            {'city': 'São Paulo', 'state': 'SP'},
            {'city': 'Campinas', 'state': 'SP'}
        ]),
        rates=json.dumps({
            'audiencia_conciliacao': 150.00,
            'audiencia_instrucao': 250.00,
            'copia_processos': 100.00,
            'protocolo': 80.00
        }),
        bank_info=json.dumps({
            'bank': 'Banco do Brasil',
            'agency': '1234-5',
            'account': '12345-6',
            'account_type': 'corrente',
            'document': '123.456.789-00'
        }),
        average_rating=4.8,
        total_services=25
    )
    db.session.add(correspondent1)
    
    correspondent_user2 = User(
        name='Correspondente Exemplo 2',
        email='correspondente2@exemplo.com',
        password_hash=generate_password_hash('corresp123'),
        role='correspondent',
        status='active',
        phone='(21) 95555-5555'
    )
    db.session.add(correspondent_user2)
    db.session.commit()
    
    correspondent2 = Correspondent(
        user_id=correspondent_user2.id,
        document='987.654.321-00',
        oab_number='RJ98765',
        specialties=json.dumps(['cível', 'família']),
        locations=json.dumps([
            {'city': 'Rio de Janeiro', 'state': 'RJ'},
            {'city': 'Niterói', 'state': 'RJ'}
        ]),
        rates=json.dumps({
            'audiencia_conciliacao': 180.00,
            'audiencia_instrucao': 280.00,
            'copia_processos': 120.00,
            'protocolo': 90.00
        }),
        bank_info=json.dumps({
            'bank': 'Itaú',
            'agency': '5678-9',
            'account': '56789-0',
            'account_type': 'corrente',
            'document': '987.654.321-00'
        }),
        average_rating=4.5,
        total_services=18
    )
    db.session.add(correspondent2)
    
    # Criar solicitações de exemplo
    future_date = datetime.utcnow() + timedelta(days=7)
    
    service_request1 = ServiceRequest(
        company_id=company1.id,
        correspondent_id=correspondent1.id,
        service_type='audiencia_conciliacao',
        location=json.dumps({'city': 'São Paulo', 'state': 'SP'}),
        date_time=future_date,
        status='assigned',
        company_value=300.00,
        correspondent_value=150.00,
        profit_margin=150.00,
        details='Audiência de conciliação no processo nº 1234567-89.2023.8.26.0100',
        instructions='Comparecer com 30 minutos de antecedência. Levar documentos de identificação.',
        deadline=future_date + timedelta(days=3)
    )
    db.session.add(service_request1)
    
    service_request2 = ServiceRequest(
        company_id=company2.id,
        service_type='copia_processos',
        location=json.dumps({'city': 'Belo Horizonte', 'state': 'MG'}),
        date_time=datetime.utcnow() + timedelta(days=3),
        status='pending_approval',
        details='Obter cópia integral do processo nº 9876543-21.2023.8.13.0024',
        deadline=datetime.utcnow() + timedelta(days=5)
    )
    db.session.add(service_request2)
    
    # Criar documentos de exemplo
    document1 = Document(
        service_request_id=service_request1.id,
        type='instrucoes',
        file_name='instrucoes_audiencia.pdf',
        file_path='/uploads/documents/instrucoes_audiencia.pdf',
        file_size=1024 * 1024,  # 1MB
        uploaded_by=admin_user.id,
        status='approved'
    )
    db.session.add(document1)
    
    db.session.commit()
    
    print("Banco de dados populado com sucesso!")

if __name__ == '__main__':
    seed_database()
