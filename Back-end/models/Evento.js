const db = require('../db.js');

const Evento = {
  getAll: (filter, callback) => {
    let sql = 'SELECT * FROM eventos';
    const params = [];

    if (filter) {
      sql += ' WHERE title LIKE ? OR description LIKE ? OR type LIKE ?';
      const likeFilter = `%${filter}%`;
      params.push(likeFilter, likeFilter, likeFilter);
    }

    db.query(sql, params, callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM eventos WHERE id = ?', [id], callback);
  },

  create: (evento, callback) => {
    const {
      title, start, end, color, location, description,
      notify, notify_time, type
    } = evento;

    // Função para converter data ISO para formato MySQL
    const formatDateForMySQL = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    const formattedStart = formatDateForMySQL(start);
    const formattedEnd = formatDateForMySQL(end);

    const sql = `INSERT INTO eventos (title, start, end, color, location, description, notify, notify_time, type)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [
      title, 
      formattedStart, 
      formattedEnd, 
      color || '#3788d8',
      location,
      description,
      notify || false,
      notify ? parseInt(notify_time) : null,
      type || 'Social'
    ], callback);
  },

  updateById: (id, evento, callback) => {
    const {
      title, start, end, color, location, description,
      notify, notify_time, type
    } = evento;

    // Função para converter data ISO para formato MySQL
    const formatDateForMySQL = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    const formattedStart = formatDateForMySQL(start);
    const formattedEnd = formatDateForMySQL(end);

    const sql = `UPDATE eventos SET 
                  title = ?, 
                  start = ?, 
                  end = ?, 
                  color = ?, 
                  location = ?, 
                  description = ?, 
                  notify = ?, 
                  notify_time = ?, 
                  type = ? 
                WHERE id = ?`;

    db.query(sql, [
      title,
      formattedStart,
      formattedEnd,
      color || '#3788d8',
      location,
      description,
      notify || false,
      notify ? parseInt(notify_time) : null,
      type || 'Social',
      id
    ], callback);
  },

  // Método adicionado para completar o CRUD
  deleteById: (id, callback) => {
    db.query('DELETE FROM eventos WHERE id = ?', [id], callback);
  }
};

module.exports = Evento;