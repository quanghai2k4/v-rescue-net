import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SOSForm.css';

function SOSForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    requestType: 'food',
    description: '',
    latitude: null,
    longitude: null,
    address: '',
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.latitude || !formData.longitude) {
      alert('Vui lòng bật định vị GPS để gửi yêu cầu');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/rescue/requests', formData);
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="sos-container success-screen">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Yêu cầu đã được gửi!</h2>
          <p>Lực lượng cứu hộ sẽ liên hệ với bạn sớm nhất.</p>
          <p>Vui lòng giữ máy điện thoại bật và sạc pin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sos-container">
      <div className="sos-header">
        <button onClick={() => navigate('/')} className="back-btn">← Quay lại</button>
        <h1>🆘 Gửi yêu cầu cứu trợ</h1>
      </div>

      <form onSubmit={handleSubmit} className="sos-form">
        <div className="form-group">
          <label>Số điện thoại *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0912345678"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Loại yêu cầu *</label>
          <select
            name="requestType"
            value={formData.requestType}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="food">Lương thực, nước uống</option>
            <option value="medical">Y tế, cấp cứu</option>
            <option value="evacuation">Sơ tán khẩn cấp</option>
            <option value="shelter">Nơi trú ẩn</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div className="form-group">
          <label>Mô tả tình trạng</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Mô tả ngắn gọn tình trạng hiện tại của bạn..."
            rows="4"
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label>Địa chỉ cụ thể</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Số nhà, tên đường, xã/phường..."
            className="form-input"
          />
        </div>

        <div className="location-info">
          {formData.latitude && formData.longitude ? (
            <p className="location-success">
              ✓ Vị trí GPS đã được xác định
              <br />
              <small>
                {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </small>
            </p>
          ) : (
            <p className="location-pending">⌛ Đang lấy vị trí GPS...</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !formData.latitude}
          className="submit-btn"
        >
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu cứu trợ'}
        </button>

        <p className="form-note">
          * Thông tin bắt buộc
        </p>
      </form>
    </div>
  );
}

export default SOSForm;
