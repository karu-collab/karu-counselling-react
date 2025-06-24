import  { useState } from 'react';
import { Calendar, Users,  AlertTriangle, Activity, FileText, Bell, Search, Filter, MoreVertical, Phone, Mail, Stethoscope, Heart, Thermometer, Pill } from 'lucide-react';

const MedicalPractitionerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data
    const stats = [
        { label: 'Total Patients', value: '1,247', icon: Users, color: 'bg-blue-500', change: '+12%' },
        { label: 'Today\'s Appointments', value: '24', icon: Calendar, color: 'bg-green-500', change: '+8%' },
        { label: 'Pending Reviews', value: '7', icon: FileText, color: 'bg-yellow-500', change: '-3%' },
        { label: 'Critical Alerts', value: '3', icon: AlertTriangle, color: 'bg-red-500', change: '+2' }
    ];

    const todayAppointments = [
        { id: 1, time: '09:00', patient: 'Sarah Johnson', type: 'Consultation', status: 'confirmed', duration: '30 min' },
        { id: 2, time: '09:30', patient: 'Michael Chen', type: 'Follow-up', status: 'in-progress', duration: '15 min' },
        { id: 3, time: '10:15', patient: 'Emma Wilson', type: 'Check-up', status: 'waiting', duration: '45 min' },
        { id: 4, time: '11:00', patient: 'David Martinez', type: 'Consultation', status: 'pending', duration: '30 min' },
        { id: 5, time: '14:00', patient: 'Lisa Anderson', type: 'Specialist Referral', status: 'confirmed', duration: '20 min' }
    ];

    const recentPatients = [
        { id: 1, name: 'Alice Cooper', age: 45, lastVisit: '2 days ago', condition: 'Hypertension', status: 'stable' },
        { id: 2, name: 'Bob Thompson', age: 32, lastVisit: '1 week ago', condition: 'Diabetes Type 2', status: 'monitoring' },
        { id: 3, name: 'Carol White', age: 58, lastVisit: '3 days ago', condition: 'Arthritis', status: 'treatment' },
        { id: 4, name: 'Daniel Brown', age: 28, lastVisit: '5 days ago', condition: 'Anxiety', status: 'improving' }
    ];

    const alerts = [
        { id: 1, type: 'critical', message: 'Patient John Doe requires immediate attention - BP 180/110', time: '5 min ago' },
        { id: 2, type: 'warning', message: 'Lab results pending for Maria Garcia', time: '2 hours ago' },
        { id: 3, type: 'info', message: 'Appointment reminder: Staff meeting at 3 PM', time: '1 hour ago' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'in-progress': return 'bg-blue-100 text-blue-800';
            case 'waiting': return 'bg-yellow-100 text-yellow-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPatientStatusColor = (status: string) => {
        switch (status) {
            case 'stable': return 'bg-green-100 text-green-800';
            case 'monitoring': return 'bg-yellow-100 text-yellow-800';
            case 'treatment': return 'bg-blue-100 text-blue-800';
            case 'improving': return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'critical': return 'border-l-red-500 bg-red-50';
            case 'warning': return 'border-l-yellow-500 bg-yellow-50';
            case 'info': return 'border-l-blue-500 bg-blue-50';
            default: return 'border-l-gray-500 bg-gray-50';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Stethoscope className="h-8 w-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">MedDash Pro</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search patients..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                                <Bell className="h-6 w-6" />
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                            </button>
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                DR
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {['overview','leeds', 'appointments', 'patients', 'alerts'].map((tab) => (
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => {
                                const IconComponent = stat.icon;
                                return (
                                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                                            </div>
                                            <div className={`p-3 rounded-full ${stat.color}`}>
                                                <IconComponent className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Today's Schedule & Quick Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Today's Appointments */}
                            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
                                <div className="p-6 border-b">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {todayAppointments.map((appointment) => (
                                            <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-sm font-medium text-gray-900">{appointment.time}</div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{appointment.patient}</p>
                                                        <p className="text-sm text-gray-600">{appointment.type} • {appointment.duration}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="p-6 border-b">
                                    <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <button className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        <span className="font-medium text-blue-900">Schedule Appointment</span>
                                    </button>
                                    <button className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                                        <Users className="h-5 w-5 text-green-600" />
                                        <span className="font-medium text-green-900">Add New Patient</span>
                                    </button>
                                    <button className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                                        <FileText className="h-5 w-5 text-purple-600" />
                                        <span className="font-medium text-purple-900">View Lab Results</span>
                                    </button>
                                    <button className="w-full flex items-center space-x-3 p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                                        <Pill className="h-5 w-5 text-yellow-600" />
                                        <span className="font-medium text-yellow-900">Prescribe Medication</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Patients */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All Patients</button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {recentPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{patient.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.age}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{patient.lastVisit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.condition}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPatientStatusColor(patient.status)}`}>
                            {patient.status}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-700">View</button>
                                                    <button className="text-green-600 hover:text-green-700">Contact</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'leeds' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Prospects Seeking You</h2>
                                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                    Refresh
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prospect</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Assessed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Possible Condition</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {recentPatients.concat([
                                    { id: 5, name: 'Jennifer Davis', age: 41, lastVisit: '1 week ago', condition: 'Migraine', status: 'critical' },
                                    { id: 6, name: 'Robert Wilson', age: 65, lastVisit: '4 days ago', condition: 'Heart Disease', status: 'monitoring' }
                                ]).map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{patient.name}</div>
                                            <div className="text-sm text-gray-500">ID: {patient.id.toString().padStart(4, '0')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.age}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <Mail className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{patient.lastVisit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.condition}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPatientStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-700">Analyse</button>
                                                <button className="text-green-600 hover:text-green-700">Divert</button>
                                                <button className="text-red-600 hover:text-purple-700">Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">All Appointments</h2>
                                <div className="flex items-center space-x-3">
                                    <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                        <Filter className="h-4 w-4" />
                                        <span>Filter</span>
                                    </button>
                                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                        New Appointment
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {todayAppointments.concat([
                                    { id: 6, time: '15:30', patient: 'James Wilson', type: 'Surgery Consultation', status: 'confirmed', duration: '60 min' },
                                    { id: 7, time: '16:00', patient: 'Mary Johnson', type: 'Therapy Session', status: 'pending', duration: '45 min' }
                                ]).map((appointment) => (
                                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-sm font-medium text-gray-900">{appointment.time}</div>
                                            <div>
                                                <p className="font-medium text-gray-900">{appointment.patient}</p>
                                                <p className="text-sm text-gray-600">{appointment.type} • {appointment.duration}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                                            <div className="flex items-center space-x-2">
                                                <button className="p-1 text-gray-400 hover:text-blue-600">
                                                    <Phone className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-green-600">
                                                    <Mail className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'patients' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Patient Directory</h2>
                                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                    Add New Patient
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {recentPatients.concat([
                                    { id: 5, name: 'Jennifer Davis', age: 41, lastVisit: '1 week ago', condition: 'Migraine', status: 'stable' },
                                    { id: 6, name: 'Robert Wilson', age: 65, lastVisit: '4 days ago', condition: 'Heart Disease', status: 'monitoring' }
                                ]).map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{patient.name}</div>
                                            <div className="text-sm text-gray-500">ID: {patient.id.toString().padStart(4, '0')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.age}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <Mail className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{patient.lastVisit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.condition}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPatientStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-700">View</button>
                                                <button className="text-green-600 hover:text-green-700">Edit</button>
                                                <button className="text-purple-600 hover:text-purple-700">History</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b">
                                <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {alerts.map((alert) => (
                                    <div key={alert.id} className={`p-4 border-l-4 rounded-lg ${getAlertColor(alert.type)}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{alert.message}</p>
                                                <p className="text-sm text-gray-600 mt-1">{alert.time}</p>
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Vital Signs Monitor */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b">
                                <h2 className="text-lg font-semibold text-gray-900">Critical Patient Monitoring</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                        <div className="flex items-center space-x-3">
                                            <Heart className="h-8 w-8 text-red-600" />
                                            <div>
                                                <p className="font-medium text-red-900">John Doe</p>
                                                <p className="text-sm text-red-700">HR: 120 BPM (High)</p>
                                                <p className="text-sm text-red-700">BP: 180/110 mmHg</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                        <div className="flex items-center space-x-3">
                                            <Thermometer className="h-8 w-8 text-yellow-600" />
                                            <div>
                                                <p className="font-medium text-yellow-900">Maria Garcia</p>
                                                <p className="text-sm text-yellow-700">Temp: 38.5°C (Fever)</p>
                                                <p className="text-sm text-yellow-700">HR: 88 BPM</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center space-x-3">
                                            <Activity className="h-8 w-8 text-blue-600" />
                                            <div>
                                                <p className="font-medium text-blue-900">Tom Wilson</p>
                                                <p className="text-sm text-blue-700">O2 Sat: 95% (Low)</p>
                                                <p className="text-sm text-blue-700">RR: 22/min</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MedicalPractitionerDashboard;