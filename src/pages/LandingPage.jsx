import AchievementsPage from '../components/AchievementsPage'
import FaqSection from '../components/FaqSection'
import Footer from '../components/Footer'
import Header from '../components/Header'
import PrinterSupportHero from '../components/Landing'
import PrinterBrands from '../components/Printer_brands'
import PrinterRepairServices from '../components/PrinterRepairServices'
import ReasonsToChooseUs from '../components/ReasonsToChooseUs'
import RecentBlogs from '../components/RecentBlogs'
import Testimonials from '../components/Testimonials'
import ServicesSection from '../components/Services'
import CertificateSection from '../components/Certificatesection'
import Aboutus from '../components/Aboutus'
function LandingPage() {
  return (
    <>
    <Header/>
    <PrinterSupportHero/>
    <ServicesSection/>
    <CertificateSection/>
    <PrinterBrands/>
    <RecentBlogs/>
    <AchievementsPage/>
    <ReasonsToChooseUs/> 
    <PrinterRepairServices/>
    <Aboutus/>
    <Testimonials/>
    <FaqSection/>
    <Footer colorClass="bg-white"/> 
    </>
  )
}

export default LandingPage