const Evento = require('../models/Evento.js');

function validarEvento(dados) {
  const requiredFields = ['title', 'start', 'end', 'location', 'description'];
  for (let field of requiredFields) {
    if (!dados[field] || dados[field].toString().trim() === '') {
      return `Campo obrigatório ausente ou inválido: ${field}`;
    }
  }
  
  if (dados.title.length > 100) return 'Título muito longo (máximo 100 caracteres).';
  if (dados.description.length > 500) return 'Descrição muito longa (máximo 500 caracteres).';
  if (dados.location.length > 100) return 'Localização muito longa (máximo 100 caracteres).';
  
  // Validar datas
  const start = new Date(dados.start);
  const end = new Date(dados.end);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Datas inválidas.';
  if (end <= start) return 'A data de término deve ser posterior à data de início.';
  
  // Validar notificação
  if (dados.notify) {
    const notifyTime = parseInt(dados.notify_time);
    if (isNaN(notifyTime) || notifyTime < 1) {
      return 'Tempo de notificação inválido (deve ser um número positivo).';
    }
  }
  
  return null;
}

exports.getEventos = (req, res) => {
  const filtro = req.query.filtro || null;
  Evento.getAll(filtro, (err, results) => {
    if (err) {
      console.error('Erro ao buscar eventos:', err);
      return res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
    
    // Converter datas para formato ISO
    const eventos = results.map(evento => ({
      ...evento,
      start: evento.start ? new Date(evento.start).toISOString() : null,
      end: evento.end ? new Date(evento.end).toISOString() : null
    }));
    
    res.json(eventos);
  });
};

exports.getEventoById = (req, res) => {
  const { id } = req.params;
  Evento.getById(id, (err, results) => {
    if (err) {
      console.error('Erro ao buscar evento:', err);
      return res.status(500).json({ error: 'Erro ao buscar evento' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    const evento = results[0];
    // Converter datas para formato ISO
    evento.start = evento.start ? new Date(evento.start).toISOString() : null;
    evento.end = evento.end ? new Date(evento.end).toISOString() : null;
    
    res.json(evento);
  });
};

exports.createEvento = (req, res) => {
  const erroValidacao = validarEvento(req.body);
  if (erroValidacao) {
    return res.status(400).json({ error: erroValidacao });
  }

  // Mapear campos do frontend para o backend
  const eventoData = {
    title: req.body.title,
    start: req.body.startDate && req.body.startTime ? 
           `${req.body.startDate}T${req.body.startTime}` : 
           req.body.start,
    end: req.body.endDate && req.body.endTime ? 
         `${req.body.endDate}T${req.body.endTime}` : 
         req.body.end,
    color: req.body.color,
    location: req.body.location,
    description: req.body.description,
    notify: req.body.notify,
    notify_time: req.body.notifyTime,
    type: req.body.type
  };

  Evento.create(eventoData, (err, result) => {
    if (err) {
      console.error('Erro ao criar evento:', err);
      return res.status(500).json({ error: 'Erro ao criar evento' });
    }
    
    // Buscar o evento recém-criado para retornar com ID
    Evento.getById(result.insertId, (err, results) => {
      if (err) {
        console.error('Erro ao buscar evento criado:', err);
        return res.status(500).json({ error: 'Erro ao buscar evento criado' });
      }
      
      if (results.length === 0) {
        return res.status(500).json({ error: 'Evento criado não encontrado' });
      }
      
      const novoEvento = results[0];
      // Converter datas para formato ISO
      novoEvento.start = novoEvento.start ? new Date(novoEvento.start).toISOString() : null;
      novoEvento.end = novoEvento.end ? new Date(novoEvento.end).toISOString() : null;
      
      res.status(201).json(novoEvento);
    });
  });
};

exports.updateEvento = (req, res) => {
  const { id } = req.params;
  const erroValidacao = validarEvento(req.body);
  if (erroValidacao) {
    return res.status(400).json({ error: erroValidacao });
  }

  // Mapear campos do frontend para o backend
  const eventoData = {
    title: req.body.title,
    start: req.body.startDate && req.body.startTime ? 
           `${req.body.startDate}T${req.body.startTime}` : 
           req.body.start,
    end: req.body.endDate && req.body.endTime ? 
         `${req.body.endDate}T${req.body.endTime}` : 
         req.body.end,
    color: req.body.color,
    location: req.body.location,
    description: req.body.description,
    notify: req.body.notify,
    notify_time: req.body.notifyTime,
    type: req.body.type
  };

  Evento.updateById(id, eventoData, (err) => {
    if (err) {
      console.error('Erro ao atualizar evento:', err);
      return res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
    
    // Buscar o evento atualizado para retornar
    Evento.getById(id, (err, results) => {
      if (err) {
        console.error('Erro ao buscar evento atualizado:', err);
        return res.status(500).json({ error: 'Erro ao buscar evento atualizado' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Evento não encontrado após atualização' });
      }
      
      const eventoAtualizado = results[0];
      // Converter datas para formato ISO
      eventoAtualizado.start = eventoAtualizado.start ? new Date(eventoAtualizado.start).toISOString() : null;
      eventoAtualizado.end = eventoAtualizado.end ? new Date(eventoAtualizado.end).toISOString() : null;
      
      res.json(eventoAtualizado);
    });
  });
};

exports.deleteEvento = (req, res) => {
  const { id } = req.params;
  
  Evento.deleteById(id, (err) => {
    if (err) {
      console.error('Erro ao excluir evento:', err);
      return res.status(500).json({ error: 'Erro ao excluir evento' });
    }
    res.sendStatus(204);
  });
};