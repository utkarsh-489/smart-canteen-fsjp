import { useState } from 'react';
import TopBar from './components/TopBar';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App(){
 const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('smartCanteenUser'))}catch{return null}});
 const logout=()=>{localStorage.removeItem('smartCanteenToken');localStorage.removeItem('smartCanteenUser');setUser(null)};
 return <><TopBar user={user} onLogout={logout}/>{!user?<AuthPage onLogin={setUser}/>:user.role==='STUDENT'?<StudentDashboard/>:user.role==='STAFF'?<StaffDashboard/>:<AdminDashboard/>}</>;
}
