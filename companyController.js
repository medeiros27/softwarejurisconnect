/**
 * Controladores para gerenciamento de empresas no Sistema de Gestão de Correspondentes Jurídicos
 * 
 * Este arquivo contém os controladores para operações CRUD de empresas contratantes.
 */

const { User, Company } = require('../models');

// Listar todas as empresas
exports.getAllCompanies = async (req, res) => {
  try {
    // Verificar se o usuário é administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const companies = await Company.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'status', 'phone', 'last_login']
        }
      ]
    });

    return res.status(200).json(companies);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Obter detalhes de uma empresa específica
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário é administrador ou a própria empresa
    if (req.user.role === 'company' && req.user.id !== id) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const company = await Company.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'status', 'phone', 'last_login']
        }
      ]
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    return res.status(200).json(company);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Atualizar dados de uma empresa
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      business_type,
      contact_name,
      monthly_volume,
      locations,
      products_of_interest,
      phone
    } = req.body;

    // Verificar se o usuário é administrador ou a própria empresa
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const user = await User.findByPk(company.user_id);
    if (req.user.role === 'company' && req.user.id !== user.id) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    // Atualizar dados da empresa
    await company.update({
      company_name,
      business_type,
      contact_name,
      monthly_volume,
      locations,
      products_of_interest
    });

    // Atualizar telefone do usuário se fornecido
    if (phone) {
      await user.update({ phone });
    }

    return res.status(200).json({
      message: 'Empresa atualizada com sucesso',
      company: {
        ...company.toJSON(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Aprovar ou rejeitar cadastro de empresa
exports.updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verificar se o usuário é administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    // Verificar status válido
    if (!['active', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const user = await User.findByPk(company.user_id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualizar status do usuário
    await user.update({ status });

    return res.status(200).json({
      message: `Status da empresa atualizado para ${status}`,
      company: {
        ...company.toJSON(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status
        }
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar status da empresa:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Excluir uma empresa
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário é administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const user = await User.findByPk(company.user_id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Excluir empresa e usuário associado
    await company.destroy();
    await user.destroy();

    return res.status(200).json({
      message: 'Empresa excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Listar empresas pendentes de aprovação
exports.getPendingCompanies = async (req, res) => {
  try {
    // Verificar se o usuário é administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const pendingCompanies = await Company.findAll({
      include: [
        {
          model: User,
          where: { status: 'pending' },
          attributes: ['id', 'name', 'email', 'status', 'phone', 'last_login']
        }
      ]
    });

    return res.status(200).json(pendingCompanies);
  } catch (error) {
    console.error('Erro ao listar empresas pendentes:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};
