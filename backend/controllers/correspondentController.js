/**
 * Controladores para gerenciamento de correspondentes no Sistema de Gestão de Correspondentes Jurídicos
 * 
 * Este arquivo contém os controladores para operações CRUD de correspondentes jurídicos.
 */

const { User, Correspondent } = require('../models');

// Listar todos os correspondentes
exports.getAllCorrespondents = async (req, res) => {
  try {
    // Verificar se o usuário é administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const correspondents = await Correspondent.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'status', 'phone', 'last_login']
        }
      ]
    });

    return res.status(200).json(correspondents);
  } catch (error) {
    console.error('Erro ao listar correspondentes:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Obter detalhes de um correspondente específico
exports.getCorrespondentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário é administrador ou o próprio correspondente
    if (req.user.role === 'correspondent' && req.user.id !== id) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const correspondent = await Correspondent.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'status', 'phone', 'last_login']
        }
      ]
    });

    if (!correspondent) {
      return res.status(404).json({ error: 'Correspondente não encontrado' });
    }

    return res.status(200).json(correspondent);
  } catch (error) {
    console.error('Erro ao buscar correspondente:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Atualizar dados de um correspondente
exports.updateCorrespondent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      oab_number,
      specialties,
      locations,
      rates,
      bank_info,
      phone
    } = req.body;

    // Verificar se o usuário é administrador ou o próprio correspondente
    const correspondent = await Correspondent.findByPk(id);
    if (!correspondent) {
      return res.status(404).json({ error: 'Correspondente não encontrado' });
    }

    const user = await User.findByPk(correspondent.user_id);
    if (req.user.role === 'correspondent' && req.user.id !== user.id) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    // Atualizar dados do correspondente
    await correspondent.update({
      oab_number,
      specialties,
      locations,
      rates,
      bank_info
    });

    // Atualizar telefone do usuário se fornecido
    if (phone) {
      await user.update({ phone });
    }

    return res.status(200).json({
      message: 'Correspondente atualizado com sucesso',
      correspondent: {
        ...correspondent.toJSON(),
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
    console.error('Erro ao atualizar correspondente:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Aprovar ou rejeitar cadastro de correspondente
exports.updateCorrespondentStatus = async (req, res) => {
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

    const correspondent = await Correspondent.findByPk(id);
    if (!correspondent) {
      return res.status(404).json({ error: 'Correspondente não encontrado' });
    }

    const user = await User.findByPk(correspondent.user_id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualizar status do usuário
    await user.update({ status });

    return res.status(200).json({
      message: `Status do correspondente atualizado para ${status}`,
      correspondent: {
        ...correspondent.toJSON(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status
        }
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar status do correspondente:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Excluir um correspondente
exports.deleteCorrespondent = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário é administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const correspondent = await Correspondent.findByPk(id);
    if (!correspondent) {
      return res.status(404).json({ error: 'Correspondente não encontrado' });
    }

    const user = await User.findByPk(correspondent.user_id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Excluir correspondente e usuário associado
    await correspondent.destroy();
    await user.destroy();

    return res.status(200).json({
      message: 'Correspondente excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir correspondente:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Listar correspondentes pendentes de aprovação
exports.getPendingCorrespondents = async (req, res) => {
  try {
    // Verificar se o usuário é administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const pendingCorrespondents = await Correspondent.findAll({
      include: [
        {
          model: User,
          where: { status: 'pending' },
          attributes: ['id', 'name', 'email', 'status', 'phone', 'last_login']
        }
      ]
    });

    return res.status(200).json(pendingCorrespondents);
  } catch (error) {
    console.error('Erro ao listar correspondentes pendentes:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Buscar correspondentes por localidade
exports.getCorrespondentsByLocation = async (req, res) => {
  try {
    const { city, state } = req.query;

    if (!city || !state) {
      return res.status(400).json({ error: 'Cidade e estado são obrigatórios' });
    }

    // Buscar correspondentes ativos na localidade especificada
    const correspondents = await Correspondent.findAll({
      include: [
        {
          model: User,
          where: { status: 'active' },
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      where: {
        // Usando operador Sequelize para buscar em array JSON
        locations: {
          [Sequelize.Op.contains]: [{ city, state }]
        }
      }
    });

    return res.status(200).json(correspondents);
  } catch (error) {
    console.error('Erro ao buscar correspondentes por localidade:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Buscar correspondentes por especialidade
exports.getCorrespondentsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query;

    if (!specialty) {
      return res.status(400).json({ error: 'Especialidade é obrigatória' });
    }

    // Buscar correspondentes ativos com a especialidade especificada
    const correspondents = await Correspondent.findAll({
      include: [
        {
          model: User,
          where: { status: 'active' },
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      where: {
        // Usando operador Sequelize para buscar em array JSON
        specialties: {
          [Sequelize.Op.contains]: [specialty]
        }
      }
    });

    return res.status(200).json(correspondents);
  } catch (error) {
    console.error('Erro ao buscar correspondentes por especialidade:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};
