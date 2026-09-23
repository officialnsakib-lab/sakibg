// models/Settings.ts
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Wahisnova'
  },
  siteDescription: {
    type: String,
    default: 'Digital Marketplace'
  },
  supportEmail: {
    type: String,
    default: 'support@wahisnova.com'
  },
  defaultCommission: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  logo: String,
  favicon: String,
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  contactEmail: String,
  contactPhone: String,
  address: String,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export default Settings;