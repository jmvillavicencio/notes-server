import express from 'express';
import dba from '../lib/dba';

const router = express.Router();

router.get('/notes', (req, res) => {
  dba.all(`
    SELECT id, title, body, created, updated
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
  } = req.body;

  if (!title || !body) {
    res.status(400).json({ err: 'missing data' });
    return;
  }
  const created = new Date().getTime();
  dba.run(`
    INSERT INTO notes(title, body, created, updated)
    VALUES (?, ?, ?, ?);
  `, [title, body, created, created], function resp(err) {
    if (err) {
      const stringerr = typeof err === 'string' ? err : JSON.stringify(err);

      res.status(500).json({
        msg: 'Error adding note',
        dirtyError: stringerr,
      });
      return;
    }

    res.json({
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
  const updated = new Date().getTime();

  return dba.run(`
    UPDATE notes
    SET title = ?,
        body = ?,
        updated= ?
    WHERE id = ?
  `, [title, body, updated, id], (err) => {
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
