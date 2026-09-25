import { Router } from 'express'
import {
  addComment,
  assignComplaint,
  createComplaint,
  getComplaint,
  getStats,
  listComplaints,
  updateStatus,
} from '../controllers/complaint.controller.js'
import { authorize, protect } from '../middleware/auth.js'

const router = Router()

// Every complaint route needs a logged in user
router.use(protect)

router.get('/', listComplaints)
router.get('/stats', getStats)
router.post('/', authorize('resident'), createComplaint)
router.get('/:id', getComplaint)
router.patch('/:id/status', updateStatus)
router.patch('/:id/assign', authorize('admin'), assignComplaint)
router.post('/:id/comments', addComment)

export default router
