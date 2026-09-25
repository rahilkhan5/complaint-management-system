import { Router } from 'express'
import { changePassword, login, me, register, updateMe } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, me)
router.patch('/me', protect, updateMe)
router.patch('/password', protect, changePassword)

export default router
