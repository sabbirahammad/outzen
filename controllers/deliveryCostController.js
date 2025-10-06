import DeliveryCost from '../models/deliveryCostModel.js';

// 🟢 Get Delivery Costs
export const getDeliveryCosts = async (req, res) => {
  try {
    console.log('🔍 Getting delivery costs...');

    let deliveryCost = await DeliveryCost.findOne();

    // If no delivery costs exist, create default ones
    if (!deliveryCost) {
      console.log('📦 No delivery costs found, creating default...');
      deliveryCost = new DeliveryCost({
        dhakaInside: 60,
        dhakaOutside: 120,
        updatedBy: req.user.id
      });
      await deliveryCost.save();
      console.log('✅ Default delivery costs created');
    }

    res.status(200).json({
      success: true,
      deliveryCosts: {
        dhakaInside: deliveryCost.dhakaInside,
        dhakaOutside: deliveryCost.dhakaOutside
      }
    });
  } catch (error) {
    console.error('❌ Get delivery costs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// 🔵 Update Delivery Costs
export const updateDeliveryCosts = async (req, res) => {
  try {
    console.log('📦 Updating delivery costs...', req.body);

    const { dhakaInside, dhakaOutside } = req.body;

    // Validate input
    if (dhakaInside === undefined || dhakaOutside === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Both dhakaInside and dhakaOutside costs are required'
      });
    }

    if (dhakaInside < 0 || dhakaOutside < 0) {
      return res.status(400).json({
        success: false,
        message: 'Delivery costs cannot be negative'
      });
    }

    // Find existing delivery costs or create new one
    let deliveryCost = await DeliveryCost.findOne();

    if (deliveryCost) {
      // Update existing
      deliveryCost.dhakaInside = dhakaInside;
      deliveryCost.dhakaOutside = dhakaOutside;
      deliveryCost.updatedBy = req.user.id;
      deliveryCost.updatedAt = new Date();
      await deliveryCost.save();
      console.log('✅ Delivery costs updated');
    } else {
      // Create new
      deliveryCost = new DeliveryCost({
        dhakaInside,
        dhakaOutside,
        updatedBy: req.user.id
      });
      await deliveryCost.save();
      console.log('✅ New delivery costs created');
    }

    res.status(200).json({
      success: true,
      message: 'Delivery costs updated successfully',
      deliveryCosts: {
        dhakaInside: deliveryCost.dhakaInside,
        dhakaOutside: deliveryCost.dhakaOutside
      }
    });
  } catch (error) {
    console.error('❌ Update delivery costs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};