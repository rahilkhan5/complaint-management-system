import { Router } from 'express'
import { createStaff, listUsers, updateUser } from '../controllers/user.controller.js'
import { authorize, protect } from '../middleware/auth.js'

const router = Router()

// Only admins manage accounts
router.use(protect, authorize('admin'))

router.get('/', listUsers)
router.post('/', createStaff)
router.patch('/:id', updateUser)

export default router
