const db = require('../config/firebase');

// Get User Profile
const getProfile = async (req, res) => {
  const userRef = db.collection('users').doc(req.userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) return res.status(404).json({ message: 'User not found' });

  res.json(userDoc.data());
};

// Update User Profile
const updateProfile = async (req, res) => {
  const { weight, height, activityFrequency, theme } = req.body;
  const userRef = db.collection('users').doc(req.userId);

  await userRef.update({
    weight,
    height,
    activityFrequency,
    theme,
  });

  res.json({ message: 'Profile updated successfully' });
};

module.exports = { getProfile, updateProfile };
