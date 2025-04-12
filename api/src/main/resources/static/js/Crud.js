class ApiService {
    constructor(baseURL = '') {
      this.baseURL = baseURL;
    }

    async request(endpoint = '', method = 'GET', data = null, headers = {}) {
      const url = `${this.baseURL}${endpoint}`;
      
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
      };
  
      if (data) {
        config.body = JSON.stringify(data);
      }
  
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const errorData = await this._parseError(response);
          throw new Error(errorData.message || 'HTTP request failed');
        }
  
        return await this._parseResponse(response);
      } catch (error) {
        console.error(`HTTP ${method} ${url} failed:`, error);
        throw error;
      }
    }
  
    async _parseResponse(response) {
      const text = await response.text();
      try {
        return text ? JSON.parse(text) : null;
      } catch {
        return text;
      }
    }
  
    async _parseError(response) {
      try {
        return await response.json();
      } catch {
        return { message: response.statusText };
      }
    }
  
    get(endpoint, headers = {}) {
      return this.request(endpoint, 'GET', null, headers);
    }
  
    post(endpoint, data, headers = {}) {
      return this.request(endpoint, 'POST', data, headers);
    }
  
    put(endpoint, data, headers = {}) {
      return this.request(endpoint, 'PUT', data, headers);
    }
  
    patch(endpoint, data, headers = {}) {
      return this.request(endpoint, 'PATCH', data, headers);
    }
  
    delete(endpoint, headers = {}) {
      return this.request(endpoint, 'DELETE', null, headers);
    }
  }
  
  export const createTaskService = () => new ApiService('http://localhost:8080/api/tasks');
  //export const createHistoryService = () => new ApiService('http://localhost:8080/HistoryTasks');