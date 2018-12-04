import express from 'express';
import dba from '../lib/dba';

const router = express.Router();

router.get('/notes', (req, res) => {
  dba.all(`
    SELECT id, title, body, created
    FROM Notes
    ORDER BY id DESC
  `, (err, notes) => {
    if (err) {
      const stringerr = typeof err === 'string' ? err : JSON.stringify(err);

      return res.json({
        msg: 'Error getting notes',
        dirtyError: stringerr,
      });
    }
    return res.json({
      notes: notes.map(note => Object.assign(note, { dirty: false })),
    });
  });
});
router.post('/notes', (req, res) => {
  const {
    title,
    body,
    created,
  } = req.body;

  if (!title || !body || !created) {
    return res.status(400).json({ err: 'missing data' });
  }

  dba.run(`
    INSERT INTO notes(title, body, created)
    VALUES (?, ?, ?);
  `, [title, body, created], function resp(err) {
    if (err) {
      const stringerr = typeof err === 'string' ? err : JSON.stringify(err);

      return res.status(500).json({
        msg: 'Error adding note',
        dirtyError: stringerr,
      });
    }

    return res.json({
      id: this.lastID,
    });
  });
});
router.put('/notes/:id', (req, res) => {
  const {
    title,
    body,
  } = req.body;
  const { id } = req.params;

  if (!title || !body) {
    return res.status(400).json({ err: 'missing data' });
  }

  return dba.run(`
    UPDATE notes
    SET title = ?,
        body = ?
    WHERE id = ?
  `, [title, body, id], (err) => {
    if (err) {
      const stringerr = typeof err === 'string' ? err : JSON.stringify(err);
      return res.status(400).json({
        msg: 'Error updating note',
        dirtyError: stringerr,
      });
    }

    return res.json({
      status: 'ok',
    });
  });
});
router.delete('/notes/:id', (req, res) => {
  const { id } = req.params;

  return dba.run(`
    DELETE FROM notes
    WHERE rowid = ?;
  `, [id], (err) => {
    if (err) {
      const stringerr = typeof err === 'string' ? err : JSON.stringify(err);
      return res.status(400).json({
        msg: 'Error deleting note',
        dirtyError: stringerr,
      });
    }

    return res.json({
      status: 'ok',
    });
  });
});

export default router;
