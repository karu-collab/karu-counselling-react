import  { useState } from 'react';
import {
    Calendar,
    User,
    AlertCircle,
    TrendingUp,
    Video,
    MapPin,
    Bell,
    Plus,
    ChevronRight,
    Pill,
    Shield,
    Loader2,
} from 'lucide-react';
import {useAuth} from "../../context/AuthContext.tsx";

const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedTimeframe, setSelectedTimeframe] = useState('week');

   // const [aiAnalysedImageResponse, setAiAnalysedImageResponse] = useState('') todo: this is part of the medgemma feature to be implemented
    const {user} = useAuth();

    // Mock data
    const upcomingAppointments = [
        {
            id: 1,
            doctor: "Dr. Sarah Johnson",
            specialty: "Cardiologist",
            date: "Today",
            time: "2:30 PM",
            type: "video",
            status: "confirmed"
        },
        {
            id: 2,
            doctor: "Dr. Michael Chen",
            specialty: "General Practice",
            date: "Tomorrow",
            time: "10:00 AM",
            type: "in-person",
            status: "confirmed"
        },
        {
            id: 3,
            doctor: "Dr. Emily Rodriguez",
            specialty: "Dermatologist",
            date: "Jun 20",
            time: "3:15 PM",
            type: "in-person",
            status: "pending"
        }
    ];

    const healthMetrics = [
        { name: "Blood Pressure", value: "120/80", unit: "mmHg", status: "normal", trend: "stable" },
        { name: "Heart Rate", value: "72", unit: "bpm", status: "normal", trend: "down" },
        { name: "Weight", value: "68.5", unit: "kg", status: "normal", trend: "up" },
        { name: "Temperature", value: "98.6", unit: "°F", status: "normal", trend: "stable" }
    ];

    const recentActivity = [
        { type: "appointment", message: "Completed appointment with Dr. Johnson", time: "2 hours ago" },
        { type: "medication", message: "Medication reminder: Take Lisinopril", time: "4 hours ago" },
        { type: "result", message: "Lab results available for Blood Panel", time: "1 day ago" },
        { type: "message", message: "New message from Dr. Chen's office", time: "2 days ago" }
    ];

    const medications = [
        { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", nextDose: "8:00 AM tomorrow" },
        { name: "Metformin", dosage: "500mg", frequency: "Twice daily", nextDose: "6:00 PM today" }
    ];

    const renderOverview = () =>{
        return(
            <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-8">


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Health Metrics */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Health Metrics</h2>
                                <select
                                    value={selectedTimeframe}
                                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                                    className="text-sm border border-gray-300 rounded-lg px-3 py-1"
                                >
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="year">This Year</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {healthMetrics.map((metric) => (
                                    <div key={metric.name} className="p-4 border border-gray-100 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                metric.status === 'normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                            {metric.status}
                          </span>
                                        </div>
                                        <div className="flex items-end space-x-2">
                                            <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                                            <span className="text-sm text-gray-500">{metric.unit}</span>
                                            <div className="flex items-center ml-auto">
                                                {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                                                {metric.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                                                {metric.trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full"></div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image Analysis */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">AI Image Analysis</h2>
                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Upload Image</button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Under Development</h3>
                                    <p className="text-sm text-gray-600 text-center max-w-sm">
                                        AI-powered image analysis for medical conditions is currently being developed.
                                        This feature will allow you to upload images for preliminary analysis.
                                    </p>
                                    <div className="mt-4 flex items-center space-x-2">
                                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="h-2 w-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Appointments */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                            </div>

                            <div className="space-y-4">
                                {upcomingAppointments.map((appointment) => (
                                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{appointment.doctor}</h3>
                                                <p className="text-sm text-gray-600">{appointment.specialty}</p>
                                                <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                  {appointment.date} at {appointment.time}
                              </span>
                                                    <span className="flex items-center text-sm text-gray-500">
                                {appointment.type === 'video' ? <Video className="h-4 w-4 mr-1" /> : <MapPin className="h-4 w-4 mr-1" />}
                                                        {appointment.type === 'video' ? 'Video Call' : 'In Person'}
                              </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">

                        {/* Medications */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Medications</h2>
                                <button className="text-sm text-blue-600 hover:text-blue-700">Manage</button>
                            </div>

                            <div className="space-y-3">
                                {medications.map((med, index) => (
                                    <div key={index} className="p-3 border border-gray-100 rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{med.name}</h3>
                                                <p className="text-sm text-gray-600">{med.dosage} • {med.frequency}</p>
                                                <p className="text-xs text-gray-500 mt-1">Next: {med.nextDose}</p>
                                            </div>
                                            <Pill className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>

                            <div className="space-y-3">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${
                                            activity.type === 'appointment' ? 'bg-blue-500' :
                                                activity.type === 'medication' ? 'bg-green-500' :
                                                    activity.type === 'result' ? 'bg-purple-500' : 'bg-gray-500'
                                        }`}></div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900">{activity.message}</p>
                                            <p className="text-xs text-gray-500">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Health Alerts */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Alerts</h2>

                            <div className="space-y-3">
                                <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">Annual Checkup Due</p>
                                        <p className="text-xs text-yellow-700">Schedule your yearly physical exam</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">Flu Vaccine Available</p>
                                        <p className="text-xs text-blue-700">Book your seasonal vaccination</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-50">


            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Health Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {user?.first_name || user?.last_name}! Here's your health overview.</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                                <Bell className="h-6 w-6" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                            </button>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>New Appointment</span>
                            </button>
                        </div>
                    </div>
                </header>
                {/* Navigation Tabs */}
                <nav className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex space-x-8">
                            {['overview','appointments', 'My Records', 'alerts','Emergency Hotlines','Providers' ].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                                        activeTab === tab
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {activeTab === 'overview' && renderOverview()}
                    </div>
                </main>

            </div>
        </div>
    );
};

export default UserDashboard;