import { useNavigate } from 'react-router-dom';
import { Typography, Container } from '@mui/material';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Welcome, {user.username} ({user.role})</Typography>
    </Container>
  );
}

export default Dashboard;