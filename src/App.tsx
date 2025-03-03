import React, { useState, useEffect } from 'react';
import { Calendar, Moon, Sun, PlusCircle, Save, Trash2, Edit, Check, HardDrive, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';

// Types
interface Activity {
  id: string;
  date: string;
  name: string;
  completed: boolean;
  time: string;
  notes: string;
}

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState<Omit<Activity, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    name: '',
    completed: false,
    time: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load activities from server on component mount
  useEffect(() => {
    loadActivitiesFromServer();
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Clear status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Load activities from server
  const loadActivitiesFromServer = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://ramadhantrackeractivity.netlify.app/.netlify/functions/activities');
      setActivities(response.data);
      setStatusMessage({ text: 'Activities loaded from server', type: 'success' });
    } catch (error) {
      console.error('Error loading activities:', error);
      setStatusMessage({ text: 'Failed to load activities from server', type: 'error' });
      // Fallback to localStorage if server is unavailable
      const savedActivities = localStorage.getItem('ramadhanActivities');
      if (savedActivities) {
        setActivities(JSON.parse(savedActivities));
        setStatusMessage({ text: 'Loaded from local storage (server unavailable)', type: 'info' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save activities to server
  const saveActivitiesToServer = async () => {
    try {
      setIsLoading(true);
      await axios.post('https://ramadhantrackeractivity.netlify.app/.netlify/functions/activities', activities);
      setStatusMessage({ text: 'Activities saved to server', type: 'success' });
      
      // Also save to localStorage as backup
      localStorage.setItem('ramadhanActivities', JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving activities:', error);
      setStatusMessage({ text: 'Failed to save to server, saved locally instead', type: 'error' });
      
      // Fallback to localStorage if server is unavailable
      localStorage.setItem('ramadhanActivities', JSON.stringify(activities));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewActivity({
      ...newActivity,
      [name]: value
    });
  };

  // Handle edit form input changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editForm) return;
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };

  // Add new activity
  const addActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.name) return;

    const newId = Date.now().toString();
    const updatedActivities = [...activities, { ...newActivity, id: newId }];
    setActivities(updatedActivities);
    setNewActivity({
      date: selectedDate,
      name: '',
      completed: false,
      time: '',
      notes: ''
    });
    
    // Save to server after adding
    saveActivitiesToServer();
  };

  // Delete activity
  const deleteActivity = (id: string) => {
    const updatedActivities = activities.filter(activity => activity.id !== id);
    setActivities(updatedActivities);
    
    // Save to server after deleting
    saveActivitiesToServer();
  };

  // Start editing activity
  const startEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setEditForm(activity);
  };

  // Save edited activity
  const saveEdit = () => {
    if (!editForm) return;
    const updatedActivities = activities.map(activity => 
      activity.id === editingId ? editForm : activity
    );
    setActivities(updatedActivities);
    setEditingId(null);
    setEditForm(null);
    
    // Save to server after editing
    saveActivitiesToServer();
  };

  // Toggle activity completion
  const toggleComplete = (id: string) => {
    const updatedActivities = activities.map(activity => 
      activity.id === id ? { ...activity, completed: !activity.completed } : activity
    );
    setActivities(updatedActivities);
    
    // Save to server after toggling
    saveActivitiesToServer();
  };

  // Filter activities by selected date
  const filteredActivities = activities.filter(activity => activity.date === selectedDate);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-gray-100'} transition-colors duration-200`}>
      <header className={`py-4 px-6 ${darkMode ? 'bg-gray-800' : 'bg-green-600'} text-white shadow-md`}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Moon className="mr-2" size={24} />
            Ramadhan Activity Tracker
          </h1>
          <div className="flex items-center space-x-3">
            <button 
              onClick={saveActivitiesToServer}
              className="p-2 rounded-full hover:bg-opacity-20 hover:bg-white flex items-center"
              title="Save to server"
              disabled={isLoading}
            >
              <HardDrive size={20} />
            </button>
            <button 
              onClick={loadActivitiesFromServer}
              className="p-2 rounded-full hover:bg-opacity-20 hover:bg-white flex items-center"
              title="Refresh from server"
              disabled={isLoading}
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-opacity-20 hover:bg-white"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Status message */}
      {statusMessage && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out flex items-center
          ${statusMessage.type === 'success' ? 'bg-green-500 text-white' : 
            statusMessage.type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'}`}
        >
          {statusMessage.type === 'error' && <AlertCircle className="mr-2" size={18} />}
          {statusMessage.text}
        </div>
      )}

      <main className="container mx-auto py-8 px-4">
        {/* Data Persistence Banner */}
        <div className={`mb-8 p-4 rounded-lg ${darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'} flex items-center justify-between`}>
          <div className="flex items-center">
            <HardDrive className={`mr-3 ${darkMode ? 'text-blue-300' : 'text-blue-500'}`} size={24} />
            <div>
              <h3 className="font-medium">Permanent Server Storage</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Your activities are automatically saved to a JSON file on the server.
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={saveActivitiesToServer}
              className={`px-3 py-1.5 rounded text-sm font-medium flex items-center ${darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              disabled={isLoading}
            >
              <Save size={16} className="mr-1" />
              Save to Server
            </button>
            <button
              onClick={loadActivitiesFromServer}
              className={`px-3 py-1.5 rounded text-sm font-medium flex items-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} ${darkMode ? 'text-white' : 'text-gray-800'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh from Server
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Date Selection */}
          <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="mr-2" size={20} />
              Select Date
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            />
          </div>

          {/* Add New Activity Form */}
          <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <PlusCircle className="mr-2" size={20} />
              Add New Activity
            </h2>
            <form onSubmit={addActivity}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Activity Name</label>
                <input
                  type="text"
                  name="name"
                  value={newActivity.name}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="e.g., Taraweeh Prayer"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Time</label>
                <input
                  type="time"
                  name="time"
                  value={newActivity.time}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Notes</label>
                <textarea
                  name="notes"
                  value={newActivity.notes}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Additional notes..."
                  rows={3}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                disabled={isLoading}
              >
                <Save className="mr-2" size={18} />
                Save Activity
              </button>
            </form>
          </div>

          {/* Activity List */}
          <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4">
              Activities for {new Date(selectedDate).toLocaleDateString()}
            </h2>
            {filteredActivities.length === 0 ? (
              <p className="text-gray-500 italic">No activities for this date.</p>
            ) : (
              <ul className="space-y-4">
                {filteredActivities.map(activity => (
                  <li 
                    key={activity.id} 
                    className={`p-4 border rounded-lg ${activity.completed ? 'border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    {editingId === activity.id ? (
                      // Edit form
                      <div className="space-y-3">
                        <input
                          type="text"
                          name="name"
                          value={editForm?.name || ''}
                          onChange={handleEditChange}
                          className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                        <input
                          type="time"
                          name="time"
                          value={editForm?.time || ''}
                          onChange={handleEditChange}
                          className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                        <textarea
                          name="notes"
                          value={editForm?.notes || ''}
                          onChange={handleEditChange}
                          className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                          rows={2}
                        ></textarea>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={saveEdit}
                            className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                            disabled={isLoading}
                          >
                            <Check size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display activity
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-2">
                            <input
                              type="checkbox"
                              checked={activity.completed}
                              onChange={() => toggleComplete(activity.id)}
                              className="mt-1"
                              disabled={isLoading}
                            />
                            <div>
                              <h3 className={`font-medium ${activity.completed ? 'line-through text-gray-500' : ''}`}>
                                {activity.name}
                              </h3>
                              {activity.time && (
                                <p className="text-sm text-gray-500">Time: {activity.time}</p>
                              )}
                              {activity.notes && (
                                <p className="text-sm mt-1">{activity.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEdit(activity)}
                              className={`p-1 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700' : ''}`}
                              disabled={isLoading}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteActivity(activity.id)}
                              className={`p-1 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700' : ''} text-red-500`}
                              disabled={isLoading}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Statistics Section */}
        <div className={`mt-8 p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <h3 className="font-medium">Total Activities</h3>
              <p className="text-2xl font-bold">{activities.length}</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <h3 className="font-medium">Completed Activities</h3>
              <p className="text-2xl font-bold">{activities.filter(a => a.completed).length}</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <h3 className="font-medium">Completion Rate</h3>
              <p className="text-2xl font-bold">
                {activities.length > 0 
                  ? Math.round((activities.filter(a => a.completed).length / activities.length) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className={`py-4 px-6 ${darkMode ? 'bg-gray-800' : 'bg-green-600'} text-white mt-8`}>
        <div className="container mx-auto text-center">
          <p>Ramadhan Activity Tracker &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;