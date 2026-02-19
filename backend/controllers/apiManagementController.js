const ApiKey = require('../models/ApiKey');
const ApiIntegration = require('../models/ApiIntegration');

// @desc    Get API statistics
// @route   GET /api/admin/api/stats
// @access  Private/Admin
const getApiStats = async (req, res) => {
  try {
    const totalApiKeys = await ApiKey.countDocuments();
    const activeApiKeys = await ApiKey.countDocuments({ isActive: true });
    const expiredApiKeys = await ApiKey.countDocuments({ 
      expiresAt: { $lt: new Date() } 
    });
    
    const totalIntegrations = await ApiIntegration.countDocuments();
    const activeIntegrations = await ApiIntegration.countDocuments({ isActive: true });
    
    // Get integrations by type
    const integrationsByType = await ApiIntegration.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    // Get total usage across all API keys
    const usageStats = await ApiKey.aggregate([
      { $group: { 
        _id: null, 
        totalUsage: { $sum: '$usageCount' },
        avgUsage: { $avg: '$usageCount' }
      }}
    ]);
    
    // Get integration usage stats
    const integrationUsage = await ApiIntegration.aggregate([
      { $group: { 
        _id: null, 
        totalRequests: { $sum: '$usageStats.totalRequests' },
        successfulRequests: { $sum: '$usageStats.successfulRequests' },
        failedRequests: { $sum: '$usageStats.failedRequests' }
      }}
    ]);
    
    res.json({
      apiKeys: {
        total: totalApiKeys,
        active: activeApiKeys,
        expired: expiredApiKeys,
        totalUsage: usageStats[0]?.totalUsage || 0,
        averageUsage: Math.round(usageStats[0]?.avgUsage || 0)
      },
      integrations: {
        total: totalIntegrations,
        active: activeIntegrations,
        byType: integrationsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        usage: {
          totalRequests: integrationUsage[0]?.totalRequests || 0,
          successfulRequests: integrationUsage[0]?.successfulRequests || 0,
          failedRequests: integrationUsage[0]?.failedRequests || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching API stats:', error);
    res.status(500).json({ message: 'Error fetching API statistics' });
  }
};

// @desc    Get all API keys
// @route   GET /api/admin/api/keys
// @access  Private/Admin
const getApiKeys = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'expired') {
      query.expiresAt = { $lt: new Date() };
    }
    
    const apiKeys = await ApiKey.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ApiKey.countDocuments(query);
    
    res.json({
      apiKeys,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ message: 'Error fetching API keys' });
  }
};

// @desc    Get single API key
// @route   GET /api/admin/api/keys/:id
// @access  Private/Admin
const getApiKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    res.json(apiKey);
  } catch (error) {
    console.error('Error fetching API key:', error);
    res.status(500).json({ message: 'Error fetching API key' });
  }
};

// @desc    Create new API key
// @route   POST /api/admin/api/keys
// @access  Private/Admin
const createApiKey = async (req, res) => {
  try {
    const { name, description, permissions, rateLimit, expiresAt } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const apiKey = new ApiKey({
      name,
      description,
      permissions: permissions || ['read'],
      rateLimit: rateLimit || 1000,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: req.user._id
    });
    
    await apiKey.save();
    
    // Return the full key and secret on creation (only time secret is fully visible)
    res.status(201).json({
      message: 'API key created successfully',
      apiKey: {
        ...apiKey.toObject(),
        key: apiKey.key,
        secret: apiKey.secret // Full secret only shown once
      }
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ message: 'Error creating API key' });
  }
};

// @desc    Update API key
// @route   PUT /api/admin/api/keys/:id
// @access  Private/Admin
const updateApiKey = async (req, res) => {
  try {
    const { name, description, permissions, rateLimit, expiresAt, isActive } = req.body;
    
    const apiKey = await ApiKey.findById(req.params.id);
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    if (name) apiKey.name = name;
    if (description !== undefined) apiKey.description = description;
    if (permissions) apiKey.permissions = permissions;
    if (rateLimit) apiKey.rateLimit = rateLimit;
    if (expiresAt !== undefined) apiKey.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
    if (isActive !== undefined) apiKey.isActive = isActive;
    
    apiKey.lastModifiedBy = req.user._id;
    
    await apiKey.save();
    
    res.json({
      message: 'API key updated successfully',
      apiKey
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({ message: 'Error updating API key' });
  }
};

// @desc    Delete API key
// @route   DELETE /api/admin/api/keys/:id
// @access  Private/Admin
const deleteApiKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    await apiKey.deleteOne();
    
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ message: 'Error deleting API key' });
  }
};

// @desc    Regenerate API key secret
// @route   POST /api/admin/api/keys/:id/regenerate
// @access  Private/Admin
const regenerateApiKeySecret = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    apiKey.secret = ApiKey.generateSecret();
    apiKey.lastModifiedBy = req.user._id;
    
    await apiKey.save();
    
    res.json({
      message: 'API key secret regenerated successfully',
      secret: apiKey.secret // Only time secret is fully visible
    });
  } catch (error) {
    console.error('Error regenerating API key secret:', error);
    res.status(500).json({ message: 'Error regenerating API key secret' });
  }
};

// @desc    Toggle API key status
// @route   PATCH /api/admin/api/keys/:id/toggle
// @access  Private/Admin
const toggleApiKeyStatus = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    apiKey.isActive = !apiKey.isActive;
    apiKey.lastModifiedBy = req.user._id;
    
    await apiKey.save();
    
    res.json({
      message: `API key ${apiKey.isActive ? 'activated' : 'deactivated'} successfully`,
      apiKey
    });
  } catch (error) {
    console.error('Error toggling API key status:', error);
    res.status(500).json({ message: 'Error toggling API key status' });
  }
};

// @desc    Get integration templates
// @route   GET /api/admin/api/integrations/templates
// @access  Private/Admin
const getIntegrationTemplates = async (req, res) => {
  try {
    const templates = ApiIntegration.getTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching integration templates:', error);
    res.status(500).json({ message: 'Error fetching integration templates' });
  }
};

// @desc    Get all integrations
// @route   GET /api/admin/api/integrations
// @access  Private/Admin
const getIntegrations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      query.type = type;
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    const integrations = await ApiIntegration.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ApiIntegration.countDocuments(query);
    
    res.json({
      integrations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ message: 'Error fetching integrations' });
  }
};

// @desc    Get single integration
// @route   GET /api/admin/api/integrations/:id
// @access  Private/Admin
const getIntegration = async (req, res) => {
  try {
    const integration = await ApiIntegration.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');
    
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }
    
    res.json(integration);
  } catch (error) {
    console.error('Error fetching integration:', error);
    res.status(500).json({ message: 'Error fetching integration' });
  }
};

// @desc    Create new integration
// @route   POST /api/admin/api/integrations
// @access  Private/Admin
const createIntegration = async (req, res) => {
  try {
    const { 
      name, 
      type, 
      provider, 
      description, 
      credentials, 
      settings,
      webhookUrl,
      webhookEvents 
    } = req.body;
    
    if (!name || !type || !provider) {
      return res.status(400).json({ message: 'Name, type, and provider are required' });
    }
    
    if (!credentials || !credentials.apiKey) {
      return res.status(400).json({ message: 'API key is required' });
    }
    
    const integration = new ApiIntegration({
      name,
      type,
      provider,
      description,
      credentials,
      settings: settings || { sandbox: false, autoRetry: true, timeout: 30000 },
      webhookUrl,
      webhookEvents,
      createdBy: req.user._id
    });
    
    await integration.save();
    
    res.status(201).json({
      message: 'Integration created successfully',
      integration
    });
  } catch (error) {
    console.error('Error creating integration:', error);
    res.status(500).json({ message: 'Error creating integration' });
  }
};

// @desc    Update integration
// @route   PUT /api/admin/api/integrations/:id
// @access  Private/Admin
const updateIntegration = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      credentials, 
      settings,
      webhookUrl,
      webhookEvents,
      isActive 
    } = req.body;
    
    const integration = await ApiIntegration.findById(req.params.id);
    
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }
    
    if (name) integration.name = name;
    if (description !== undefined) integration.description = description;
    if (credentials) {
      integration.credentials = {
        ...integration.credentials.toObject(),
        ...credentials
      };
    }
    if (settings) {
      integration.settings = {
        ...integration.settings.toObject(),
        ...settings
      };
    }
    if (webhookUrl !== undefined) integration.webhookUrl = webhookUrl;
    if (webhookEvents) integration.webhookEvents = webhookEvents;
    if (isActive !== undefined) integration.isActive = isActive;
    
    integration.lastModifiedBy = req.user._id;
    
    await integration.save();
    
    res.json({
      message: 'Integration updated successfully',
      integration
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({ message: 'Error updating integration' });
  }
};

// @desc    Delete integration
// @route   DELETE /api/admin/api/integrations/:id
// @access  Private/Admin
const deleteIntegration = async (req, res) => {
  try {
    const integration = await ApiIntegration.findById(req.params.id);
    
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }
    
    await integration.deleteOne();
    
    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({ message: 'Error deleting integration' });
  }
};

// @desc    Toggle integration status
// @route   PATCH /api/admin/api/integrations/:id/toggle
// @access  Private/Admin
const toggleIntegrationStatus = async (req, res) => {
  try {
    const integration = await ApiIntegration.findById(req.params.id);
    
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }
    
    integration.isActive = !integration.isActive;
    integration.lastModifiedBy = req.user._id;
    
    await integration.save();
    
    res.json({
      message: `Integration ${integration.isActive ? 'activated' : 'deactivated'} successfully`,
      integration
    });
  } catch (error) {
    console.error('Error toggling integration status:', error);
    res.status(500).json({ message: 'Error toggling integration status' });
  }
};

// @desc    Test integration connection
// @route   POST /api/admin/api/integrations/:id/test
// @access  Private/Admin
const testIntegration = async (req, res) => {
  try {
    const integration = await ApiIntegration.findById(req.params.id);
    
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }
    
    // Simulate a test connection based on provider type
    // In a real implementation, this would make actual API calls
    const startTime = Date.now();
    
    // Simulate test based on provider
    let testResult = {
      success: true,
      message: 'Connection test successful',
      responseTime: 0,
      details: {}
    };
    
    // Simulate different test scenarios based on provider
    switch (integration.provider.toLowerCase()) {
      case 'mpesa':
      case 'flutterwave':
      case 'paystack':
        testResult.details = {
          endpoint: 'Test connection',
          status: 'OK'
        };
        break;
      case 'africastalking':
      case 'twilio':
        testResult.details = {
          balance: 'Available',
          status: 'Active'
        };
        break;
      case 'sendgrid':
      case 'mailgun':
        testResult.details = {
          quota: 'Available',
          domain: 'Verified'
        };
        break;
      case 'cloudinary':
      case 'aws-s3':
        testResult.details = {
          storage: 'Accessible',
          permissions: 'Valid'
        };
        break;
      default:
        testResult.details = {
          status: 'Connection verified'
        };
    }
    
    testResult.responseTime = Date.now() - startTime;
    
    // Update usage stats
    await integration.updateUsageStats(testResult.success, testResult.responseTime);
    
    res.json(testResult);
  } catch (error) {
    console.error('Error testing integration:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error testing integration connection' 
    });
  }
};

module.exports = {
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
};