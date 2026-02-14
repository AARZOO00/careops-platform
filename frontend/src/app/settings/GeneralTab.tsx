'use client';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BuildingOfficeIcon,
  GlobeAltIcon,
  ClockIcon,
  CurrencyDollarIcon,
  LanguageIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
  CloudArrowUpIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/hooks/useToast';
import { motion as fm } from 'framer-motion';

const businessSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessEmail: z.string().email('Valid email is required'),
  businessPhone: z.string().min(10, 'Valid phone is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
  timezone: z.string(),
  currency: z.string(),
  language: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  weekStartsOn: z.string()
});

type BusinessForm = z.infer<typeof businessSchema>;

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
  { value: 'Asia/Tokyo', label: 'Japan Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

const currencies = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { value: 'CAD', label: 'CAD ($)', symbol: 'C$' },
  { value: 'AUD', label: 'AUD ($)', symbol: 'A$' },
  { value: 'SGD', label: 'SGD ($)', symbol: 'S$' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
];

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

const timeFormats = [
  { value: '12h', label: '12-hour (12:00 PM)' },
  { value: '24h', label: '24-hour (13:00)' },
];

const weekStartDays = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'saturday', label: 'Saturday' },
];

const workingHoursData = [
  { day: 'Monday', open: '09:00', close: '17:00', closed: false },
  { day: 'Tuesday', open: '09:00', close: '17:00', closed: false },
  { day: 'Wednesday', open: '09:00', close: '17:00', closed: false },
  { day: 'Thursday', open: '09:00', close: '17:00', closed: false },
  { day: 'Friday', open: '09:00', close: '17:00', closed: false },
  { day: 'Saturday', open: '10:00', close: '14:00', closed: false },
  { day: 'Sunday', open: '00:00', close: '00:00', closed: true },
];

export default function GeneralTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [workingHours, setWorkingHours] = useState(workingHoursData);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: 'CareOps Demo Workspace',
      businessEmail: 'hello@careops.com',
      businessPhone: '+1 (555) 123-4567',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'United States',
      timezone: 'America/Los_Angeles',
      currency: 'USD',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      weekStartsOn: 'monday'
    }
  });

  const handleWorkingHourChange = (index: number, field: string, value: string | boolean) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingHours(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        showToast('success', 'Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: BusinessForm) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsEditing(false);
    showToast('success', 'Settings saved successfully');
  };

  const SettingSection = ({ title, description, children, onEdit }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        {onEdit && !isEditing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <PencilIcon className="w-4 h-4 mr-1.5" />
            Edit
          </motion.button>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Business Information Section */}
      <SettingSection 
        title="Business Information" 
        description="Your company details and contact information"
        onEdit={true}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Logo Upload */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 transition-colors group">
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <BuildingOfficeIcon className="w-12 h-12 text-indigo-400" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-full shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors group-hover:scale-110">
                    <CloudArrowUpIcon className="w-4 h-4 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Click to upload logo
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG up to 2MB
                </p>
              </div>
            </div>

            {/* Business Details */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <div className="relative">
                    <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('businessName')}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.businessName && (
                    <p className="mt-1 text-xs text-red-600">{errors.businessName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Email
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('businessEmail')}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.businessEmail && (
                    <p className="mt-1 text-xs text-red-600">{errors.businessEmail.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('businessPhone')}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.businessPhone && (
                    <p className="mt-1 text-xs text-red-600">{errors.businessPhone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <DevicePhoneMobileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      }`}
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('address')}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <input
                    {...register('city')}
                    disabled={!isEditing}
                    placeholder="City"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
                <div className="col-span-1">
                  <input
                    {...register('state')}
                    disabled={!isEditing}
                    placeholder="State"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
                <div className="col-span-1">
                  <input
                    {...register('zipCode')}
                    disabled={!isEditing}
                    placeholder="ZIP Code"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
                <div className="col-span-1">
                  <input
                    {...register('country')}
                    disabled={!isEditing}
                    placeholder="Country"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSaving}
                className="relative px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <ArrowPathIcon className="animate-spin w-4 h-4 mr-2 inline" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </motion.button>
            </div>
          )}
        </form>
      </SettingSection>

      {/* Working Hours Section */}
      <SettingSection 
        title="Working Hours" 
        description="Set your business hours and availability"
        onEdit={true}
      >
        <div className="space-y-4">
          {workingHours.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-28">
                <span className="text-sm font-medium text-gray-700">{day.day}</span>
              </div>
              
              {day.closed ? (
                <div className="flex items-center">
                  <span className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">Closed</span>
                  {isEditing && (
                    <button
                      onClick={() => handleWorkingHourChange(index, 'closed', false)}
                      className="ml-3 text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      Set hours
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <select
                    disabled={!isEditing}
                    value={day.open}
                    onChange={(e) => handleWorkingHourChange(index, 'open', e.target.value)}
                    className={`px-3 py-1.5 border rounded-lg text-sm ${
                      isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {Array.from({ length: 48 }, (_, i) => {
                      const hour = Math.floor(i / 2);
                      const minute = i % 2 === 0 ? '00' : '30';
                      const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                      return (
                        <option key={time} value={time}>
                          {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </option>
                      );
                    })}
                  </select>
                  <span className="text-gray-500">to</span>
                  <select
                    disabled={!isEditing}
                    value={day.close}
                    onChange={(e) => handleWorkingHourChange(index, 'close', e.target.value)}
                    className={`px-3 py-1.5 border rounded-lg text-sm ${
                      isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {Array.from({ length: 48 }, (_, i) => {
                      const hour = Math.floor(i / 2);
                      const minute = i % 2 === 0 ? '00' : '30';
                      const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                      return (
                        <option key={time} value={time}>
                          {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </option>
                      );
                    })}
                  </select>
                  {isEditing && (
                    <button
                      onClick={() => handleWorkingHourChange(index, 'closed', true)}
                      className="ml-2 text-xs text-red-600 hover:text-red-700"
                    >
                      Close
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </SettingSection>

      {/* Regional Settings Section */}
      <SettingSection 
        title="Regional Settings" 
        description="Configure timezone, currency, and language preferences"
        onEdit={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GlobeAltIcon className="w-4 h-4 inline mr-1 text-gray-400" />
              Timezone
            </label>
            <select
              {...register('timezone')}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CurrencyDollarIcon className="w-4 h-4 inline mr-1 text-gray-400" />
              Currency
            </label>
            <select
              {...register('currency')}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
            >
              {currencies.map(curr => (
                <option key={curr.value} value={curr.value}>{curr.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LanguageIcon className="w-4 h-4 inline mr-1 text-gray-400" />
              Language
            </label>
            <select
              {...register('language')}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-1 text-gray-400" />
              Date Format
            </label>
            <select
              {...register('dateFormat')}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
            >
              {dateFormats.map(format => (
                <option key={format.value} value={format.value}>{format.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-1 text-gray-400" />
              Time Format
            </label>
            <select
              {...register('timeFormat')}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
            >
              {timeFormats.map(format => (
                <option key={format.value} value={format.value}>{format.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-1 text-gray-400" />
              Week Starts On
            </label>
            <select
              {...register('weekStartsOn')}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
            >
              {weekStartDays.map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </div>
        </div>
      </SettingSection>
    </div>
  );
}