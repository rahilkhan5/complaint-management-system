import { Router } from 'express'
import healthRoutes from './health.routes.js'

const router = Router()

router.use('/health', healthRoutes)

// Add new feature routes here, for example:
// router.use('/auth', authRoutes)
// router.use('/complaints', complaintRoutes)

export default router
