import { databaseStatus } from '../config/db.js'
import { isDemoMode } from '../utils/demo.js'

export function getHealth(req, res) {
  res.json({
    status: 'ok',
    database: databaseStatus(),
    uptime: Math.round(process.uptime()),
    demo: isDemoMode(),
  })
}
