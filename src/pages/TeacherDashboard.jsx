import { motion } from 'framer-motion'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function TeacherDashboard() {
  const attendanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Present',
        data: [25, 24, 23, 26, 22],
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
      },
      {
        label: 'Absent',
        data: [2, 3, 4, 1, 5],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Attendance Overview',
      },
    },
  }

  const recentActivities = [
    { id: 1, action: 'Marked attendance for Grade 3', time: '2 hours ago' },
    { id: 2, action: 'Added new student: Sarah Johnson', time: '1 day ago' },
    { id: 3, action: 'Updated class information', time: '2 days ago' },
    { id: 4, action: 'Generated attendance report', time: '3 days ago' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto p-6"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Teacher Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <h3 className="text-lg font-medium text-gray-500 mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-indigo-600">127</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <h3 className="text-lg font-medium text-gray-500 mb-2">Today's Attendance</h3>
          <p className="text-3xl font-bold text-green-600">92%</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <h3 className="text-lg font-medium text-gray-500 mb-2">Pending Tasks</h3>
          <p className="text-3xl font-bold text-yellow-600">3</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white p-6 rounded-xl shadow-lg mb-8"
      >
        <Bar options={options} data={attendanceData} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <motion.div 
                key={activity.id}
                whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                className="p-3 border-b border-gray-100 transition-colors"
              >
                <p className="text-gray-800">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-indigo-100 text-indigo-700 p-4 rounded-lg font-medium hover:bg-indigo-200 transition-colors text-center"
            >
              Take Attendance
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-green-100 text-green-700 p-4 rounded-lg font-medium hover:bg-green-200 transition-colors text-center"
            >
              Add New Student
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-blue-100 text-blue-700 p-4 rounded-lg font-medium hover:bg-blue-200 transition-colors text-center"
            >
              Generate Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-purple-100 text-purple-700 p-4 rounded-lg font-medium hover:bg-purple-200 transition-colors text-center"
            >
              View All Students
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}