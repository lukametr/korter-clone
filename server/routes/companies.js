const express = require('express');
const Company = require('../models/Company');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find({ isActive: true })
      .populate('owner', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(companies);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
});

// Get single company
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('owner', 'firstName lastName email')
      .populate('employees', 'firstName lastName email');

    if (!company) {
      return res.status(404).json({ message: 'კომპანია ვერ მოიძებნა' });
    }

    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
});

// Create company (requires auth)
router.post('/', auth, async (req, res) => {
  try {
    const company = new Company({
      ...req.body,
      owner: req.user.userId
    });

    await company.save();
    res.status(201).json(company);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
});

module.exports = router; 