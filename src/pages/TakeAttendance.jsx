import { useState } from 'react'
import { motion } from 'framer-motion'

export default function TakeAttendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents] = useState([
    { id: 1, name: 'John Doe', present: false },
    { id: 2, name: 'Jane Smith', present: false },
    { id: 3, name: 'Michael Johnson', present: false },
    { id: 4, name: 'Emily Davis', present: false },
    { id: 5, name: 'Robert Wilson', present: false },
  ])

  const toggleAttendance = (id) => {
    setStudents(students.map(student => 
      student.id === id ? { ...student, present: !student.present } : student
    ))
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Take Attendance</h1>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white shadow-lg rounded-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="">Select class</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Student List</h2>
          
          {students.map((student) => (
            <motion.div
              key={student.id}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <span className="text-gray-700">{student.name}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleAttendance(student.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  student.present
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {student.present ? 'Present' : 'Absent'}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8"
        >
          <button
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
          >
            Submit Attendance
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}