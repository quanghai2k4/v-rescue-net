import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="hero">
        <h1 className="title">V-Rescue Net</h1>
        <p className="slogan">Kết nối tức thì, cứu trợ kịp thời</p>
        
        <div className="button-group">
          <Link to="/sos" className="btn btn-emergency">
            <span className="icon">🆘</span>
            Gửi yêu cầu cứu trợ
          </Link>
          
          <Link to="/command" className="btn btn-command">
            <span className="icon">🚁</span>
            Command Center
          </Link>
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>Cho người dân</h3>
          <p>Gửi yêu cầu cứu trợ trong 30 giây với vị trí GPS chính xác</p>
        </div>
        
        <div className="info-card">
          <h3>Cho lực lượng cứu hộ</h3>
          <p>Theo dõi và điều phối các yêu cầu cứu trợ trên bản đồ thời gian thực</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
