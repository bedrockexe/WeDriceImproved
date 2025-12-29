import React from 'react';
import WelcomeSection from '../components/Dashboard/WelcomeSection';
import RecommendedCars from '../components/Dashboard/RecommendedCars';
import ActiveReservations from '../components/Dashboard/ActiveReservations';
import FAQSection from '../components/Dashboard/FAQSection';
import Footer from '../components/Dashboard/Footer';
const Dashboard = () => {
  return <>
      <WelcomeSection />
      <div className="mt-8">
        <RecommendedCars />
      </div>
      <div className="mt-8">
        <ActiveReservations />
      </div>
      <div className="mt-8">
        <FAQSection />
      </div>
      <Footer />
    </>;
};
export default Dashboard;