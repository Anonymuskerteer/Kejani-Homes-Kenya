const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/authMiddleware');
const {
  getApiStats,
  getApiKeys,
  getApiKey,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  regenerateApiKeySecret,
  toggleApiKeyStatus,
  getIntegrationTemplates,
  getIntegrations,
  getIntegration,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  toggleIntegrationStatus,
  testIntegration
} = require('../controllers/apiManagementController');

// All routes require authentication and admin role
router.use(auth);
router.use(requireRole(['admin']));

// API Statistics
router.get('/stats', getApiStats);

// API Keys routes
router.route('/keys')
  .get(getApiKeys)
  .post(createApiKey);

router.route('/keys/:id')
  .get(getApiKey)
  .put(updateApiKey)
  .delete(deleteApiKey);

router.post('/keys/:id/regenerate', regenerateApiKeySecret);
router.patch('/keys/:id/toggle', toggleApiKeyStatus);

// Integration templates
router.get('/integrations/templates', getIntegrationTemplates);

// Integrations routes
router.route('/integrations')
  .get(getIntegrations)
  .post(createIntegration);

router.route('/integrations/:id')
  .get(getIntegration)
  .put(updateIntegration)
  .delete(deleteIntegration);

router.patch('/integrations/:id/toggle', toggleIntegrationStatus);
router.post('/integrations/:id/test', testIntegration);

module.exports = router;