import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Home() {
  const features = [
    {
      title: "Student Registration",
      description: "Easily register new students with all necessary details.",
      icon: "📝",
      path: "/register"
    },
    {
      title: "Attendance Tracking",
      description: "Quickly take attendance with our intuitive interface.",
      icon: "✅",
      path: "/attendance"
    },
    {
      title: "Teacher Dashboard",
      description: "Comprehensive overview of class statistics and trends.",
      icon: "📊",
      path: "/teacher-dashboard"
    },
    {
      title: "Student Portal",
      description: "Students can view their attendance records and progress.",
      icon: "👨‍🎓",
      path: "/student-dashboard"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Modern School <span className="text-indigo-600">Attendance System</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Streamline your school's attendance tracking with our easy-to-use platform designed for teachers and students.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/teacher-dashboard"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-gray-100 transition-colors border border-indigo-600"
            >
              View Demo
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            whileHover={{ y: -10, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600 mb-4">{feature.description}</p>
            <Link
              to={feature.path}
              className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors inline-flex items-center"
            >
              Learn more
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        ))}
      </motion.section>
    </div>
  )
}