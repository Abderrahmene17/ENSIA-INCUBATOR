// services/applicationService.js

// Base URL for API
const API_URL =  'http://localhost:8000';

const applicationService = {
  /**
   * Get all applications
   * @returns {Promise<Array>} - Array of applications
   */
  getApplications: async () => {
    try {console.log("fetching forms")
      const response = await fetch(`${API_URL}/incubation-form`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting applications:', error);
      throw error;
    }
  },

  /**
   * Get a single application by ID
   * @param {number} id - Application ID
   * @returns {Promise<Object>} - Application data
   */
getApplication: async (id: number): Promise<object> => {
    try {
      const response = await fetch(`${API_URL}/incubation-form/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting application ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update application status
   * @param {number} id - Application ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated application data
   */
  updateApplicationStatus: async (id: number, status: string): Promise<object> => {

    try {
      const response = await fetch(`${API_URL}/incubation-form/${id}/status/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating application ${id} status:`, error);
      throw error;
    }
  },

  /**
   * Export applications to CSV
   * @returns {Promise<void>}
   */
  exportApplicationsCSV: async () => {
    try {
      const response = await fetch(`${API_URL}/applications/export/csv`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `applications-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting applications:', error);
      throw error;
    }
  },
};

export default applicationService;