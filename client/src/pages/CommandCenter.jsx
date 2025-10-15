import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { io } from 'socket.io-client';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CommandCenter.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createColoredIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const statusColors = {
  pending: 'red',
  in_progress: 'yellow',
  completed: 'green',
};

function CommandCenter() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    requestType: 'all',
  });
  const [socket, setSocket] = useState(null);
  const [center] = useState([16.0544, 108.2022]);

  useEffect(() => {
    fetchRequests();

    const newSocket = io({ path: '/socket.io' });
    setSocket(newSocket);

    newSocket.emit('join-rescue-team');

    newSocket.on('new-rescue-request', (request) => {
      setRequests(prev => [request, ...prev]);
    });

    newSocket.on('rescue-request-updated', (updatedRequest) => {
      setRequests(prev => 
        prev.map(req => req.id === updatedRequest.id ? updatedRequest : req)
      );
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    let filtered = [...requests];

    if (filters.status !== 'all') {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(req => req.priority === filters.priority);
    }

    if (filters.requestType !== 'all') {
      filtered = filtered.filter(req => req.request_type === filters.requestType);
    }

    setFilteredRequests(filtered);
  }, [requests, filters]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/rescue/requests');
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const updateRequestStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/rescue/requests/${id}`, { status: newStatus });
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const getRequestTypeLabel = (type) => {
    const labels = {
      food: 'Lương thực',
      medical: 'Y tế',
      evacuation: 'Sơ tán',
      shelter: 'Trú ẩn',
      other: 'Khác',
    };
    return labels[type] || type;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      high: 'Cao',
      medium: 'Trung bình',
      low: 'Thấp',
    };
    return labels[priority] || priority;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Mới',
      in_progress: 'Đang xử lý',
      completed: 'Hoàn thành',
    };
    return labels[status] || status;
  };

  return (
    <div className="command-container">
      <div className="command-header">
        <button onClick={() => navigate('/')} className="back-btn">← Trang chủ</button>
        <h1>🚁 Command Center</h1>
        <div className="stats">
          <span className="stat-badge pending">{requests.filter(r => r.status === 'pending').length} Mới</span>
          <span className="stat-badge in-progress">{requests.filter(r => r.status === 'in_progress').length} Đang xử lý</span>
          <span className="stat-badge completed">{requests.filter(r => r.status === 'completed').length} Hoàn thành</span>
        </div>
      </div>

      <div className="command-content">
        <div className="sidebar">
          <div className="filters">
            <h3>Bộ lọc</h3>
            
            <div className="filter-group">
              <label>Trạng thái:</label>
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">Tất cả</option>
                <option value="pending">Mới</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Độ ưu tiên:</label>
              <select 
                value={filters.priority} 
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
              >
                <option value="all">Tất cả</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Loại yêu cầu:</label>
              <select 
                value={filters.requestType} 
                onChange={(e) => setFilters({...filters, requestType: e.target.value})}
              >
                <option value="all">Tất cả</option>
                <option value="food">Lương thực</option>
                <option value="medical">Y tế</option>
                <option value="evacuation">Sơ tán</option>
                <option value="shelter">Trú ẩn</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div className="requests-list">
            <h3>Danh sách yêu cầu ({filteredRequests.length})</h3>
            {filteredRequests.map(request => (
              <div key={request.id} className={`request-card ${request.status}`}>
                <div className="request-header">
                  <span className={`priority-badge ${request.priority}`}>
                    {getPriorityLabel(request.priority)}
                  </span>
                  <span className={`status-badge ${request.status}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>
                
                <div className="request-body">
                  <p><strong>Loại:</strong> {getRequestTypeLabel(request.request_type)}</p>
                  <p><strong>SĐT:</strong> {request.phone}</p>
                  {request.address && <p><strong>Địa chỉ:</strong> {request.address}</p>}
                  {request.description && <p><strong>Mô tả:</strong> {request.description}</p>}
                  <p className="request-time">
                    {new Date(request.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="request-actions">
                  {request.status === 'pending' && (
                    <button 
                      onClick={() => updateRequestStatus(request.id, 'in_progress')}
                      className="btn-action btn-progress"
                    >
                      Nhận nhiệm vụ
                    </button>
                  )}
                  {request.status === 'in_progress' && (
                    <button 
                      onClick={() => updateRequestStatus(request.id, 'completed')}
                      className="btn-action btn-complete"
                    >
                      Hoàn thành
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="map-container">
          <MapContainer 
            center={center} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {filteredRequests.map(request => (
              <Marker
                key={request.id}
                position={[request.latitude, request.longitude]}
                icon={createColoredIcon(statusColors[request.status])}
              >
                <Popup>
                  <div className="popup-content">
                    <h4>{getRequestTypeLabel(request.request_type)}</h4>
                    <p><strong>Trạng thái:</strong> {getStatusLabel(request.status)}</p>
                    <p><strong>Ưu tiên:</strong> {getPriorityLabel(request.priority)}</p>
                    <p><strong>SĐT:</strong> {request.phone}</p>
                    {request.address && <p><strong>Địa chỉ:</strong> {request.address}</p>}
                    {request.description && <p>{request.description}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default CommandCenter;
