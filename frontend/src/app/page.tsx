'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  SparklesIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  CubeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import LoginModal from '@/components/auth/LoginModal';
import SignupModal from '@/components/auth/SignupModal';
import VideoModal from '@/components/ui/VideoModal';
import { useAuthStore } from '@/store/authStore';
import ChatAssistant from '@/components/ai/ChatAssistant';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  // Parallax effect for background
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['-5deg', '5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['5deg', '-5deg']);

  useEffect(() => {
    setMounted(true);
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPos = (clientX / innerWidth - 0.5) * 2;
      const yPos = (clientY / innerHeight - 0.5) * 2;
      
      x.set(xPos);
      y.set(yPos);
      setMousePosition({ x: clientX, y: clientY });
    };

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [x, y]);

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const features = [
    {
      icon: CalendarIcon,
      title: 'Smart Scheduling',
      description: 'AI-powered booking optimization',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Unified Inbox',
      description: 'All communications in one place',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: CubeIcon,
      title: 'Inventory Tracking',
      description: 'Real-time stock alerts',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Predictive insights & trends',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const stats = [
    { value: '10k+', label: 'Active Users', icon: UserGroupIcon },
    { value: '50k+', label: 'Bookings', icon: CalendarIcon },
    { value: '99.9%', label: 'Uptime', icon: ShieldCheckIcon },
    { value: '4.9/5', label: 'Rating', icon: StarIcon }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Business Owner',
      content: 'CareOps transformed how we manage our business. The AI insights are incredible!',
      rating: 5,
      image: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Clinic Director',
      content: 'Best decision we made. Our efficiency improved by 40% in just 2 months.',
      rating: 5,
      image: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Salon Owner',
      content: 'The unified platform replaced 5 different tools. Saves us hours every day.',
      rating: 5,
      image: 'ER'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 overflow-hidden relative">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {dimensions.width > 0 && [...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
              transition: {
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                ease: "linear"
              }
            }}
            style={{
              opacity: Math.random() * 0.3 + 0.1,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-40 -right-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-20 left-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-xl blur-lg opacity-50" />
              <div className="relative w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold text-white">CareOps</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogin(true)}
              className="px-6 py-2.5 text-white font-medium hover:text-purple-200 transition-colors"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSignup(true)}
              className="px-6 py-2.5 bg-white text-gray-900 rounded-xl font-medium hover:shadow-xl transition-all hover:scale-105"
            >
              Get Started
              <ArrowRightIcon className="w-4 h-4 ml-2 inline" />
            </motion.button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full text-white mb-6"
            >
              <SparklesIcon className="w-4 h-4 mr-2 text-yellow-300" />
              <span className="text-sm">AI-Powered Operations Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              Transform Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Business Operations
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-white/70 mt-6 max-w-lg"
            >
              Replace 5+ tools with one AI-powered platform. Automate bookings, communication, inventory, and get predictive insights.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center space-x-4 mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSignup(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transition-all flex items-center"
              >
                Start Free Trial
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVideo(true)}  // ✅ This is correct
                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
              >
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-4 gap-6 mt-12"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -4 }}
                    className="text-center"
                  >
                    <Icon className="w-6 h-6 text-white/50 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/50">{stat.label}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Content - Animated Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            style={{
              rotateX,
              rotateY,
              perspective: 1000
            }}
            className="relative"
          >
            <div className="relative">
              {/* Main Dashboard Card */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl"
              >
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl" />
                    <div className="w-20 h-3 bg-white/20 rounded-full" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/10 rounded-lg" />
                    <div className="w-8 h-8 bg-white/10 rounded-lg" />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.02, 1],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                      }}
                      className="bg-white/5 rounded-xl p-4"
                    >
                      <div className="w-16 h-4 bg-white/10 rounded-full mb-2" />
                      <div className="w-24 h-6 bg-white/20 rounded-full" />
                    </motion.div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="bg-white/5 rounded-xl p-4 h-32 flex items-end space-x-2">
                  {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [height, height + 10, height],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                      }}
                      className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg"
                      style={{ height } as React.CSSProperties}
                    />
                  ))}
                </div>

                {/* Activity Feed */}
                <div className="mt-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        x: [0, 5, 0],
                      }}
                      transition={{
                        duration: 3,
                        delay: i * 0.2,
                        repeat: Infinity,
                      }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-white/10 rounded-full" />
                      <div className="flex-1">
                        <div className="w-32 h-3 bg-white/20 rounded-full mb-2" />
                        <div className="w-24 h-2 bg-white/10 rounded-full" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{
                  x: [0, 20, 0],
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-2xl flex items-center justify-center"
              >
                <SparklesIcon className="w-10 h-10 text-white" />
              </motion.div>

              <motion.div
                animate={{
                  x: [0, -20, 0],
                  y: [0, 20, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-8 -left-8 w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl shadow-2xl flex items-center justify-center"
              >
                <ChartBarIcon className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            AI-powered tools to streamline your entire operation
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:shadow-2xl transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} p-3 mb-4`}>
                  <Icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Trusted by Thousands of Businesses
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            See what our customers have to say
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.image}
                </div>
                <div className="ml-4">
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-white/60 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-white/80 mb-4">"{testimonial.content}"</p>
              <div className="flex items-center">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]" />
          
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <h2 className="text-4xl font-bold text-white mb-4 relative z-10">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto relative z-10">
            Join thousands of businesses using CareOps to streamline their operations
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSignup(true)}
            className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all relative z-10"
          >
            Start Your Free Trial
            <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <SparklesIcon className="w-5 h-5 text-white/60" />
            <span className="text-white/60 text-sm">© 2026 CareOps. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Privacy</a>
            <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Terms</a>
            <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Contact</a>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}
       <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSwitchToSignup={() => {
        setShowLogin(false);
        setShowSignup(true);
      }} />
      
      <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} onSwitchToLogin={() => {
        setShowSignup(false);
        setShowLogin(true);
      }} />

      {/* Video Modal */}
      <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} />
        {/* AI Chatbot - Visible on landing page */}
      <ChatAssistant />
      {/* Designed & Developed by Aarzoo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-center py-4"
      >
        <p className="text-white/40 text-xs tracking-wider">
          DESIGNED & DEVELOPED BY
        </p>
        <motion.p
          whileHover={{ scale: 1.05 }}
          className="text-white text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          AARZOO
        </motion.p>
        <p className="text-white/20 text-xs mt-1">© 2026</p>
      </motion.div>
    </div>
  );
}