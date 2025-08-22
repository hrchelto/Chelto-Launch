import React, { useState } from 'react';
import { Store, Mail, User, Phone, MapPin, Calendar, CheckCircle, Share2, Clock, Gift as Gift2, Zap, Copy, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WhatsappShareButton, FacebookShareButton, TwitterShareButton, WhatsappIcon, FacebookIcon, TwitterIcon } from 'react-share';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  city: string;
}

interface RetrieveData {
  email: string;
  phoneNumber: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phoneNumber: '',
    city: ''
  });
  const [retrieveData, setRetrieveData] = useState<RetrieveData>({
    email: '',
    phoneNumber: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showRetrieve, setShowRetrieve] = useState(false);
  const [error, setError] = useState('');
  const [retrieveError, setRetrieveError] = useState('');
  const [promocode, setPromocode] = useState('');
  const [retrievedPromocode, setRetrievedPromocode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const cities = [
    { name: 'Chilakaluripet', isLaunching: false },
    { name: 'Guntur', isLaunching: true, launchDate: 'February 15th, 2025' },
    { name: 'Narasarao Pet', isLaunching: false },
    { name: 'Vinukonda', isLaunching: false }
  ];

  const shareUrl = window.location.href;
  const shareTitle = "🎉 Chelto is launching in Guntur City! Get ₹250 promocode by registering now!";

  // Generate unique promocode
  const generatePromocode = () => {
    const prefix = 'CHELTO';
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${randomNum}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleRetrieveInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRetrieveData(prev => ({
      ...prev,
      [name]: value
    }));
    setRetrieveError('');
  };

  const checkExistingUser = async (email: string, phoneNumber: string) => {
    const q = query(
      collection(db, 'launch-registrations'),
      where('email', '==', email)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { exists: true, type: 'email' };
    }

    const phoneQuery = query(
      collection(db, 'launch-registrations'),
      where('phoneNumber', '==', phoneNumber)
    );
    const phoneSnapshot = await getDocs(phoneQuery);
    
    if (!phoneSnapshot.empty) {
      return { exists: true, type: 'phone' };
    }

    return { exists: false, type: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Check for existing registration
      const existingUser = await checkExistingUser(formData.email, formData.phoneNumber);
      
      if (existingUser.exists) {
        setError(`This ${existingUser.type} is already registered. Use "Get Promocode" to retrieve your code.`);
        setIsLoading(false);
        return;
      }

      // Generate promocode
      const newPromocode = generatePromocode();
      
      // Save to Firebase
      await addDoc(collection(db, 'launch-registrations'), {
        ...formData,
        promocode: newPromocode,
        registeredAt: new Date(),
        promocodeAmount: 250,
        status: 'registered'
      });
      
      setPromocode(newPromocode);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error saving registration:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrievePromocode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRetrieving(true);
    setRetrieveError('');
    
    try {
      const q = query(
        collection(db, 'launch-registrations'),
        where('email', '==', retrieveData.email),
        where('phoneNumber', '==', retrieveData.phoneNumber)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setRetrieveError('No registration found with these details. Please register first.');
      } else {
        const userData = querySnapshot.docs[0].data();
        setRetrievedPromocode(userData.promocode);
      }
    } catch (err) {
      console.error('Error retrieving promocode:', err);
      setRetrieveError('Failed to retrieve promocode. Please try again.');
    } finally {
      setIsRetrieving(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const isFormValid = formData.name.trim() !== '' && 
                     formData.email.trim() !== '' && 
                     formData.phoneNumber.trim() !== '' && 
                     formData.city.trim() !== '';

  const isRetrieveValid = retrieveData.email.trim() !== '' && 
                         retrieveData.phoneNumber.trim() !== '';

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful! 🎉</h2>
          <p className="text-gray-600 mb-6">
            Welcome to Chelto, <span className="font-semibold text-orange-600">{formData.name}</span>!
          </p>
          
          {/* Promocode Display */}
          <div className="bg-gradient-to-r from-orange-100 to-purple-100 rounded-xl p-6 mb-6">
            <Gift2 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-700 font-medium mb-3">Your Promocode:</p>
            <div className="bg-white rounded-lg p-4 border-2 border-dashed border-orange-300">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-600 tracking-wider">{promocode}</span>
                <button
                  onClick={() => copyToClipboard(promocode)}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copySuccess && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-sm mt-2"
                >
                  Copied to clipboard! ✓
                </motion.p>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Save this code! You'll get ₹250 off on your first order in {formData.city}
            </p>
          </div>

          <button
            onClick={() => setShowShare(!showShare)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 mb-4"
          >
            <Share2 className="w-5 h-5 inline mr-2" />
            Share with Friends
          </button>

          {showShare && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center space-x-4 mb-4"
            >
              <WhatsappShareButton url={shareUrl} title={shareTitle}>
                <WhatsappIcon size={40} round />
              </WhatsappShareButton>
              <FacebookShareButton url={shareUrl} title={shareTitle}>
                <FacebookIcon size={40} round />
              </FacebookShareButton>
              <TwitterShareButton url={shareUrl} title={shareTitle}>
                <TwitterIcon size={40} round />
              </TwitterShareButton>
            </motion.div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Register Another User
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div>
             <img src="/image.png" alt="Chelto Logo" className="w-14 h-14" />
            </div>
              <div>
                <h1 className="text-2xl font-serif">CHELTO</h1>
                <p className="text-sm text-gray-600 font-medium">Grocery | Food | Medicines</p>
                <p className="text-xs text-orange-600 font-semibold">Single Cart Delivery</p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {/* Get Promocode Button - Mobile */}
              <button
                onClick={() => setShowRetrieve(!showRetrieve)}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-1 text-sm"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Get Promocode</span>
              </button>
              
              {/* Share Button */}
              <button
                onClick={() => setShowShare(!showShare)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-1 text-sm"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
          
          {/* Share Options */}
          <AnimatePresence>
            {showShare && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex justify-center space-x-4 pb-2"
              >
                <WhatsappShareButton url={shareUrl} title={shareTitle}>
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>
                <FacebookShareButton url={shareUrl} title={shareTitle}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} title={shareTitle}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Get Promocode Section */}
          <AnimatePresence>
            {showRetrieve && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-gray-50 rounded-xl p-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">Retrieve Your Promocode</h3>
                {retrieveError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
                    {retrieveError}
                  </div>
                )}
                {retrievedPromocode && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3"
                  >
                    <p className="text-green-700 text-sm mb-2">Your Promocode:</p>
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-300">
                      <span className="text-xl font-bold text-green-600 tracking-wider">{retrievedPromocode}</span>
                      <button
                        onClick={() => copyToClipboard(retrievedPromocode)}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copySuccess && (
                      <p className="text-green-600 text-sm mt-2">Copied to clipboard! ✓</p>
                    )}
                  </motion.div>
                )}
                <form onSubmit={handleRetrievePromocode} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="email"
                      name="email"
                      value={retrieveData.email}
                      onChange={handleRetrieveInputChange}
                      placeholder="Enter your email"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm"
                      required
                    />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={retrieveData.phoneNumber}
                      onChange={handleRetrieveInputChange}
                      placeholder="Enter your phone"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isRetrieveValid || isRetrieving}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                  >
                    {isRetrieving ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Retrieving...</span>
                      </div>
                    ) : (
                      'Get My Promocode'
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Opening Soon!</h2>
            <p className="text-xl md:text-2xl opacity-90">Your favorite everything store is coming to your city</p>
          </motion.div>

          {/* Cities Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {cities.map((city, index) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl backdrop-blur-sm ${
                  city.isLaunching 
                    ? 'bg-white/30 border-2 border-white/50 shadow-lg' 
                    : 'bg-white/10 border border-white/20'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <MapPin className={`w-5 h-5 ${city.isLaunching ? 'text-yellow-300' : 'text-white/70'}`} />
                </div>
                <h3 className={`font-bold text-lg ${city.isLaunching ? 'text-white' : 'text-white/80'}`}>
                  {city.name}
                </h3>
                {city.isLaunching && (
                  <div className="mt-2">
                    <div className="flex items-center justify-center space-x-1 text-yellow-300 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">{city.launchDate}</span>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="mt-2 bg-yellow-400 text-orange-900 px-3 py-1 rounded-full text-xs font-bold"
                    >
                      LAUNCHING FIRST! 🚀
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Promotional Animation */}
      <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-500 py-4">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
          className="whitespace-nowrap text-white font-bold text-lg flex items-center space-x-8"
        >
          <span className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>HURRY UP! Register now to get ₹250 promocode!</span>
          </span>
          <span className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Limited time offer - Don't miss out!</span>
          </span>
          <span className="flex items-center space-x-2">
            <Gift2 className="w-5 h-5" />
            <span>Early bird special - ₹250 credit waiting for you!</span>
          </span>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Registration Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-purple-100 rounded-full px-6 py-3 mb-6">
            <Gift2 className="w-6 h-6 text-orange-600" />
            <span className="text-orange-800 font-semibold text-lg">Exclusive Launch Offer</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600">₹250</span> Credit
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Be among the first to experience Chelto in Guntur City! Register before launch and receive an exclusive 
            ₹250 credit for your first order. Don't miss this limited-time opportunity!
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Reserve Your Spot</h3>
            <p className="text-gray-600">Join our exclusive pre-launch community</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-3">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-3">
                  City *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 text-gray-900"
                    required
                  >
                    <option value="">Select your city</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name} {city.isLaunching ? '(Launching First!)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-6 rounded-xl transition-all duration-300 transform hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registering...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Gift2 className="w-6 h-6" />
                  <span>Claim Your ₹250 Credit Now!</span>
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-400 to-purple-400 rounded-full flex items-center justify-center mt-1">
                <Gift2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">What you'll get:</h4>
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span>₹250 credit for your first order</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Early access to exclusive deals and offers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    <span>Priority customer support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span>First to know about new product launches</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            Can't wait to serve you at Chelto! Follow us for updates and behind-the-scenes content.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;