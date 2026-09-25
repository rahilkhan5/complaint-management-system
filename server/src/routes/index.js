import { Router } from 'express'
import authRoutes from './auth.routes.js'
import complaintRoutes from './complaint.routes.js'
import healthRoutes from './health.routes.js'
import userRoutes from './user.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/complaints', complaintRoutes)
router.use('/users', userRoutes)

export default router
